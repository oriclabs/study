import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

export function analyzeMistake(q: Question, _answer: unknown): Mistake | null {
  if (q.type === 'mcq') {
    return {
      category: 'misread-question',
      subjectHint: 'verbal',
      detail: 'Re-read the pattern — verbal reasoning rewards precise relationship spotting over quick guesses.',
    };
  }
  return null;
}
