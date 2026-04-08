import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

export function analyzeMistake(q: Question, _answer: unknown): Mistake | null {
  if (q.type === 'mcq') {
    return {
      category: 'confused-similar-concept',
      subjectHint: 'grammar',
      detail: 'Two similar grammatical forms can look right at first glance — identify the subject precisely.',
    };
  }
  if (q.type === 'fill') {
    return {
      category: 'notation-error',
      subjectHint: 'grammar',
      detail: 'Check the verb form and number match the subject.',
    };
  }
  return null;
}
