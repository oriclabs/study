/**
 * Fraction arithmetic solver.
 * Handles: a/b + c/d, a/b - c/d, a/b * c/d, a/b / c/d
 * Shows LCD, equivalent fractions, computation, simplification.
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
function step(id: string, kind: Step['kind'], ops: Op[], narration?: string, wait?: number): Step {
  return { id, kind, ops, ...(narration ? { narration } : {}), ...(wait ? { waitAfterMs: wait } : {}) };
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b); }

function simplifyFrac(n: number, d: number): [number, number] {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d);
  return [n / g, d / g];
}

export function solveFraction(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { a_num: number; a_den: number; b_num: number; b_den: number; op: string };
  const { a_num, a_den, b_num, b_den, op } = inputs;

  if (a_den === 0 || b_den === 0) return null;

  const steps: Step[] = [];
  const fracA = `${a_num}/${a_den}`;
  const fracB = `${b_num}/${b_den}`;
  const opSymbol = op === '*' ? '\u00D7' : op === '/' ? '\u00F7' : op;
  const expr = `${fracA} ${opSymbol} ${fracB}`;

  steps.push(step('s1', 'work', [writeOp(expr)], undefined, 400));

  let resultNum: number;
  let resultDen: number;

  if (op === '+' || op === '-') {
    // Find LCD
    const lcd = lcm(a_den, b_den);
    const multA = lcd / a_den;
    const multB = lcd / b_den;
    const newA = a_num * multA;
    const newB = b_num * multB;

    steps.push(step('s2', 'explain', [
      writeOp(`Find the LCD of ${a_den} and ${b_den}`, 'explain'),
    ]));

    steps.push(step('s3', 'work', [
      txOp(expr, `LCD = ${lcd}`, `LCM(${a_den}, ${b_den})`),
    ], undefined, 300));

    // Convert to equivalent fractions
    const eqA = `${newA}/${lcd}`;
    const eqB = `${newB}/${lcd}`;

    if (multA !== 1 || multB !== 1) {
      steps.push(step('s4', 'work', [
        txOp(
          `${fracA} ${opSymbol} ${fracB}`,
          `${eqA} ${opSymbol} ${eqB}`,
          `\u00D7${multA} and \u00D7${multB}`,
        ),
      ], undefined, 300));
    }

    // Compute
    resultNum = op === '+' ? newA + newB : newA - newB;
    resultDen = lcd;

    steps.push(step('s5', 'work', [
      txOp(
        `${eqA} ${opSymbol} ${eqB}`,
        `${resultNum}/${resultDen}`,
        op === '+' ? `${newA} + ${newB} = ${resultNum}` : `${newA} - ${newB} = ${resultNum}`,
      ),
    ], undefined, 300));

  } else if (op === '*') {
    // Multiply numerators and denominators
    resultNum = a_num * b_num;
    resultDen = a_den * b_den;

    steps.push(step('s2', 'explain', [
      writeOp('Multiply numerators and denominators', 'explain'),
    ]));

    steps.push(step('s3', 'work', [
      txOp(expr, `(${a_num} \u00D7 ${b_num}) / (${a_den} \u00D7 ${b_den})`, 'multiply across'),
    ], undefined, 300));

    steps.push(step('s4', 'work', [
      txOp(
        `(${a_num} \u00D7 ${b_num}) / (${a_den} \u00D7 ${b_den})`,
        `${resultNum}/${resultDen}`,
        'compute',
      ),
    ], undefined, 300));

  } else {
    // Division: multiply by reciprocal
    if (b_num === 0) return null;

    steps.push(step('s2', 'explain', [
      writeOp('Divide = multiply by the reciprocal', 'explain'),
    ]));

    steps.push(step('s3', 'work', [
      txOp(expr, `${fracA} \u00D7 ${b_den}/${b_num}`, 'flip and multiply'),
    ], undefined, 300));

    resultNum = a_num * b_den;
    resultDen = a_den * b_num;

    steps.push(step('s4', 'work', [
      txOp(
        `${fracA} \u00D7 ${b_den}/${b_num}`,
        `${resultNum}/${resultDen}`,
        'multiply across',
      ),
    ], undefined, 300));
  }

  // Simplify
  const [sNum, sDen] = simplifyFrac(resultNum, resultDen);
  if (sNum !== resultNum || sDen !== resultDen) {
    const g = gcd(Math.abs(resultNum), Math.abs(resultDen));
    steps.push(step('s_simplify', 'work', [
      txOp(
        `${resultNum}/${resultDen}`,
        sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`,
        `\u00F7${g} (simplify)`,
      ),
    ], undefined, 300));
  }

  // Answer
  const answer = sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
  steps.push(step('s_ans', 'checkpoint', [writeOp(answer, 'answer')]));

  // Number line showing the fractions
  const decA = a_num / a_den;
  const decB = b_num / b_den;
  const decResult = sNum / sDen;
  const allVals = [decA, decB, decResult, 0];
  const nlFrom = Math.floor(Math.min(...allVals) - 1);
  const nlTo = Math.ceil(Math.max(...allVals) + 1);
  steps.push(step('s_nl', 'visual', [{
    op: 'numberline',
    data: {
      from: nlFrom, to: nlTo,
      marks: [decResult],
      labels: { [String(decResult)]: `= ${answer}` },
    },
  }]));

  return {
    schemaVersion: 1,
    id: `math.solve.fraction.${Date.now()}`,
    subject: 'math',
    topic: 'fractions.fractions',
    title: `Solve: ${expr}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['fraction arithmetic'] },
    steps,
  };
}
