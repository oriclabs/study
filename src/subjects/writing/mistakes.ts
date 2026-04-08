import type { Question } from '@core/types/question.js';
import type { Mistake } from '@core/types/mistake.js';

/**
 * Writing mistakes are harder to classify than math/physics errors because
 * free-form text can fail in many ways. We map broad categories onto the
 * shared taxonomy:
 *   - missed thesis / off-topic        → misread-question
 *   - weak structure / no topic sent.  → procedural-skip
 *   - vague language / told not shown  → incomplete-answer
 *   - wrong tone / register            → confused-similar-concept
 */
export function analyzeMistake(q: Question, _answer: unknown): Mistake | null {
  if (q.type === 'short') {
    return {
      category: 'incomplete-answer',
      subjectHint: 'writing',
      detail: 'Answer lacks a clear thesis, evidence, or explanation. Use PEEL: Point, Evidence, Explanation, Link.',
    };
  }
  if (q.type === 'mcq') {
    return {
      category: 'confused-similar-concept',
      subjectHint: 'writing',
      detail: 'Two similar writing techniques can feel interchangeable — check the definition for the exact one being asked about.',
    };
  }
  return null;
}
