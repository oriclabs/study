import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, fmt, getGoal } from './helpers.js';

/** v² = u² + 2as — third kinematic equation, no time needed. */
export const vSquaredEquals: Strategy = {
  metadata: {
    id: 'kin-v-squared-equals-u-squared-plus-2as',
    name: 'v² = u² + 2as',
    shortDescription: 'Final velocity from initial velocity, acceleration, and distance — no time needed.',
    appliesTo: ['kinematics'],
    tradeoffs: {
      speed: 'medium',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['kinematics without time', 'energy-like formulation'],
      failsWhen: 'you don\'t know distance, or you need t explicitly',
    },
    relatedStrategies: ['kin-v-equals-u-plus-at', 'kin-s-equals-ut-plus-half-at-squared'],
    commonMistakes: ['sign-error', 'arithmetic-slip'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'kinematics') return { applicable: false, reason: 'Not a kinematics problem.' };
    const inputs = problem.inputs as Record<string, number> | undefined;
    if (!inputs) return { applicable: false, reason: 'No inputs extracted.' };

    const goal = getGoal(problem);
    const passed: string[] = [];
    const failed: string[] = [];

    const canSolveV = goal === 'v' && 'u' in inputs && 'a' in inputs && 's' in inputs;
    const canSolveU = goal === 'u' && 'v' in inputs && 'a' in inputs && 's' in inputs;
    const canSolveA = goal === 'a' && 'v' in inputs && 'u' in inputs && 's' in inputs;
    const canSolveS = goal === 's' && 'v' in inputs && 'u' in inputs && 'a' in inputs;

    if (canSolveV || canSolveU || canSolveA || canSolveS) {
      passed.push('Formula: v² = u² + 2as');
      passed.push(`Known inputs for this formula: ${['v', 'u', 'a', 's'].filter(k => k in inputs).join(', ')}`);
      passed.push(`No need to know time — this formula skips it`);
      return {
        applicable: true,
        reason: `v² = u² + 2as is ideal when you don't know time. You have the inputs needed for ${goal}.`,
        passedChecks: passed,
      };
    }

    if ('t' in inputs && !('s' in inputs)) {
      failed.push('You know t but not s — use v = u + at or s = ut + ½at² instead');
    }
    for (const n of ['v', 'u', 'a', 's']) {
      if (n in inputs) passed.push(`${n} is known`);
      else if (n !== goal) failed.push(`${n} is not given`);
    }

    return {
      applicable: false,
      reason: `v² = u² + 2as needs {v, u, a, s} minus the goal. Missing inputs make it inapplicable.`,
      passedChecks: passed,
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const inputs = problem.inputs as Record<string, number>;
    const goal = getGoal(problem);

    let result: number;
    let variableSolution: string;
    let computation: string;

    if (goal === 'v') {
      const vSq = inputs.u! * inputs.u! + 2 * inputs.a! * inputs.s!;
      result = Math.sqrt(Math.max(0, vSq));
      variableSolution = 'v = √(u² + 2as)';
      computation = `v = √(${inputs.u}² + 2·${inputs.a}·${inputs.s}) = √${fmt(vSq)} = ${fmt(result)}`;
    } else if (goal === 'u') {
      const uSq = inputs.v! * inputs.v! - 2 * inputs.a! * inputs.s!;
      result = Math.sqrt(Math.max(0, uSq));
      variableSolution = 'u = √(v² − 2as)';
      computation = `u = √(${inputs.v}² − 2·${inputs.a}·${inputs.s}) = ${fmt(result)}`;
    } else if (goal === 'a') {
      result = (inputs.v! * inputs.v! - inputs.u! * inputs.u!) / (2 * inputs.s!);
      variableSolution = 'a = (v² − u²) / (2s)';
      computation = `a = (${inputs.v}² − ${inputs.u}²) / (2·${inputs.s}) = ${fmt(result)}`;
    } else {
      result = (inputs.v! * inputs.v! - inputs.u! * inputs.u!) / (2 * inputs.a!);
      variableSolution = 's = (v² − u²) / (2a)';
      computation = `s = (${inputs.v}² − ${inputs.u}²) / (2·${inputs.a}) = ${fmt(result)}`;
    }

    return buildLesson({
      id: `physics.strategy.v-squared.${Date.now()}`,
      topic: 'mechanics.kinematics',
      title: `v² = u² + 2as: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['third kinematic equation', 'no-time-needed strategy'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Strategy: v² = u² + 2as', 'explain'),
           writeOp('Use this when you know distance but not time.', 'explain')],
          undefined, 300),
        step('s3', 'work',
          [writeOp(`Known: ${Object.entries(inputs).map(([k, v]) => `${k} = ${v}`).join(', ')}`)],
          undefined, 300),
        step('s4', 'explain', [writeOp(`Rearrange to isolate ${goal}:`, 'explain')]),
        step('s5', 'work', [writeOp(variableSolution)], undefined, 300),
        step('s6', 'work', [writeOp(computation)], undefined, 400),
        step('s7', 'checkpoint', [writeOp(`${goal} = ${fmt(result)}`, 'answer')]),
      ],
    });
  },
};
