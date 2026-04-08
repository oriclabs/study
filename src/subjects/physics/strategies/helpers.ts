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
    subject: 'physics',
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

export function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(3)).toString();
}

export function getGoal(problem: { goal: string }): string {
  const m = problem.goal.match(/find\s+([a-z]+)/i);
  return m ? m[1]! : 'v';
}
