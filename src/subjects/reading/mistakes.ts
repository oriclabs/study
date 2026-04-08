import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

/**
 * Classify a wrong reading answer into the shared taxonomy.
 * Reading mistakes are almost always one of:
 *  - misread-question (picked an option about a detail, not the asked thing)
 *  - confused-similar-concept (e.g., inference vs fact)
 *  - incomplete-answer (ignored part of the evidence)
 */
export function analyzeMistake(q: Question, answer: unknown): Mistake | null {
  // For MCQs with author-time hooks, the test engine already handles them.
  // This analyzer handles free-form 'short' answers by checking keyword overlap.
  if (q.type !== 'short' && q.type !== 'mcq') return null;

  if (q.answer.kind === 'choiceIndex') {
    return {
      category: 'misread-question',
      subjectHint: 'reading',
      detail: 'Re-read the question carefully and re-check the passage evidence for the specific thing being asked.',
    };
  }

  if (q.answer.kind === 'strings' && Array.isArray(q.answer.value)) {
    const userText = String(answer).toLowerCase();
    const expectedKeywords = q.answer.value.map(s => s.toLowerCase());
    const matched = expectedKeywords.filter(k => userText.includes(k));
    if (matched.length > 0 && matched.length < expectedKeywords.length) {
      return {
        category: 'incomplete-answer',
        subjectHint: 'reading',
        detail: `You identified ${matched.length} of ${expectedKeywords.length} key ideas — look for more evidence in the passage.`,
      };
    }
    return {
      category: 'confused-similar-concept',
      subjectHint: 'reading',
      detail: 'Your answer references different ideas than the passage emphasizes. Re-scan for the strongest textual evidence.',
    };
  }

  return null;
}
