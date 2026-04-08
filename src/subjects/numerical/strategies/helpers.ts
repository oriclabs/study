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
    subject: 'numerical',
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

/** Extract numeric values array from a Problem's inputs. */
export function getValues(problem: { inputs?: Record<string, unknown> }): number[] {
  const i = problem.inputs ?? {};
  if (Array.isArray(i.terms)) return i.terms as number[];
  if (Array.isArray(i.values)) return i.values as number[];
  return [];
}

/** Extract word-problem subtype from a Problem's inputs. */
export function getSubtype(problem: { inputs?: Record<string, unknown> }): string {
  const i = problem.inputs ?? {};
  return String(i.subtype ?? 'unknown');
}
