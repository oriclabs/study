/**
 * Linear inequality solver.
 * Handles: ax + b > c, ax + b >= c, ax + b < c, ax + b <= c
 * Shows step-by-step isolation, sign flip warning, number line.
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

/** Flip inequality direction. */
function flipOp(op: string): string {
  switch (op) {
    case '>': return '<';
    case '<': return '>';
    case '>=': return '<=';
    case '<=': return '>=';
    default: return op;
  }
}

/** Pretty-print inequality operator. */
function prettyOp(op: string): string {
  switch (op) {
    case '>=': return '\u2265';
    case '<=': return '\u2264';
    default: return op;
  }
}

export function solveInequality(problem: Problem): Lesson | null {
  const a = problem.coefficients?.a ?? 0;
  const b = problem.coefficients?.b ?? 0;
  let operator = (problem.inputs as { operator: string }).operator;
  if (a === 0) return null;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  // Standard form: ax + b OP 0
  // Solve: ax OP -b  →  x OP -b/a (flip if a < 0)
  let currentLhs = `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '- ' + (-b)}`;
  let currentRhs = '0';
  let currentExpr = `${currentLhs} ${prettyOp(operator)} ${currentRhs}`;

  // Step: remove constant
  if (b !== 0) {
    const action = b > 0 ? `subtract ${b} from both sides` : `add ${-b} to both sides`;
    currentLhs = `${a === 1 ? '' : a === -1 ? '-' : a}x`;
    currentRhs = fmt(-b);
    const nextExpr = `${currentLhs} ${prettyOp(operator)} ${currentRhs}`;
    steps.push(step('s2', 'work', [
      txOp(currentExpr, nextExpr, action),
    ], 300));
    currentExpr = nextExpr;
  }

  // Step: divide by coefficient
  if (a !== 1) {
    const willFlip = a < 0;
    if (willFlip) {
      steps.push(step('s3', 'explain', [
        writeOp(`Dividing by a negative number (${a}) \u2014 flip the inequality!`, 'explain'),
      ]));
      operator = flipOp(operator);
    }
    const solution = -b / a;
    const nextExpr = `x ${prettyOp(operator)} ${fmt(solution)}`;
    steps.push(step('s4', 'work', [
      txOp(currentExpr, nextExpr, `divide by ${a}${willFlip ? ' (flip!)' : ''}`),
    ], 300));
    currentExpr = nextExpr;
  }

  const solution = -b / a;

  // Answer
  steps.push(step('s5', 'checkpoint', [
    writeOp(`x ${prettyOp(operator)} ${fmt(solution)}`, 'answer'),
  ]));

  // Number line visualization
  const nlFrom = Math.floor(solution - 5);
  const nlTo = Math.ceil(solution + 5);
  const isOpen = operator === '>' || operator === '<';
  const goesRight = operator === '>' || operator === '>=';

  steps.push(step('s_nl', 'visual', [{
    op: 'numberline',
    data: {
      from: nlFrom,
      to: nlTo,
      marks: [solution],
      labels: { [String(solution)]: fmt(solution) },
      intervals: [{
        from: goesRight ? solution : nlFrom,
        to: goesRight ? nlTo : solution,
        closed: [!isOpen, !isOpen] as [boolean, boolean],
      }],
    },
  }]));

  return {
    schemaVersion: 1,
    id: `math.solve.inequality.${Date.now()}`,
    subject: 'math',
    topic: 'algebra.inequalities',
    title: `Solve: ${problem.rawInput}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['linear inequalities', 'sign flip rule'] },
    steps,
  };
}
