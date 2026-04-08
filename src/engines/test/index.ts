import type { Question, Answer } from '@core/types/question.js';
import type { SubjectModule } from '@core/types/subject.js';
import type { Mistake } from '@core/types/mistake.js';

/**
 * Test engine — answer checking + mistake classification.
 * Default checker handles numeric, string, boolean, choice.
 * Subject modules override via analyzeMistake for subject-specific cases.
 */

export interface CheckResult {
  correct: boolean;
  mistake?: Mistake;
}

export class TestEngine {
  constructor(private subjects: Map<string, SubjectModule>) {}

  check(question: Question, userAnswer: unknown, subjectId: string): CheckResult {
    const correct = this.defaultCheck(question.answer, userAnswer);
    if (correct) return { correct: true };

    const subject = this.subjects.get(subjectId);
    const mistake = subject?.analyzeMistake?.(question, userAnswer) ?? undefined;

    // Also check author-time hooks on the question
    if (!mistake && question.mistakes) {
      for (const hook of question.mistakes) {
        if (hook.whenAnswer !== undefined && this.deepEqual(hook.whenAnswer, userAnswer)) {
          return {
            correct: false,
            mistake: { category: hook.pattern as Mistake['category'], detail: hook.explain },
          };
        }
      }
    }

    return { correct: false, mistake };
  }

  private defaultCheck(expected: Answer, actual: unknown): boolean {
    switch (expected.kind) {
      case 'numeric': {
        const n = typeof actual === 'string' ? parseFloat(actual.replace(',', '.')) : Number(actual);
        if (!isFinite(n)) return false;
        return Math.abs(n - expected.value) <= (expected.tolerance ?? 1e-9);
      }
      case 'expression': {
        return String(actual).replace(/\s+/g, '') === expected.value.replace(/\s+/g, '');
      }
      case 'choiceIndex':
        return Number(actual) === expected.value;
      case 'boolean':
        return Boolean(actual) === expected.value;
      case 'strings': {
        if (!Array.isArray(actual)) return false;
        if (actual.length !== expected.value.length) return false;
        return expected.value.every((s, i) =>
          String(actual[i]).trim().toLowerCase() === s.trim().toLowerCase());
      }
      case 'order':
      case 'pairs':
        return this.deepEqual(expected.value, actual);
    }
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((x, i) => this.deepEqual(x, b[i]));
    }
    return false;
  }
}
