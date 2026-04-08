/**
 * Percentage solver.
 * Handles:
 *   - percentage-of:    "25% of 80" → 20
 *   - percentage-find:  "what % is 15 of 60" → 25%
 *   - percentage-whole:  "15 is 25% of what" → 60
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
  return parseFloat(n.toFixed(4)).toString();
}

export function solvePercentage(problem: Problem): Lesson | null {
  const steps: Step[] = [];

  if (problem.type === 'percentage-of') {
    const { percent, value } = problem.inputs as { percent: number; value: number };
    const result = (percent / 100) * value;

    steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));
    steps.push(step('s2', 'explain', [
      writeOp(`${percent}% means ${percent}/100`, 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(
        `${percent}% of ${value}`,
        `${percent}/100 \u00D7 ${value}`,
        'convert % to fraction',
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(
        `${percent}/100 \u00D7 ${value}`,
        `${fmt(percent / 100)} \u00D7 ${value}`,
        `${percent}/100 = ${fmt(percent / 100)}`,
      ),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(
        `${fmt(percent / 100)} \u00D7 ${value}`,
        `${fmt(result)}`,
        'multiply',
      ),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(fmt(result), 'answer')]));

    // Percentage bar showing proportion
    steps.push(step('s_bar', 'visual', [{
      op: 'table', data: {
        headers: ['Total', `${percent}%`, 'Result'],
        rows: [[fmt(value), `${percent}/100`, fmt(result)]],
        highlightCells: [[0, 2]],
      },
    }]));

  } else if (problem.type === 'percentage-find') {
    const { part, whole } = problem.inputs as { part: number; whole: number };
    if (whole === 0) return null;
    const result = (part / whole) * 100;

    steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));
    steps.push(step('s2', 'explain', [
      writeOp('Percentage = (part / whole) \u00D7 100', 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(
        `what % is ${part} of ${whole}`,
        `(${part} / ${whole}) \u00D7 100`,
        'apply formula',
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(
        `(${part} / ${whole}) \u00D7 100`,
        `${fmt(part / whole)} \u00D7 100`,
        `${part}/${whole} = ${fmt(part / whole)}`,
      ),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(
        `${fmt(part / whole)} \u00D7 100`,
        `${fmt(result)}%`,
        'multiply by 100',
      ),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(`${fmt(result)}%`, 'answer')]));

  } else if (problem.type === 'percentage-whole') {
    const { part, percent } = problem.inputs as { part: number; percent: number };
    if (percent === 0) return null;
    const result = (part / percent) * 100;

    steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));
    steps.push(step('s2', 'explain', [
      writeOp('Whole = part / (percent / 100)', 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(
        `${part} is ${percent}% of what`,
        `${part} / (${percent}/100)`,
        'rearrange formula',
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(
        `${part} / (${percent}/100)`,
        `${part} / ${fmt(percent / 100)}`,
        `${percent}/100 = ${fmt(percent / 100)}`,
      ),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(
        `${part} / ${fmt(percent / 100)}`,
        `${fmt(result)}`,
        'divide',
      ),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(fmt(result), 'answer')]));

  } else {
    return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.percentage.${Date.now()}`,
    subject: 'math',
    topic: 'fractions.percentages',
    title: `Solve: ${problem.rawInput}`,
    meta: { difficulty: 1, source: 'generated', objectives: ['percentages'] },
    steps,
  };
}
