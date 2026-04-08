import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

/**
 * Classify a wrong math answer into the shared mistake taxonomy.
 * The returned Mistake is consumed by the shared feedback engine,
 * which never sees the math-specific reasoning.
 */
export function analyzeMistake(q: Question, answer: unknown): Mistake | null {
  if (q.answer.kind !== 'numeric') return null;
  const expected = q.answer.value;

  const n = typeof answer === 'string' ? parseFloat(answer) : Number(answer);
  if (!isFinite(n)) {
    return { category: 'notation-error', subjectHint: 'math', detail: 'Answer is not a number.' };
  }

  // Opposite sign
  if (n === -expected) {
    return {
      category: 'sign-error',
      subjectHint: 'math',
      detail: `You got ${n}; the correct answer is ${expected}. Check the sign on each side.`,
    };
  }

  // Off by one
  if (Math.abs(n - expected) === 1) {
    return {
      category: 'off-by-one',
      subjectHint: 'math',
      detail: `You were off by one — double-check the boundaries.`,
    };
  }

  // Very close: arithmetic slip
  if (Math.abs(n - expected) / Math.max(1, Math.abs(expected)) < 0.1) {
    return {
      category: 'arithmetic-slip',
      subjectHint: 'math',
      detail: `The method is right but a small arithmetic error crept in.`,
    };
  }

  return {
    category: 'procedural-skip',
    subjectHint: 'math',
    detail: `The answer is off by a lot — a step in the method may have been skipped.`,
  };
}
