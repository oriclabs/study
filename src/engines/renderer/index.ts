import type { Lesson, Step } from '@core/types/lesson.js';
import type { TTSAdapter } from '@platform/types.js';
import { createContext, clearCanvas, AbortError, type RenderContext } from './state.js';
import { getTheme, type ThemeName } from './theme.js';
import { buildOpRegistry, type OpHandler } from './ops/index.js';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  tts: TTSAdapter;
  theme?: ThemeName;
  speed?: number;
}

interface StepSnapshot {
  imageData: ImageData;
  cursorX: number;
  cursorY: number;
}

export class Renderer {
  private ctx: RenderContext;
  private registry: Record<string, OpHandler>;
  private _running = false;
  private tts: TTSAdapter;
  voiceEnabled = false;

  /** Step snapshots for rewind/forward */
  private _snapshots: StepSnapshot[] = [];
  private _currentStep = -1;
  private _lesson: Lesson | null = null;

  /** Callback fired when step index changes (for UI updates) */
  onStepChange?: (stepIndex: number, totalSteps: number) => void;

  /** Callback fired when play finishes, with the final cursor Y position. */
  onPlayComplete?: (finalCursorY: number) => void;

  constructor(private opts: RendererOptions) {
    this.ctx = createContext(opts.canvas, getTheme(opts.theme ?? 'whiteboard'), {
      speed: opts.speed ?? 1,
    });
    this.registry = buildOpRegistry(opts.tts);
    this.tts = opts.tts;
    clearCanvas(this.ctx);
  }

  get running(): boolean { return this._running; }
  get paused(): boolean { return this.ctx.paused; }
  set paused(v: boolean) { this.ctx.paused = v; }

  get speed(): number { return this.ctx.speed; }
  set speed(v: number) { this.ctx.speed = v; }

  get currentStep(): number { return this._currentStep; }
  get totalSteps(): number { return this._lesson?.steps.length ?? 0; }

  setTheme(name: ThemeName): void {
    this.ctx.theme = getTheme(name);
    clearCanvas(this.ctx);
  }

  set onCursorMove(cb: ((x: number, y: number) => void) | undefined) {
    this.ctx.onCursorMove = cb;
  }

  clear(): void {
    this.ctx.aborted = false;
    this.ctx.paused = false;
    this._running = false;
    clearCanvas(this.ctx);
    this._snapshots = [];
    this._currentStep = -1;
  }

  abort(): void {
    this.ctx.aborted = true;
    this.ctx.paused = false; // Ensure sleep loops can exit
    if (this.voiceEnabled) this.tts.cancel();
  }

  async play(lesson: Lesson): Promise<void> {
    if (this._running) {
      this.abort();
      await new Promise(r => setTimeout(r, 100));
    }
    this._lesson = lesson;
    this._snapshots = [];
    this._currentStep = -1;
    this.ctx.aborted = false;
    this.ctx.paused = false;
    this._running = true;
    clearCanvas(this.ctx);

    await this.drawTitle(lesson.title);

    // Snapshot after title (step -1 = title only)
    this._snapshots = [this.takeSnapshot()];

    try {
      for (let i = 0; i < lesson.steps.length; i++) {
        if (this.ctx.aborted) break;
        this._currentStep = i;
        this.onStepChange?.(i, lesson.steps.length);
        await this.playStep(lesson.steps[i]!);
        // Snapshot after each step
        this._snapshots.push(this.takeSnapshot());
      }
    } catch (e) {
      if (!(e instanceof AbortError)) throw e;
    } finally {
      this._running = false;
      this.onPlayComplete?.(this.ctx.cursor.y);
    }
  }

  /** Play from a specific step index (replays steps 0..stepIndex) */
  async playFromStep(stepIndex: number): Promise<void> {
    if (!this._lesson) return;

    // If we have a snapshot at or before this step, restore it
    // Snapshots: [0] = after title, [1] = after step 0, [2] = after step 1, ...
    // To show state AFTER step N, restore snapshot[N+1]
    // To show state BEFORE step N (i.e. after step N-1), restore snapshot[N]
    const snapshotIdx = stepIndex; // snapshot[stepIndex] = state before playing step[stepIndex]
    if (snapshotIdx >= 0 && snapshotIdx < this._snapshots.length) {
      this.restoreSnapshot(this._snapshots[snapshotIdx]!);
      this._currentStep = stepIndex - 1;

      // Now play from stepIndex onward
      if (this._running) {
        this.abort();
        await new Promise(r => setTimeout(r, 50));
      }
      this.ctx.aborted = false;
      this._running = true;

      try {
        for (let i = stepIndex; i < this._lesson.steps.length; i++) {
          if (this.ctx.aborted) break;
          this._currentStep = i;
          this.onStepChange?.(i, this._lesson.steps.length);
          await this.playStep(this._lesson.steps[i]!);
          if (i >= this._snapshots.length - 1) {
            this._snapshots.push(this.takeSnapshot());
          }
        }
      } catch (e) {
        if (!(e instanceof AbortError)) throw e;
      } finally {
        this._running = false;
      }
    }
  }

  /** Jump to show state after a specific step (no animation, instant) */
  jumpToStep(stepIndex: number): void {
    if (!this._lesson) return;
    // snapshot[N+1] = state after step N completed
    const snapshotIdx = stepIndex + 1;
    if (snapshotIdx >= 0 && snapshotIdx < this._snapshots.length) {
      if (this._running) this.abort();
      this.restoreSnapshot(this._snapshots[snapshotIdx]!);
      this._currentStep = stepIndex;
      this.onStepChange?.(stepIndex, this._lesson.steps.length);
    }
  }

  /** Play a single step (with animation), then stop. For step-by-step mode. */
  async playSingleStep(stepIndex: number): Promise<void> {
    if (!this._lesson || stepIndex < 0 || stepIndex >= this._lesson.steps.length) return;

    // Restore to state before this step
    const snapshotIdx = stepIndex;
    if (snapshotIdx >= 0 && snapshotIdx < this._snapshots.length) {
      this.restoreSnapshot(this._snapshots[snapshotIdx]!);
    }

    if (this._running) {
      this.abort();
      await new Promise(r => setTimeout(r, 50));
    }
    this.ctx.aborted = false;
    this._running = true;
    this._currentStep = stepIndex;
    this.onStepChange?.(stepIndex, this._lesson.steps.length);

    try {
      await this.playStep(this._lesson.steps[stepIndex]!);
      // Take snapshot after step if we don't have one
      if (stepIndex + 1 >= this._snapshots.length) {
        this._snapshots.push(this.takeSnapshot());
      }
    } catch (e) {
      if (!(e instanceof AbortError)) throw e;
    } finally {
      this._running = false;
      // If this was the last step, fire completion
      if (stepIndex === this._lesson.steps.length - 1) {
        this.onPlayComplete?.(this.ctx.cursor.y);
      }
    }
  }

  /** Jump to previous step (instant) */
  prevStep(): void {
    if (this._currentStep > 0) {
      this.jumpToStep(this._currentStep - 1);
    } else if (this._currentStep === 0) {
      // Jump to title-only state
      if (this._running) this.abort();
      this.restoreSnapshot(this._snapshots[0]!);
      this._currentStep = -1;
      this.onStepChange?.(-1, this._lesson?.steps.length ?? 0);
    }
  }

  /** Jump to next step (instant) */
  nextStep(): void {
    const total = this._lesson?.steps.length ?? 0;
    if (this._currentStep < total - 1) {
      this.jumpToStep(this._currentStep + 1);
    }
  }

  private takeSnapshot(): StepSnapshot {
    const { canvas } = this.ctx;
    return {
      imageData: this.ctx.ctx.getImageData(0, 0, canvas.width, canvas.height),
      cursorX: this.ctx.cursor.x,
      cursorY: this.ctx.cursor.y,
    };
  }

  private restoreSnapshot(snap: StepSnapshot): void {
    this.ctx.ctx.putImageData(snap.imageData, 0, 0);
    this.ctx.cursor.x = snap.cursorX;
    this.ctx.cursor.y = snap.cursorY;
  }

  private async playStep(step: Step): Promise<void> {
    if (this.voiceEnabled && step.narration && this.tts.isSupported()) {
      this.tts.speak(step.narration).catch(() => { /* ignore tts errors */ });
    }
    for (const op of step.ops) {
      if (this.ctx.aborted) return;
      const handler = this.registry[op.op];
      if (!handler) throw new Error(`Unknown op: ${op.op}`);
      await handler(op, this.ctx);
    }
    if (step.waitAfterMs) await this.ctx.sleep(step.waitAfterMs);
  }

  private async drawTitle(title: string): Promise<void> {
    const c = this.ctx.ctx;
    c.save();
    c.font = this.ctx.theme.titleFont;
    c.fillStyle = this.ctx.theme.defaultPen;
    c.fillText(title, this.ctx.marginX, 40);
    c.restore();
    this.ctx.cursor.y = 85;
  }

  exportPNG(): string {
    return this.opts.canvas.toDataURL('image/png');
  }
}
