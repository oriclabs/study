import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

/**
 * Physics problem generator (template + random values).
 * Deterministic via seed. Emits complete Lessons.
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}

function step(id: string, kind: Step['kind'], ops: Op[], narration?: string): Step {
  return { id, kind, ops, ...(narration !== undefined ? { narration } : {}) };
}

/** Ohm's law: V = IR. Pick two, solve for the third. */
export function generateOhmsLaw(seed: number): Lesson {
  const rnd = seededRandom(seed);
  const V = Math.round(rnd() * 10 + 2); // 2..12 V
  const I = Math.round(rnd() * 3 + 1);  // 1..4 A
  const R = V / I;

  return {
    schemaVersion: 1,
    id: `physics.electricity.ohms-law.generated-${seed}`,
    subject: 'physics',
    topic: 'electricity.ohms-law',
    title: `Find R when V = ${V}V, I = ${I}A`,
    meta: { difficulty: 2, source: 'generated', objectives: ["Ohm's law"], generatorSeed: seed },
    steps: [
      step('s1', 'explain', [writeOp("Ohm's law:", 'explain')], "Ohm's law."),
      step('s2', 'work', [writeOp('V = I × R')]),
      step('s3', 'explain', [writeOp('Solve for R:', 'explain')], 'Solve for R.'),
      step('s4', 'work', [writeOp(`R = V / I = ${V} / ${I}`)]),
      step('s5', 'checkpoint', [writeOp(`R = ${R} Ω`, 'answer')]),
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'solve',
          prompt: `A resistor has V = ${V * 2} V and I = ${I * 2} A. Find R in ohms.`,
          answer: { kind: 'numeric', value: R, tolerance: 0.01 },
          hints: ['Use R = V / I.'],
        },
      ],
    },
  };
}

/** Kinematics: uniform acceleration. */
export function generateKinematics(seed: number): Lesson {
  const rnd = seededRandom(seed);
  const u = Math.round(rnd() * 5);       // initial velocity
  const a = Math.round(rnd() * 3 + 1);   // acceleration
  const t = Math.round(rnd() * 4 + 2);   // time
  const v = u + a * t;                   // final velocity

  return {
    schemaVersion: 1,
    id: `physics.mechanics.kinematics.generated-${seed}`,
    subject: 'physics',
    topic: 'mechanics.kinematics',
    title: `Find final velocity: u=${u}, a=${a}, t=${t}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['equations of motion'], generatorSeed: seed },
    steps: [
      step('s1', 'explain', [writeOp('Equation of motion:', 'explain')]),
      step('s2', 'work', [writeOp('v = u + at')]),
      step('s3', 'work', [writeOp(`v = ${u} + ${a} × ${t}`)]),
      step('s4', 'work', [writeOp(`v = ${u} + ${a * t}`)]),
      step('s5', 'checkpoint', [writeOp(`v = ${v} m/s`, 'answer')]),
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'solve',
          prompt: `u = ${u + 1}, a = ${a}, t = ${t}. Find v.`,
          answer: { kind: 'numeric', value: (u + 1) + a * t, tolerance: 0 },
          hints: ['v = u + at'],
        },
      ],
    },
  };
}

export function generate(topicId: string, seed: number): Lesson {
  switch (topicId) {
    case 'electricity.ohms-law': return generateOhmsLaw(seed);
    case 'mechanics.kinematics': return generateKinematics(seed);
    default: throw new Error(`No generator for topic ${topicId}`);
  }
}
