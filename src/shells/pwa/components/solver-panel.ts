/**
 * Solver panel — inline expandable auto-solver canvas.
 * Single shared instance that gets repositioned into whichever example is expanded.
 * Owns its own Renderer instance since it has its own canvas element.
 */

import type { App } from '@engines/app/index.js';
import { Renderer } from '@engines/renderer/index.js';
import type { ThemeName } from '@engines/renderer/theme.js';
import type { PenCursor } from './pen-cursor.js';
import type { StrategyPicker } from './strategy-picker.js';

export class SolverPanel {
  private app: App;
  private renderer: Renderer;
  private penCursor: PenCursor;
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private canvasWrap: HTMLElement;
  private currentSlot: HTMLElement | null = null;
  private inputField: HTMLInputElement;
  private pauseBtn: HTMLButtonElement;
  private stepModeBtn: HTMLButtonElement;
  private stepNav: HTMLElement;
  private stepLabel: HTMLElement;
  private historyEl: HTMLElement;
  private exportRow: HTMLElement;
  private strategyPicker: StrategyPicker | null = null;
  private subjectHint = 'math';
  private lastInput = '';
  private lastSubject = 'math';
  private lastLesson: import('@core/types/lesson.js').Lesson | null = null;
  private stepMode = false;
  private stepIndex = -1;
  private playing = false;
  private activeWatchBtn: HTMLButtonElement | null = null;
  private history: string[] = [];
  private inline = false; // true = embedded in notes (scrollbar), false = standalone (page scroll)

  constructor(app: App, penCursor: PenCursor) {
    this.app = app;
    this.penCursor = penCursor;

    // Build the panel DOM
    this.container = document.createElement('div');
    this.container.className = 'solver-panel';
    this.container.style.display = 'none';

    // Canvas wrapper (scrollable)
    this.canvasWrap = document.createElement('div');
    this.canvasWrap.className = 'solver-canvas-wrap';
    this.canvas = document.createElement('canvas');
    this.canvas.width = 860;
    this.canvas.height = 300;
    this.canvas.className = 'solver-canvas';
    this.canvasWrap.appendChild(this.canvas);
    // Canvas wrapper added after controls (see below)

    // Create a dedicated Renderer for this canvas
    this.renderer = new Renderer({
      canvas: this.canvas,
      tts: app.platform.tts,
    });
    this.renderer.onCursorMove = penCursor.createCallback();

    // After playback, trim canvas and show export buttons
    this.renderer.onPlayComplete = (finalY) => {
      this.playing = false;
      this.exportRow.style.display = '';
      // Re-enable the "Watch it solved" button
      if (this.activeWatchBtn) {
        this.activeWatchBtn.disabled = false;
        this.activeWatchBtn.textContent = '\u25B6 Watch it solved';
      }
      // Trim canvas to content height (removes empty space below)
      const trimHeight = Math.max(200, Math.ceil(finalY + 40));
      if (trimHeight < this.canvas.height) {
        const imgData = this.canvas.getContext('2d')!.getImageData(0, 0, this.canvas.width, trimHeight);
        this.canvas.height = trimHeight;
        this.canvas.getContext('2d')!.putImageData(imgData, 0, 0);
      }
      // For inline mode, scroll wrapper to show final content
      if (this.inline) {
        this.canvasWrap.scrollTop = this.canvasWrap.scrollHeight;
      }
    };

    // Controls
    const controls = document.createElement('div');
    controls.className = 'solver-controls';

    // Pause overlay
    this.canvasWrap.style.position = 'relative';
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'canvas-paused-overlay';
    pauseOverlay.textContent = '\u23F8 PAUSED';
    pauseOverlay.style.display = 'none';
    this.canvasWrap.appendChild(pauseOverlay);

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'solver-btn';
    this.pauseBtn.textContent = '\u23F8 Pause';
    this.pauseBtn.addEventListener('click', () => {
      if (!this.renderer.running) return;
      this.renderer.paused = !this.renderer.paused;
      this.pauseBtn.textContent = this.renderer.paused ? '\u25B6 Resume' : '\u23F8 Pause';
      pauseOverlay.style.display = this.renderer.paused ? 'block' : 'none';
    });

    const speedLabel = document.createElement('label');
    speedLabel.className = 'solver-speed-label';
    speedLabel.textContent = 'Speed ';
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.5';
    speedSlider.max = '3';
    speedSlider.step = '0.25';
    speedSlider.value = '1';
    speedSlider.className = 'solver-speed';
    speedSlider.addEventListener('input', () => {
      this.renderer.speed = parseFloat(speedSlider.value);
    });
    speedLabel.appendChild(speedSlider);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'solver-btn';
    resetBtn.textContent = '\u21BA Reset';
    resetBtn.addEventListener('click', () => {
      if (this.lastInput) {
        this.pauseBtn.textContent = '\u23F8 Pause';
        this.solveAndPlay(this.lastInput, this.lastSubject);
      }
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'solver-btn solver-close-btn';
    closeBtn.textContent = '\u2715 Close';
    closeBtn.addEventListener('click', () => this.close());

    // Export buttons (hidden until a solve completes)
    const copyTextBtn = document.createElement('button');
    copyTextBtn.className = 'solver-btn solver-export-btn';
    copyTextBtn.textContent = '\uD83D\uDCCB Copy';
    copyTextBtn.addEventListener('click', () => this.exportText());

    const saveImgBtn = document.createElement('button');
    saveImgBtn.className = 'solver-btn solver-export-btn';
    saveImgBtn.textContent = '\uD83D\uDCF7 Image';
    saveImgBtn.addEventListener('click', () => this.exportImage());

    this.exportRow = document.createElement('span');
    this.exportRow.className = 'solver-export-group';
    this.exportRow.style.display = 'none';
    this.exportRow.appendChild(copyTextBtn);
    this.exportRow.appendChild(saveImgBtn);

    // Step mode toggle
    this.stepModeBtn = document.createElement('button');
    this.stepModeBtn.className = 'solver-btn solver-step-mode-btn';
    this.stepModeBtn.textContent = 'Step';
    this.stepModeBtn.title = 'Toggle step-by-step mode';
    this.stepModeBtn.addEventListener('click', () => this.toggleStepMode());

    controls.appendChild(this.pauseBtn);
    controls.appendChild(speedLabel);
    controls.appendChild(resetBtn);
    controls.appendChild(this.stepModeBtn);
    controls.appendChild(this.exportRow);
    controls.appendChild(closeBtn);
    this.container.appendChild(controls);

    // Step navigation bar (hidden until step mode is activated)
    this.stepNav = document.createElement('div');
    this.stepNav.className = 'solver-step-nav';
    this.stepNav.style.display = 'none';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'solver-btn';
    prevBtn.textContent = '\u25C0 Prev';
    prevBtn.addEventListener('click', () => this.stepPrev());

    this.stepLabel = document.createElement('span');
    this.stepLabel.className = 'solver-step-label';
    this.stepLabel.textContent = 'Step 0 of 0';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'solver-btn';
    nextBtn.textContent = 'Next \u25B6';
    nextBtn.addEventListener('click', () => this.stepNext());

    this.stepNav.appendChild(prevBtn);
    this.stepNav.appendChild(this.stepLabel);
    this.stepNav.appendChild(nextBtn);
    this.container.appendChild(this.stepNav);

    // Free-form input row
    const inputRow = document.createElement('div');
    inputRow.className = 'solver-input-row';

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Type an equation, e.g. 3x + 5 = 20';
    this.inputField.className = 'solver-input';
    this.inputField.spellcheck = false;

    const solveBtn = document.createElement('button');
    solveBtn.className = 'solver-btn solver-solve-btn';
    solveBtn.textContent = 'Solve';
    solveBtn.addEventListener('click', () => this.solveCustom());

    const pickMethodBtn = document.createElement('button');
    pickMethodBtn.className = 'solver-btn';
    pickMethodBtn.textContent = 'Pick a method';
    pickMethodBtn.addEventListener('click', () => this.openStrategyPicker());

    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.solveCustom();
    });
    this.inputField.addEventListener('input', () => this.clearInputError());

    inputRow.appendChild(this.inputField);
    inputRow.appendChild(solveBtn);
    inputRow.appendChild(pickMethodBtn);
    this.container.appendChild(inputRow);

    // History / recent equations
    this.historyEl = document.createElement('div');
    this.historyEl.className = 'solver-history';
    this.container.appendChild(this.historyEl);

    // Canvas wrapper goes last — controls/input/history stay above, always visible
    this.container.appendChild(this.canvasWrap);

    // Load history from localStorage
    try {
      const saved = localStorage.getItem('solver-history');
      if (saved) this.history = JSON.parse(saved);
    } catch { /* ignore */ }
    this.renderHistory();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  /** Open the solver panel below a specific slot element */
  openAt(slot: HTMLElement, question: string, subjectId: string): void {
    this.subjectHint = subjectId;

    // Detect if this is inline (inside notes card) vs standalone (solve view)
    this.inline = !slot.classList.contains('solve-slot');

    // Always abort + clear previous state
    if (this.playing) {
      this.renderer.abort();
      this.playing = false;
    }
    this.renderer.clear();

    // Set scroll mode based on context
    this.canvasWrap.classList.toggle('solver-inline', this.inline);
    if (!this.inline) {
      this.canvasWrap.style.maxHeight = '';
      this.canvasWrap.style.overflowY = 'visible';
    }

    // Save scroll position before DOM changes
    const scrollY = window.scrollY;

    // Close previous if different slot — hide first to prevent layout shift
    if (this.currentSlot && this.currentSlot !== slot) {
      this.container.style.display = 'none';
      if (this.container.parentElement === this.currentSlot) {
        this.currentSlot.removeChild(this.container);
      }
    }
    this.currentSlot = slot;
    slot.appendChild(this.container);
    this.container.style.display = 'block';

    // Hide history and input row in inline mode (notes "Watch it solved")
    this.historyEl.style.display = this.inline ? 'none' : '';

    // Disable the "Watch it solved" button that triggered this (find it in the slot)
    if (this.activeWatchBtn) {
      this.activeWatchBtn.disabled = false;
      this.activeWatchBtn.textContent = '\u25B6 Watch it solved';
    }
    const watchBtn = slot.querySelector('.snotes-solve-btn') as HTMLButtonElement | null;
    if (watchBtn) {
      watchBtn.disabled = true;
      watchBtn.textContent = '\u23F9 Playing...';
      this.activeWatchBtn = watchBtn;
    }

    // Aggressively restore scroll — prevent browser auto-scroll on DOM insertion
    if (this.inline) {
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
      setTimeout(() => window.scrollTo(0, scrollY), 50);
    }

    this.penCursor.attachTo(this.canvasWrap, this.canvas);
    this.penCursor.show();
    this.pauseBtn.textContent = '\u23F8 Pause';
    if (question) {
      this.solveAndPlay(question, subjectId);
    }
  }

  /** Solve from the free-form input field */
  private solveCustom(): void {
    const input = this.inputField.value.trim();
    if (!input) return;

    // Validate input
    const error = validateInput(input);
    if (error) {
      this.showInputError(error);
      return;
    }

    this.clearInputError();
    this.pauseBtn.textContent = '\u23F8 Pause';
    this.solveAndPlay(input, this.subjectHint);
  }

  private showInputError(msg: string): void {
    this.clearInputError();
    const el = document.createElement('div');
    el.className = 'solver-input-error';
    el.textContent = msg;
    this.inputField.classList.add('solver-input-invalid');
    this.inputField.parentElement?.after(el);
  }

  private clearInputError(): void {
    this.inputField.classList.remove('solver-input-invalid');
    this.container.querySelector('.solver-input-error')?.remove();
  }

  private addToHistory(input: string): void {
    if (input.length < 3) return; // skip very short inputs
    // Remove duplicates, add to front, keep max 10
    this.history = [input, ...this.history.filter(h => h !== input)].slice(0, 10);
    try { localStorage.setItem('solver-history', JSON.stringify(this.history)); } catch { /* ignore */ }
    this.renderHistory();
  }

  private renderHistory(): void {
    this.historyEl.innerHTML = '';
    if (this.history.length === 0) return;

    const label = document.createElement('span');
    label.className = 'solver-history-label';
    label.textContent = 'Recent:';
    this.historyEl.appendChild(label);

    for (const item of this.history.slice(0, 6)) {
      const btn = document.createElement('button');
      btn.className = 'solver-history-item';
      btn.textContent = item.length > 28 ? item.slice(0, 25) + '\u2026' : item;
      btn.title = item; // full text on hover
      btn.addEventListener('click', () => {
        this.inputField.value = item;
        this.solveCustom();
      });
      this.historyEl.appendChild(btn);
    }
  }

  private solveAndPlay(input: string, subjectId: string): void {
    this.lastInput = input;
    this.lastSubject = subjectId;
    this.lastLesson = null;
    this.exportRow.style.display = 'none';
    this.stepIndex = -1;
    if (this.stepMode) this.updateStepLabel();
    this.addToHistory(input);
    // Reset canvas to full height for new content
    this.canvas.height = 300;
    // Try the given subject first, then fall back to math (the universal equation solver)
    let lesson = this.app.solveWith(subjectId, input);
    if (!lesson && subjectId !== 'math') {
      lesson = this.app.solveWith('math', input);
    }

    // If input looks like "Solve: 2x + 3 = 7", try extracting the equation part
    if (!lesson) {
      const extracted = extractEquation(input);
      if (extracted && extracted !== input) {
        lesson = this.app.solveWith('math', extracted);
      }
    }

    if (lesson) {
      this.lastLesson = lesson;
      this.renderer.play(lesson);
    } else {
      // Show helpful error message on the canvas
      this.renderer.clear();
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        ctx.font = '18px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Could not parse this as an equation.', 40, 50);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        const maxWidth = this.canvas.width - 80;
        wrapText(ctx, `Input: "${input}"`, 40, 85, maxWidth, 20);
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('Try typing an equation directly:', 40, 140);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Linear:      2x + 3 = 7', 60, 170);
        ctx.fillText('Quadratic:   x^2 - 5x + 6 = 0', 60, 195);
        ctx.fillText('Two sides:   3x - 5 = 2x + 1', 60, 220);
      }
    }
  }

  /** Play a pre-built Lesson directly on this panel's canvas. */
  playLesson(lesson: import('@core/types/lesson.js').Lesson): void {
    // Abort any running animation first
    if (this.playing) {
      this.renderer.abort();
    }
    this.playing = true;
    this.lastInput = '';
    this.lastLesson = lesson;
    this.pauseBtn.textContent = '\u23F8 Pause';
    this.canvas.height = 300;
    this.exportRow.style.display = 'none';
    this.renderer.clear();

    if (this.stepMode) {
      // In step mode: play title then stop, user clicks Next to advance
      this.stepIndex = -1;
      this.renderer.play(lesson); // starts playing
      // Abort after title draws (give it a moment to render title)
      setTimeout(() => {
        this.renderer.abort();
        this.stepIndex = -1;
        this.updateStepLabel();
      }, 500);
    } else {
      this.renderer.play(lesson);
    }
  }

  /** Copy solution as plain text to clipboard. */
  private exportText(): void {
    if (!this.lastLesson) return;
    const lines: string[] = [this.lastLesson.title];
    for (const s of this.lastLesson.steps) {
      for (const op of s.ops) {
        if (op.op === 'write') {
          lines.push(op.data.text);
        } else if (op.op === 'transform') {
          lines.push(op.data.from);
          if (op.data.operation) lines.push(`  \u2192 ${op.data.operation}`);
          lines.push(`  ${op.data.to}`);
        }
      }
    }
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.showExportFeedback('Copied!');
    }).catch(() => {
      // Fallback for extension context where clipboard API may be restricted
      this.showExportFeedback('Copy failed');
    });
  }

  /** Save canvas as PNG image. */
  private exportImage(): void {
    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `solution-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    this.showExportFeedback('Saved!');
  }

  /** Brief feedback text on export buttons. */
  private showExportFeedback(msg: string): void {
    const el = document.createElement('span');
    el.className = 'solver-export-feedback';
    el.textContent = msg;
    this.exportRow.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  close(): void {
    this.renderer.abort();
    this.renderer.clear();
    this.playing = false;
    this.penCursor.hide();
    this.canvasWrap.style.maxHeight = '';
    this.container.style.display = 'none';
    this.strategyPicker?.close();
    if (this.activeWatchBtn) {
      this.activeWatchBtn.disabled = false;
      this.activeWatchBtn.textContent = '\u25B6 Watch it solved';
      this.activeWatchBtn = null;
    }
    if (this.currentSlot && this.container.parentElement === this.currentSlot) {
      this.currentSlot.removeChild(this.container);
    }
    this.currentSlot = null;
  }

  setTheme(theme: ThemeName): void {
    this.renderer.setTheme(theme);
  }

  setSubjectHint(subject: string): void {
    this.subjectHint = subject;
  }

  private toggleStepMode(): void {
    this.stepMode = !this.stepMode;
    this.stepModeBtn.classList.toggle('solver-step-mode-active', this.stepMode);
    this.stepModeBtn.textContent = this.stepMode ? 'Auto' : 'Step';
    this.stepNav.style.display = this.stepMode ? 'flex' : 'none';

    if (this.stepMode) {
      // Pause current playback
      this.renderer.abort();
      this.stepIndex = this.renderer.currentStep;
      this.updateStepLabel();
    }
  }

  private stepNext(): void {
    if (!this.lastLesson) return;
    const total = this.lastLesson.steps.length;
    if (this.stepIndex < total - 1) {
      this.stepIndex++;
      this.renderer.playSingleStep(this.stepIndex);
      this.updateStepLabel();
    }
  }

  private stepPrev(): void {
    if (this.stepIndex > 0) {
      this.stepIndex--;
      this.renderer.jumpToStep(this.stepIndex);
      this.updateStepLabel();
    } else if (this.stepIndex === 0) {
      this.stepIndex = -1;
      this.renderer.prevStep();
      this.updateStepLabel();
    }
  }

  private updateStepLabel(): void {
    const total = this.lastLesson?.steps.length ?? 0;
    const current = this.stepIndex + 1;
    const stepData = this.lastLesson?.steps[this.stepIndex];
    const kind = stepData?.kind ?? '';
    const narration = stepData?.narration ?? '';
    const desc = narration ? ` \u2014 ${narration.slice(0, 40)}` : kind ? ` (${kind})` : '';
    this.stepLabel.textContent = `Step ${Math.max(0, current)} of ${total}${desc}`;
  }

  /** Try to solve without playing. Returns lesson or null if solver can't handle it. */
  trySolve(input: string, subjectId: string): import('@core/types/lesson.js').Lesson | null {
    // Normalize Unicode for consistent parsing
    const normalized = input
      .replace(/\u2212/g, '-').replace(/\u00D7/g, '*').replace(/\u00F7/g, '/')
      .replace(/\u00B2/g, '^2').replace(/\u00B3/g, '^3');

    let lesson = this.app.solveWith(subjectId, normalized);
    if (!lesson && subjectId !== 'math') {
      lesson = this.app.solveWith('math', normalized);
    }
    if (!lesson) {
      const extracted = extractEquation(normalized);
      if (extracted && extracted !== normalized) {
        lesson = this.app.solveWith('math', extracted);
      }
    }
    return lesson;
  }

  /** Attach a strategy picker. Its panel will be mounted inside the solver container. */
  setStrategyPicker(picker: StrategyPicker): void {
    this.strategyPicker = picker;
    picker.onPlay = (lesson) => this.playLesson(lesson);
    this.container.appendChild(picker.getElement());
  }

  private openStrategyPicker(): void {
    const input = this.inputField.value.trim();
    if (!input || !this.strategyPicker) return;
    const opened = this.strategyPicker.open(input, this.subjectHint);
    if (!opened) {
      // Can't classify — fall back to quick solve
      this.solveAndPlay(input, this.subjectHint);
    }
  }
}

/** Validate solver input before attempting to solve. */
function validateInput(input: string): string | null {
  if (input.length > 200) return 'Input is too long. Keep it under 200 characters.';
  if (/[<>{}[\]\\|@#$&~`]/.test(input)) return 'Contains unsupported characters. Use numbers, letters, operators (+−×÷=), and parentheses.';
  if ((input.match(/\(/g) ?? []).length !== (input.match(/\)/g) ?? []).length) return 'Mismatched parentheses.';
  if (/={2,}/.test(input)) return 'Use a single = sign for equations.';
  if (/\/\s*0(?!\d)/.test(input)) return 'Division by zero is not allowed.';
  return null;
}

/** Try to extract an equation from a question string. */
function extractEquation(input: string): string | null {
  // "Solve: 2x + 3 = 7" → "2x + 3 = 7"
  const solveMatch = input.match(/solve\s*[:.]?\s*(.+=.+)/i);
  if (solveMatch) return solveMatch[1]!.trim();

  // Look for something with = sign that has x
  const eqMatch = input.match(/([^,;]*x[^,;]*=[^,;]+)/i);
  if (eqMatch) return eqMatch[1]!.trim();

  return null;
}

/** Word-wrap text on canvas. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, currentY);
}
