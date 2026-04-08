/**
 * Practice view — question-by-question practice mode.
 * Sources questions from content pack practice arrays OR
 * auto-generates from snotes examples.
 */

import type { ContentSourceAdapter } from '@platform/types.js';
import type { ContentPackManager, PracticeQuestion } from '../components/content-packs.js';
import type { StudyProgress } from '../components/study-progress.js';

export async function renderPractice(
  exam: string,
  subject: string,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
  progress: StudyProgress,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Loading practice questions...</div>';

  let questions: PracticeQuestion[] = [];

  // Try loading from pack first
  if (exam.startsWith('pack:')) {
    questions = await packManager.loadPractice(exam.slice(5), subject);
  }

  // If no pack questions, try auto-generating from notes examples
  if (questions.length === 0) {
    questions = await extractFromNotes(exam, subject, content, packManager);
  }

  container.innerHTML = '';

  if (questions.length === 0) {
    container.innerHTML = `
      <div class="placeholder">
        <h2>Practice</h2>
        <p>No practice questions available yet for this subject.</p>
        <p style="font-size:0.85rem;color:var(--muted);margin-top:8px;">
          Import a content pack with practice questions, or they'll be auto-generated from study notes examples.
        </p>
      </div>`;
    return;
  }

  // Difficulty filter
  const hasDifficulty = questions.some(q => q.difficulty);
  let filteredQuestions = [...questions];
  let selectedDifficulty = 0; // 0 = all

  function applyFilter() {
    filteredQuestions = selectedDifficulty === 0
      ? [...questions]
      : questions.filter(q => (q.difficulty ?? 1) === selectedDifficulty);
  }

  // Header + filter
  const header = document.createElement('div');
  header.className = 'practice-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'practice-title-row';
  const titleEl = document.createElement('h2');
  titleEl.className = 'practice-title';
  titleRow.appendChild(titleEl);

  if (hasDifficulty) {
    const filterWrap = document.createElement('div');
    filterWrap.className = 'difficulty-filter';

    const levels = [
      { value: 0, label: 'All', cls: '' },
      { value: 1, label: 'Foundation (Y8)', cls: 'diff-1' },
      { value: 2, label: 'Standard (Y9)', cls: 'diff-2' },
      { value: 3, label: 'Extension (Y10)', cls: 'diff-3' },
    ];

    for (const lv of levels) {
      const btn = document.createElement('button');
      btn.className = `difficulty-btn ${lv.cls} ${lv.value === selectedDifficulty ? 'difficulty-active' : ''}`;
      btn.textContent = lv.label;
      btn.addEventListener('click', () => {
        selectedDifficulty = lv.value;
        applyFilter();
        // Reset state and re-render
        currentIdx = 0; score = 0; answered = 0;
        answers.length = filteredQuestions.length;
        answers.fill(null);
        titleEl.textContent = `Practice — ${filteredQuestions.length} questions`;
        questionArea.style.display = 'block';
        scoreArea.style.display = 'none';
        // Update active button
        filterWrap.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('difficulty-active'));
        btn.classList.add('difficulty-active');
        renderQuestion();
      });
      filterWrap.appendChild(btn);
    }
    titleRow.appendChild(filterWrap);
  }

  header.appendChild(titleRow);
  container.appendChild(header);
  titleEl.textContent = `Practice — ${filteredQuestions.length} questions`;

  // State
  let currentIdx = 0;
  let score = 0;
  let answered = 0;
  const answers: (string | null)[] = new Array(filteredQuestions.length).fill(null);

  // Progress bar
  const progressWrap = document.createElement('div');
  progressWrap.className = 'practice-progress-wrap';
  const progressBar = document.createElement('div');
  progressBar.className = 'practice-progress-bar';
  progressWrap.appendChild(progressBar);
  const progressText = document.createElement('span');
  progressText.className = 'practice-progress-text';
  progressWrap.appendChild(progressText);
  container.appendChild(progressWrap);

  // Question area
  const questionArea = document.createElement('div');
  questionArea.className = 'practice-question-area';
  container.appendChild(questionArea);

  // Score area (hidden until done)
  const scoreArea = document.createElement('div');
  scoreArea.className = 'practice-score-area';
  scoreArea.style.display = 'none';
  container.appendChild(scoreArea);

  function renderQuestion() {
    const q = filteredQuestions[currentIdx]!;
    questionArea.innerHTML = '';

    // Question number + text
    const qHeader = document.createElement('div');
    qHeader.className = 'practice-q-header';
    qHeader.innerHTML = `<span class="practice-q-num">Q${currentIdx + 1}/${filteredQuestions.length}</span>`;
    if (q.difficulty) {
      const stars = '\u2B50'.repeat(Math.min(q.difficulty, 5));
      qHeader.innerHTML += `<span class="practice-q-diff">${stars}</span>`;
    }
    questionArea.appendChild(qHeader);

    const qText = document.createElement('div');
    qText.className = 'practice-q-text';
    qText.textContent = q.question;
    questionArea.appendChild(qText);

    // Options (MCQ) or free input
    if (q.options && q.options.length > 0) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'practice-options';

      for (const opt of q.options) {
        const btn = document.createElement('button');
        btn.className = 'practice-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleAnswer(opt, optionsDiv));
        optionsDiv.appendChild(btn);
      }
      questionArea.appendChild(optionsDiv);
    } else {
      const inputRow = document.createElement('div');
      inputRow.className = 'practice-input-row';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'practice-input';
      input.placeholder = 'Type your answer...';
      const submitBtn = document.createElement('button');
      submitBtn.className = 'practice-submit-btn';
      submitBtn.textContent = 'Check';
      submitBtn.addEventListener('click', () => handleAnswer(input.value.trim(), inputRow));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitBtn.click(); });
      inputRow.appendChild(input);
      inputRow.appendChild(submitBtn);
      questionArea.appendChild(inputRow);
    }

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'practice-nav';
    if (currentIdx > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'practice-nav-btn';
      prevBtn.textContent = '\u2190 Previous';
      prevBtn.addEventListener('click', () => { currentIdx--; renderQuestion(); });
      nav.appendChild(prevBtn);
    }
    const skipBtn = document.createElement('button');
    skipBtn.className = 'practice-nav-btn practice-skip';
    skipBtn.textContent = 'Skip \u2192';
    skipBtn.addEventListener('click', () => {
      if (currentIdx < filteredQuestions.length - 1) { currentIdx++; renderQuestion(); }
      else showResults();
    });
    nav.appendChild(skipBtn);
    questionArea.appendChild(nav);

    updateProgress();
  }

  function handleAnswer(userAnswer: string, parentEl: HTMLElement) {
    const q = filteredQuestions[currentIdx]!;
    const correct = normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);

    answers[currentIdx] = userAnswer;
    if (correct) score++;
    answered++;

    // Record in progress tracker
    const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
    progress.recordAttempt({
      packId,
      subject,
      topic: q.topic_id ?? q.topic ?? 'general',
      question: q.question,
      userAnswer,
      correctAnswer: q.answer,
      correct,
      difficulty: q.difficulty,
      source: 'practice',
    });

    // Show feedback
    const feedback = document.createElement('div');
    feedback.className = `practice-feedback ${correct ? 'practice-correct' : 'practice-wrong'}`;
    feedback.innerHTML = correct
      ? `<strong>\u2713 Correct!</strong>`
      : `<strong>\u2717 Incorrect.</strong> Answer: ${esc(q.answer)}`;

    // Show solution steps if available
    if (q.solutionSteps && q.solutionSteps.length > 0) {
      const steps = document.createElement('ol');
      steps.className = 'practice-solution-steps';
      for (const s of q.solutionSteps) {
        const li = document.createElement('li');
        li.textContent = s;
        steps.appendChild(li);
      }
      feedback.appendChild(steps);
    }
    if (q.explanation) {
      const exp = document.createElement('p');
      exp.className = 'practice-explanation';
      exp.textContent = q.explanation;
      feedback.appendChild(exp);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'practice-next-btn';
    nextBtn.textContent = currentIdx < filteredQuestions.length - 1 ? 'Next Question \u2192' : 'See Results';
    nextBtn.addEventListener('click', () => {
      if (currentIdx < filteredQuestions.length - 1) { currentIdx++; renderQuestion(); }
      else showResults();
    });
    feedback.appendChild(nextBtn);

    // Highlight selected option
    if (parentEl.classList.contains('practice-options')) {
      for (const btn of parentEl.querySelectorAll('.practice-option')) {
        (btn as HTMLButtonElement).disabled = true;
        if (btn.textContent === q.answer) btn.classList.add('practice-option-correct');
        if (btn.textContent === userAnswer && !correct) btn.classList.add('practice-option-wrong');
      }
    }

    questionArea.appendChild(feedback);
    updateProgress();
  }

  function showResults() {
    questionArea.style.display = 'none';
    scoreArea.style.display = 'block';
    const pct = filteredQuestions.length > 0 ? Math.round((score / filteredQuestions.length) * 100) : 0;

    // Build topic breakdown
    const byTopic: Record<string, { total: number; correct: number }> = {};
    for (let i = 0; i < filteredQuestions.length; i++) {
      const q = filteredQuestions[i]!;
      const topic = q.topic ?? 'General';
      if (!byTopic[topic]) byTopic[topic] = { total: 0, correct: 0 };
      byTopic[topic].total++;
      if (answers[i] && normalizeAnswer(answers[i]!) === normalizeAnswer(q.answer)) byTopic[topic].correct++;
    }

    const topicRows = Object.entries(byTopic)
      .sort((a, b) => (a[1].total > 0 ? a[1].correct / a[1].total : 0) - (b[1].total > 0 ? b[1].correct / b[1].total : 0))
      .map(([topic, s]) => {
        const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        const cls = p >= 80 ? 'good' : p >= 50 ? 'ok' : 'weak';
        return `<div class="exam-bd-row"><span class="exam-bd-label">${esc(topic)}</span><span class="exam-bd-bar-wrap"><span class="exam-bd-bar exam-bd-${cls}" style="width:${p}%"></span></span><span class="exam-bd-val">${s.correct}/${s.total}</span></div>`;
      }).join('');

    const weakTopics = Object.entries(byTopic).filter(([, s]) => s.total > 0 && s.correct / s.total < 0.5);

    scoreArea.innerHTML = `
      <div class="practice-results">
        <h2 class="practice-results-title">Results</h2>
        <div class="practice-score-circle">
          <span class="practice-score-pct">${pct}%</span>
          <span class="practice-score-detail">${score}/${filteredQuestions.length} correct</span>
        </div>
        ${topicRows ? `<div class="exam-breakdown" style="text-align:left;margin:16px 0;"><h3 class="exam-bd-title">By Topic</h3><div class="exam-bd-bars">${topicRows}</div>${weakTopics.length > 0 ? `<div class="exam-weak-callout"><strong>\u26A0\uFE0F Focus on:</strong> ${weakTopics.map(([t]) => esc(t)).join(', ')}</div>` : ''}</div>` : ''}
        <button class="practice-retry-btn" id="retry-btn">Try Again</button>
      </div>
    `;
    scoreArea.querySelector('#retry-btn')!.addEventListener('click', () => {
      currentIdx = 0; score = 0; answered = 0;
      answers.fill(null);
      questionArea.style.display = 'block';
      scoreArea.style.display = 'none';
      renderQuestion();
    });
  }

  function updateProgress() {
    const pct = filteredQuestions.length > 0 ? (answered / filteredQuestions.length) * 100 : 0;
    progressBar.style.width = `${pct}%`;
    progressText.textContent = `${answered}/${filteredQuestions.length} answered · ${score} correct`;
  }

  renderQuestion();
}

/** Auto-generate practice questions from snotes examples */
async function extractFromNotes(
  exam: string,
  subject: string,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
): Promise<PracticeQuestion[]> {
  let data: Record<string, unknown>;
  try {
    if (exam.startsWith('pack:')) {
      const notes = await packManager.loadNotes(exam.slice(5), subject);
      if (!notes) return [];
      data = notes;
    } else {
      data = await content.loadNotes(exam, subject) as Record<string, unknown>;
    }
  } catch { return []; }

  const questions: PracticeQuestion[] = [];
  const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
  if (!categories) return [];

  for (const cat of categories) {
    const topics = (cat['topics'] as Array<Record<string, unknown>>) || [];
    for (const topic of topics) {
      const examples = (topic['examples'] as Array<Record<string, unknown>>) || [];
      const topicTitle = (topic['title'] as string) || '';
      const topicId = (topic['topic_id'] as string) || undefined;
      for (let i = 0; i < examples.length; i++) {
        const ex = examples[i]!;
        const q = ex['question'] as string | undefined;
        const ans = ex['answer'] as string | undefined;
        if (!q || !ans) continue;
        questions.push({
          id: `auto-${topicTitle}-${i}`,
          topic: topicTitle,
          topic_id: topicId,
          question: q,
          options: ex['options'] as string[] | undefined,
          answer: ans,
          solutionSteps: ex['solution_steps'] as string[] | undefined,
          difficulty: ex['difficulty'] as number | undefined,
        });
      }
    }
  }
  return questions;
}

function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
