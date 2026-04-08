import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, fmt, getGoal } from './helpers.js';

/** s = ½(u + v)t — average-velocity method. Good when a is unknown but u, v are. */
export const sEqualsAvgVelocity: Strategy = {
  metadata: {
    id: 'kin-s-equals-avg-velocity',
    name: 's = ½(u + v)t',
    shortDescription: 'Distance from average velocity × time — when u and v are known but a isn\'t.',
    appliesTo: ['kinematics'],
    tradeoffs: {
      speed: 'fast',
      generality: 'narrow',
      accuracy: 'exact',
      builds: ['average velocity intuition', 'alternative to acceleration formulas'],
      failsWhen: 'you don\'t know both u and v, or acceleration varies',
    },
    relatedStrategies: ['kin-v-equals-u-plus-at', 'kin-s-equals-ut-plus-half-at-squared'],
    commonMistakes: ['arithmetic-slip', 'wrong-formula'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'kinematics') return { applicable: false, reason: 'Not a kinematics problem.' };
    const inputs = problem.inputs as Record<string, number> | undefined;
    if (!inputs) return { applicable: false, reason: 'No inputs extracted.' };

    const goal = getGoal(problem);
    const canSolveS = goal === 's' && 'u' in inputs && 'v' in inputs && 't' in inputs;

    if (canSolveS) {
      return {
        applicable: true,
        reason: 'You know u, v, t — no need to involve acceleration. Average velocity × time gives the distance directly.',
        passedChecks: [
          'Formula: s = ½(u + v) · t',
          `Known: u = ${inputs.u}, v = ${inputs.v}, t = ${inputs.t}`,
          'Acceleration not needed — this is a shortcut',
        ],
      };
    }

    const failed: string[] = [];
    if (goal !== 's') failed.push(`Goal is ${goal}, not s`);
    if (!('u' in inputs)) failed.push('u is not given');
    if (!('v' in inputs)) failed.push('v is not given');
    if (!('t' in inputs)) failed.push('t is not given');

    return {
      applicable: false,
      reason: `s = ½(u + v)·t needs both initial and final velocities and time. ${failed.join('; ')}.`,
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const inputs = problem.inputs as Record<string, number>;
    const u = inputs.u!, v = inputs.v!, t = inputs.t!;
    const avg = (u + v) / 2;
    const s = avg * t;

    return buildLesson({
      id: `physics.strategy.s-avg-velocity.${Date.now()}`,
      topic: 'mechanics.kinematics',
      title: `Average velocity: ${problem.rawInput}`,
      difficulty: 1,
      objectives: ['average velocity', 'shortcut for constant a'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 300),
        step('s2', 'explain',
          [writeOp('Strategy: average velocity × time', 'explain'),
           writeOp('When acceleration is constant, the average of u and v is the average speed.', 'explain')],
          undefined, 300),
        step('s3', 'work', [writeOp(`u = ${u}, v = ${v}, t = ${t}`)], undefined, 300),
        step('s4', 'work', [writeOp(`Avg velocity = (${u} + ${v}) / 2 = ${fmt(avg)} m/s`)], undefined, 300),
        step('s5', 'work', [writeOp(`s = ${fmt(avg)} × ${t}`)], undefined, 300),
        step('s6', 'checkpoint', [writeOp(`s = ${fmt(s)} m`, 'answer')]),
      ],
    });
  },
};
