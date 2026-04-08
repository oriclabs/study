import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, transformOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const factoring: Strategy = {
  metadata: {
    id: 'factoring',
    name: 'Factoring',
    shortDescription: 'Write as (x \u2212 r\u2081)(x \u2212 r\u2082) = 0 and read off the roots.',
    appliesTo: ['quadratic'],
    tradeoffs: {
      speed: 'fast',
      generality: 'narrow',
      accuracy: 'exact',
      builds: ['integer reasoning', 'zero-product property', 'factored form'],
      failsWhen: 'roots are irrational or complex',
    },
    relatedStrategies: ['quadratic-formula', 'completing-square'],
    commonMistakes: ['sign-error', 'wrong-formula'],
    workedExampleId: 'math.algebra.quadratics.factoring-01',
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'quadratic' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a quadratic equation.' };
    }
    const a = problem.coefficients.a!;
    const b = problem.coefficients.b!;
    const c = problem.coefficients.c!;
    if (a === 0) return { applicable: false, reason: 'Leading coefficient is zero \u2014 not really a quadratic.' };

    const discriminant = b * b - 4 * a * c;
    const passed: string[] = ['Quadratic in standard form ax\u00B2 + bx + c = 0'];

    if (discriminant < 0) {
      return {
        applicable: false,
        reason: 'Discriminant is negative \u2014 no real roots, so there\'s nothing to factor over the reals.',
        passedChecks: passed,
        failedChecks: [`Discriminant = ${discriminant} is negative`],
      };
    }

    const sqrt = Math.sqrt(discriminant);
    if (Math.abs(sqrt - Math.round(sqrt)) > 1e-9) {
      return {
        applicable: false,
        reason: `Discriminant ${discriminant} is not a perfect square, so the roots are irrational. Use the quadratic formula.`,
        passedChecks: passed,
        failedChecks: [`\u221A${discriminant} \u2248 ${formatNum(sqrt)} is not an integer`],
      };
    }

    passed.push(`Discriminant ${discriminant} = ${Math.round(sqrt)}\u00B2 is a perfect square`);
    passed.push('Roots will be rational \u2014 factoring works cleanly');

    return {
      applicable: true,
      reason: `The discriminant is ${discriminant} = ${Math.round(sqrt)}\u00B2, so the roots are rational. Factoring is the fastest path here.`,
      passedChecks: passed,
    };
  },

  cost(problem: Problem): number {
    const a = problem.coefficients?.a ?? 1;
    const c = problem.coefficients?.c ?? 0;
    if (a === 1 && Math.abs(c) < 30) return 1;
    if (a <= 3) return 2;
    return 3;
  },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const c = problem.coefficients!.c!;
    const disc = b * b - 4 * a * c;
    const sqrt = Math.sqrt(disc);
    const r1 = (-b + sqrt) / (2 * a);
    const r2 = (-b - sqrt) / (2 * a);

    const product = a * c;
    const sum = b;
    const factorPair = findFactorPair(product, sum);

    const currentEq = problem.rawInput;
    const acInfo = `a\u00B7c = ${a}\u00B7${c} = ${product},  sum needed = ${sum}`;

    const stepsArr = [
      step('s1', 'work', [writeOp(currentEq)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: factoring', 'explain'),
         writeOp('Find two numbers that multiply to ac and add to b.', 'explain')],
        undefined, 300),
      step('s3', 'work', [writeOp(acInfo)], undefined, 300),
    ];

    if (factorPair) {
      // Show the factor pair found
      stepsArr.push(step('s4', 'work', [
        transformOp(
          acInfo,
          `${factorPair[0]} \u00D7 ${factorPair[1]} = ${product} \u2713\n${factorPair[0]} + ${factorPair[1]} = ${sum} \u2713`,
          'find factor pair',
          [{ text: String(product), label: 'product' }, { text: String(sum), label: 'sum' }],
        ),
      ], undefined, 400));
    }

    // Write factored form
    const factoredEq = a === 1
      ? `(x ${signedTerm(-r1)})(x ${signedTerm(-r2)}) = 0`
      : `${a}(x ${signedTerm(-r1)})(x ${signedTerm(-r2)}) = 0`;

    stepsArr.push(step('s5', 'work', [
      transformOp(currentEq, factoredEq, 'write in factored form'),
    ], undefined, 400));

    // Set each factor to zero
    const eq1 = `x ${signedTerm(-r1)} = 0`;
    const eq2 = `x ${signedTerm(-r2)} = 0`;
    const sol1 = `x = ${formatNum(r1)}`;
    const sol2 = `x = ${formatNum(r2)}`;

    stepsArr.push(step('s6', 'explain', [writeOp('Set each factor to zero:', 'explain')]));
    stepsArr.push(step('s7', 'work', [
      transformOp(eq1, sol1, 'solve first factor'),
    ], undefined, 300));
    stepsArr.push(step('s8', 'work', [
      transformOp(eq2, sol2, 'solve second factor'),
    ], undefined, 300));

    stepsArr.push(step('s9', 'checkpoint',
      [writeOp(`x = ${formatNum(r1)}  or  x = ${formatNum(r2)}`, 'answer')]));

    return buildLesson({
      id: `math.strategy.factoring.${Date.now()}`,
      topic: 'algebra.quadratics',
      title: `Factor: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['factoring', 'zero-product property'],
      steps: stepsArr,
    });
  },
};

function signedTerm(n: number): string {
  if (n >= 0) return `+ ${formatNum(n)}`;
  return `\u2212 ${formatNum(-n)}`;
}

function findFactorPair(product: number, sum: number): [number, number] | null {
  const limit = Math.max(100, Math.abs(product) + 10);
  for (let i = -limit; i <= limit; i++) {
    if (i === 0) continue;
    if (product % i === 0) {
      const other = product / i;
      if (i + other === sum) return [i, other];
    }
  }
  return null;
}
