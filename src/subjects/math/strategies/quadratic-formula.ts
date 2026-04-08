import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, transformOp, mathOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const quadraticFormula: Strategy = {
  metadata: {
    id: 'quadratic-formula',
    name: 'Quadratic Formula',
    shortDescription: 'Plug a, b, c into x = (\u2212b \u00B1 \u221A(b\u00B2\u22124ac)) / 2a \u2014 works on every quadratic.',
    appliesTo: ['quadratic'],
    tradeoffs: {
      speed: 'medium',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['discriminant meaning', 'universal method', 'surds'],
      failsWhen: 'never for standard-form quadratics',
    },
    relatedStrategies: ['factoring', 'completing-square'],
    commonMistakes: ['sign-error', 'arithmetic-slip', 'notation-error'],
  },

  learningValue: 2,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'quadratic' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a quadratic equation.' };
    }
    const a = problem.coefficients.a ?? 0;
    if (a === 0) {
      return { applicable: false, reason: 'Leading coefficient is zero \u2014 not a quadratic.' };
    }
    return {
      applicable: true,
      reason: 'The quadratic formula always works on standard-form quadratics \u2014 no preconditions beyond a \u2260 0.',
      passedChecks: ['Equation is in standard form ax\u00B2 + bx + c = 0', `a = ${a} \u2260 0`],
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const c = problem.coefficients!.c!;
    const disc = b * b - 4 * a * c;

    const steps = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: quadratic formula', 'explain'),
         writeOp('This always works on any quadratic.', 'explain')],
        undefined, 300),
      step('s3', 'work', [mathOp('(-b + sqrt(b^2 - 4*a*c)) / (2*a)')], 'The quadratic formula.', 400),

      // Identify coefficients
      step('s3b', 'explain', [
        writeOp(`Identify: a = ${a},  b = ${b},  c = ${c}`, 'explain'),
      ], undefined, 300),

      // Substitute values
      step('s4', 'work', [
        transformOp(
          'x = (\u2212b \u00B1 \u221A(b\u00B2 \u2212 4ac)) / 2a',
          `x = (${-b} \u00B1 \u221A(${b}\u00B2 \u2212 4\u00B7${a}\u00B7${c})) / ${2 * a}`,
          `substitute a=${a}, b=${b}, c=${c}`,
        ),
      ], undefined, 400),

      // Compute discriminant
      step('s5', 'work', [
        transformOp(
          `x = (${-b} \u00B1 \u221A(${b}\u00B2 \u2212 4\u00B7${a}\u00B7${c})) / ${2 * a}`,
          `Discriminant = ${b*b} \u2212 ${4*a*c} = ${disc}`,
          'compute discriminant',
          [{ text: `${b}\u00B2 \u2212 4\u00B7${a}\u00B7${c}`, label: `= ${disc}` }],
        ),
      ], undefined, 400),
    ];

    if (disc < 0) {
      const absDisc = Math.abs(disc);
      const sqrtAbs = Math.sqrt(absDisc);
      const realPart = -b / (2 * a);
      const imagPart = sqrtAbs / (2 * a);

      steps.push(step('s6', 'explain',
        [writeOp('Discriminant < 0 \u2014 no real solutions.', 'explain')],
        'No real roots.'));

      steps.push(step('s7', 'explain', [
        writeOp('Complex (imaginary) solutions:', 'explain'),
      ]));

      steps.push(step('s8', 'work', [
        transformOp(
          `\u221A(${disc})`,
          `\u221A${absDisc} \u00D7 i`,
          '\u221A(-1) = i',
        ),
      ], undefined, 300));

      const x1 = `${formatNum(realPart)} + ${formatNum(Math.abs(imagPart))}i`;
      const x2 = `${formatNum(realPart)} - ${formatNum(Math.abs(imagPart))}i`;
      steps.push(step('s9', 'checkpoint', [
        writeOp(`x = ${x1}  or  x = ${x2}`, 'answer'),
        writeOp('(complex conjugate pair)', 'explain'),
      ]));
    } else if (disc === 0) {
      const x = -b / (2 * a);
      steps.push(step('s6', 'work', [
        transformOp(
          `Discriminant = ${disc}`,
          `x = \u2212b / 2a = ${-b} / ${2*a} = ${formatNum(x)}`,
          'single root (disc = 0)',
        ),
      ], undefined, 300));
      steps.push(step('s7', 'checkpoint',
        [writeOp(`x = ${formatNum(x)}  (double root)`, 'answer')]));
    } else {
      const sqrt = Math.sqrt(disc);
      const r1 = (-b + sqrt) / (2 * a);
      const r2 = (-b - sqrt) / (2 * a);
      const isPerfect = Math.abs(sqrt - Math.round(sqrt)) < 1e-9;

      steps.push(step('s6', 'work', [
        transformOp(
          `Discriminant = ${disc}`,
          isPerfect
            ? `x = (${-b} \u00B1 ${Math.round(sqrt)}) / ${2 * a}`
            : `x = (${-b} \u00B1 \u221A${disc}) / ${2 * a}`,
          isPerfect ? `\u221A${disc} = ${Math.round(sqrt)}` : 'take square root',
        ),
      ], undefined, 300));

      steps.push(step('s7', 'checkpoint', [
        writeOp(isPerfect
          ? `x = ${formatNum(r1)}  or  x = ${formatNum(r2)}`
          : `x \u2248 ${formatNum(r1)}  or  x \u2248 ${formatNum(r2)}`,
          'answer'),
      ]));
    }

    // Graph showing parabola
    const vx = -b / (2 * a);
    const vy = a * vx * vx + b * vx + c;
    const pad = disc >= 0 ? Math.max(3, Math.abs((-b + Math.sqrt(Math.max(0, disc))) / (2 * a)) + 2) : 3;
    const xR: [number, number] = [Math.floor(Math.min(0, vx) - pad), Math.ceil(Math.max(0, vx) + pad)];
    const yR: [number, number] = [Math.floor(Math.min(0, vy) - 2), Math.ceil(Math.max(0, vy) + 4)];
    const expr = `${a}*x^2+${b}*x+${c}`;
    const pts: { x: number; y: number; label?: string }[] = [{ x: vx, y: vy, label: 'vertex' }];
    if (disc > 0) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a), r2 = (-b - Math.sqrt(disc)) / (2 * a);
      pts.push({ x: r1, y: 0, label: `x=${formatNum(r1)}` }, { x: r2, y: 0, label: `x=${formatNum(r2)}` });
    } else if (disc === 0) {
      pts.push({ x: -b / (2 * a), y: 0, label: `x=${formatNum(-b / (2 * a))}` });
    }
    steps.push(step('s_graph', 'visual', [{
      op: 'graph', data: { xRange: xR, yRange: yR, plots: [{ expr, color: '#7c3aed', label: 'y' }], points: pts },
    }]));

    return buildLesson({
      id: `math.strategy.quadratic-formula.${Date.now()}`,
      topic: 'algebra.quadratics',
      title: `Quadratic formula: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['quadratic formula', 'discriminant'],
      steps,
    });
  },
};
