import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

export function analyzeMistake(q: Question, answer: unknown): Mistake | null {
  if (q.answer.kind !== 'numeric') return null;
  const expected = q.answer.value;
  const n = typeof answer === 'string' ? parseFloat(answer) : Number(answer);
  if (!isFinite(n)) {
    return { category: 'notation-error', subjectHint: 'physics', detail: 'Answer is not a number. Check unit placement.' };
  }
  // Common physics mistake: off by a power of 10 (unit conversion)
  if (Math.abs(Math.log10(Math.abs(n / expected))) > 0.9 && Math.abs(n / expected - Math.round(n / expected * 10) / 10) < 0.01) {
    return { category: 'unit-error', subjectHint: 'physics', detail: 'Your answer is off by a factor of 10 — check unit conversions (mm vs m, etc).' };
  }
  if (Math.abs(n - expected) / Math.max(1, Math.abs(expected)) < 0.1) {
    return { category: 'arithmetic-slip', subjectHint: 'physics', detail: 'Close — small arithmetic slip.' };
  }
  return { category: 'wrong-formula', subjectHint: 'physics', detail: 'Far off — likely the wrong formula was applied.' };
}
