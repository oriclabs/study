import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import { writeOp, step, buildLesson, getValues, getSubtype } from './helpers.js';

/**
 * Work-backwards strategy.
 *
 * Start from the answer choices (or a guessed answer) and verify which
 * one satisfies all the problem's conditions. Especially useful for
 * multiple-choice numerical reasoning tests where plugging in options
 * is faster than deriving the answer algebraically.
 */
export const workBackwards: Strategy = {
  metadata: {
    id: 'work-backwards',
    name: 'Work Backwards',
    shortDescription: 'Start from the answer options and test which one satisfies all conditions.',
    appliesTo: ['word-problem', 'sequence', 'proportion', 'data', 'pattern'],
    tradeoffs: {
      speed: 'medium',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['logical verification', 'number substitution', 'checking skills'],
      failsWhen: 'no answer choices are provided and the solution space is large',
    },
    relatedStrategies: ['pattern-recognition', 'formula-method'],
    commonMistakes: ['skipped-verification', 'tested-too-few-options'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    // Work-backwards applies to all numerical problem types
    const validTypes = ['word-problem', 'sequence', 'proportion', 'data', 'pattern'];
    if (!validTypes.includes(problem.type)) {
      return { applicable: false, reason: 'Not a numerical reasoning problem.' };
    }

    const passed: string[] = ['problem type supports backward verification'];

    // More effective when the problem text hints at answer choices
    if (/\b[A-E]\)|\boption|\bchoice|\bwhich\s+of/i.test(problem.rawInput)) {
      passed.push('answer choices detected in problem text');
    }

    return {
      applicable: true,
      reason: 'Work backwards by testing candidate answers against the conditions.',
      passedChecks: passed,
    };
  },

  cost(problem: Problem): number {
    // Cheaper when answer choices are present
    if (/\b[A-E]\)|\boption|\bchoice/i.test(problem.rawInput)) return 2;
    return 3;
  },

  solve(problem: Problem) {
    const values = getValues(problem);

    const stepsArr = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: Work Backwards', 'title'),
         writeOp('Instead of solving forward, pick a candidate answer and check if it fits all conditions.', 'explain')],
        undefined, 300),
    ];

    if (problem.type === 'sequence') {
      stepsArr.push(
        step('s3', 'explain',
          [writeOp('Take each answer option and see if it extends the sequence consistently.', 'explain'),
           writeOp(`Known terms: ${values.join(', ')}`)],
          undefined, 300),
        step('s4', 'work',
          [writeOp('For each candidate next term, compute differences or ratios with the last known terms.'),
           writeOp('The correct answer produces a consistent pattern.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('The option that maintains the same difference/ratio pattern is the answer.', 'answer')]),
      );
    } else if (problem.type === 'word-problem') {
      const subtype = getSubtype(problem);
      stepsArr.push(
        step('s3', 'explain',
          [writeOp(`Problem subtype: ${subtype}`, 'explain'),
           writeOp('Pick a candidate answer and substitute it back into every condition.')],
          undefined, 300),
        step('s4', 'work',
          [writeOp('Check condition 1: does the candidate satisfy it? Then condition 2, etc.'),
           writeOp('If all conditions hold, you have found the answer.')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('The candidate that satisfies all conditions simultaneously is the answer.', 'answer')]),
      );
    } else {
      stepsArr.push(
        step('s3', 'explain',
          [writeOp('List the conditions the answer must satisfy.', 'explain'),
           writeOp('Test each candidate against every condition.')],
          undefined, 300),
        step('s4', 'work',
          [writeOp('Eliminate candidates that fail any condition.'),
           writeOp(`Values from the problem: ${values.join(', ')}`)],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('The surviving candidate is the answer.', 'answer')]),
      );
    }

    return buildLesson({
      id: `numerical.strategy.work-backwards.${Date.now()}`,
      topic: problem.topic ?? 'word-problems',
      title: `Work Backwards: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['backward reasoning', 'answer verification'],
      steps: stepsArr,
    });
  },
};
