/**
 * Solver strip — a compact, always-visible equation input + canvas
 * that sits at the top of notes pages for math/numerical subjects.
 * Separate from the inline SolverPanel (which opens per-example).
 */

import type { App } from '@engines/app/index.js';
import { Renderer } from '@engines/renderer/index.js';
import type { ThemeName } from '@engines/renderer/theme.js';
import type { PenCursor } from './pen-cursor.js';

export class SolverStrip {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private app: App;
  private penCursor: PenCursor;
  private canvasWrap: HTMLElement;
  private pauseBtn: HTMLButtonElement;
  private expanded = false;
  private lastInput = '';

  constructor(app: App, penCursor: PenCursor) {
    this.app = app;

    this.container = document.createElement('div');
    this.container.className = 'solver-strip';

    // Input row
    const row = document.createElement('div');
    row.className = 'solver-strip-row';

    const icon = document.createElement('span');
    icon.className = 'solver-strip-icon';
    icon.textContent = '\u270D\uFE0F';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'solver-strip-input';
    input.placeholder = 'Type an equation to solve, e.g. 2x + 3 = 7';
    input.spellcheck = false;

    const solveBtn = document.createElement('button');
    solveBtn.className = 'solver-strip-btn';
    solveBtn.textContent = 'Solve';

    row.appendChild(icon);
    row.appendChild(input);
    row.appendChild(solveBtn);
    this.container.appendChild(row);

    // Canvas area (hidden until first solve)
    this.canvasWrap = document.createElement('div');
    this.canvasWrap.className = 'solver-strip-canvas-wrap';
    this.canvasWrap.style.display = 'none';

    this.canvas = document.createElement('canvas');
    this.canvas.width = 860;
    this.canvas.height = 460;
    this.canvas.className = 'solver-strip-canvas';
    this.canvasWrap.appendChild(this.canvas);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'solver-strip-controls';

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
        this.solveAndPlay(this.lastInput);
      }
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'solver-btn';
    closeBtn.textContent = '\u2715 Close';
    closeBtn.addEventListener('click', () => this.collapse());

    controls.appendChild(this.pauseBtn);
    controls.appendChild(speedLabel);
    controls.appendChild(resetBtn);
    controls.appendChild(closeBtn);
    this.canvasWrap.appendChild(controls);

    this.container.appendChild(this.canvasWrap);

    // Renderer + pen cursor
    this.penCursor = penCursor;
    this.renderer = new Renderer({ canvas: this.canvas, tts: app.platform.tts });
    this.renderer.onCursorMove = penCursor.createCallback();

    // Events
    const doSolve = () => {
      const val = input.value.trim();
      if (!val) return;
      this.solveAndPlay(val);
    };
    solveBtn.addEventListener('click', doSolve);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSolve(); });
  }

  getElement(): HTMLElement { return this.container; }

  private solveAndPlay(input: string): void {
    this.lastInput = input;
    let lesson = this.app.solveWith('math', input);

    // Try extracting equation from wrapped text
    if (!lesson) {
      const match = input.match(/([^,;]*[=][^,;]+)/);
      if (match) lesson = this.app.solveWith('math', match[1]!.trim());
    }

    if (lesson) {
      this.expand();
      this.pauseBtn.textContent = '\u23F8 Pause';
      this.renderer.play(lesson);
    } else {
      this.expand();
      this.renderer.clear();
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        ctx.font = '18px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Could not parse. Supported formats:', 40, 50);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Linear:      2x + 3 = 7', 60, 85);
        ctx.fillText('Quadratic:   x^2 - 5x + 6 = 0', 60, 110);
        ctx.fillText('Two sides:   3x - 5 = 2x + 1', 60, 135);
      }
    }
  }

  private expand(): void {
    this.expanded = true;
    this.canvasWrap.style.display = 'block';
    this.penCursor.attachTo(this.canvasWrap, this.canvas);
    this.penCursor.show();
  }

  collapse(): void {
    this.renderer.abort();
    this.penCursor.hide();
    this.expanded = false;
    this.canvasWrap.style.display = 'none';
  }

  setTheme(theme: ThemeName): void {
    this.renderer.setTheme(theme);
  }

  destroy(): void {
    this.renderer.abort();
    this.penCursor.hide();
    this.container.remove();
  }
}
