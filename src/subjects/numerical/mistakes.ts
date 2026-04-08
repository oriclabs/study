import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

/**
 * Numerical reasoning mistakes map onto the shared taxonomy. The most
 * common failure in selective-exam numerical reasoning is pattern-matching
 * on the wrong feature — e.g. spotting an arithmetic pattern where the
 * pattern is actually geometric.
 */
export function analyzeMistake(q: Question, answer: unknown): Mistake | null {
  if (q.answer.kind !== 'numeric') {
    return q.type === 'mcq'
      ? { category: 'misread-question', subjectHint: 'numerical', detail: 'Re-examine the pattern — check at least two transitions before committing to a rule.' }
      : null;
  }
  const expected = q.answer.value;
  const n = typeof answer === 'string' ? parseFloat(answer) : Number(answer);
  if (!isFinite(n)) return { category: 'notation-error', subjectHint: 'numerical' };

  // Off-by-one is common in sequence questions
  if (Math.abs(n - expected) === 1) {
    return { category: 'off-by-one', subjectHint: 'numerical', detail: 'Off by one — you found the pattern but landed on the wrong term index.' };
  }
  if (n === -expected) {
    return { category: 'sign-error', subjectHint: 'numerical', detail: 'Sign error — check whether the pattern increases or decreases.' };
  }
  if (Math.abs(n - expected) / Math.max(1, Math.abs(expected)) < 0.15) {
    return { category: 'arithmetic-slip', subjectHint: 'numerical', detail: 'Close — arithmetic slip in applying the pattern.' };
  }
  return {
    category: 'confused-similar-concept',
    subjectHint: 'numerical',
    detail: 'Far off — likely the wrong type of pattern was detected (arithmetic vs geometric, or an alternating rule was missed).',
  };
}
