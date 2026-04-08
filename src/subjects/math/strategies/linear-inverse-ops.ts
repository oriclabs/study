import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, transformOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const linearInverseOps: Strategy = {
  metadata: {
    id: 'linear-inverse-ops',
    name: 'Inverse Operations',
    shortDescription: 'Undo what was done to x, one step at a time, using inverse operations.',
    appliesTo: ['linear'],
    tradeoffs: {
      speed: 'fast',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['inverse operations', 'equation balance', 'sequential reasoning'],
      failsWhen: 'never for standard linear equations',
    },
    relatedStrategies: ['linear-graphical'],
    commonMistakes: ['sign-error', 'arithmetic-slip'],
    workedExampleId: 'math.algebra.linear-equations.linear-01',
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'linear' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a linear equation.' };
    }
    const a = problem.coefficients.a ?? 0;
    if (a === 0) return { applicable: false, reason: 'No x term — not really an equation to solve.' };
    return {
      applicable: true,
      reason: 'Inverse operations work on every linear equation.',
      passedChecks: [
        'Linear equation in the form ax + b = 0',
        `Coefficient a = ${a} ≠ 0`,
      ],
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const x = -b / a;

    const steps = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: inverse operations', 'explain'),
         writeOp('Undo additions/subtractions first, then multiplications/divisions.', 'explain')],
        undefined, 300),
    ];

    // Build the equation in standard form: ax + b = 0
    const eqFrom = problem.rawInput;

    if (b !== 0) {
      const action = b > 0
        ? `subtract ${formatNum(b)} from both sides`
        : `add ${formatNum(-b)} to both sides`;

      const eqAfterSub = a === 1
        ? `x = ${formatNum(-b)}`
        : a === -1
          ? `-x = ${formatNum(-b)}`
          : `${formatNum(a)}x = ${formatNum(-b)}`;

      const bStr = b > 0 ? `+ ${formatNum(b)}` : `- ${formatNum(-b)}`;
      // Find the constant term to highlight
      const bHighlight = b > 0 ? formatNum(b) : formatNum(-b);

      steps.push(step('s3', 'work', [
        transformOp(
          eqFrom,
          eqAfterSub,
          action,
          [{ text: bHighlight, label: b > 0 ? 'remove this' : 'remove this' }],
          { strikeSource: true },
        ),
      ], action, 400));

      if (a !== 1 && a !== -1) {
        const eqAfterDiv = `x = ${formatNum(x)}`;
        steps.push(step('s4', 'work', [
          transformOp(
            eqAfterSub,
            eqAfterDiv,
            `divide both sides by ${formatNum(a)}`,
            [{ text: formatNum(a), label: 'divide by this' }],
            { strikeSource: true },
          ),
        ], `Divide both sides by ${formatNum(a)}.`, 400));
      } else if (a === -1) {
        const eqAfterNeg = `x = ${formatNum(x)}`;
        steps.push(step('s4', 'work', [
          transformOp(
            eqAfterSub,
            eqAfterNeg,
            'multiply both sides by -1',
            [{ text: '-', label: 'negate' }],
            { strikeSource: true },
          ),
        ], 'Multiply both sides by -1.', 400));
      }
    } else {
      // b === 0, just need to divide by a
      if (a !== 1) {
        const eqAfterDiv = `x = ${formatNum(x)}`;
        steps.push(step('s3', 'work', [
          transformOp(
            eqFrom,
            eqAfterDiv,
            `divide both sides by ${formatNum(a)}`,
            [{ text: formatNum(a), label: 'divide by this' }],
            { strikeSource: true },
          ),
        ], `Divide both sides by ${formatNum(a)}.`, 400));
      }
    }

    // Answer
    steps.push(step('s5', 'checkpoint',
      [writeOp(`x = ${formatNum(x)}`, 'answer')]));

    // Verification
    const verifyResult = formatNum(a * x + b);
    steps.push(step('s6', 'explain',
      [writeOp(`Verify: ${formatNum(a)}(${formatNum(x)}) + ${formatNum(b)} = ${verifyResult} ✓`, 'explain')],
      'Verification.'));

    return buildLesson({
      id: `math.strategy.linear-inverse-ops.${Date.now()}`,
      topic: 'algebra.linear-equations',
      title: `Inverse operations: ${problem.rawInput}`,
      difficulty: 1,
      objectives: ['inverse operations', 'isolating variables'],
      steps,
    });
  },
};
