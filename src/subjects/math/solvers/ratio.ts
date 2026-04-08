/**
 * Ratio/proportion solver + powers/surds solver.
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

// ─── Ratio ───────────────────────────────────────────────────────

export function solveRatio(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  if (type === 'divide') {
    const total = inputs.total as number;
    const parts = inputs.parts as number[];
    const sum = parts.reduce((a, b) => a + b, 0);
    const ratioStr = parts.join(':');

    steps.push(step('s2', 'explain', [
      writeOp(`Divide ${total} in the ratio ${ratioStr}`, 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`Total parts = ${parts.join(' + ')}`, `Total parts = ${sum}`, 'add ratio parts'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`One part = ${total} / ${sum}`, `One part = ${fmt(total / sum)}`, 'divide'),
    ], 300));

    const results = parts.map(p => fmt(p * (total / sum)));
    for (let i = 0; i < parts.length; i++) {
      steps.push(step(`s${5 + i}`, 'work', [
        txOp(`Part ${i + 1} = ${parts[i]} \u00D7 ${fmt(total / sum)}`, results[i]!, 'multiply'),
      ], 200));
    }

    steps.push(step('s_ans', 'checkpoint', [
      writeOp(results.join(', '), 'answer'),
    ]));

    // Verify
    const sumResult = parts.reduce((a, p) => a + p * (total / sum), 0);
    steps.push(step('s_verify', 'explain', [
      writeOp(`Verify: ${results.join(' + ')} = ${fmt(sumResult)} \u2713`, 'explain'),
    ]));

    // Bar diagram showing ratio parts
    const barRows = parts.map((p, i) => [`Part ${i + 1} (${p})`, results[i]!]);
    steps.push(step('s_bar', 'visual', [{
      op: 'table', data: { headers: ['Ratio Part', 'Value'], rows: barRows },
    }]));

  } else if (type === 'simplify') {
    const a = inputs.a as number;
    const b = inputs.b as number;
    const g = gcd(a, b);
    steps.push(step('s2', 'explain', [writeOp('Find the HCF and divide both parts.', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`HCF(${a}, ${b})`, `${g}`, 'find HCF')]));
    steps.push(step('s4', 'work', [
      txOp(`${a}:${b}`, `${a / g}:${b / g}`, `\u00F7${g}`),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`${a / g}:${b / g}`, 'answer')]));

  } else {
    return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.ratio.${Date.now()}`,
    subject: 'math',
    topic: 'ratio.ratios',
    title: `Ratio: ${problem.rawInput}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['ratios'] },
    steps,
  };
}

// ─── Powers & Surds ──────────────────────────────────────────────

export function solvePowers(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  if (type === 'simplify-surd') {
    const n = inputs.value as number;
    // Find largest perfect square factor
    let bestSquare = 1;
    for (let i = 2; i * i <= n; i++) {
      if (n % (i * i) === 0) bestSquare = i * i;
    }

    if (bestSquare === 1) {
      steps.push(step('s2', 'explain', [
        writeOp(`\u221A${n} is already in simplest form (no perfect square factors).`, 'explain'),
      ]));
      steps.push(step('s3', 'checkpoint', [writeOp(`\u221A${n}`, 'answer')]));
    } else {
      const outside = Math.sqrt(bestSquare);
      const inside = n / bestSquare;
      steps.push(step('s2', 'explain', [
        writeOp(`Find the largest perfect square factor of ${n}.`, 'explain'),
      ]));
      steps.push(step('s3', 'work', [
        txOp(`\u221A${n}`, `\u221A(${bestSquare} \u00D7 ${inside})`, `${n} = ${bestSquare} \u00D7 ${inside}`),
      ], 300));
      steps.push(step('s4', 'work', [
        txOp(`\u221A(${bestSquare} \u00D7 ${inside})`, `${outside}\u221A${inside}`, `\u221A${bestSquare} = ${outside}`),
      ], 300));
      steps.push(step('s5', 'checkpoint', [writeOp(`${outside}\u221A${inside}`, 'answer')]));
    }

  } else if (type === 'evaluate-power') {
    const base = inputs.base as number;
    const exp = inputs.exponent as number;
    const result = Math.pow(base, exp);
    steps.push(step('s2', 'explain', [
      writeOp(`${base}${exp >= 0 ? '\u207F' : '\u207B\u207F'} means multiply ${base} by itself ${Math.abs(exp)} times.`, 'explain'),
    ]));

    if (exp >= 0 && exp <= 6) {
      const expanded = Array(exp).fill(String(base)).join(' \u00D7 ');
      steps.push(step('s3', 'work', [txOp(`${base}^${exp}`, expanded, 'expand')]));
      steps.push(step('s4', 'work', [txOp(expanded, fmt(result), 'compute')]));
    } else {
      steps.push(step('s3', 'work', [txOp(`${base}^${exp}`, fmt(result), 'compute')]));
    }
    steps.push(step('s5', 'checkpoint', [writeOp(fmt(result), 'answer')]));

  } else if (type === 'index-law') {
    const base = inputs.base as number;
    const exp1 = inputs.exp1 as number;
    const exp2 = inputs.exp2 as number;
    const op = inputs.op as string;

    if (op === '*') {
      const resultExp = exp1 + exp2;
      const result = Math.pow(base, resultExp);
      steps.push(step('s2', 'explain', [writeOp(`Index law: a\u207F \u00D7 a\u1D50 = a\u207F\u207A\u1D50`, 'explain')]));
      steps.push(step('s3', 'work', [
        txOp(`${base}^${exp1} \u00D7 ${base}^${exp2}`, `${base}^${exp1 + exp2}`, `${exp1} + ${exp2} = ${resultExp}`),
      ], 300));
      steps.push(step('s4', 'work', [txOp(`${base}^${resultExp}`, fmt(result), 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(fmt(result), 'answer')]));
    } else if (op === '/') {
      const resultExp = exp1 - exp2;
      const result = Math.pow(base, resultExp);
      steps.push(step('s2', 'explain', [writeOp(`Index law: a\u207F \u00F7 a\u1D50 = a\u207F\u207B\u1D50`, 'explain')]));
      steps.push(step('s3', 'work', [
        txOp(`${base}^${exp1} \u00F7 ${base}^${exp2}`, `${base}^${exp1 - exp2}`, `${exp1} - ${exp2} = ${resultExp}`),
      ], 300));
      steps.push(step('s4', 'work', [txOp(`${base}^${resultExp}`, fmt(result), 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(fmt(result), 'answer')]));
    }
  } else {
    return null;
  }

  // Number line for the result if it's a simple number
  const powResult = steps[steps.length - 1];
  if (type === 'evaluate-power') {
    const base = inputs.base as number;
    const exp = inputs.exponent as number;
    const result = Math.pow(base, exp);
    if (isFinite(result) && Math.abs(result) < 500) {
      steps.push(step('s_nl', 'visual', [{
        op: 'numberline', data: { from: Math.floor(Math.min(0, result) - 2), to: Math.ceil(Math.max(0, result) + 2), marks: [result], labels: { [String(result)]: `${base}^${exp}` } },
      }]));
    }
  }

  return {
    schemaVersion: 1,
    id: `math.solve.powers.${Date.now()}`,
    subject: 'math',
    topic: 'powers.surds',
    title: `Simplify: ${problem.rawInput}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['powers', 'surds'] },
    steps,
  };
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
