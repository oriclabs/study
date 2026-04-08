/**
 * Speed Drill — timed practice with auto-advance.
 * Questions auto-skip after time limit. Trains exam speed.
 * Prioritizes weak topics from progress data.
 */

import type { ContentPackManager, PracticeQuestion, TestStyle } from '../components/content-packs.js';
import type { StudyProgress } from '../components/study-progress.js';
import type { ContentSourceAdapter } from '@platform/types.js';
import { showToast } from '../components/modal.js';

export async function renderSpeedDrill(
  progress: StudyProgress,
  packManager: ContentPackManager,
  content: ContentSourceAdapter,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  // Load all questions from all packs
  const packs = await packManager.listPacks();
  let allQuestions: (PracticeQuestion & { packId: string })[] = [];

  for (const pack of packs) {
    for (const subj of pack.subjects) {
      const qs = await packManager.loadPractice(pack.packId, subj.id);
      for (const q of qs) allQuestions.push({ ...q, packId: pack.packId });

      // Also from notes
      if (subj.hasNotes) {
        const notes = await packManager.loadNotes(pack.packId, subj.id);
        if (notes) {
          for (const cat of ((notes as any).categories || [])) {
            for (const topic of (cat.topics || [])) {
              for (const [i, ex] of (topic.examples || []).entries()) {
                if (ex.question && ex.answer) {
                  allQuestions.push({ id: `drill-${allQuestions.length}`, packId: pack.packId,
                    topic: topic.title, topic_id: topic.topic_id, question: ex.question, options: ex.options,
                    answer: ex.answer, difficulty: ex.difficulty, solutionSteps: ex.solution_steps });
                }
              }
            }
          }
        }
      }
    }
  }

  if (allQuestions.length === 0) {
    container.innerHTML = '<div class="placeholder"><p>No questions available. Import a content pack first.</p></div>';
    return;
  }

  // Header
  const header = document.createElement('div');
  header.className = 'drill-header';
  header.innerHTML = `
    <h2 class="drill-title">\u{23F1} Speed Drill</h2>
    <p class="drill-subtitle">Questions auto-advance when time runs out. Train for exam speed!</p>
  `;
  container.appendChild(header);

  // Config
  const config = document.createElement('div');
  config.className = 'drill-config';

  // Question count
  const countRow = document.createElement('div');
  countRow.className = 'gen-row';
  countRow.innerHTML = '<label class="gen-label">Questions</label>';
  const countSelect = document.createElement('select');
  countSelect.className = 'gen-select';
  for (const n of [10, 15, 20, 30]) {
    countSelect.innerHTML += `<option value="${n}">${n} questions</option>`;
  }
  countRow.appendChild(countSelect);
  config.appendChild(countRow);

  // Time per question
  const timeRow = document.createElement('div');
  timeRow.className = 'gen-row';
  timeRow.innerHTML = '<label class="gen-label">Seconds per Q</label>';
  const timeSelect = document.createElement('select');
  timeSelect.className = 'gen-select';
  for (const [label, secs] of [['ACER (45s)', 45], ['Edutest (35s)', 35], ['Quick (20s)', 20], ['Relaxed (60s)', 60]] as const) {
    timeSelect.innerHTML += `<option value="${secs}">${label}</option>`;
  }
  timeRow.appendChild(timeSelect);
  config.appendChild(timeRow);

  // Focus mode
  const focusRow = document.createElement('div');
  focusRow.className = 'gen-row';
  focusRow.innerHTML = '<label class="gen-label">Focus</label>';
  const focusSelect = document.createElement('select');
  focusSelect.className = 'gen-select';
  focusSelect.innerHTML = `
    <option value="weak">Weak topics first (recommended)</option>
    <option value="random">Random mix</option>
    <option value="hard">Hard questions only</option>
  `;
  focusRow.appendChild(focusSelect);
  config.appendChild(focusRow);

  // Start button
  const startBtn = document.createElement('button');
  startBtn.className = 'gen-btn';
  startBtn.textContent = '\u{26A1} Start Speed Drill';
  config.appendChild(startBtn);
  container.appendChild(config);

  startBtn.addEventListener('click', async () => {
    const count = parseInt(countSelect.value);
    const secsPerQ = parseInt(timeSelect.value);
    const focus = focusSelect.value;

    // Build question set
    let pool = [...allQuestions];

    if (focus === 'weak') {
      const topicScores = await progress.getTopicScores();
      const weakTopics = new Set(topicScores.filter(s => s.attempts > 0 && s.correct / s.attempts < 0.7).map(s => s.topic));
      pool.sort((a, b) => {
        const aWeak = weakTopics.has(a.topic ?? '') ? 0 : 1;
        const bWeak = weakTopics.has(b.topic ?? '') ? 0 : 1;
        return aWeak !== bWeak ? aWeak - bWeak : Math.random() - 0.5;
      });
    } else if (focus === 'hard') {
      pool = pool.filter(q => (q.difficulty ?? 2) >= 3);
      if (pool.length < count) pool = allQuestions.filter(q => (q.difficulty ?? 2) >= 2);
    }
    // Shuffle and take
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j]!,pool[i]!]; }
    const questions = pool.slice(0, count);

    if (questions.length === 0) { showToast('No questions available', { type: 'warning' }); return; }

    runDrill(questions, secsPerQ, progress, container);
  });
}

function runDrill(
  questions: (PracticeQuestion & { packId: string })[],
  secsPerQ: number,
  progress: StudyProgress,
  container: HTMLElement,
): void {
  container.innerHTML = '';
  let idx = 0;
  let score = 0;
  let skipped = 0;
  let answered = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let remaining = secsPerQ;

  // Timer bar
  const timerBar = document.createElement('div');
  timerBar.className = 'drill-timer-bar';
  const timerText = document.createElement('span');
  timerText.className = 'drill-timer-text';
  const timerProgress = document.createElement('div');
  timerProgress.className = 'drill-timer-fill';
  timerBar.appendChild(timerText);
  timerBar.appendChild(timerProgress);
  container.appendChild(timerBar);

  // Question area
  const qArea = document.createElement('div');
  qArea.className = 'drill-question-area';
  container.appendChild(qArea);

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.className = 'drill-score-bar';
  container.appendChild(scoreBar);

  function updateScore() {
    scoreBar.innerHTML = `<span>Q ${idx + 1}/${questions.length}</span><span>\u2713 ${score}</span><span>\u23F1 ${skipped} skipped</span>`;
  }

  function startTimer() {
    remaining = secsPerQ;
    answered = false;
    updateTimer();
    timer = setInterval(() => {
      remaining--;
      updateTimer();
      if (remaining <= 0) {
        // Time's up — auto-skip
        clearInterval(timer!);
        if (!answered) {
          skipped++;
          recordAnswer(null);
          setTimeout(nextQuestion, 500);
        }
      }
    }, 1000);
  }

  function updateTimer() {
    timerText.textContent = `${remaining}s`;
    const pct = (remaining / secsPerQ) * 100;
    timerProgress.style.width = `${pct}%`;
    timerBar.classList.toggle('drill-timer-urgent', remaining <= 5);
  }

  function recordAnswer(userAnswer: string | null) {
    const q = questions[idx]!;
    const correct = userAnswer !== null && userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim();
    if (correct) score++;

    progress.recordAttempt({
      packId: q.packId,
      subject: q.topic ?? 'general',
      topic: q.topic_id ?? q.topic ?? 'general',
      question: q.question,
      userAnswer: userAnswer ?? '(time expired)',
      correctAnswer: q.answer,
      correct,
      difficulty: q.difficulty,
      source: 'practice',
    });
  }

  function showQuestion() {
    const q = questions[idx]!;
    qArea.innerHTML = '';
    updateScore();

    const qText = document.createElement('div');
    qText.className = 'drill-q-text';
    qText.textContent = q.question;
    qArea.appendChild(qText);

    if (q.options && q.options.length > 0) {
      const opts = document.createElement('div');
      opts.className = 'practice-options';
      for (const opt of q.options) {
        const btn = document.createElement('button');
        btn.className = 'practice-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          if (timer) clearInterval(timer);

          const correct = opt.toLowerCase().trim() === q.answer.toLowerCase().trim();
          btn.classList.add(correct ? 'practice-option-correct' : 'practice-option-wrong');
          if (!correct) {
            // Highlight correct
            opts.querySelectorAll('.practice-option').forEach(b => {
              if (b.textContent?.toLowerCase().trim() === q.answer.toLowerCase().trim()) b.classList.add('practice-option-correct');
            });
          }
          recordAnswer(opt);
          setTimeout(nextQuestion, correct ? 600 : 1200);
        });
        opts.appendChild(btn);
      }
      qArea.appendChild(opts);
    } else {
      const inputRow = document.createElement('div');
      inputRow.className = 'practice-input-row';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'practice-input';
      input.placeholder = 'Type answer...';
      input.autofocus = true;
      const submitBtn = document.createElement('button');
      submitBtn.className = 'practice-submit-btn';
      submitBtn.textContent = 'Submit';
      const doSubmit = () => {
        if (answered) return;
        answered = true;
        if (timer) clearInterval(timer);
        recordAnswer(input.value.trim());
        setTimeout(nextQuestion, 800);
      };
      submitBtn.addEventListener('click', doSubmit);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
      inputRow.appendChild(input);
      inputRow.appendChild(submitBtn);
      qArea.appendChild(inputRow);
      input.focus();
    }

    startTimer();
  }

  function nextQuestion() {
    idx++;
    if (idx >= questions.length) {
      showResults();
      return;
    }
    showQuestion();
  }

  function showResults() {
    if (timer) clearInterval(timer);
    const pct = Math.round((score / questions.length) * 100);
    container.innerHTML = `
      <div class="practice-results">
        <h2 class="practice-results-title">\u{26A1} Speed Drill Complete!</h2>
        <div class="practice-score-circle">
          <span class="practice-score-pct">${pct}%</span>
          <span class="practice-score-detail">${score}/${questions.length} correct \u00B7 ${skipped} timed out</span>
        </div>
        <p style="color:var(--muted);font-size:0.85rem;margin-top:8px;">Average: ${secsPerQ}s per question</p>
      </div>
    `;
  }

  showQuestion();
}
