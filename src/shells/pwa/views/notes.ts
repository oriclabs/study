/**
 * Notes view — renders study notes for a subject using the snotes renderer.
 * Supports both category overview and individual topic drill-down.
 * Integrates with the Sidebar for left navigation.
 */

import type { ContentSourceAdapter, TTSAdapter } from '@platform/types.js';
import { SnotesRenderer } from '../components/snotes-renderer.js';
import type { SolverPanel } from '../components/solver-panel.js';
import type { SolverStrip } from '../components/solver-strip.js';
import type { Sidebar } from '../components/sidebar.js';
import type { PenCursor } from '../components/pen-cursor.js';
import type { ContentPackManager } from '../components/content-packs.js';
import { exampleToLesson } from '../components/steps-to-lesson.js';
import { navigate } from '../router.js';

/** Cache loaded notes to avoid refetching */
const notesCache = new Map<string, Record<string, unknown>>();

/** Load notes data (with cache). All content is pack-based. */
async function loadNotes(
  exam: string,
  subject: string,
  _content: ContentSourceAdapter,
  packManager: ContentPackManager,
): Promise<Record<string, unknown>> {
  const cacheKey = `${exam}/${subject}`;
  let data = notesCache.get(cacheKey);
  if (!data) {
    const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
    const notes = await packManager.loadNotes(packId, subject);
    if (!notes) throw new Error(`Notes not found for pack "${packId}", subject "${subject}"`);
    data = notes;
    notesCache.set(cacheKey, data);
  }
  return data;
}

/** Active step panel — one at a time */
let activeStepPanel: HTMLElement | null = null;

function cleanupStepPanel(): void {
  if (activeStepPanel) {
    activeStepPanel.remove();
    activeStepPanel = null;
  }
}

/** Create a configured SnotesRenderer with solver + steps callbacks wired */
function createNotesRenderer(
  subject: string,
  solverPanel: SolverPanel,
  penCursor: PenCursor,
  tts: TTSAdapter,
  container: HTMLElement,
): SnotesRenderer {
  const renderer = new SnotesRenderer();
  const subjectId = subject === 'quantitative' ? 'numerical' : subject;
  renderer.setSubjectId(subjectId);

  // Equation solver callback
  renderer.setSolverCallback((question, sid) => {
    const slots = container.querySelectorAll('.snotes-solver-slot');
    for (const slot of slots) {
      if ((slot as HTMLElement).dataset.question === question) {
        solverPanel.openAt(slot as HTMLElement, question, sid);
        break;
      }
    }
  });

  // Visual step-by-step — try solver first (for diagrams/graphs), fall back to steps-to-lesson
  renderer.setVisualStepsCallback((example, sid, slotEl) => {
    cleanupStepPanel();
    const ex = example as Record<string, unknown> & { question?: string; solution_steps?: string[]; answer?: string };
    const question = ex.question ?? '';

    solverPanel.openAt(slotEl, '', sid);

    // Try solver pipeline first — gives transformOps, diagrams, graphs
    if (question) {
      const solverLesson = solverPanel.trySolve(question, sid);
      if (solverLesson) {
        solverPanel.playLesson(solverLesson);
        return;
      }
    }

    // Fallback: use steps-to-lesson (text-based with basic transformOps)
    const lesson = exampleToLesson(ex, sid);
    if (lesson) solverPanel.playLesson(lesson);
  });

  // Step-by-step walkthrough — DOM-based with typing animation + pen cursor
  renderer.setStepsCallback((example, _sid, slotEl) => {
    cleanupStepPanel();

    const ex = example as Record<string, unknown>;
    const question = (ex['question'] as string) || '';
    const solutionSteps = (ex['solution_steps'] as string[]) || (ex['steps'] as string[]) || [];
    const answer = (ex['answer'] as string) || '';

    if (solutionSteps.length === 0) return;

    // Build lines
    const allLines: { text: string; type: 'question' | 'step' | 'answer' }[] = [];
    if (question) allLines.push({ text: question, type: 'question' });
    let sn = 0;
    for (const s of solutionSteps) { sn++; allLines.push({ text: `${sn}. ${s}`, type: 'step' }); }
    if (answer) allLines.push({ text: `\u2713 ${answer}`, type: 'answer' });

    // Panel
    const panel = document.createElement('div');
    panel.className = 'step-panel';

    // Board area (where text appears)
    const board = document.createElement('div');
    board.className = 'step-board';
    board.style.position = 'relative';
    panel.appendChild(board);

    // Pen cursor element
    const pen = document.createElement('div');
    pen.className = 'step-pen';
    pen.innerHTML = `<svg width="20" height="30" viewBox="0 0 24 36" fill="none">
      <rect x="8" y="0" width="8" height="28" rx="3" fill="#f0ece4" stroke="#c8c0b0" stroke-width="0.7"/>
      <polygon points="9,28 12,35 15,28" fill="#e8e4dc" stroke="#c8c0b0" stroke-width="0.5"/>
    </svg>`;
    board.appendChild(pen);

    // Pre-create line elements
    const lineEls: HTMLElement[] = [];
    for (const line of allLines) {
      const el = document.createElement('div');
      el.className = `step-line step-line-${line.type}`;
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.dataset.fullText = line.text;
      board.appendChild(el);
      lineEls.push(el);
    }

    // Controls
    const controls = document.createElement('div');
    controls.className = 'step-controls';

    const stepInfo = document.createElement('span');
    stepInfo.className = 'step-info';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'solver-btn';
    prevBtn.textContent = '\u23EA Prev';

    const playBtn = document.createElement('button');
    playBtn.className = 'solver-btn';
    playBtn.textContent = '\u25B6 Play';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'solver-btn';
    nextBtn.textContent = 'Next \u23E9';

    const speedLabel = document.createElement('label');
    speedLabel.className = 'solver-speed-label';
    speedLabel.textContent = 'Speed ';
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '5';
    speedSlider.step = '1';
    speedSlider.value = '2';
    speedSlider.className = 'solver-speed';
    speedLabel.appendChild(speedSlider);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'solver-btn';
    resetBtn.textContent = '\u21BA Reset';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'solver-btn solver-close-btn';
    closeBtn.textContent = '\u2715 Close';

    controls.appendChild(prevBtn);
    controls.appendChild(playBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(stepInfo);
    controls.appendChild(speedLabel);
    controls.appendChild(resetBtn);
    controls.appendChild(closeBtn);
    panel.appendChild(controls);

    slotEl.appendChild(panel);
    activeStepPanel = panel;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Animation state
    let currentLine = -1;
    let charIdx = 0;
    let typingTimer: ReturnType<typeof setTimeout> | null = null;
    let paused = false;

    function getSpeed(): number {
      // chars per tick: 1=slow, 5=instant
      return parseInt(speedSlider.value);
    }

    function getDelay(): number {
      const s = getSpeed();
      if (s >= 5) return 5;
      if (s >= 4) return 15;
      if (s >= 3) return 25;
      if (s >= 2) return 40;
      return 60;
    }

    function movePen(el: HTMLElement) {
      // Measure actual text width using a temporary span
      const boardRect = board.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // Create offscreen measurement span
      const measure = document.createElement('span');
      measure.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;';
      measure.style.font = getComputedStyle(el).font;
      measure.textContent = el.textContent || '';
      document.body.appendChild(measure);
      const textW = measure.offsetWidth;
      document.body.removeChild(measure);

      const x = elRect.left - boardRect.left + Math.min(textW, el.clientWidth - 4);
      const y = elRect.top - boardRect.top;
      pen.style.left = `${x}px`;
      pen.style.top = `${y - 6}px`;
      pen.style.display = 'block';
    }

    function revealLine(lineIdx: number, instant: boolean) {
      const el = lineEls[lineIdx]!;
      const text = el.dataset.fullText || '';
      el.style.visibility = 'visible';
      el.style.height = 'auto';
      el.style.overflow = 'visible';

      if (instant || getSpeed() >= 5) {
        el.textContent = text;
        movePen(el);
        return;
      }

      // Typing animation
      charIdx = 0;
      el.textContent = '';

      function typeChar() {
        if (paused) { typingTimer = setTimeout(typeChar, 50); return; }
        if (charIdx >= text.length) {
          movePen(el);
          return; // Done with this line
        }
        // Type multiple chars per tick based on speed
        const batch = Math.max(1, getSpeed());
        const end = Math.min(charIdx + batch, text.length);
        el.textContent = text.slice(0, end);
        charIdx = end;
        movePen(el);
        typingTimer = setTimeout(typeChar, getDelay());
      }
      typeChar();
    }

    function hideLine(lineIdx: number) {
      const el = lineEls[lineIdx]!;
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.textContent = '';
    }

    function updateInfo() {
      stepInfo.textContent = `${Math.max(0, currentLine + 1)}/${allLines.length}`;
    }

    function showUpTo(target: number, instant: boolean) {
      stopTyping();
      // Hide everything above target
      for (let i = target + 1; i < lineEls.length; i++) hideLine(i);
      // Reveal up to target
      for (let i = 0; i <= target; i++) {
        if (i < target) {
          // Already-shown lines: instant
          const el = lineEls[i]!;
          el.style.visibility = 'visible';
          el.style.height = 'auto';
          el.style.overflow = 'visible';
          el.textContent = el.dataset.fullText || '';
        } else {
          // Current line: animate (unless instant)
          revealLine(i, instant);
        }
      }
      currentLine = target;
      updateInfo();
    }

    function stopTyping() {
      if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
    }

    // Auto-play: reveal lines one by one with typing
    let autoTimer: ReturnType<typeof setTimeout> | null = null;

    function autoPlayNext() {
      if (currentLine >= allLines.length - 1) { stopAutoPlay(); return; }
      currentLine++;
      showUpTo(currentLine, false);
      // Wait for typing to finish, then delay before next line
      const text = allLines[currentLine]!.text;
      const typingTime = (text.length / Math.max(1, getSpeed())) * getDelay();
      autoTimer = setTimeout(autoPlayNext, typingTime + 600);
    }

    function startAutoPlay() {
      stopAutoPlay();
      paused = false;
      playBtn.textContent = '\u23F8 Pause';
      autoPlayNext();
    }

    function stopAutoPlay() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
      playBtn.textContent = '\u25B6 Play';
    }

    prevBtn.addEventListener('click', () => {
      stopAutoPlay();
      if (currentLine > 0) showUpTo(currentLine - 1, true);
      else if (currentLine === 0) { for (let i = 0; i < lineEls.length; i++) hideLine(i); currentLine = -1; updateInfo(); }
    });
    nextBtn.addEventListener('click', () => {
      stopAutoPlay();
      if (currentLine < allLines.length - 1) showUpTo(currentLine + 1, false);
    });
    playBtn.addEventListener('click', () => {
      if (autoTimer) { stopAutoPlay(); paused = true; }
      else { paused = false; startAutoPlay(); }
    });
    resetBtn.addEventListener('click', () => {
      stopAutoPlay(); stopTyping();
      for (let i = 0; i < lineEls.length; i++) hideLine(i);
      currentLine = -1;
      pen.style.display = 'none';
      updateInfo();
    });
    closeBtn.addEventListener('click', () => { stopAutoPlay(); stopTyping(); cleanupStepPanel(); });

    updateInfo();
    // Start immediately
    startAutoPlay();
  });

  return renderer;
}

export async function renderNotes(
  exam: string,
  subject: string,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
  solverPanel: SolverPanel,
  solverStrip: SolverStrip | null,
  sidebar: Sidebar,
  tts: TTSAdapter,
  penCursor: PenCursor,
  container: HTMLElement,
): Promise<void> {
  // Show loading
  container.innerHTML = '<div class="notes-loading">Loading notes...</div>';

  let data: Record<string, unknown>;
  try {
    data = await loadNotes(exam, subject, content, packManager);
  } catch (e) {
    container.innerHTML = '';
    const err = document.createElement('div');
    err.className = 'notes-error';
    err.textContent = `Failed to load notes: ${e instanceof Error ? e.message : String(e)}`;
    container.appendChild(err);
    return;
  }
  container.innerHTML = '';

  // Build sidebar from data
  sidebar.build(data, exam, subject);
  sidebar.setActive({ view: 'notes', exam, subject });

  // Render the exam info header
  const examInfo = data['exam'] as Record<string, unknown> | undefined;
  if (examInfo) {
    const header = document.createElement('div');
    header.className = 'notes-header';
    header.innerHTML = `
      <h2 class="notes-subject-title">${esc(examInfo['subject'] as string || subject)}</h2>
      <p class="notes-exam-name">${esc(examInfo['name'] as string || '')}</p>
    `;

    const rules = (examInfo['golden_rules'] || examInfo['golden_rule']) as string | string[] | undefined;
    if (rules) {
      const rulesEl = document.createElement('div');
      rulesEl.className = 'notes-golden-rules';
      rulesEl.innerHTML = '<h4>Golden Rules</h4>';
      const list = document.createElement('ul');
      const ruleArr = Array.isArray(rules) ? rules : [rules];
      for (const rule of ruleArr) {
        const li = document.createElement('li');
        li.textContent = rule;
        list.appendChild(li);
      }
      rulesEl.appendChild(list);
      header.appendChild(rulesEl);
    }

    container.appendChild(header);
  }

  // Solver strip (for math/numerical subjects)
  if (solverStrip) {
    container.appendChild(solverStrip.getElement());
  }

  // Render categories
  const renderer = createNotesRenderer(subject, solverPanel, penCursor, tts, container);
  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'notes-categories';
  renderer.renderCategories(data, categoriesContainer);

  // Wire up topic links
  categoriesContainer.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('.snotes-topic-link') as HTMLElement | null;
    if (!link) return;
    e.preventDefault();
    const catIdx = parseInt(link.dataset.catIdx!, 10);
    const topicIdx = parseInt(link.dataset.topicIdx!, 10);
    navigate({ view: 'notes-topic', exam, subject, categoryIdx: catIdx, topicIdx });
  });

  container.appendChild(categoriesContainer);
}

export async function renderNotesTopic(
  exam: string,
  subject: string,
  categoryIdx: number,
  topicIdx: number,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
  solverPanel: SolverPanel,
  solverStrip: SolverStrip | null,
  sidebar: Sidebar,
  tts: TTSAdapter,
  penCursor: PenCursor,
  container: HTMLElement,
): Promise<void> {
  let data: Record<string, unknown>;
  try {
    data = await loadNotes(exam, subject, content, packManager);
  } catch (e) {
    container.innerHTML = '';
    const err = document.createElement('div');
    err.className = 'notes-error';
    err.textContent = `Failed to load notes: ${e instanceof Error ? e.message : String(e)}`;
    container.appendChild(err);
    return;
  }

  // Build sidebar if not already built (e.g. direct URL navigation)
  sidebar.build(data, exam, subject);
  sidebar.setActive({ view: 'notes-topic', exam, subject, categoryIdx, topicIdx });

  const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
  if (!categories || !categories[categoryIdx]) {
    container.textContent = 'Category not found.';
    return;
  }

  const category = categories[categoryIdx];
  const topics = category['topics'] as Array<Record<string, unknown>> | undefined;
  if (!topics || !topics[topicIdx]) {
    container.textContent = 'Topic not found.';
    return;
  }

  const topic = topics[topicIdx];

  // Category name header
  const catName = (category['category'] as string) || `Category ${categoryIdx + 1}`;
  const catHeader = document.createElement('div');
  catHeader.className = 'notes-cat-header';
  catHeader.innerHTML = `<span class="notes-cat-label">${esc(catName)}</span>`;
  container.appendChild(catHeader);

  // Solver strip
  if (solverStrip) {
    container.appendChild(solverStrip.getElement());
  }

  // Render the topic
  const renderer = createNotesRenderer(subject, solverPanel, penCursor, tts, container);
  const topicContainer = document.createElement('div');
  topicContainer.className = 'notes-topic-detail';
  renderer.renderTopic(topic, topicContainer);
  container.appendChild(topicContainer);

  // Topic navigation: prev/next within category
  const nav = document.createElement('div');
  nav.className = 'notes-topic-nav';

  if (topicIdx > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'notes-nav-btn';
    const prevTitle = (topics[topicIdx - 1]['title'] as string) || 'Previous';
    prevBtn.textContent = `\u2190 ${prevTitle}`;
    prevBtn.addEventListener('click', () => {
      navigate({ view: 'notes-topic', exam, subject, categoryIdx, topicIdx: topicIdx - 1 });
    });
    nav.appendChild(prevBtn);
  }

  if (topicIdx < topics.length - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'notes-nav-btn notes-nav-next';
    const nextTitle = (topics[topicIdx + 1]['title'] as string) || 'Next';
    nextBtn.textContent = `${nextTitle} \u2192`;
    nextBtn.addEventListener('click', () => {
      navigate({ view: 'notes-topic', exam, subject, categoryIdx, topicIdx: topicIdx + 1 });
    });
    nav.appendChild(nextBtn);
  }

  container.appendChild(nav);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
