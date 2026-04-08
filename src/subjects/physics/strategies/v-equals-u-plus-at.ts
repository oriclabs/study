import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, fmt, getGoal } from './helpers.js';

/** v = u + at — first kinematic equation. */
export const vEqualsUPlusAt: Strategy = {
  metadata: {
    id: 'kin-v-equals-u-plus-at',
    name: 'v = u + at',
    shortDescription: 'Final velocity from initial velocity, acceleration, and time.',
    appliesTo: ['kinematics'],
    tradeoffs: {
      speed: 'fast',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['linear kinematics', 'constant acceleration intuition'],
      failsWhen: 'acceleration is not constant, or you don\'t know time',
    },
    relatedStrategies: ['kin-s-equals-ut-plus-half-at-squared', 'kin-v-squared-equals-u-squared-plus-2as'],
    commonMistakes: ['wrong-formula', 'sign-error'],
    workedExampleId: 'physics.mechanics.kinematics-01',
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'kinematics') return { applicable: false, reason: 'Not a kinematics problem.' };
    const inputs = problem.inputs as Record<string, number> | undefined;
    if (!inputs) return { applicable: false, reason: 'No inputs extracted.' };

    const goal = getGoal(problem);
    const passed: string[] = [];
    const failed: string[] = [];

    // Check what this formula needs and produces
    const needs = ['u', 'a', 't'];
    const missing = needs.filter(n => !(n in inputs));
    const produces = 'v';

    for (const n of needs) {
      if (n in inputs) passed.push(`${n} = ${inputs[n]} is known ✓`);
      else failed.push(`${n} is not given`);
    }

    if (goal !== produces && !(goal === 'u' || goal === 'a' || goal === 't')) {
      failed.push(`Goal is ${goal}, but this formula produces ${produces}`);
    }

    // Applicable if: either solving for v with u,a,t known; or solving for u/a/t with v and the other two known
    const hasAllVUAT = 'v' in inputs && 'u' in inputs && 'a' in inputs && 't' in inputs;
    const canSolveV = goal === 'v' && missing.length === 0;
    const canSolveU = goal === 'u' && 'v' in inputs && 'a' in inputs && 't' in inputs;
    const canSolveA = goal === 'a' && 'v' in inputs && 'u' in inputs && 't' in inputs;
    const canSolveT = goal === 't' && 'v' in inputs && 'u' in inputs && 'a' in inputs;

    if (canSolveV || canSolveU || canSolveA || canSolveT) {
      return {
        applicable: true,
        reason: `v = u + at links v, u, a, t — and you have enough inputs to solve for ${goal}.`,
        passedChecks: [
          'Formula: v = u + at',
          `Known inputs for this formula: ${['u', 'v', 'a', 't'].filter(k => k in inputs).join(', ')}`,
          `Target ${goal} can be isolated`,
        ],
      };
    }

    if (hasAllVUAT) {
      return {
        applicable: false,
        reason: 'All of v, u, a, t already known — nothing to solve with this formula.',
        passedChecks: passed,
      };
    }

    return {
      applicable: false,
      reason: `v = u + at needs u, a, t (or three of {v, u, a, t}) and solves for the fourth — you're missing ${failed.join(', ')}.`,
      passedChecks: passed,
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const inputs = problem.inputs as Record<string, number>;
    const goal = getGoal(problem);

    let result: number;
    let computation: string;
    let variableSolution: string;

    if (goal === 'v') {
      result = inputs.u! + inputs.a! * inputs.t!;
      variableSolution = 'v = u + at';
      computation = `v = ${inputs.u} + ${inputs.a} × ${inputs.t} = ${fmt(result)}`;
    } else if (goal === 'u') {
      result = inputs.v! - inputs.a! * inputs.t!;
      variableSolution = 'u = v − at';
      computation = `u = ${inputs.v} − ${inputs.a} × ${inputs.t} = ${fmt(result)}`;
    } else if (goal === 'a') {
      result = (inputs.v! - inputs.u!) / inputs.t!;
      variableSolution = 'a = (v − u) / t';
      computation = `a = (${inputs.v} − ${inputs.u}) / ${inputs.t} = ${fmt(result)}`;
    } else {
      result = (inputs.v! - inputs.u!) / inputs.a!;
      variableSolution = 't = (v − u) / a';
      computation = `t = (${inputs.v} − ${inputs.u}) / ${inputs.a} = ${fmt(result)}`;
    }

    return buildLesson({
      id: `physics.strategy.v-equals-u-plus-at.${Date.now()}`,
      topic: 'mechanics.kinematics',
      title: `v = u + at: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['first kinematic equation', 'solve for any variable'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Strategy: v = u + at', 'explain'),
           writeOp('The first equation of motion links four variables — solve for the missing one.', 'explain')],
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
