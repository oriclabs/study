/**
 * Daily Practice — picks 5 random questions from weak/due topics.
 * Focuses on areas that need improvement. Pack-agnostic.
 */

import type { ContentPackManager, PracticeQuestion } from '../components/content-packs.js';
import type { StudyProgress } from '../components/study-progress.js';
import type { ContentSourceAdapter } from '@platform/types.js';

const DAILY_COUNT = 5;

export async function renderDaily(
  progress: StudyProgress,
  packManager: ContentPackManager,
  content: ContentSourceAdapter,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Preparing daily practice...</div>';

  // Collect all available questions from all packs
  const packs = await packManager.listPacks();
  let allQuestions: (PracticeQuestion & { packId: string; subject: string })[] = [];

  for (const pack of packs) {
    for (const subj of pack.subjects) {
      // From practice array
      const practice = await packManager.loadPractice(pack.packId, subj.id);
      for (const q of practice) {
        allQuestions.push({ ...q, packId: pack.packId, subject: subj.id });
      }

      // From notes examples
      if (subj.hasNotes) {
        const notes = await packManager.loadNotes(pack.packId, subj.id);
        if (notes) {
          const cats = (notes as Record<string, unknown>)['categories'] as Array<Record<string, unknown>> | undefined;
          if (cats) {
            for (const cat of cats) {
              for (const topic of ((cat['topics'] as Array<Record<string, unknown>>) || [])) {
                for (const ex of ((topic['examples'] as Array<Record<string, unknown>>) || [])) {
                  const q = ex['question'] as string | undefined;
                  const a = ex['answer'] as string | undefined;
                  if (q && a) {
                    allQuestions.push({
                      id: `daily-${allQuestions.length}`,
                      packId: pack.packId,
                      subject: subj.id,
                      topic: (topic['title'] as string) || '',
                      topic_id: (topic['topic_id'] as string) || undefined,
                      question: q,
                      options: ex['options'] as string[] | undefined,
                      answer: a,
                      solutionSteps: ex['solution_steps'] as string[] | undefined,
                      difficulty: ex['difficulty'] as number | undefined,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  container.innerHTML = '';

  if (allQuestions.length === 0) {
    container.innerHTML = '<div class="dash-empty"><p>No questions available. Import a content pack first.</p></div>';
    return;
  }

  // Prioritize weak topics (topics with low scores)
  const topicScores = await progress.getTopicScores();
  const weakTopics = new Set(
    topicScores
      .filter(s => s.attempts > 0 && (s.correct / s.attempts) < 0.7)
      .map(s => s.topic)
  );

  // Sort: weak topics first, then random
  // Use topic_id for matching (falls back to display title)
  const prioritized = allQuestions.sort((a, b) => {
    const aTopic = a.topic_id ?? a.topic ?? '';
    const bTopic = b.topic_id ?? b.topic ?? '';
    const aWeak = weakTopics.has(aTopic) ? 0 : 1;
    const bWeak = weakTopics.has(bTopic) ? 0 : 1;
    if (aWeak !== bWeak) return aWeak - bWeak;
    return Math.random() - 0.5;
  });

  const dailyQuestions = prioritized.slice(0, DAILY_COUNT);

  // Render
  const header = document.createElement('div');
  header.className = 'daily-header';
  header.innerHTML = `
    <h2 class="daily-title">\u{1F4DD} Daily Practice</h2>
    <p class="daily-subtitle">${DAILY_COUNT} questions${weakTopics.size > 0 ? ' — focusing on weak areas' : ''}</p>
  `;
  container.appendChild(header);

  let currentIdx = 0;
  let score = 0;

  const qArea = document.createElement('div');
  qArea.className = 'daily-question-area';
  container.appendChild(qArea);

  function renderQ() {
    const q = dailyQuestions[currentIdx]!;
    qArea.innerHTML = '';

    const qNum = document.createElement('div');
    qNum.className = 'daily-q-num';
    qNum.textContent = `${currentIdx + 1} of ${dailyQuestions.length}`;
    qArea.appendChild(qNum);

    const qText = document.createElement('div');
    qText.className = 'daily-q-text';
    qText.textContent = q.question;
    qArea.appendChild(qText);

    if (q.options && q.options.length > 0) {
      const opts = document.createElement('div');
      opts.className = 'practice-options';
      for (const opt of q.options) {
        const btn = document.createElement('button');
        btn.className = 'practice-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleAnswer(opt, opts));
        opts.appendChild(btn);
      }
      qArea.appendChild(opts);
    } else {
      const row = document.createElement('div');
      row.className = 'practice-input-row';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'practice-input';
      input.placeholder = 'Type your answer';
      const submit = document.createElement('button');
      submit.className = 'practice-submit-btn';
      submit.textContent = 'Check';
      submit.addEventListener('click', () => handleAnswer(input.value.trim(), row));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') submit.click(); });
      row.appendChild(input);
      row.appendChild(submit);
      qArea.appendChild(row);
    }
  }

  async function handleAnswer(answer: string, parentEl: HTMLElement) {
    const q = dailyQuestions[currentIdx]!;
    const correct = answer.toLowerCase().trim() === q.answer.toLowerCase().trim();
    if (correct) score++;

    // Record in progress
    await progress.recordAttempt({
      packId: q.packId,
      subject: q.subject,
      topic: q.topic_id ?? q.topic ?? 'general',
      question: q.question,
      userAnswer: answer,
      correctAnswer: q.answer,
      correct,
      difficulty: q.difficulty,
      source: 'daily',
    });

    // Show feedback
    const fb = document.createElement('div');
    fb.className = `practice-feedback ${correct ? 'practice-correct' : 'practice-wrong'}`;
    fb.innerHTML = correct
      ? '<strong>\u2713 Correct!</strong>'
      : `<strong>\u2717 Incorrect.</strong> Answer: ${esc(q.answer)}`;

    if (q.solutionSteps) {
      const steps = document.createElement('ol');
      steps.className = 'practice-solution-steps';
      for (const s of q.solutionSteps) {
        const li = document.createElement('li');
        li.textContent = s;
        steps.appendChild(li);
      }
      fb.appendChild(steps);
    }

    // Highlight MCQ
    if (parentEl.classList.contains('practice-options')) {
      for (const btn of parentEl.querySelectorAll('.practice-option')) {
        (btn as HTMLButtonElement).disabled = true;
        if (btn.textContent === q.answer) btn.classList.add('practice-option-correct');
        if (btn.textContent === answer && !correct) btn.classList.add('practice-option-wrong');
      }
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'practice-next-btn';
    nextBtn.textContent = currentIdx < dailyQuestions.length - 1 ? 'Next \u2192' : 'See Results';
    nextBtn.addEventListener('click', () => {
      if (currentIdx < dailyQuestions.length - 1) { currentIdx++; renderQ(); }
      else showResults();
    });
    fb.appendChild(nextBtn);
    qArea.appendChild(fb);
  }

  function showResults() {
    qArea.innerHTML = `
      <div class="practice-results">
        <h2 class="practice-results-title">\u{1F389} Daily Practice Complete!</h2>
        <div class="practice-score-circle">
          <span class="practice-score-pct">${Math.round((score / dailyQuestions.length) * 100)}%</span>
          <span class="practice-score-detail">${score}/${dailyQuestions.length} correct</span>
        </div>
      </div>
    `;
  }

  renderQ();
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
