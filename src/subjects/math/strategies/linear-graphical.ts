import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson } from './helpers.js';
import { formatNum } from '../parser.js';

export const linearGraphical: Strategy = {
  metadata: {
    id: 'linear-graphical',
    name: 'Graphical Interpretation',
    shortDescription: 'Plot y = ax + b and read the solution where the line crosses the x-axis.',
    appliesTo: ['linear'],
    tradeoffs: {
      speed: 'medium',
      generality: 'universal',
      accuracy: 'approximate',
      builds: ['geometric meaning of solutions', 'linear function structure', 'visual intuition'],
      failsWhen: 'you need exact non-integer solutions',
    },
    relatedStrategies: ['linear-inverse-ops'],
    commonMistakes: ['notation-error'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'linear' || !problem.coefficients) {
      return { applicable: false, reason: 'Not a linear equation.' };
    }
    const a = problem.coefficients.a ?? 0;
    if (a === 0) return { applicable: false, reason: 'Slope is zero — line is horizontal.' };
    return {
      applicable: true,
      reason: 'Every line crosses the x-axis exactly once (unless horizontal). Graphing shows you where.',
      passedChecks: [
        `Slope ${a} ≠ 0 — line is not horizontal`,
        'Graphing gives a visual intuition for why x has one solution',
      ],
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const a = problem.coefficients!.a!;
    const b = problem.coefficients!.b!;
    const x = -b / a;

    // Graph range: include the x-intercept with some padding
    const xMin = Math.min(x - 3, -1);
    const xMax = Math.max(x + 3, 3);
    const yAtMin = a * xMin + b;
    const yAtMax = a * xMax + b;
    const yMin = Math.min(-3, Math.min(yAtMin, yAtMax) - 1);
    const yMax = Math.max(3, Math.max(yAtMin, yAtMax) + 1);

    const expr = `${a}*x${b >= 0 ? '+' : ''}${b}`;

    return buildLesson({
      id: `math.strategy.linear-graphical.${Date.now()}`,
      topic: 'algebra.linear-equations',
      title: `Graphical: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['geometric meaning of equations', 'x-intercepts'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Think of the left side as y = ax + b.', 'explain'),
           writeOp('Solving = 0 means finding where the line crosses the x-axis.', 'explain')],
          undefined, 300),
        step('s3', 'visual', [{
          op: 'graph',
          data: {
            xRange: [xMin, xMax],
            yRange: [yMin, yMax],
            plots: [{ expr, color: '#0f3460', label: `y = ${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}` }],
            points: [{ x, y: 0, label: `(${formatNum(x)}, 0)` }],
          },
        }], undefined, 500),
        step('s4', 'checkpoint',
          [writeOp(`x = ${formatNum(x)}  (where the line meets the x-axis)`, 'answer')]),
      ],
    });
  },
};
