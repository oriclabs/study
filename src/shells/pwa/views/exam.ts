/**
 * Mock Exam view — timed exam mode with no hints.
 * Shows all answers and score at the end.
 */

import type { ContentSourceAdapter } from '@platform/types.js';
import type { ContentPackManager, PracticeQuestion, MockExamConfig, TestStyle } from '../components/content-packs.js';
import type { StudyProgress } from '../components/study-progress.js';
import { showModal, showConfirm } from '../components/modal.js';

interface ExamState {
  config: MockExamConfig;
  questions: PracticeQuestion[];
  answers: Map<number, string>;
  startedAt: number;
  finishedAt: number | null;
}

export async function renderExam(
  exam: string,
  subject: string,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
  progress: StudyProgress,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Loading exam options...</div>';

  const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
  let mockExams: MockExamConfig[] = [];
  let allQuestions: PracticeQuestion[] = [];
  let testStyles: TestStyle[] = [];

  // Load pack data
  const packMeta = await packManager.getPack(packId);
  if (packMeta) {
    testStyles = packMeta.testStyles ?? [];
    mockExams = await packManager.loadMockExams(packId, subject);
    allQuestions = await packManager.loadPractice(packId, subject);
  }

  // Auto-generate from notes if no pack questions
  if (allQuestions.length === 0) {
    allQuestions = await extractQuestionsFromNotes(exam, subject, content, packManager);
  }

  container.innerHTML = '';

  if (allQuestions.length === 0 && mockExams.length === 0) {
    container.innerHTML = `
      <div class="placeholder">
        <h2>Mock Exams</h2>
        <p>No exam content available yet for this subject.</p>
        <p style="font-size:0.85rem;color:var(--muted);margin-top:8px;">
          Import a content pack with mock exam configs and practice questions.
        </p>
      </div>`;
    return;
  }

  // Exam selection screen
  renderExamSelection(mockExams, allQuestions, testStyles, container, exam, subject, progress);
}

function renderExamSelection(
  mockExams: MockExamConfig[],
  allQuestions: PracticeQuestion[],
  testStyles: TestStyle[],
  container: HTMLElement,
  exam: string,
  subject: string,
  progress: StudyProgress,
): void {
  let selectedStyle: string | null = null;

  const header = document.createElement('div');
  header.className = 'exam-header';
  header.innerHTML = `
    <h2 class="exam-title">Mock Exams</h2>
    <p class="exam-subtitle">${allQuestions.length} questions available</p>
  `;

  // Style selector (if pack defines test styles)
  if (testStyles.length > 0) {
    const styleWrap = document.createElement('div');
    styleWrap.className = 'exam-style-selector';
    styleWrap.innerHTML = '<span class="exam-style-label">Test style:</span>';

    const allBtn = document.createElement('button');
    allBtn.className = 'exam-style-btn exam-style-active';
    allBtn.textContent = 'All styles';
    allBtn.addEventListener('click', () => {
      selectedStyle = null;
      styleWrap.querySelectorAll('.exam-style-btn').forEach(b => b.classList.remove('exam-style-active'));
      allBtn.classList.add('exam-style-active');
      updateQuestionCount();
    });
    styleWrap.appendChild(allBtn);

    for (const style of testStyles) {
      const btn = document.createElement('button');
      btn.className = 'exam-style-btn';
      btn.textContent = style.label;
      btn.addEventListener('click', () => {
        selectedStyle = style.id;
        styleWrap.querySelectorAll('.exam-style-btn').forEach(b => b.classList.remove('exam-style-active'));
        btn.classList.add('exam-style-active');
        updateQuestionCount();
      });
      styleWrap.appendChild(btn);
    }

    header.appendChild(styleWrap);
  }

  container.appendChild(header);

  const subtitleEl = header.querySelector('.exam-subtitle')!;
  function updateQuestionCount() {
    const filtered = filterByStyle(allQuestions, selectedStyle);
    subtitleEl.textContent = `${filtered.length} questions available${selectedStyle ? ` (${selectedStyle} style)` : ''}`;
    // Rebuild the exam cards grid when style changes
    buildGrid();
  }

  function getStyleConfig(): { secsPerQ: number } {
    if (selectedStyle) {
      const style = testStyles.find(s => s.id === selectedStyle);
      if (style) return { secsPerQ: style.secsPerQuestion };
    }
    return { secsPerQ: 45 }; // default
  }

  let grid = document.createElement('div');
  grid.className = 'exam-grid';

  // Helper: get style-filtered pool
  function getPool(): PracticeQuestion[] {
    return filterByStyle(allQuestions, selectedStyle);
  }

  function buildGrid() {
    const newGrid = document.createElement('div');
    newGrid.className = 'exam-grid';
    buildGridContent(newGrid);
    grid.replaceWith(newGrid);
    grid = newGrid;
  }

  function buildGridContent(targetGrid: HTMLElement) {

  // Preset mock exams from pack
  for (const config of mockExams) {
    // Only show if style matches or exam has no style
    if (selectedStyle && config.style && config.style !== selectedStyle) continue;
    const card = document.createElement('div');
    card.className = 'exam-card';
    card.innerHTML = `
      <h3 class="exam-card-title">${esc(config.title)}</h3>
      <div class="exam-card-info">
        <span>\u23F1 ${config.timeMinutes} min</span>
        <span>\u2753 ${config.questionCount} questions</span>
        ${config.style ? `<span class="exam-style-tag">${esc(config.style)}</span>` : ''}
      </div>
    `;
    card.addEventListener('click', () => {
      const pool = getPool();
      const questions = resolveQuestions(config, pool);
      if (questions.length === 0) { showModal('No questions found for this exam configuration.', { title: 'No Questions', type: 'warning' }); return; }
      startExam({ config, questions, answers: new Map(), startedAt: Date.now(), finishedAt: null }, container, exam, subject, progress);
    });
    targetGrid.appendChild(card);
  }

  // Full mock exam (30 questions, balanced difficulty: ~30% easy, ~50% medium, ~20% hard)
  if (allQuestions.length >= 10) {
    const fullCard = document.createElement('div');
    fullCard.className = 'exam-card exam-card-quick';
    const { secsPerQ } = getStyleConfig();
    const fullCount = Math.min(30, getPool().length);
    const fullTime = Math.ceil(fullCount * secsPerQ / 60);
    fullCard.innerHTML = `
      <h3 class="exam-card-title">\u{1F3AF} Full Mock Exam</h3>
      <div class="exam-card-info">
        <span>\u23F1 ${fullTime} min</span>
        <span>\u2753 ${fullCount} questions</span>
        <span>Balanced difficulty</span>
      </div>
      <p style="font-size:0.75rem;color:var(--muted);margin-top:6px;">~30% Foundation, ~50% Standard, ~20% Extension</p>
    `;
    fullCard.addEventListener('click', () => {
      const pool = getPool();
      const questions = buildBalancedExam(pool, fullCount);
      const config: MockExamConfig = {
        id: 'full-mock', title: 'Full Mock Exam',
        timeMinutes: fullTime, questionCount: questions.length,
        style: selectedStyle ?? undefined,
      };
      startExam({ config, questions, answers: new Map(), startedAt: Date.now(), finishedAt: null }, container, exam, subject, progress);
    });
    targetGrid.appendChild(fullCard);
  }

  // Quick quiz (10 questions)
  if (allQuestions.length >= 5) {
    const quickCard = document.createElement('div');
    quickCard.className = 'exam-card';
    quickCard.innerHTML = `
      <h3 class="exam-card-title">\u26A1 Quick Quiz</h3>
      <div class="exam-card-info">
        <span>\u23F1 8 min</span>
        <span>\u2753 10 questions</span>
      </div>
    `;
    quickCard.addEventListener('click', () => {
      const questions = buildBalancedExam(getPool(), 10);
      const config: MockExamConfig = {
        id: 'quick', title: 'Quick Quiz',
        timeMinutes: 8, questionCount: questions.length,
      };
      startExam({ config, questions, answers: new Map(), startedAt: Date.now(), finishedAt: null }, container, exam, subject, progress);
    });
    targetGrid.appendChild(quickCard);
  }

  // Custom exam
  if (allQuestions.length >= 5) {
    const customCard = document.createElement('div');
    customCard.className = 'exam-card exam-card-custom';
    customCard.innerHTML = `
      <h3 class="exam-card-title">\u{1F527} Custom Exam</h3>
      <div class="exam-custom-opts">
        <label>Questions: <input type="number" id="custom-count" min="5" max="${allQuestions.length}" value="${Math.min(20, allQuestions.length)}" class="exam-custom-input"></label>
        <label>Time (min): <input type="number" id="custom-time" min="5" max="120" value="20" class="exam-custom-input"></label>
      </div>
    `;
    const startBtn = document.createElement('button');
    startBtn.className = 'exam-start-btn';
    startBtn.textContent = 'Start';
    startBtn.addEventListener('click', () => {
      const count = parseInt((customCard.querySelector('#custom-count') as HTMLInputElement).value) || 10;
      const time = parseInt((customCard.querySelector('#custom-time') as HTMLInputElement).value) || 15;
      const config: MockExamConfig = {
        id: 'custom', title: 'Custom Exam',
        timeMinutes: time, questionCount: count,
      };
      startExam({
        config,
        questions: buildBalancedExam(getPool(), count),
        answers: new Map(),
        startedAt: Date.now(),
        finishedAt: null,
      }, container, exam, subject, progress);
    });
    customCard.appendChild(startBtn);
    targetGrid.appendChild(customCard);
  }

  } // end buildGridContent

  buildGrid(); // initial render
  container.appendChild(grid);
}

function startExam(state: ExamState, container: HTMLElement, exam: string, subject: string, progress: StudyProgress): void {
  container.innerHTML = '';
  let currentIdx = 0;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Timer bar
  const timerBar = document.createElement('div');
  timerBar.className = 'exam-timer-bar';
  const timerText = document.createElement('span');
  timerText.className = 'exam-timer-text';
  const timerProgress = document.createElement('div');
  timerProgress.className = 'exam-timer-progress';
  timerBar.appendChild(timerText);
  timerBar.appendChild(timerProgress);
  container.appendChild(timerBar);

  const qArea = document.createElement('div');
  qArea.className = 'exam-question-area';
  container.appendChild(qArea);

  function updateTimer() {
    const elapsed = Date.now() - state.startedAt;
    const totalMs = state.config.timeMinutes * 60_000;
    const remaining = Math.max(0, totalMs - elapsed);
    const mins = Math.floor(remaining / 60_000);
    const secs = Math.floor((remaining % 60_000) / 1000);
    timerText.textContent = `${mins}:${String(secs).padStart(2, '0')} remaining`;
    timerProgress.style.width = `${(1 - elapsed / totalMs) * 100}%`;
    if (remaining <= 0) finishExam();
    if (remaining < 60_000) timerBar.classList.add('exam-timer-urgent');
  }

  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();

  function renderQ() {
    const q = state.questions[currentIdx]!;
    qArea.innerHTML = '';

    const qNum = document.createElement('div');
    qNum.className = 'exam-q-num';
    qNum.textContent = `Question ${currentIdx + 1} of ${state.questions.length}`;
    qArea.appendChild(qNum);

    const qText = document.createElement('div');
    qText.className = 'exam-q-text';
    qText.textContent = q.question;
    qArea.appendChild(qText);

    if (q.options && q.options.length > 0) {
      const opts = document.createElement('div');
      opts.className = 'exam-options';
      for (const opt of q.options) {
        const btn = document.createElement('button');
        btn.className = 'exam-option';
        if (state.answers.get(currentIdx) === opt) btn.classList.add('exam-option-selected');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          state.answers.set(currentIdx, opt);
          renderQ(); // re-render to show selection
        });
        opts.appendChild(btn);
      }
      qArea.appendChild(opts);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'exam-input';
      input.placeholder = 'Type your answer';
      input.value = state.answers.get(currentIdx) ?? '';
      input.addEventListener('input', () => { state.answers.set(currentIdx, input.value.trim()); });
      qArea.appendChild(input);
    }

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'exam-nav';
    if (currentIdx > 0) {
      const prev = document.createElement('button');
      prev.className = 'exam-nav-btn';
      prev.textContent = '\u2190 Prev';
      prev.addEventListener('click', () => { currentIdx--; renderQ(); });
      nav.appendChild(prev);
    }
    if (currentIdx < state.questions.length - 1) {
      const next = document.createElement('button');
      next.className = 'exam-nav-btn';
      next.textContent = 'Next \u2192';
      next.addEventListener('click', () => { currentIdx++; renderQ(); });
      nav.appendChild(next);
    }
    const finishBtn = document.createElement('button');
    finishBtn.className = 'exam-finish-btn';
    finishBtn.textContent = `Finish (${state.answers.size}/${state.questions.length} answered)`;
    finishBtn.addEventListener('click', async () => {
      const unanswered = state.questions.length - state.answers.size;
      if (unanswered > 0) {
        const yes = await showConfirm(`${unanswered} question(s) still unanswered.`, { title: 'Finish Exam?', type: 'warning', confirmText: 'Finish', cancelText: 'Continue' });
        if (!yes) return;
      }
      finishExam();
    });
    nav.appendChild(finishBtn);
    qArea.appendChild(nav);
  }

  function finishExam() {
    if (timerInterval) clearInterval(timerInterval);
    state.finishedAt = Date.now();
    container.innerHTML = '';

    let correct = 0;
    const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
    const details: { q: PracticeQuestion; userAnswer: string | null; correct: boolean }[] = [];
    for (let i = 0; i < state.questions.length; i++) {
      const q = state.questions[i]!;
      const ans = state.answers.get(i) ?? null;
      const isCorrect = ans !== null && normalizeAnswer(ans) === normalizeAnswer(q.answer);
      if (isCorrect) correct++;
      details.push({ q, userAnswer: ans, correct: isCorrect });

      // Record each answer in progress
      if (ans !== null) {
        progress.recordAttempt({
          packId,
          subject,
          topic: q.topic_id ?? q.topic ?? 'general',
          question: q.question,
          userAnswer: ans,
          correctAnswer: q.answer,
          correct: isCorrect,
          difficulty: q.difficulty,
          source: 'exam',
        });
      }
    }

    const pct = state.questions.length > 0 ? Math.round((correct / state.questions.length) * 100) : 0;
    const duration = state.finishedAt - state.startedAt;
    const mins = Math.floor(duration / 60_000);
    const secs = Math.floor((duration % 60_000) / 1000);

    const results = document.createElement('div');
    results.className = 'exam-results';
    results.innerHTML = `
      <h2 class="exam-results-title">Exam Complete</h2>
      <div class="exam-results-summary">
        <div class="exam-result-stat"><span class="exam-result-num">${pct}%</span><span>Score</span></div>
        <div class="exam-result-stat"><span class="exam-result-num">${correct}/${state.questions.length}</span><span>Correct</span></div>
        <div class="exam-result-stat"><span class="exam-result-num">${mins}:${String(secs).padStart(2, '0')}</span><span>Time</span></div>
      </div>
    `;
    // Quick progress breakdown
    const breakdown = document.createElement('div');
    breakdown.className = 'exam-breakdown';

    // By difficulty
    const byDiff: Record<number, { total: number; correct: number }> = {};
    const byTopic: Record<string, { total: number; correct: number }> = {};
    for (const d of details) {
      const diff = d.q.difficulty ?? 2;
      if (!byDiff[diff]) byDiff[diff] = { total: 0, correct: 0 };
      byDiff[diff].total++;
      if (d.correct) byDiff[diff].correct++;

      const topic = d.q.topic ?? 'General';
      if (!byTopic[topic]) byTopic[topic] = { total: 0, correct: 0 };
      byTopic[topic].total++;
      if (d.correct) byTopic[topic].correct++;
    }

    const diffLabels: Record<number, string> = { 1: 'Foundation', 2: 'Standard', 3: 'Extension' };
    let diffHtml = '<h3 class="exam-bd-title">By Difficulty</h3><div class="exam-bd-bars">';
    for (const [d, stats] of Object.entries(byDiff).sort((a, b) => +a[0] - +b[0])) {
      const p = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const cls = p >= 80 ? 'good' : p >= 50 ? 'ok' : 'weak';
      diffHtml += `<div class="exam-bd-row">
        <span class="exam-bd-label">${diffLabels[+d] ?? `Level ${d}`}</span>
        <span class="exam-bd-bar-wrap"><span class="exam-bd-bar exam-bd-${cls}" style="width:${p}%"></span></span>
        <span class="exam-bd-val">${stats.correct}/${stats.total} (${p}%)</span>
      </div>`;
    }
    diffHtml += '</div>';

    // By topic — sorted weakest first
    const topicEntries = Object.entries(byTopic).sort((a, b) => {
      const pA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
      const pB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
      return pA - pB;
    });
    let topicHtml = '<h3 class="exam-bd-title">By Topic</h3><div class="exam-bd-bars">';
    for (const [topic, stats] of topicEntries) {
      const p = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const cls = p >= 80 ? 'good' : p >= 50 ? 'ok' : 'weak';
      topicHtml += `<div class="exam-bd-row">
        <span class="exam-bd-label">${esc(topic)}</span>
        <span class="exam-bd-bar-wrap"><span class="exam-bd-bar exam-bd-${cls}" style="width:${p}%"></span></span>
        <span class="exam-bd-val">${stats.correct}/${stats.total}</span>
      </div>`;
    }
    topicHtml += '</div>';

    // Weak areas callout
    const weakTopics = topicEntries.filter(([, s]) => s.total > 0 && (s.correct / s.total) < 0.5);
    let weakHtml = '';
    if (weakTopics.length > 0) {
      weakHtml = `<div class="exam-weak-callout">
        <strong>\u26A0\uFE0F Focus areas:</strong> ${weakTopics.map(([t]) => esc(t)).join(', ')}
      </div>`;
    }

    breakdown.innerHTML = diffHtml + topicHtml + weakHtml;
    results.appendChild(breakdown);

    // Action buttons
    const actionsRow = document.createElement('div');
    actionsRow.className = 'exam-results-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'exam-print-btn';
    downloadBtn.textContent = '\u{1F4BE} Download Results';
    downloadBtn.addEventListener('click', () => {
      const data = {
        exam: state.config.title,
        date: new Date().toISOString(),
        score: { correct, total: state.questions.length, percentage: pct },
        duration: `${mins}m ${secs}s`,
        byDifficulty: Object.fromEntries(Object.entries(byDiff).map(([d, s]) => [diffLabels[+d] ?? d, s])),
        byTopic: byTopic,
        weakAreas: weakTopics.map(([t]) => t),
        questions: details.map((d, i) => ({
          num: i + 1, question: d.q.question, topic: d.q.topic,
          difficulty: d.q.difficulty, yourAnswer: d.userAnswer,
          correctAnswer: d.q.answer, correct: d.correct,
        })),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-results-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    const printBtn = document.createElement('button');
    printBtn.className = 'exam-print-btn';
    printBtn.textContent = '\u{1F5A8} Print Exam Paper';
    printBtn.addEventListener('click', () => printExamPaper(state.questions, state.config.title));

    const printAnswersBtn = document.createElement('button');
    printAnswersBtn.className = 'exam-print-btn';
    printAnswersBtn.textContent = '\u{1F4CB} Print Answers';
    printAnswersBtn.addEventListener('click', () => printAnswerSheet(state.questions, details, state.config.title));

    actionsRow.appendChild(downloadBtn);
    actionsRow.appendChild(printBtn);
    actionsRow.appendChild(printAnswersBtn);
    results.appendChild(actionsRow);

    container.appendChild(results);

    // Detailed review
    const review = document.createElement('div');
    review.className = 'exam-review';
    review.innerHTML = '<h3>Question Review</h3>';
    for (let i = 0; i < details.length; i++) {
      const d = details[i]!;
      const diffBadge = d.q.difficulty ? ` <span class="snotes-diff-badge snotes-diff-${d.q.difficulty}">${diffLabels[d.q.difficulty] ?? ''}</span>` : '';
      const row = document.createElement('div');
      row.className = `exam-review-item ${d.correct ? 'exam-review-correct' : 'exam-review-wrong'}`;
      row.innerHTML = `
        <div class="exam-review-q"><strong>Q${i + 1}:</strong> ${esc(d.q.question)}${diffBadge}</div>
        <div class="exam-review-ans">Your answer: ${d.userAnswer ? esc(d.userAnswer) : '<em>unanswered</em>'}</div>
        ${!d.correct ? `<div class="exam-review-correct-ans">Correct: ${esc(d.q.answer)}</div>` : ''}
        ${d.q.solutionSteps ? `<details class="exam-review-steps"><summary>Solution</summary><ol>${d.q.solutionSteps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}
        ${d.q.topic ? `<div class="exam-review-topic">${esc(d.q.topic)}</div>` : ''}
      `;
      review.appendChild(row);
    }
    container.appendChild(review);
  }

  renderQ();
}

/** Filter questions by test style */
function filterByStyle(questions: PracticeQuestion[], style: string | null): PracticeQuestion[] {
  if (!style) return questions;
  return questions.filter(q => !q.style || q.style === style || q.style === 'both');
}

/**
 * Build a balanced exam: ~30% Foundation (diff 1), ~50% Standard (diff 2), ~20% Extension (diff 3).
 * Shuffled, with topic diversity (avoids too many questions from one topic).
 */
function buildBalancedExam(pool: PracticeQuestion[], count: number): PracticeQuestion[] {
  const d1 = shuffle(pool.filter(q => (q.difficulty ?? 2) === 1));
  const d2 = shuffle(pool.filter(q => (q.difficulty ?? 2) === 2));
  const d3 = shuffle(pool.filter(q => (q.difficulty ?? 2) === 3));

  // Target counts: 30% easy, 50% medium, 20% hard
  let n1 = Math.round(count * 0.3);
  let n2 = Math.round(count * 0.5);
  let n3 = count - n1 - n2;

  // Adjust if we don't have enough at a level
  const take = (arr: PracticeQuestion[], n: number) => arr.slice(0, n);
  let result = [...take(d1, n1), ...take(d2, n2), ...take(d3, n3)];

  // If not enough, fill from any level
  if (result.length < count) {
    const used = new Set(result.map(q => q.id));
    const remaining = shuffle(pool.filter(q => !used.has(q.id)));
    result.push(...remaining.slice(0, count - result.length));
  }

  // Shuffle final order but group: easy first, then medium, then hard (like real exam)
  const easy = result.filter(q => (q.difficulty ?? 2) === 1);
  const med = result.filter(q => (q.difficulty ?? 2) === 2);
  const hard = result.filter(q => (q.difficulty ?? 2) === 3);
  return [...shuffle(easy), ...shuffle(med), ...shuffle(hard)].slice(0, count);
}

function resolveQuestions(config: MockExamConfig, all: PracticeQuestion[]): PracticeQuestion[] {
  if (config.questionIds && config.questionIds.length > 0) {
    const byId = new Map(all.map(q => [q.id, q]));
    return config.questionIds.map(id => byId.get(id)).filter(Boolean) as PracticeQuestion[];
  }
  let pool = all;
  if (config.topics && config.topics.length > 0) {
    pool = all.filter(q => q.topic && config.topics!.includes(q.topic));
  }
  return shuffle([...pool]).slice(0, config.questionCount);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

async function extractQuestionsFromNotes(
  exam: string, subject: string,
  content: ContentSourceAdapter, packManager: ContentPackManager,
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

  const out: PracticeQuestion[] = [];
  const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
  if (!categories) return [];
  for (const cat of categories) {
    for (const topic of ((cat['topics'] as Array<Record<string, unknown>>) || [])) {
      for (const [i, ex] of ((topic['examples'] as Array<Record<string, unknown>>) || []).entries()) {
        const q = ex['question'] as string | undefined;
        const ans = ex['answer'] as string | undefined;
        if (q && ans) {
          out.push({ id: `auto-${i}`, topic: topic['title'] as string, topic_id: (topic['topic_id'] as string) || undefined, question: q, options: ex['options'] as string[] | undefined, answer: ans, solutionSteps: ex['solution_steps'] as string[], difficulty: ex['difficulty'] as number | undefined });
        }
      }
    }
  }
  return out;
}

/** Print a clean exam paper (questions only, no answers) */
function printExamPaper(questions: PracticeQuestion[], title: string): void {
  const html = `<!doctype html><html><head><title>${esc(title)}</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 2rem auto; padding: 0 2rem; font-size: 12pt; color: #000; }
  h1 { text-align: center; font-size: 16pt; margin-bottom: 4px; }
  .info { text-align: center; font-size: 10pt; color: #666; margin-bottom: 20px; }
  .q { margin: 16px 0; page-break-inside: avoid; }
  .q-num { font-weight: bold; }
  .q-text { margin: 4px 0 8px 20px; }
  .q-passage { margin: 4px 0 8px 20px; font-style: italic; border-left: 2px solid #ccc; padding-left: 10px; }
  .opts { margin-left: 40px; }
  .opt { margin: 3px 0; }
  .answer-space { margin-left: 40px; border-bottom: 1px solid #ccc; height: 30px; width: 200px; }
  @media print { body { margin: 0; padding: 1cm; } }
</style></head><body>
<h1>${esc(title)}</h1>
<div class="info">${questions.length} questions \u00B7 Name: __________________ \u00B7 Date: __________</div>
${questions.map((q, i) => `
<div class="q">
  <span class="q-num">Q${i + 1}.</span>
  ${q.passage ? `<div class="q-passage">${esc(q.passage)}</div>` : ''}
  <div class="q-text">${esc(q.question)}</div>
  ${q.options ? `<div class="opts">${q.options.map((o, j) => `<div class="opt">${String.fromCharCode(65 + j)}) ${esc(o)}</div>`).join('')}</div>` : '<div class="answer-space"></div>'}
</div>`).join('')}
</body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

/** Print answer sheet with correct answers and explanations */
function printAnswerSheet(
  questions: PracticeQuestion[],
  details: { q: PracticeQuestion; userAnswer: string | null; correct: boolean }[] | null,
  title: string,
): void {
  const html = `<!doctype html><html><head><title>${esc(title)} — Answers</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 2rem auto; padding: 0 2rem; font-size: 11pt; color: #000; }
  h1 { text-align: center; font-size: 14pt; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; font-size: 10pt; }
  th { background: #f0f0f0; }
  .correct { color: green; font-weight: bold; }
  .wrong { color: red; }
  .explanation { margin: 8px 0; page-break-inside: avoid; }
  .exp-q { font-weight: bold; font-size: 10pt; }
  .exp-steps { margin-left: 16px; font-size: 9pt; color: #444; }
  @media print { body { margin: 0; padding: 1cm; } }
</style></head><body>
<h1>${esc(title)} — Answer Key</h1>
<table>
  <tr><th>#</th><th>Answer</th>${details ? '<th>Your Answer</th><th>Result</th>' : ''}<th>Topic</th></tr>
  ${questions.map((q, i) => {
    const d = details?.[i];
    return `<tr>
      <td>${i + 1}</td>
      <td class="correct">${esc(q.answer)}</td>
      ${d ? `<td>${d.userAnswer ? esc(d.userAnswer) : '—'}</td><td class="${d.correct ? 'correct' : 'wrong'}">${d.correct ? '\u2713' : '\u2717'}</td>` : ''}
      <td>${esc(q.topic ?? '')}</td>
    </tr>`;
  }).join('')}
</table>
<h2 style="font-size:12pt;">Detailed Solutions</h2>
${questions.map((q, i) => `
<div class="explanation">
  <div class="exp-q">Q${i + 1}: ${esc(q.question)}</div>
  <div><strong>Answer:</strong> ${esc(q.answer)}</div>
  ${q.solutionSteps ? `<div class="exp-steps"><ol>${q.solutionSteps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
  ${q.explanation ? `<div class="exp-steps">${esc(q.explanation)}</div>` : ''}
</div>`).join('')}
</body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

function normalizeAnswer(s: string): string { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
function esc(s: string): string { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
