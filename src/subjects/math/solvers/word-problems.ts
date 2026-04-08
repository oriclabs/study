/**
 * Solvers for word problem types produced by the equation builder.
 * Each takes a Problem with structured inputs and generates a step-by-step lesson.
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import type { Problem } from '@core/types/strategy.js';

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant ? { op: 'write', style: { variant }, data: { text } } : { op: 'write', data: { text } };
}
function txOp(from: string, to: string, operation: string): Op {
  return { op: 'transform', data: { from, to, operation, strikeSource: true } };
}
function step(id: string, kind: Step['kind'], ops: Op[], wait?: number): Step {
  return { id, kind, ops, ...(wait ? { waitAfterMs: wait } : {}) };
}
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(3)).toString();
}
function lesson(id: string, topic: string, title: string, steps: Step[]): Lesson {
  return { schemaVersion: 1, id: `math.solve.${id}.${Date.now()}`, subject: 'math', topic, title, meta: { difficulty: 2, source: 'generated', objectives: [id] }, steps };
}

// ─── Speed / Distance / Time ─────────────────────────────────────

export function solveSDT(problem: Problem): Lesson | null {
  const { find, speed, distance, time } = problem.inputs as Record<string, number | string>;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (find === 'speed') {
    const d = distance as number, t = time as number;
    if (t === 0) return null;
    const result = d / t;
    steps.push(step('s2', 'explain', [writeOp('Formula: Speed = Distance / Time', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: Distance = ${fmt(d)}, Time = ${fmt(t)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`Speed = ${fmt(d)} / ${fmt(t)}`, `Speed = ${fmt(result)}`, 'divide')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`Speed = ${fmt(result)} units/time`, 'answer')]));
  } else if (find === 'distance') {
    const s = speed as number, t = time as number;
    const result = s * t;
    steps.push(step('s2', 'explain', [writeOp('Formula: Distance = Speed \u00D7 Time', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: Speed = ${fmt(s)}, Time = ${fmt(t)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`Distance = ${fmt(s)} \u00D7 ${fmt(t)}`, `Distance = ${fmt(result)}`, 'multiply')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`Distance = ${fmt(result)} units`, 'answer')]));
  } else if (find === 'time') {
    const d = distance as number, s = speed as number;
    if (s === 0) return null;
    const result = d / s;
    steps.push(step('s2', 'explain', [writeOp('Formula: Time = Distance / Speed', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: Distance = ${fmt(d)}, Speed = ${fmt(s)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`Time = ${fmt(d)} / ${fmt(s)}`, `Time = ${fmt(result)}`, 'divide')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`Time = ${fmt(result)} units`, 'answer')]));
  } else return null;

  // SDT relationship table
  const sdt = problem.inputs as Record<string, number | string>;
  const findWhat = sdt.find as string;
  const spdVal = findWhat === 'speed' ? (distance as number) / (time as number) : sdt.speed;
  const distVal = findWhat === 'distance' ? (speed as number) * (time as number) : sdt.distance;
  const timeVal = findWhat === 'time' ? (distance as number) / (speed as number) : sdt.time;
  steps.push(step('s_table', 'visual', [{
    op: 'table', data: {
      headers: ['Speed', 'Distance', 'Time'],
      rows: [[fmt(spdVal as number), fmt(distVal as number), fmt(timeVal as number)]],
    },
  }]));

  return lesson('sdt', 'ratio.rates', problem.rawInput, steps);
}

// ─── HCF / LCM ──────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b); }

export function solveHcfLcm(problem: Problem): Lesson | null {
  const { operation, values } = problem.inputs as { operation: string; values: number[] };
  if (values.length < 2) return null;

  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (operation === 'hcf') {
    steps.push(step('s2', 'explain', [writeOp('Find HCF using repeated division.', 'explain')]));

    let result = values[0]!;
    for (let i = 1; i < values.length; i++) {
      const a = result, b = values[i]!;
      result = gcd(a, b);
      steps.push(step(`s${2 + i}`, 'work', [
        txOp(`HCF(${fmt(a)}, ${fmt(b)})`, fmt(result), `Euclidean algorithm`),
      ], 300));
    }

    // Show prime factorization as table
    const factorRows = values.map(v => [String(v), primeFactors(v).join(' \u00D7 ')]);
    steps.push(step('s_factors', 'visual', [{
      op: 'table', data: { headers: ['Number', 'Prime Factorisation'], rows: factorRows },
    }]));
    steps.push(step('s_ans', 'checkpoint', [writeOp(`HCF = ${fmt(result)}`, 'answer')]));

  } else {
    steps.push(step('s2', 'explain', [writeOp('LCM = product / HCF', 'explain')]));

    let result = values[0]!;
    for (let i = 1; i < values.length; i++) {
      const a = result, b = values[i]!;
      result = lcm(a, b);
      steps.push(step(`s${2 + i}`, 'work', [
        txOp(`LCM(${fmt(a)}, ${fmt(b)})`, fmt(result), `(${a} \u00D7 ${b}) / HCF(${a},${b})`),
      ], 300));
    }

    steps.push(step('s_ans', 'checkpoint', [writeOp(`LCM = ${fmt(result)}`, 'answer')]));
  }

  return lesson('hcf-lcm', 'number.factors', problem.rawInput, steps);
}

function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let num = Math.abs(n);
  while (d * d <= num) {
    while (num % d === 0) { factors.push(d); num /= d; }
    d++;
  }
  if (num > 1) factors.push(num);
  return factors.length ? factors : [n];
}

// ─── Age problems ────────────────────────────────────────────────

export function solveAge(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number>;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (inputs.diff !== undefined && inputs.total !== undefined) {
    const { diff, total, younger, older } = inputs;
    steps.push(step('s2', 'explain', [
      writeOp('Let younger = x, older = x + ' + fmt(diff), 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`x + (x + ${fmt(diff)}) = ${fmt(total)}`, `2x + ${fmt(diff)} = ${fmt(total)}`, 'combine'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`2x = ${fmt(total)} - ${fmt(diff)}`, `2x = ${fmt(total - diff)}`, 'subtract'),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(`x = ${fmt(total - diff)} / 2`, `x = ${fmt(younger)}`, 'divide'),
    ], 300));
    steps.push(step('s6', 'checkpoint', [
      writeOp(`Younger = ${fmt(younger)}, Older = ${fmt(older)}`, 'answer'),
    ]));
    // Number line showing both ages
    steps.push(step('s_nl', 'visual', [{
      op: 'numberline', data: { from: Math.floor(younger - 2), to: Math.ceil(older + 2), marks: [younger, older], labels: { [String(younger)]: `Younger=${fmt(younger)}`, [String(older)]: `Older=${fmt(older)}` } },
    }]));
  } else if (inputs.multiplier !== undefined) {
    const { multiplier, total, younger, older } = inputs;
    steps.push(step('s2', 'explain', [
      writeOp(`Let younger = x, older = ${fmt(multiplier)}x`, 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`x + ${fmt(multiplier)}x = ${fmt(total)}`, `${fmt(1 + multiplier)}x = ${fmt(total)}`, 'combine'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`x = ${fmt(total)} / ${fmt(1 + multiplier)}`, `x = ${fmt(younger)}`, 'divide'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [
      writeOp(`Younger = ${fmt(younger)}, Older = ${fmt(older)}`, 'answer'),
    ]));
  } else return null;

  return lesson('age', 'algebra.linear-equations', problem.rawInput, steps);
}

// ─── Comparison / sum-difference ─────────────────────────────────

export function solveComparison(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number>;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (inputs.diff !== undefined && inputs.total !== undefined) {
    const { diff, total, smaller, larger } = inputs;
    steps.push(step('s2', 'explain', [
      writeOp(`Let smaller = x, larger = x + ${fmt(diff)}`, 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`x + (x + ${fmt(diff)}) = ${fmt(total)}`, `2x = ${fmt(total - diff)}`, 'simplify'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`x = ${fmt(total - diff)} / 2`, `x = ${fmt(smaller)}`, 'divide'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [
      writeOp(`${fmt(smaller)} and ${fmt(larger)}`, 'answer'),
    ]));
    steps.push(step('s_nl', 'visual', [{
      op: 'numberline', data: { from: Math.floor(smaller - 2), to: Math.ceil(larger + 2), marks: [smaller, larger], labels: { [String(smaller)]: fmt(smaller), [String(larger)]: fmt(larger) } },
    }]));
  } else if (inputs.sum !== undefined && inputs.diff !== undefined) {
    const { sum, diff, a, b } = inputs;
    steps.push(step('s2', 'explain', [
      writeOp('a + b = sum, a - b = diff', 'explain'),
      writeOp('a = (sum + diff) / 2, b = (sum - diff) / 2', 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`a = (${fmt(sum)} + ${fmt(diff)}) / 2`, `a = ${fmt(a)}`, 'compute'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`b = (${fmt(sum)} - ${fmt(diff)}) / 2`, `b = ${fmt(b)}`, 'compute'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [
      writeOp(`The numbers are ${fmt(a)} and ${fmt(b)}`, 'answer'),
    ]));
    steps.push(step('s_nl', 'visual', [{
      op: 'numberline', data: { from: Math.floor(Math.min(a, b) - 2), to: Math.ceil(Math.max(a, b) + 2), marks: [a, b], labels: { [String(a)]: fmt(a), [String(b)]: fmt(b) } },
    }]));
  } else return null;

  return lesson('comparison', 'algebra.linear-equations', problem.rawInput, steps);
}

// ─── Proportion ──────────────────────────────────────────────────

export function solveProportion(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'inverse') {
    const { w1, t1, w2, t2 } = inputs as Record<string, number>;
    steps.push(step('s2', 'explain', [
      writeOp('Inverse proportion: more workers = less time', 'explain'),
      writeOp('workers\u2081 \u00D7 time\u2081 = workers\u2082 \u00D7 time\u2082', 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`${fmt(w1)} \u00D7 ${fmt(t1)} = ${fmt(w2)} \u00D7 time\u2082`, `${fmt(w1 * t1)} = ${fmt(w2)} \u00D7 time\u2082`, 'multiply'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`time\u2082 = ${fmt(w1 * t1)} / ${fmt(w2)}`, `time\u2082 = ${fmt(t2)}`, 'divide'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`Answer: ${fmt(t2)}`, 'answer')]));
    // Proportion table
    steps.push(step('s_table', 'visual', [{
      op: 'table', data: { headers: ['Workers', 'Time'], rows: [[fmt(w1), fmt(t1)], [fmt(w2), fmt(t2)]], highlightCells: [[1, 1]] },
    }]));
  } else if (type === 'direct') {
    const { n1, v1, n2, v2 } = inputs as Record<string, number>;
    steps.push(step('s2', 'explain', [
      writeOp('Direct proportion: unit price \u00D7 quantity', 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`Unit value = ${fmt(v1)} / ${fmt(n1)}`, `Unit value = ${fmt(v1 / n1)}`, 'divide'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`${fmt(v1 / n1)} \u00D7 ${fmt(n2)}`, fmt(v2), 'multiply'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`Answer: ${fmt(v2)}`, 'answer')]));
    // Proportion table
    steps.push(step('s_table', 'visual', [{
      op: 'table', data: { headers: ['Quantity', 'Value'], rows: [[fmt(n1), fmt(v1)], [fmt(n2), fmt(v2)]], highlightCells: [[1, 1]] },
    }]));
  } else return null;

  return lesson('proportion', 'ratio.proportion', problem.rawInput, steps);
}

// ─── Simple arithmetic ──────────────────────────────────────────

export function solveArithmetic(problem: Problem): Lesson | null {
  const { a, b, op, result } = problem.inputs as { a: number; b: number; op: string; result: number };
  const opSymbol = op === '*' ? '\u00D7' : op === '/' ? '\u00F7' : op;

  const steps: Step[] = [
    step('s1', 'work', [writeOp(problem.rawInput)], 400),
    step('s2', 'work', [
      txOp(`${fmt(a)} ${opSymbol} ${fmt(b)}`, fmt(result), 'compute'),
    ], 300),
    step('s3', 'checkpoint', [writeOp(fmt(result), 'answer')]),
  ];

  // Number line showing result
  if (isFinite(result) && Math.abs(result) < 1000) {
    const marks = [result];
    if (op === '+' || op === '-') marks.unshift(a); // show starting point too
    const nlFrom = Math.floor(Math.min(0, ...marks) - 2);
    const nlTo = Math.ceil(Math.max(0, ...marks) + 2);
    steps.push(step('s_nl', 'visual', [{
      op: 'numberline', data: { from: nlFrom, to: nlTo, marks: [result], labels: { [String(result)]: `= ${fmt(result)}` } },
    }]));
  }

  return lesson('arithmetic', 'number.operations', problem.rawInput, steps);
}
