import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import { writeOp, step, buildLesson, getValues } from './helpers.js';

/**
 * Pattern recognition strategy.
 *
 * Find the rule behind a sequence by computing first differences, second
 * differences, and ratios between consecutive terms. Works best for
 * arithmetic, geometric, and quadratic sequences.
 */
export const patternRecognition: Strategy = {
  metadata: {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    shortDescription: 'Examine differences and ratios between terms to find the underlying rule.',
    appliesTo: ['sequence', 'pattern'],
    tradeoffs: {
      speed: 'fast',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['number sense', 'difference tables', 'ratio reasoning'],
      failsWhen: 'the sequence follows an obscure or non-numeric rule',
    },
    relatedStrategies: ['formula-method', 'work-backwards'],
    commonMistakes: ['missed-second-difference', 'confused-ratio-with-difference'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    const validTypes = ['sequence', 'pattern'];
    if (!validTypes.includes(problem.type)) {
      return { applicable: false, reason: 'Not a sequence or pattern problem.' };
    }

    const values = getValues(problem);
    if (values.length < 3) {
      return {
        applicable: false,
        reason: 'Need at least 3 terms to detect a pattern.',
        failedChecks: ['fewer than 3 terms provided'],
      };
    }

    const diffs = differences(values);
    const allSame = diffs.every(d => d === diffs[0]);
    const ratios = consecutiveRatios(values);
    const ratiosSame = ratios.length > 0 && ratios.every(r => r === ratios[0]) && values.every(v => v !== 0);

    const passed: string[] = [`has ${values.length} terms`];
    if (allSame) passed.push(`constant first difference: ${diffs[0]}`);
    if (ratiosSame) passed.push(`constant ratio: ${ratios[0]}`);
    if (!allSame && !ratiosSame) {
      const d2 = differences(diffs);
      if (d2.every(d => d === d2[0])) passed.push(`constant second difference: ${d2[0]}`);
    }

    return {
      applicable: true,
      reason: `Sequence has ${values.length} terms — pattern analysis can identify the rule.`,
      passedChecks: passed,
    };
  },

  cost(problem: Problem): number {
    const values = getValues(problem);
    return values.length <= 5 ? 1 : 2;
  },

  solve(problem: Problem) {
    const values = getValues(problem);
    const diffs = differences(values);
    const allSame = diffs.every(d => d === diffs[0]);
    const ratios = consecutiveRatios(values);
    const ratiosSame = ratios.length > 0 && ratios.every(r => r === ratios[0]) && values.every(v => v !== 0);

    const stepsArr = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: Pattern Recognition', 'title'),
         writeOp('Compute differences between consecutive terms.', 'explain')],
        undefined, 300),
      step('s3', 'work',
        [writeOp(`Terms: ${values.join(', ')}`),
         writeOp(`First differences: ${diffs.join(', ')}`)],
        undefined, 300),
    ];

    if (allSame) {
      const nextTerm = values[values.length - 1]! + diffs[0]!;
      stepsArr.push(
        step('s4', 'explain',
          [writeOp(`The first difference is constant (${diffs[0]}), so this is an arithmetic sequence.`, 'explain')],
          undefined, 300),
        step('s5', 'checkpoint',
          [writeOp(`Next term = ${values[values.length - 1]} + ${diffs[0]} = ${nextTerm}`, 'answer')]),
      );
    } else if (ratiosSame) {
      const nextTerm = values[values.length - 1]! * ratios[0]!;
      stepsArr.push(
        step('s4', 'explain',
          [writeOp(`Ratios between terms: ${ratios.join(', ')}`, 'explain'),
           writeOp(`The ratio is constant (${ratios[0]}), so this is a geometric sequence.`, 'explain')],
          undefined, 300),
        step('s5', 'checkpoint',
          [writeOp(`Next term = ${values[values.length - 1]} × ${ratios[0]} = ${nextTerm}`, 'answer')]),
      );
    } else {
      const d2 = differences(diffs);
      const d2Same = d2.every(d => d === d2[0]);
      stepsArr.push(
        step('s4', 'explain',
          [writeOp(`First differences are not constant. Compute second differences: ${d2.join(', ')}`, 'explain'),
           ...(d2Same
             ? [writeOp(`Second difference is constant (${d2[0]}) — quadratic pattern.`, 'explain')]
             : [writeOp('Second differences are also not constant. Look for alternating or mixed rules.', 'explain')])],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('Use the pattern you found to predict the next term.', 'answer')]),
      );
    }

    return buildLesson({
      id: `numerical.strategy.pattern-recognition.${Date.now()}`,
      topic: problem.topic ?? 'sequences',
      title: `Pattern Recognition: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['sequence analysis', 'difference tables'],
      steps: stepsArr,
    });
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function differences(arr: number[]): number[] {
  return arr.slice(1).map((v, i) => v - arr[i]!);
}

function consecutiveRatios(arr: number[]): number[] {
  return arr.slice(1).map((v, i) => arr[i] !== 0 ? v / arr[i]! : NaN);
}
