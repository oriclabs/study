import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

export function writeOp(text: string, variant?: 'explain' | 'answer' | 'title'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}

export function step(id: string, kind: Step['kind'], ops: Op[], narration?: string, waitAfterMs?: number): Step {
  return {
    id,
    kind,
    ops,
    ...(narration !== undefined ? { narration } : {}),
    ...(waitAfterMs !== undefined ? { waitAfterMs } : {}),
  };
}

export function buildLesson(params: {
  id: string;
  topic: string;
  title: string;
  difficulty: number;
  objectives: string[];
  steps: Step[];
}): Lesson {
  return {
    schemaVersion: 1,
    id: params.id,
    subject: 'writing',
    topic: params.topic,
    title: params.title,
    meta: {
      difficulty: params.difficulty,
      source: 'generated',
      objectives: params.objectives,
    },
    steps: params.steps,
  };
}

/** Extract a short label from the prompt for use in lesson titles. */
export function promptLabel(raw: string, maxLen = 40): string {
  const short = raw.length <= maxLen ? raw : raw.slice(0, maxLen - 1) + '\u2026';
  return short;
}
