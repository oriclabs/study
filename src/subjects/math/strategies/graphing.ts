import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const graphing: Strategy = {
  metadata: {
    id: 'graphing',
    name: 'Graphing',
    shortDescription: 'Plot y = ax² + bx + c and read the roots where the parabola crosses the x-axis.',
    appliesTo: ['quadratic'],
    tradeoffs: {
      speed: 'medium',
      generality: 'universal',
      accuracy: 'approximate',
      builds: ['geometric meaning of roots', 'parabola shape', 'visual intuition'],
      failsWhen: 'you need exact irrational roots',
    },
    relatedStrategies: ['factoring', 'quadratic-formula'],
    commonMistakes: ['notation-error'],
    workedExampleId: 'math.algebra.graphing.intersection-01',
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'quadratic' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a quadratic equation.' };
    }
    const a = problem.coefficients.a ?? 0;
    if (a === 0) return { applicable: false, reason: 'Not a quadratic.' };
    const b = problem.coefficients.b ?? 0;
    const c = problem.coefficients.c ?? 0;
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      return {
        applicable: false,
        reason: 'Discriminant is negative — the parabola doesn\'t cross the x-axis, so graphing won\'t find real roots.',
        failedChecks: ['No real roots to visualize'],
      };
    }
    return {
      applicable: true,
      reason: 'Graphing shows the roots visually. Approximate only — use algebra if you need exact values.',
      passedChecks: ['Parabola crosses the x-axis (discriminant ≥ 0)', 'Visual intuition is the goal, not precision'],
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const c = problem.coefficients!.c!;
    const disc = b * b - 4 * a * c;
    const sqrt = Math.sqrt(Math.max(0, disc));
    const r1 = (-b + sqrt) / (2 * a);
    const r2 = (-b - sqrt) / (2 * a);

    // Choose ranges to include both roots and the vertex comfortably
    const minX = Math.min(r1, r2) - 2;
    const maxX = Math.max(r1, r2) + 2;
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const yPadding = Math.max(3, Math.abs(vertexY) + 2);
    const minY = Math.min(-2, vertexY - yPadding);
    const maxY = Math.max(5, vertexY + yPadding);

    const expr = `${a}*x^2${b >= 0 ? '+' : ''}${b}*x${c >= 0 ? '+' : ''}${c}`;

    return buildLesson({
      id: `math.strategy.graphing.${Date.now()}`,
      topic: 'algebra.quadratics',
      title: `Graphing: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['graphical interpretation', 'roots as x-intercepts'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Strategy: graph and read the roots.', 'explain'),
           writeOp('The roots are where y = 0 (the parabola crosses the x-axis).', 'explain')],
          undefined, 300),
        step('s3', 'visual', [{
          op: 'graph',
          data: {
            xRange: [minX, maxX],
            yRange: [minY, maxY],
            plots: [{ expr, color: '#0f3460', label: `y = ${problem.rawInput.split('=')[0]!.trim()}` }],
            points: [
              { x: r1, y: 0, label: `(${formatNum(r1)}, 0)` },
              ...(r1 !== r2 ? [{ x: r2, y: 0, label: `(${formatNum(r2)}, 0)` }] : []),
              { x: vertexX, y: vertexY, label: `vertex (${formatNum(vertexX)}, ${formatNum(vertexY)})` },
            ],
          },
        }], undefined, 500),
        step('s4', 'checkpoint',
          [writeOp(
            r1 === r2
              ? `x ≈ ${formatNum(r1)}  (double root, parabola touches the x-axis)`
              : `x ≈ ${formatNum(r1)}  or  x ≈ ${formatNum(r2)}`,
            'answer',
          )]),
      ],
    });
  },
};
