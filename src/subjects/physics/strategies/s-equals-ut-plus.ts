import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, fmt, getGoal } from './helpers.js';

/** s = ut + ½at² — second kinematic equation. */
export const sEqualsUtPlus: Strategy = {
  metadata: {
    id: 'kin-s-equals-ut-plus-half-at-squared',
    name: 's = ut + ½at²',
    shortDescription: 'Distance from initial velocity, acceleration, and time.',
    appliesTo: ['kinematics'],
    tradeoffs: {
      speed: 'medium',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['distance under acceleration', 'quadratic time'],
      failsWhen: 'you don\'t know time, or want to skip v',
    },
    relatedStrategies: ['kin-v-equals-u-plus-at', 'kin-v-squared-equals-u-squared-plus-2as'],
    commonMistakes: ['arithmetic-slip', 'procedural-skip'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'kinematics') return { applicable: false, reason: 'Not a kinematics problem.' };
    const inputs = problem.inputs as Record<string, number> | undefined;
    if (!inputs) return { applicable: false, reason: 'No inputs extracted.' };

    const goal = getGoal(problem);
    const canSolveS = goal === 's' && 'u' in inputs && 'a' in inputs && 't' in inputs;

    if (canSolveS) {
      return {
        applicable: true,
        reason: 'You know u, a, t and want s — this formula gives s directly.',
        passedChecks: [
          'Formula: s = ut + ½at²',
          `Known: u = ${inputs.u}, a = ${inputs.a}, t = ${inputs.t}`,
          'Goal is distance (s)',
        ],
      };
    }

    const failed: string[] = [];
    if (goal !== 's') failed.push(`Goal is ${goal}, not s — this formula gives distance directly`);
    if (!('u' in inputs)) failed.push('u is not given');
    if (!('a' in inputs)) failed.push('a is not given');
    if (!('t' in inputs)) failed.push('t is not given');

    return {
      applicable: false,
      reason: `s = ut + ½at² requires u, a, t to solve for s. ${failed.join('; ')}.`,
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const inputs = problem.inputs as Record<string, number>;
    const u = inputs.u!, a = inputs.a!, t = inputs.t!;
    const s = u * t + 0.5 * a * t * t;

    return buildLesson({
      id: `physics.strategy.s-equals-ut-plus.${Date.now()}`,
      topic: 'mechanics.kinematics',
      title: `s = ut + ½at²: ${problem.rawInput}`,
      difficulty: 2,
      objectives: ['second kinematic equation', 'distance under acceleration'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Strategy: s = ut + ½at²', 'explain'),
           writeOp('The second equation of motion — gives distance from u, a, t.', 'explain')],
          undefined, 300),
        step('s3', 'work', [writeOp(`u = ${u}, a = ${a}, t = ${t}`)], undefined, 300),
        step('s4', 'work', [writeOp(`s = ${u}·${t} + ½·${a}·${t}²`)], undefined, 300),
        step('s5', 'work', [writeOp(`s = ${fmt(u * t)} + ${fmt(0.5 * a * t * t)}`)], undefined, 300),
        step('s6', 'checkpoint', [writeOp(`s = ${fmt(s)} m`, 'answer')]),
      ],
    });
  },
};
