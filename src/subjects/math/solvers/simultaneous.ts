/**
 * Simultaneous equations solver (2 variables, elimination method).
 * Input: two equations ax + by = c
 * Shows: multiply to match coefficients, subtract, solve, back-substitute.
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

function formatEq(a: number, b: number, c: number): string {
  const parts: string[] = [];
  if (a === 1) parts.push('x');
  else if (a === -1) parts.push('-x');
  else if (a !== 0) parts.push(`${fmt(a)}x`);

  if (b === 1) parts.push(parts.length ? '+ y' : 'y');
  else if (b === -1) parts.push(parts.length ? '- y' : '-y');
  else if (b > 0 && parts.length) parts.push(`+ ${fmt(b)}y`);
  else if (b < 0 && parts.length) parts.push(`- ${fmt(-b)}y`);
  else if (b !== 0) parts.push(`${fmt(b)}y`);

  return `${parts.join(' ')} = ${fmt(c)}`;
}

export function solveSimultaneous(problem: Problem): Lesson | null {
  const inputs = problem.inputs as {
    eq1: { a: number; b: number; c: number };
    eq2: { a: number; b: number; c: number };
  };
  const { eq1, eq2 } = inputs;

  // Solve using elimination on x
  const det = eq1.a * eq2.b - eq2.a * eq1.b;
  if (det === 0) return null; // No unique solution

  const x = (eq1.c * eq2.b - eq2.c * eq1.b) / det;
  const y = (eq1.a * eq2.c - eq2.a * eq1.c) / det;

  const eq1Str = formatEq(eq1.a, eq1.b, eq1.c);
  const eq2Str = formatEq(eq2.a, eq2.b, eq2.c);

  const steps: Step[] = [];

  // Show equations
  steps.push(step('s1', 'work', [
    writeOp(`(1)  ${eq1Str}`),
    writeOp(`(2)  ${eq2Str}`),
  ], 400));

  steps.push(step('s2', 'explain', [
    writeOp('Strategy: elimination — make coefficients of x equal, then subtract.', 'explain'),
  ], 300));

  // Multiply to match x coefficients
  const m1 = Math.abs(eq2.a);
  const m2 = Math.abs(eq1.a);
  const sign1 = eq1.a * eq2.a > 0 ? 'subtract' : 'add';

  const newEq1 = { a: eq1.a * m1, b: eq1.b * m1, c: eq1.c * m1 };
  const newEq2 = { a: eq2.a * m2, b: eq2.b * m2, c: eq2.c * m2 };

  if (m1 !== 1 || m2 !== 1) {
    const ops: Op[] = [];
    if (m1 !== 1) {
      ops.push(txOp(
        `(1)  ${eq1Str}`,
        `(1')  ${formatEq(newEq1.a, newEq1.b, newEq1.c)}`,
        `multiply (1) by ${m1}`,
      ));
    }
    if (m2 !== 1) {
      ops.push(txOp(
        `(2)  ${eq2Str}`,
        `(2')  ${formatEq(newEq2.a, newEq2.b, newEq2.c)}`,
        `multiply (2) by ${m2}`,
      ));
    }
    steps.push(step('s3', 'work', ops, 400));
  }

  // Subtract/add to eliminate x
  const elimB = sign1 === 'subtract' ? newEq1.b - newEq2.b : newEq1.b + newEq2.b;
  const elimC = sign1 === 'subtract' ? newEq1.c - newEq2.c : newEq1.c + newEq2.c;

  const fromStr = m1 !== 1 || m2 !== 1
    ? `(1') ${sign1 === 'subtract' ? '-' : '+'} (2')`
    : `(1) ${sign1 === 'subtract' ? '-' : '+'} (2)`;
  const elimEq = formatEq(0, elimB, elimC);

  steps.push(step('s4', 'work', [
    txOp(fromStr, elimEq, `${sign1} equations to eliminate x`),
  ], 400));

  // Solve for y
  if (elimB === 0) return null;
  steps.push(step('s5', 'work', [
    txOp(elimEq, `y = ${fmt(y)}`, `divide by ${fmt(elimB)}`),
  ], 300));

  // Back-substitute for x
  steps.push(step('s6', 'explain', [
    writeOp(`Substitute y = ${fmt(y)} into equation (1):`, 'explain'),
  ]));

  const subEq = `${fmt(eq1.a)}x + ${fmt(eq1.b)}(${fmt(y)}) = ${fmt(eq1.c)}`;
  const simplified = `${fmt(eq1.a)}x + ${fmt(eq1.b * y)} = ${fmt(eq1.c)}`;
  const isolated = `${fmt(eq1.a)}x = ${fmt(eq1.c - eq1.b * y)}`;

  steps.push(step('s7', 'work', [
    txOp(subEq, simplified, 'compute'),
  ], 300));

  steps.push(step('s8', 'work', [
    txOp(simplified, isolated, `subtract ${fmt(eq1.b * y)}`),
  ], 300));

  if (eq1.a !== 1) {
    steps.push(step('s9', 'work', [
      txOp(isolated, `x = ${fmt(x)}`, `divide by ${fmt(eq1.a)}`),
    ], 300));
  }

  // Answer
  steps.push(step('s10', 'checkpoint', [
    writeOp(`x = ${fmt(x)},  y = ${fmt(y)}`, 'answer'),
  ]));

  // Verify
  const v1 = eq1.a * x + eq1.b * y;
  const v2 = eq2.a * x + eq2.b * y;
  steps.push(step('s11', 'explain', [
    writeOp(`Verify: (1) ${fmt(eq1.a)}(${fmt(x)}) + ${fmt(eq1.b)}(${fmt(y)}) = ${fmt(v1)} \u2713`, 'explain'),
    writeOp(`Verify: (2) ${fmt(eq2.a)}(${fmt(x)}) + ${fmt(eq2.b)}(${fmt(y)}) = ${fmt(v2)} \u2713`, 'explain'),
  ]));

  // Graph: two lines intersecting at (x, y)
  const pad = Math.max(3, Math.ceil(Math.max(Math.abs(x), Math.abs(y)) * 0.3));
  const xR: [number, number] = [Math.floor(Math.min(0, x) - pad), Math.ceil(Math.max(0, x) + pad)];
  const yR: [number, number] = [Math.floor(Math.min(0, y) - pad), Math.ceil(Math.max(0, y) + pad)];

  // Express each equation as y = ... for plotting
  const plots: { expr: string; color: string; label: string }[] = [];
  if (eq1.b !== 0) {
    const m1Slope = -eq1.a / eq1.b, c1 = eq1.c / eq1.b;
    plots.push({ expr: `${m1Slope}*x+${c1}`, color: '#2563eb', label: `(1)` });
  }
  if (eq2.b !== 0) {
    const m2Slope = -eq2.a / eq2.b, c2 = eq2.c / eq2.b;
    plots.push({ expr: `${m2Slope}*x+${c2}`, color: '#7c3aed', label: `(2)` });
  }

  if (plots.length >= 2) {
    steps.push(step('s_graph', 'visual', [{
      op: 'graph',
      data: { xRange: xR, yRange: yR, plots, points: [{ x, y, label: `(${fmt(x)}, ${fmt(y)})` }] },
    }]));
  }

  return {
    schemaVersion: 1,
    id: `math.solve.simultaneous.${Date.now()}`,
    subject: 'math',
    topic: 'algebra.simultaneous',
    title: `Solve: ${problem.rawInput}`,
    meta: { difficulty: 3, source: 'generated', objectives: ['simultaneous equations', 'elimination'] },
    steps,
  };
}
