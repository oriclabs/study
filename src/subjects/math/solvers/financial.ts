/**
 * Financial math solver — simple/compound interest, profit/loss/discount.
 * Sequences solver — arithmetic, geometric, find nth term.
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
  return parseFloat(n.toFixed(2)).toString();
}

// ─── Financial ───────────────────────────────────────────────────

export function solveFinancial(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  if (type === 'simple-interest') {
    const P = inputs.principal as number;
    const r = inputs.rate as number;
    const t = inputs.time as number;
    const interest = P * (r / 100) * t;
    const total = P + interest;

    steps.push(step('s2', 'explain', [writeOp('Formula: I = P \u00D7 r \u00D7 t / 100', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: P = ${fmt(P)}, r = ${fmt(r)}%, t = ${fmt(t)} years`, 'explain')], 200));
    steps.push(step('s3', 'work', [
      txOp(`I = ${P} \u00D7 ${r} \u00D7 ${t} / 100`, `I = ${fmt(P * r * t)} / 100`, 'multiply'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`I = ${fmt(P * r * t)} / 100`, `I = ${fmt(interest)}`, 'divide by 100'),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(`Total = ${P} + ${fmt(interest)}`, `Total = ${fmt(total)}`, 'add principal'),
    ], 300));
    steps.push(step('s6', 'checkpoint', [
      writeOp(`Interest = ${fmt(interest)}, Total = ${fmt(total)}`, 'answer'),
    ]));

  } else if (type === 'compound-interest') {
    const P = inputs.principal as number;
    const r = inputs.rate as number;
    const t = inputs.time as number;
    const n = (inputs.compounds as number) || 1; // compounds per year

    steps.push(step('s2', 'explain', [writeOp('Formula: A = P(1 + r/100n)^(nt)', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: P = ${fmt(P)}, r = ${fmt(r)}%, t = ${fmt(t)} years, n = ${n}/year`, 'explain')], 200));

    const rate = r / (100 * n);
    const periods = n * t;
    const amount = P * Math.pow(1 + rate, periods);
    const interest = amount - P;

    steps.push(step('s3', 'work', [
      txOp(
        `A = ${P}(1 + ${r}/${100 * n})^${periods}`,
        `A = ${P}(${fmt(1 + rate)})^${periods}`,
        `1 + ${fmt(rate)} = ${fmt(1 + rate)}`,
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(
        `A = ${P} \u00D7 ${fmt(Math.pow(1 + rate, periods))}`,
        `A = ${fmt(amount)}`,
        `(${fmt(1 + rate)})^${periods} = ${fmt(Math.pow(1 + rate, periods))}`,
      ),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(`Interest = ${fmt(amount)} - ${P}`, `Interest = ${fmt(interest)}`, 'subtract principal'),
    ], 300));
    steps.push(step('s6', 'checkpoint', [
      writeOp(`Amount = ${fmt(amount)}, Interest = ${fmt(interest)}`, 'answer'),
    ]));

    // Show year-by-year table
    if (t <= 10) {
      const rows: string[][] = [];
      let bal = P;
      for (let yr = 1; yr <= t; yr++) {
        const prev = bal;
        bal = prev * Math.pow(1 + rate, n);
        rows.push([String(yr), fmt(prev), fmt(bal - prev), fmt(bal)]);
      }
      steps.push(step('s_table', 'visual', [{
        op: 'table',
        data: {
          headers: ['Year', 'Start', 'Interest', 'End'],
          rows,
        },
      }]));
    }

  } else if (type === 'profit-loss') {
    const cost = inputs.cost as number;
    const selling = inputs.selling as number;
    const diff = selling - cost;
    const pct = (diff / cost) * 100;
    const isProfit = diff >= 0;

    steps.push(step('s2', 'explain', [
      writeOp(`${isProfit ? 'Profit' : 'Loss'} = Selling Price - Cost Price`, 'explain'),
    ]));
    steps.push(step('s3', 'work', [
      txOp(`${selling} - ${cost}`, fmt(diff), 'subtract'),
    ], 300));
    steps.push(step('s4', 'explain', [
      writeOp(`${isProfit ? 'Profit' : 'Loss'} % = (${isProfit ? 'Profit' : 'Loss'} / Cost) \u00D7 100`, 'explain'),
    ]));
    steps.push(step('s5', 'work', [
      txOp(`(${fmt(Math.abs(diff))} / ${cost}) \u00D7 100`, `${fmt(Math.abs(pct))}%`, 'compute'),
    ], 300));
    steps.push(step('s6', 'checkpoint', [
      writeOp(`${isProfit ? 'Profit' : 'Loss'} = ${fmt(Math.abs(diff))} (${fmt(Math.abs(pct))}%)`, 'answer'),
    ]));

  } else if (type === 'discount') {
    const original = inputs.original as number;
    const discount = inputs.discount as number;
    const saved = original * (discount / 100);
    const final = original - saved;

    steps.push(step('s2', 'explain', [writeOp(`Discount = ${discount}% of ${original}`, 'explain')]));
    steps.push(step('s3', 'work', [
      txOp(`${discount}/100 \u00D7 ${original}`, fmt(saved), 'compute discount'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`${original} - ${fmt(saved)}`, fmt(final), 'subtract discount'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [
      writeOp(`Sale price = ${fmt(final)} (saved ${fmt(saved)})`, 'answer'),
    ]));

  } else {
    return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.financial.${Date.now()}`,
    subject: 'math',
    topic: type.includes('interest') ? 'financial.interest' : 'financial.profit-loss',
    title: problem.rawInput,
    meta: { difficulty: 2, source: 'generated', objectives: ['financial math'] },
    steps,
  };
}

// ─── Sequences ───────────────────────────────────────────────────

export function solveSequence(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;
  const values = inputs.values as number[];

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  if (type === 'arithmetic') {
    const d = values.length >= 2 ? values[1]! - values[0]! : 0;
    const a = values[0]!;
    const n = (inputs.findN as number) || 10;

    steps.push(step('s2', 'explain', [
      writeOp('Check: is the difference between consecutive terms constant?', 'explain'),
    ]));

    // Show differences
    const diffs = values.slice(1).map((v, i) => v - values[i]!);
    const diffsStr = diffs.map(fmt).join(', ');
    steps.push(step('s3', 'work', [
      writeOp(`Differences: ${diffsStr}`),
    ], 300));

    const isArithmetic = diffs.every(dd => Math.abs(dd - d) < 1e-9);
    if (isArithmetic) {
      steps.push(step('s4', 'explain', [
        writeOp(`Common difference d = ${fmt(d)}`, 'explain'),
        writeOp(`Formula: nth term = a + (n-1)d = ${fmt(a)} + (n-1)\u00D7${fmt(d)}`, 'explain'),
      ]));

      const nthTerm = a + (n - 1) * d;
      steps.push(step('s5', 'work', [
        txOp(
          `T(${n}) = ${fmt(a)} + (${n}-1) \u00D7 ${fmt(d)}`,
          `T(${n}) = ${fmt(a)} + ${fmt((n - 1) * d)}`,
          `(${n}-1) \u00D7 ${fmt(d)}`,
        ),
      ], 300));
      steps.push(step('s6', 'work', [
        txOp(`T(${n}) = ${fmt(a)} + ${fmt((n - 1) * d)}`, `T(${n}) = ${fmt(nthTerm)}`, 'add'),
      ], 300));
      steps.push(step('s7', 'checkpoint', [
        writeOp(`nth term = ${fmt(a)} + ${fmt(d)}(n-1)`, 'answer'),
        writeOp(`T(${n}) = ${fmt(nthTerm)}`, 'answer'),
      ]));

      // Number line showing first few terms
      const terms = values.slice(0, Math.min(6, values.length));
      const nlFrom = Math.floor(Math.min(...terms) - 2);
      const nlTo = Math.ceil(Math.max(...terms, nthTerm) + 2);
      steps.push(step('s_nl', 'visual', [{
        op: 'numberline', data: { from: nlFrom, to: nlTo, marks: terms, labels: { [String(nthTerm)]: `T(${n})` } },
      }]));
    } else {
      steps.push(step('s4', 'explain', [
        writeOp('Differences are not constant \u2014 not arithmetic.', 'explain'),
      ]));
    }

  } else if (type === 'geometric') {
    if (values[0] === 0) return null;
    const r = values.length >= 2 ? values[1]! / values[0]! : 1;
    const a = values[0]!;
    const n = (inputs.findN as number) || 10;

    steps.push(step('s2', 'explain', [
      writeOp('Check: is the ratio between consecutive terms constant?', 'explain'),
    ]));

    const ratios = values.slice(1).map((v, i) => values[i] !== 0 ? v / values[i]! : NaN);
    steps.push(step('s3', 'work', [
      writeOp(`Ratios: ${ratios.map(fmt).join(', ')}`),
    ], 300));

    const isGeometric = ratios.every(rr => Math.abs(rr - r) < 1e-9);
    if (isGeometric) {
      steps.push(step('s4', 'explain', [
        writeOp(`Common ratio r = ${fmt(r)}`, 'explain'),
        writeOp(`Formula: nth term = a \u00D7 r^(n-1) = ${fmt(a)} \u00D7 ${fmt(r)}^(n-1)`, 'explain'),
      ]));

      const nthTerm = a * Math.pow(r, n - 1);
      steps.push(step('s5', 'work', [
        txOp(
          `T(${n}) = ${fmt(a)} \u00D7 ${fmt(r)}^${n - 1}`,
          `T(${n}) = ${fmt(a)} \u00D7 ${fmt(Math.pow(r, n - 1))}`,
          `${fmt(r)}^${n - 1} = ${fmt(Math.pow(r, n - 1))}`,
        ),
      ], 300));
      steps.push(step('s6', 'work', [
        txOp(`T(${n}) = ${fmt(a)} \u00D7 ${fmt(Math.pow(r, n - 1))}`, `T(${n}) = ${fmt(nthTerm)}`, 'multiply'),
      ], 300));
      steps.push(step('s7', 'checkpoint', [
        writeOp(`nth term = ${fmt(a)} \u00D7 ${fmt(r)}^(n-1)`, 'answer'),
        writeOp(`T(${n}) = ${fmt(nthTerm)}`, 'answer'),
      ]));

      // Terms table
      const termRows = values.map((v, i) => [String(i + 1), fmt(v)]);
      termRows.push([String(n), fmt(nthTerm)]);
      steps.push(step('s_table', 'visual', [{
        op: 'table', data: { headers: ['n', 'T(n)'], rows: termRows, highlightCells: [[termRows.length - 1, 1]] },
      }]));
    }

  } else if (type === 'find-next') {
    // Try arithmetic first, then geometric
    const d = values.length >= 2 ? values[1]! - values[0]! : 0;
    const isArith = values.slice(1).every((v, i) => Math.abs((v - values[i]!) - d) < 1e-9);

    if (isArith) {
      const next = values[values.length - 1]! + d;
      steps.push(step('s2', 'explain', [writeOp(`Arithmetic sequence, d = ${fmt(d)}`, 'explain')]));
      steps.push(step('s3', 'work', [
        txOp(`${fmt(values[values.length - 1]!)} + ${fmt(d)}`, fmt(next), 'add d'),
      ], 300));
      steps.push(step('s4', 'checkpoint', [writeOp(`Next term = ${fmt(next)}`, 'answer')]));
    } else if (values[0] !== 0) {
      const r = values[1]! / values[0]!;
      const isGeom = values.slice(1).every((v, i) => values[i] !== 0 && Math.abs((v / values[i]!) - r) < 1e-9);
      if (isGeom) {
        const next = values[values.length - 1]! * r;
        steps.push(step('s2', 'explain', [writeOp(`Geometric sequence, r = ${fmt(r)}`, 'explain')]));
        steps.push(step('s3', 'work', [
          txOp(`${fmt(values[values.length - 1]!)} \u00D7 ${fmt(r)}`, fmt(next), 'multiply by r'),
        ], 300));
        steps.push(step('s4', 'checkpoint', [writeOp(`Next term = ${fmt(next)}`, 'answer')]));
      } else {
        steps.push(step('s2', 'explain', [writeOp('Could not identify a simple pattern.', 'explain')]));
        return null;
      }
    }

  } else {
    return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.sequence.${Date.now()}`,
    subject: 'math',
    topic: type === 'geometric' ? 'sequences.geometric' : 'sequences.arithmetic',
    title: problem.rawInput,
    meta: { difficulty: 2, source: 'generated', objectives: ['sequences'] },
    steps,
  };
}
