import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

/**
 * Lesson recorder (Phase 13).
 * Captures a sequence of ops the user performs and emits a complete Lesson
 * JSON ready to author back into content/. Minimal v1 — append ops,
 * assemble into steps, finalize with metadata.
 */

export class LessonRecorder {
  private steps: Step[] = [];
  private currentOps: Op[] = [];
  private recording = false;

  start(): void {
    this.steps = [];
    this.currentOps = [];
    this.recording = true;
  }

  isRecording(): boolean { return this.recording; }

  addOp(op: Op): void {
    if (!this.recording) return;
    this.currentOps.push(op);
  }

  /** Close the current step and start a new one. */
  commitStep(kind: Step['kind'] = 'work', narration?: string): void {
    if (!this.recording || this.currentOps.length === 0) return;
    this.steps.push({
      id: `s${this.steps.length + 1}`,
      kind,
      ops: this.currentOps,
      ...(narration !== undefined ? { narration } : {}),
    });
    this.currentOps = [];
  }

  finish(opts: {
    id: string;
    subject: string;
    topic: string;
    title: string;
    difficulty?: number;
    objectives?: string[];
  }): Lesson {
    if (this.currentOps.length > 0) this.commitStep();
    this.recording = false;
    const lesson: Lesson = {
      schemaVersion: 1,
      id: opts.id,
      subject: opts.subject,
      topic: opts.topic,
      title: opts.title,
      meta: {
        difficulty: opts.difficulty ?? 2,
        source: 'authored',
        ...(opts.objectives ? { objectives: opts.objectives } : {}),
      },
      steps: this.steps,
    };
    this.steps = [];
    return lesson;
  }

  cancel(): void {
    this.recording = false;
    this.steps = [];
    this.currentOps = [];
  }
}
