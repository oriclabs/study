/**
 * Extension sidepanel — full app shell.
 * Imports same engines + subjects as PWA; swaps in ext platform adapters.
 */
import { App } from '@engines/app/index.js';
import { createExtPlatform } from '@platform/ext/index.js';
import { math } from '@subjects/math/index.js';
import { reading } from '@subjects/reading/index.js';
import { grammar } from '@subjects/grammar/index.js';
import { physics } from '@subjects/physics/index.js';
import { verbal } from '@subjects/verbal/index.js';
import { writing } from '@subjects/writing/index.js';
import { numerical } from '@subjects/numerical/index.js';
import type { ThemeName } from '@engines/renderer/theme.js';
import type { Lesson } from '@core/types/lesson.js';
import type { Question } from '@core/types/question.js';
import type { FeedbackLevel } from '@engines/feedback/index.js';

const canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
const curriculumSelect = document.getElementById('curriculum-select') as HTMLSelectElement;
const curriculumInfo = document.getElementById('curriculum-info') as HTMLDivElement;
const subjectSelect = document.getElementById('subject-select') as HTMLSelectElement;
const lessonSelect = document.getElementById('lesson-select') as HTMLSelectElement;
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const customInput = document.getElementById('custom-input') as HTMLInputElement;
const solveBtn = document.getElementById('solve-btn') as HTMLButtonElement;
const speedInput = document.getElementById('speed') as HTMLInputElement;
const speedVal = document.getElementById('speed-val') as HTMLSpanElement;
const themeSelect = document.getElementById('theme') as HTMLSelectElement;
const statsSummary = document.getElementById('stats-summary') as HTMLDivElement;

const practicePanel = document.getElementById('practice-panel') as HTMLElement;
const practicePrompt = document.getElementById('practice-prompt') as HTMLDivElement;
const practiceAnswer = document.getElementById('practice-answer') as HTMLInputElement;
const practiceChoices = document.getElementById('practice-choices') as HTMLDivElement;
const practiceProgress = document.getElementById('practice-progress') as HTMLSpanElement;
const practiceHint = document.getElementById('practice-hint') as HTMLDivElement;
const practiceFeedback = document.getElementById('practice-feedback') as HTMLDivElement;
const checkBtn = document.getElementById('check-btn') as HTMLButtonElement;
const hintBtn = document.getElementById('hint-btn') as HTMLButtonElement;
const nextQBtn = document.getElementById('next-q-btn') as HTMLButtonElement;

const app = new App({
  platform: createExtPlatform('sidepanel'),
  subjects: [math, numerical, verbal, reading, writing, grammar, physics],
  canvas,
});

interface PracticeState {
  lesson: Lesson;
  qIndex: number;
  hintsShown: number;
  selectedChoice: number | null;
  startedAt: number;
}
let practice: PracticeState | null = null;

async function boot() {
  await app.init();
  populateCurricula();
  populateSubjects();
  await populateLessons();
  await refreshCurriculumInfo();
  await refreshStats();
}

function populateCurricula() {
  curriculumSelect.innerHTML = '';
  for (const ref of app.curriculum.list()) {
    const opt = document.createElement('option');
    opt.value = ref.id;
    opt.textContent = `${ref.region} — ${ref.displayName}`;
    curriculumSelect.appendChild(opt);
  }
  const selected = app.curriculum.getSelectedId();
  if (selected) curriculumSelect.value = selected;
}

async function refreshCurriculumInfo() {
  const cur = await app.curriculum.getSelected();
  if (!cur) { curriculumInfo.textContent = ''; return; }
  curriculumInfo.textContent = `${cur.region} · ${cur.units.length} units · ${cur.assessmentStyle.calculatorPolicy} calc`;
}

function populateSubjects() {
  subjectSelect.innerHTML = '';
  for (const id of app.index.subjects()) {
    const mod = app.getSubject(id);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = mod?.displayName ?? id;
    subjectSelect.appendChild(opt);
  }
}

async function populateLessons() {
  const subject = subjectSelect.value;
  lessonSelect.innerHTML = '';
  const cur = await app.curriculum.getSelected();
  if (cur && cur.subject === subject) {
    const groups = app.curriculum.lessonsInCurriculum(cur);
    const used = new Set<string>();
    for (const { unit, lessons } of groups) {
      if (lessons.length === 0) continue;
      const g = document.createElement('optgroup');
      g.label = unit.title;
      for (const ref of lessons) {
        if (used.has(ref.id)) continue;
        used.add(ref.id);
        const opt = document.createElement('option');
        opt.value = ref.id;
        opt.textContent = ref.title + (ref.hasAssessment ? '  •' : '');
        g.appendChild(opt);
      }
      if (g.childElementCount > 0) lessonSelect.appendChild(g);
    }
    const other = app.index.bySubjectKey(subject).filter(r => !used.has(r.id));
    if (other.length > 0) {
      const g = document.createElement('optgroup');
      g.label = 'Other';
      for (const ref of other) {
        const opt = document.createElement('option');
        opt.value = ref.id;
        opt.textContent = ref.title + (ref.hasAssessment ? '  •' : '');
        g.appendChild(opt);
      }
      lessonSelect.appendChild(g);
    }
  } else {
    for (const ref of app.index.bySubjectKey(subject)) {
      const opt = document.createElement('option');
      opt.value = ref.id;
      opt.textContent = ref.title + (ref.hasAssessment ? '  •' : '');
      lessonSelect.appendChild(opt);
    }
  }
}

async function playSelected() {
  const id = lessonSelect.value;
  if (!id) return;
  setPlaying(true);
  hidePractice();
  try {
    const lesson = await app.loader.loadLesson(id);
    await app.renderer.play(lesson);
    if (lesson.assessment && lesson.assessment.questions.length > 0) startPractice(lesson);
  } finally { setPlaying(false); }
}

async function solveCustom() {
  const input = customInput.value.trim();
  if (!input) return;
  const lesson = app.solveWith('math', input);
  if (!lesson) { alert('Could not parse. Try "2x + 3 = 7" or "x^2 - 5x + 6 = 0".'); return; }
  setPlaying(true);
  hidePractice();
  try { await app.playSolvedLesson(lesson); }
  finally { setPlaying(false); }
}

function setPlaying(v: boolean) {
  playBtn.disabled = v;
  solveBtn.disabled = v;
  pauseBtn.disabled = !v;
  playBtn.textContent = v ? '…' : '▶ Play';
}

function togglePause() {
  if (!app.renderer.running) return;
  app.renderer.paused = !app.renderer.paused;
  pauseBtn.textContent = app.renderer.paused ? '▶' : '⏸';
}

function reset() {
  app.renderer.abort();
  app.renderer.clear();
  setPlaying(false);
  pauseBtn.textContent = '⏸';
  hidePractice();
}

/* Practice mode */
function startPractice(lesson: Lesson) {
  if (!lesson.assessment || lesson.assessment.questions.length === 0) return;
  practice = { lesson, qIndex: 0, hintsShown: 0, selectedChoice: null, startedAt: Date.now() };
  practicePanel.hidden = false;
  renderQuestion();
  practicePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function hidePractice() { practicePanel.hidden = true; practice = null; }
function currentQuestion(): Question | null {
  if (!practice) return null;
  return practice.lesson.assessment!.questions[practice.qIndex] ?? null;
}
function renderQuestion() {
  if (!practice) return;
  const q = currentQuestion();
  if (!q) return;
  practice.hintsShown = 0;
  practice.selectedChoice = null;
  practiceProgress.textContent = `Q${practice.qIndex + 1}/${practice.lesson.assessment!.questions.length}`;
  practicePrompt.textContent = q.prompt;
  if (q.type === 'mcq' && q.choices) {
    practiceChoices.hidden = false;
    practiceAnswer.hidden = true;
    practiceChoices.innerHTML = '';
    q.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = `${String.fromCharCode(65 + i)}. ${choice}`;
      btn.addEventListener('click', () => selectChoice(i, btn));
      practiceChoices.appendChild(btn);
    });
  } else {
    practiceChoices.hidden = true;
    practiceAnswer.hidden = false;
    practiceAnswer.value = '';
    practiceAnswer.focus();
  }
  practiceHint.hidden = true;
  practiceHint.innerHTML = '';
  practiceFeedback.hidden = true;
  practiceFeedback.innerHTML = '';
  practiceFeedback.className = 'feedback';
  checkBtn.disabled = false;
  hintBtn.disabled = false;
  nextQBtn.disabled = true;
}
function selectChoice(index: number, btn: HTMLButtonElement) {
  if (!practice) return;
  practice.selectedChoice = index;
  practiceChoices.querySelectorAll('.choice-btn').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
}
async function checkAnswer() {
  if (!practice) return;
  const q = currentQuestion();
  if (!q) return;
  let userAnswer: unknown;
  if (q.type === 'mcq') {
    if (practice.selectedChoice === null) return;
    userAnswer = practice.selectedChoice;
  } else {
    userAnswer = practiceAnswer.value.trim();
    if (!userAnswer) return;
  }
  const result = app.test.check(q, userAnswer, practice.lesson.subject);
  const timeMs = Date.now() - practice.startedAt;
  await app.progress.recordAttempt(practice.lesson.topic, {
    lessonId: practice.lesson.id,
    questionId: q.id,
    correct: result.correct,
    timeMs,
    timestamp: Date.now(),
    ...(result.mistake ? { mistake: result.mistake } : {}),
  });
  if (result.correct) {
    await app.sr.review(practice.lesson.topic, 4);
    showFeedback('correct', 'Correct!', 'Nicely done.');
    if (q.type === 'mcq') markChoices(practice.selectedChoice!, true);
  } else {
    await app.sr.review(practice.lesson.topic, 1);
    const fb: FeedbackLevel = result.mistake
      ? await app.feedback.record(result.mistake)
      : { level: 1, headline: 'Not quite.', explain: 'Try again.' };
    showFeedback('wrong', fb.headline, fb.explain);
    if (q.type === 'mcq' && q.answer.kind === 'choiceIndex') {
      markChoices(q.answer.value, false, practice.selectedChoice ?? undefined);
    }
  }
  checkBtn.disabled = true;
  hintBtn.disabled = true;
  nextQBtn.disabled = false;
  await refreshStats();
}
function showFeedback(kind: 'correct' | 'wrong', headline: string, detail?: string) {
  practiceFeedback.className = `feedback ${kind}`;
  practiceFeedback.hidden = false;
  practiceFeedback.innerHTML = `<div class="headline">${esc(headline)}</div>${detail ? `<div>${esc(detail)}</div>` : ''}`;
}
function markChoices(correctIdx: number, wasCorrect: boolean, selectedIdx?: number) {
  practiceChoices.querySelectorAll<HTMLButtonElement>('.choice-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
    else if (!wasCorrect && i === selectedIdx) btn.classList.add('wrong');
  });
}
function showHint() {
  if (!practice) return;
  const q = currentQuestion();
  if (!q || !q.hints || q.hints.length === 0) { flashHint('No hints.'); return; }
  if (practice.hintsShown >= q.hints.length) { flashHint('No more hints.'); return; }
  const hint = q.hints[practice.hintsShown]!;
  practice.hintsShown++;
  practiceHint.hidden = false;
  practiceHint.innerHTML = `<div class="headline">Hint ${practice.hintsShown}/${q.hints.length}</div><div>${esc(hint)}</div>`;
}
function flashHint(msg: string) {
  practiceHint.hidden = false;
  practiceHint.innerHTML = `<div>${esc(msg)}</div>`;
}
function nextQuestion() {
  if (!practice) return;
  practice.qIndex++;
  if (practice.qIndex >= practice.lesson.assessment!.questions.length) { hidePractice(); return; }
  renderQuestion();
}
function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

async function refreshStats() {
  const all = app.progress.all();
  if (all.length === 0) { statsSummary.textContent = 'No attempts yet.'; return; }
  const attempts = all.reduce((n, t) => n + t.attempts, 0);
  const correct = all.reduce((n, t) => n + t.correct, 0);
  const pct = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
  statsSummary.innerHTML = `<strong>${correct}/${attempts}</strong> correct (${pct}%)`;
}

playBtn.addEventListener('click', playSelected);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', reset);
solveBtn.addEventListener('click', solveCustom);
checkBtn.addEventListener('click', checkAnswer);
hintBtn.addEventListener('click', showHint);
nextQBtn.addEventListener('click', nextQuestion);
subjectSelect.addEventListener('change', () => { populateLessons().catch(console.error); });
curriculumSelect.addEventListener('change', async () => {
  await app.curriculum.select(curriculumSelect.value);
  await refreshCurriculumInfo();
  await populateLessons();
});
customInput.addEventListener('keydown', e => { if (e.key === 'Enter') solveCustom(); });
practiceAnswer.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
speedInput.addEventListener('input', () => {
  const v = parseFloat(speedInput.value);
  app.renderer.speed = v;
  speedVal.textContent = `${v.toFixed(1)}x`;
});
themeSelect.addEventListener('change', () => {
  app.renderer.setTheme(themeSelect.value as ThemeName);
});

boot().catch(err => {
  console.error(err);
  alert(`Failed to start: ${err.message}`);
});
