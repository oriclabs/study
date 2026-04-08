import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

export function writeOp(text: string, variant?: 'explain' | 'answer' | 'title'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}

export function indentedWrite(text: string): Op {
  return { op: 'write', data: { text, indent: true } };
}

/** Create a transform op showing equation A → B with highlights and operation label. */
export function transformOp(
  from: string,
  to: string,
  operation: string,
  highlights?: { text: string; label?: string }[],
  opts?: { strikeSource?: boolean },
): Op {
  return {
    op: 'transform',
    data: {
      from,
      to,
      operation,
      highlights,
      strikeSource: opts?.strikeSource,
    },
  };
}

/** Create a math notation op for properly typeset equations on canvas. */
export function mathOp(expr: string, variant?: 'default' | 'answer' | 'explain'): Op {
  return { op: 'math', data: { expr, variant } };
}

/** Create a table op for structured grid layout. */
export function tableOp(
  rows: string[][],
  headers?: string[],
  highlightCells?: [number, number][],
): Op {
  return {
    op: 'table',
    data: { headers, rows, highlightCells },
  };
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
    subject: 'math',
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
