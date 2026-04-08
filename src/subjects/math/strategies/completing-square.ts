import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, transformOp, mathOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const completingSquare: Strategy = {
  metadata: {
    id: 'completing-square',
    name: 'Completing the Square',
    shortDescription: 'Rewrite ax\u00B2 + bx + c as a(x + h)\u00B2 + k to read off the roots and the vertex.',
    appliesTo: ['quadratic'],
    tradeoffs: {
      speed: 'slow',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['vertex form', 'parabola structure', 'derivation of the quadratic formula'],
      failsWhen: 'never, but computationally heavier than other methods',
    },
    relatedStrategies: ['factoring', 'quadratic-formula'],
    commonMistakes: ['sign-error', 'arithmetic-slip', 'procedural-skip'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'quadratic' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a quadratic equation.' };
    }
    const a = problem.coefficients.a ?? 0;
    if (a === 0) {
      return { applicable: false, reason: 'Leading coefficient is zero \u2014 not a quadratic.' };
    }
    const passed = ['Equation is in standard form', `a = ${a} \u2260 0`];
    if (a === 1) passed.push('Monic (a = 1) \u2014 completing the square is clean');
    return {
      applicable: true,
      reason: a === 1
        ? 'Works always \u2014 and since a = 1, completing the square is particularly clean here.'
        : 'Works on any quadratic. You\'ll divide through by a first to make the leading coefficient 1.',
      passedChecks: passed,
    };
  },

  cost(problem: Problem): number {
    return (problem.coefficients?.a ?? 1) === 1 ? 3 : 4;
  },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const c = problem.coefficients!.c!;

    const bn = b / a;
    const cn = c / a;
    const h = bn / 2;
    const k = cn - h * h;
    const rhs = -k;

    const steps = [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp('Strategy: completing the square', 'explain'),
         writeOp('Rewrite as (x + h)\u00B2 + k to expose the vertex and the roots.', 'explain')],
        undefined, 300),
    ];

    let currentEq = problem.rawInput;

    // Divide by a if needed
    if (a !== 1) {
      const nextEq = `x\u00B2 + ${formatNum(bn)}x + ${formatNum(cn)} = 0`;
      steps.push(step('s3', 'work', [
        transformOp(currentEq, nextEq, `divide everything by ${a}`, [{ text: formatNum(a), label: 'divide' }]),
      ], undefined, 400));
      currentEq = nextEq;
    }

    // Half the x-coefficient
    steps.push(step('s4', 'explain',
      [writeOp(`Half of ${formatNum(bn)} is ${formatNum(h)}`, 'explain'),
       writeOp(`${formatNum(h)}\u00B2 = ${formatNum(h * h)}`, 'explain')],
      undefined, 300));

    // Form the square
    const squareEq = `(x + ${formatNum(h)})\u00B2 \u2212 ${formatNum(h * h)} + ${formatNum(cn)} = 0`;
    steps.push(step('s5', 'work', [
      transformOp(currentEq, squareEq, 'add and subtract ' + formatNum(h * h),
        [{ text: `${formatNum(bn)}x`, label: `\u2192 (x + ${formatNum(h)})\u00B2` }]),
    ], undefined, 400));

    // Simplify
    const simplifiedEq = `(x + ${formatNum(h)})\u00B2 = ${formatNum(rhs)}`;
    steps.push(step('s6', 'work', [
      transformOp(squareEq, simplifiedEq, 'simplify constants',
        [{ text: `\u2212 ${formatNum(h * h)} + ${formatNum(cn)}`, label: `= ${formatNum(k)}` }],
        { strikeSource: true }),
    ], undefined, 400));

    if (rhs < 0) {
      steps.push(step('s7', 'checkpoint',
        [writeOp('Right side is negative \u2014 no real solutions.', 'answer')]));
    } else {
      const sqrt = Math.sqrt(rhs);
      const r1 = -h + sqrt;
      const r2 = -h - sqrt;

      const sqrtEq = `x + ${formatNum(h)} = \u00B1${formatNum(sqrt)}`;
      steps.push(step('s7', 'work', [
        transformOp(simplifiedEq, sqrtEq, 'take square root of both sides'),
      ], undefined, 300));

      const solveEq = `x = ${formatNum(-h)} \u00B1 ${formatNum(sqrt)}`;
      steps.push(step('s8', 'work', [
        transformOp(sqrtEq, solveEq, `subtract ${formatNum(h)}`,
          [{ text: formatNum(h), label: 'move to right' }], { strikeSource: true }),
      ], undefined, 300));

      steps.push(step('s9', 'checkpoint',
        [writeOp(`x = ${formatNum(r1)}  or  x = ${formatNum(r2)}`, 'answer')]));
    }

    // Vertex info
    steps.push(step('s10', 'explain',
      [writeOp(`Vertex form: y = ${a === 1 ? '' : formatNum(a)}(x + ${formatNum(h)})\u00B2 ${k >= 0 ? '+' : '\u2212'} ${formatNum(Math.abs(a * k))}`, 'explain'),
       writeOp(`Vertex at (${formatNum(-h)}, ${formatNum(a * k)})`, 'explain')],
      'Completing the square also reveals the vertex.'));

    // Graph showing parabola with vertex
    const vx = -h, vy = a * k;
    const pad = rhs >= 0 ? Math.max(3, Math.abs(Math.sqrt(rhs)) + 2) : 3;
    const xR: [number, number] = [Math.floor(vx - pad), Math.ceil(vx + pad)];
    const yR: [number, number] = [Math.floor(Math.min(0, vy) - 2), Math.ceil(Math.max(0, vy) + 4)];
    const expr = `${a}*x^2+${bn}*x+${cn}`;
    const pts: { x: number; y: number; label?: string }[] = [{ x: vx, y: vy, label: `vertex (${formatNum(vx)}, ${formatNum(vy)})` }];
    if (rhs >= 0) {
      pts.push({ x: -h + Math.sqrt(rhs), y: 0, label: `x=${formatNum(-h + Math.sqrt(rhs))}` });
      if (Math.abs(Math.sqrt(rhs)) > 0.01) pts.push({ x: -h - Math.sqrt(rhs), y: 0, label: `x=${formatNum(-h - Math.sqrt(rhs))}` });
    }
    steps.push(step('s_graph', 'visual', [{
      op: 'graph', data: { xRange: xR, yRange: yR, plots: [{ expr, color: '#7c3aed', label: 'y' }], points: pts },
    }]));

    return buildLesson({
      id: `math.strategy.completing-square.${Date.now()}`,
      topic: 'algebra.quadratics',
      title: `Completing the square: ${problem.rawInput}`,
      difficulty: 3,
      objectives: ['completing the square', 'vertex form'],
      steps,
    });
  },
};
