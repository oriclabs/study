/**
 * Statistics solver — mean, median, mode, range.
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

export function solveStatistics(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { operation: string; values: number[] };
  const { operation, values } = inputs;
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const steps: Step[] = [];
  const valuesStr = values.join(', ');

  steps.push(step('s1', 'work', [writeOp(`${operation} of {${valuesStr}}`)], 400));

  switch (operation) {
    case 'mean': {
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      steps.push(step('s2', 'explain', [
        writeOp('Mean = sum of values / count', 'explain'),
      ]));
      steps.push(step('s3', 'work', [
        txOp(
          `(${values.join(' + ')}) / ${values.length}`,
          `${fmt(sum)} / ${values.length}`,
          'add all values',
        ),
      ], 300));
      steps.push(step('s4', 'work', [
        txOp(`${fmt(sum)} / ${values.length}`, fmt(mean), 'divide'),
      ], 300));
      steps.push(step('s5', 'checkpoint', [writeOp(`Mean = ${fmt(mean)}`, 'answer')]));
      break;
    }

    case 'median': {
      const n = sorted.length;
      steps.push(step('s2', 'explain', [
        writeOp('Sort the values first, then find the middle.', 'explain'),
      ]));
      steps.push(step('s3', 'work', [
        txOp(`{${valuesStr}}`, `{${sorted.join(', ')}}`, 'sort ascending'),
      ], 300));
      steps.push(step('s4', 'explain', [
        writeOp(`${n} values \u2014 ${n % 2 === 1 ? 'odd count, take middle value' : 'even count, average the two middle values'}.`, 'explain'),
      ]));

      let median: number;
      if (n % 2 === 1) {
        median = sorted[Math.floor(n / 2)]!;
        steps.push(step('s5', 'work', [
          writeOp(`Middle value (position ${Math.floor(n / 2) + 1}): ${fmt(median)}`),
        ]));
      } else {
        const a = sorted[n / 2 - 1]!;
        const b = sorted[n / 2]!;
        median = (a + b) / 2;
        steps.push(step('s5', 'work', [
          txOp(
            `(${fmt(a)} + ${fmt(b)}) / 2`,
            fmt(median),
            `average positions ${n / 2} and ${n / 2 + 1}`,
          ),
        ], 300));
      }
      steps.push(step('s6', 'checkpoint', [writeOp(`Median = ${fmt(median)}`, 'answer')]));
      break;
    }

    case 'mode': {
      const freq = new Map<number, number>();
      for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
      const maxFreq = Math.max(...freq.values());

      steps.push(step('s2', 'explain', [
        writeOp('Count how often each value appears.', 'explain'),
      ]));

      // Show frequency table
      const tableRows: string[][] = [];
      for (const [val, count] of [...freq.entries()].sort((a, b) => a[0] - b[0])) {
        tableRows.push([fmt(val), String(count)]);
      }
      steps.push(step('s3', 'work', [{
        op: 'table',
        data: {
          headers: ['Value', 'Frequency'],
          rows: tableRows,
          highlightCells: tableRows
            .map((row, i) => parseInt(row[1]!) === maxFreq ? [i, 1] as [number, number] : null)
            .filter((x): x is [number, number] => x !== null),
        },
      }], 400));

      if (maxFreq === 1) {
        steps.push(step('s4', 'checkpoint', [writeOp('No mode (all values appear once)', 'answer')]));
      } else {
        const modes = [...freq.entries()].filter(([, c]) => c === maxFreq).map(([v]) => v);
        steps.push(step('s4', 'checkpoint', [
          writeOp(`Mode = ${modes.map(fmt).join(', ')} (appears ${maxFreq} times)`, 'answer'),
        ]));
      }
      break;
    }

    case 'range': {
      const min = sorted[0]!;
      const max = sorted[sorted.length - 1]!;
      const range = max - min;
      steps.push(step('s2', 'explain', [
        writeOp('Range = maximum - minimum', 'explain'),
      ]));
      steps.push(step('s3', 'work', [
        txOp(`${fmt(max)} - ${fmt(min)}`, fmt(range), 'subtract'),
      ], 300));
      steps.push(step('s4', 'checkpoint', [writeOp(`Range = ${fmt(range)}`, 'answer')]));

      // Number line
      steps.push(step('s_nl', 'visual', [{
        op: 'numberline',
        data: {
          from: Math.floor(min - 2),
          to: Math.ceil(max + 2),
          marks: [min, max],
          labels: { [String(min)]: `min=${fmt(min)}`, [String(max)]: `max=${fmt(max)}` },
          intervals: [{ from: min, to: max, closed: [true, true] as [boolean, boolean] }],
        },
      }]));
      break;
    }

    default:
      return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.statistics.${Date.now()}`,
    subject: 'math',
    topic: 'statistics.data',
    title: `${operation}: ${valuesStr}`,
    meta: { difficulty: 1, source: 'generated', objectives: [operation] },
    steps,
  };
}
