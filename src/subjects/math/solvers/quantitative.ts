/**
 * Quantitative reasoning solvers:
 * - Missing number in sequence (with ?)
 * - Number analogies (3→9, 4→16, 5→?)
 * - Odd-one-out (which doesn't belong)
 * - Number matrices (row/col/diagonal patterns)
 * - Magic squares
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

// ─── Missing Number in Sequence ──────────────────────────────────

export function solveMissingNumber(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { values: (number | null)[]; missingIndex: number };
  const { values, missingIndex } = inputs;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  const known = values.filter((v): v is number => v !== null);
  if (known.length < 3) return null;

  // Try arithmetic pattern
  const knownIndices = values.map((v, i) => v !== null ? i : -1).filter(i => i >= 0);
  const knownVals = knownIndices.map(i => values[i]!);

  // Check arithmetic: constant difference
  const diffs: number[] = [];
  for (let i = 1; i < knownIndices.length; i++) {
    const gap = knownIndices[i]! - knownIndices[i - 1]!;
    const valDiff = knownVals[i]! - knownVals[i - 1]!;
    diffs.push(valDiff / gap);
  }

  const isArithmetic = diffs.length > 0 && diffs.every(d => Math.abs(d - diffs[0]!) < 1e-9);

  if (isArithmetic) {
    const d = diffs[0]!;
    // Find the missing value using the common difference
    const refIdx = knownIndices[0]!;
    const refVal = knownVals[0]!;
    const missing = refVal + d * (missingIndex - refIdx);

    steps.push(step('s2', 'explain', [writeOp('Check differences between terms:', 'explain')]));

    // Show differences
    const diffStr = knownVals.slice(1).map((v, i) => `${fmt(v)} - ${fmt(knownVals[i]!)} = ${fmt(v - knownVals[i]!)}`).join(', ');
    steps.push(step('s3', 'work', [writeOp(`Differences: ${diffStr}`)]));
    steps.push(step('s4', 'explain', [writeOp(`Common difference d = ${fmt(d)} \u2014 arithmetic sequence!`, 'explain')]));

    const filled = [...values];
    filled[missingIndex] = missing;
    steps.push(step('s5', 'work', [
      txOp(
        values.map(v => v === null ? '?' : fmt(v)).join(', '),
        filled.map(v => fmt(v!)).join(', '),
        `? = ${fmt(refVal)} + ${fmt(d)} \u00D7 ${missingIndex - refIdx} = ${fmt(missing)}`,
      ),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));

    // Number line showing the sequence
    const allNums = filled.filter((v): v is number => v !== null);
    const nlFrom = Math.floor(Math.min(...allNums) - 2);
    const nlTo = Math.ceil(Math.max(...allNums) + 2);
    steps.push(step('s_nl', 'visual', [{
      op: 'numberline',
      data: { from: nlFrom, to: nlTo, marks: [missing], labels: { [String(missing)]: `? = ${fmt(missing)}` } },
    }]));

    return lesson('missing-number', 'sequences.arithmetic', problem.rawInput, steps);
  }

  // Check geometric: constant ratio
  const ratios: number[] = [];
  for (let i = 1; i < knownIndices.length; i++) {
    if (knownVals[i - 1] === 0) continue;
    const gap = knownIndices[i]! - knownIndices[i - 1]!;
    const ratio = Math.pow(knownVals[i]! / knownVals[i - 1]!, 1 / gap);
    ratios.push(ratio);
  }

  const isGeometric = ratios.length > 0 && ratios.every(r => Math.abs(r - ratios[0]!) < 1e-9);

  if (isGeometric) {
    const r = ratios[0]!;
    const refIdx = knownIndices[0]!;
    const refVal = knownVals[0]!;
    const missing = refVal * Math.pow(r, missingIndex - refIdx);

    steps.push(step('s2', 'explain', [writeOp('Check ratios between terms:', 'explain')]));
    const ratioStr = knownVals.slice(1).map((v, i) => `${fmt(v)} / ${fmt(knownVals[i]!)} = ${fmt(v / knownVals[i]!)}`).join(', ');
    steps.push(step('s3', 'work', [writeOp(`Ratios: ${ratioStr}`)]));
    steps.push(step('s4', 'explain', [writeOp(`Common ratio r = ${fmt(r)} \u2014 geometric sequence!`, 'explain')]));

    const filled = [...values];
    filled[missingIndex] = missing;
    steps.push(step('s5', 'work', [
      txOp(
        values.map(v => v === null ? '?' : fmt(v)).join(', '),
        filled.map(v => fmt(v!)).join(', '),
        `? = ${fmt(refVal)} \u00D7 ${fmt(r)}^${missingIndex - refIdx} = ${fmt(missing)}`,
      ),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));

    return lesson('missing-number', 'sequences.geometric', problem.rawInput, steps);
  }

  // Check quadratic: second differences constant
  if (known.length >= 4) {
    const firstDiffs = knownVals.slice(1).map((v, i) => v - knownVals[i]!);
    const secondDiffs = firstDiffs.slice(1).map((v, i) => v - firstDiffs[i]!);
    const isQuadratic = secondDiffs.length > 0 && secondDiffs.every(d => Math.abs(d - secondDiffs[0]!) < 1e-9);

    if (isQuadratic) {
      const sd = secondDiffs[0]!;
      steps.push(step('s2', 'explain', [writeOp('Check second differences:', 'explain')]));
      steps.push(step('s3', 'work', [writeOp(`First differences: ${firstDiffs.map(fmt).join(', ')}`)]));
      steps.push(step('s4', 'work', [writeOp(`Second differences: ${secondDiffs.map(fmt).join(', ')}`)]));
      steps.push(step('s5', 'explain', [writeOp(`Constant second difference = ${fmt(sd)} \u2014 quadratic sequence!`, 'explain')]));

      // Extrapolate the missing first difference, then the missing value
      const missingFirstDiffIdx = missingIndex - 1;
      // Reconstruct first diffs including the gap
      const allFirstDiffs = [...firstDiffs];
      if (missingFirstDiffIdx >= 0 && missingFirstDiffIdx < allFirstDiffs.length) {
        // Missing value is between known values — interpolate
        const prevVal = values[missingIndex - 1];
        const nextVal = values[missingIndex + 1];
        if (prevVal !== null && nextVal !== null) {
          // Use the pattern of first differences
          const expectedDiff = firstDiffs[0]! + sd * missingIndex;
          const missing = prevVal + expectedDiff;
          const filled = [...values];
          filled[missingIndex] = missing;
          steps.push(step('s6', 'work', [
            txOp(
              values.map(v => v === null ? '?' : fmt(v)).join(', '),
              filled.map(v => fmt(v!)).join(', '),
              `expected difference at position ${missingIndex} = ${fmt(expectedDiff)}`,
            ),
          ], 300));
          steps.push(step('s7', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));
          return lesson('missing-number', 'sequences.other', problem.rawInput, steps);
        }
      }
    }
  }

  steps.push(step('s2', 'explain', [writeOp('Could not identify a clear pattern.', 'explain')]));
  return lesson('missing-number', 'sequences.other', problem.rawInput, steps);
}

// ─── Number Analogies ────────────────────────────────────────────

export function solveAnalogy(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { pairs: [number, number][]; query: number };
  const { pairs, query } = inputs;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (pairs.length < 2) return null;

  steps.push(step('s2', 'explain', [writeOp('Find the operation that connects each pair:', 'explain')]));

  // Try different operations
  const ops: { name: string; fn: (x: number) => number; check: (a: number, b: number) => boolean }[] = [
    { name: 'square', fn: x => x * x, check: (a, b) => a * a === b },
    { name: 'cube', fn: x => x * x * x, check: (a, b) => a * a * a === b },
    { name: 'double', fn: x => x * 2, check: (a, b) => a * 2 === b },
    { name: 'triple', fn: x => x * 3, check: (a, b) => a * 3 === b },
    { name: 'add 1 then square', fn: x => (x + 1) * (x + 1), check: (a, b) => (a + 1) * (a + 1) === b },
    { name: 'square + 1', fn: x => x * x + 1, check: (a, b) => a * a + 1 === b },
    { name: 'square - 1', fn: x => x * x - 1, check: (a, b) => a * a - 1 === b },
    { name: 'factorial', fn: x => factorial(x), check: (a, b) => factorial(a) === b },
    { name: 'reverse digits', fn: x => reverseNum(x), check: (a, b) => reverseNum(a) === b },
  ];

  // Also try: add constant, multiply constant
  const addConst = pairs[0]![1] - pairs[0]![0];
  if (pairs.every(([a, b]) => b - a === addConst)) {
    ops.unshift({ name: `add ${fmt(addConst)}`, fn: x => x + addConst, check: (a, b) => a + addConst === b });
  }
  const mulConst = pairs[0]![0] !== 0 ? pairs[0]![1] / pairs[0]![0] : 0;
  if (mulConst !== 0 && pairs.every(([a, b]) => Math.abs(a * mulConst - b) < 1e-9)) {
    ops.unshift({ name: `multiply by ${fmt(mulConst)}`, fn: x => x * mulConst, check: (a, b) => Math.abs(a * mulConst - b) < 1e-9 });
  }

  for (const op of ops) {
    if (pairs.every(([a, b]) => op.check(a, b))) {
      // Found the pattern!
      const pairStrs = pairs.map(([a, b]) => `${fmt(a)} \u2192 ${fmt(b)}`).join(', ');
      steps.push(step('s3', 'work', [writeOp(pairStrs)]));
      steps.push(step('s4', 'explain', [writeOp(`Pattern: ${op.name}`, 'explain')]));

      // Verify with each pair
      for (let i = 0; i < pairs.length; i++) {
        const [a, b] = pairs[i]!;
        steps.push(step(`s5_${i}`, 'work', [
          txOp(`${fmt(a)} \u2192 ${op.name}`, fmt(b), `${fmt(a)} \u2192 ${fmt(b)} \u2713`),
        ], 200));
      }

      const result = op.fn(query);
      steps.push(step('s6', 'work', [
        txOp(`${fmt(query)} \u2192 ${op.name}`, fmt(result), 'apply pattern'),
      ], 300));
      steps.push(step('s7', 'checkpoint', [writeOp(`${fmt(query)} \u2192 ${fmt(result)}`, 'answer')]));

      // Mapping table
      const mapRows = [...pairs.map(([a, b]) => [fmt(a), op.name, fmt(b)]), [fmt(query), op.name, fmt(result)]];
      const hlCells: [number, number][] = [[mapRows.length - 1, 2]]; // highlight answer
      steps.push(step('s_map', 'visual', [{
        op: 'table', data: { headers: ['Input', 'Operation', 'Output'], rows: mapRows, highlightCells: hlCells },
      }]));

      return lesson('analogy', 'sequences.other', problem.rawInput, steps);
    }
  }

  steps.push(step('s3', 'explain', [writeOp('Could not identify a clear pattern.', 'explain')]));
  return lesson('analogy', 'sequences.other', problem.rawInput, steps);
}

function factorial(n: number): number {
  if (n < 0 || n > 12 || !Number.isInteger(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function reverseNum(n: number): number {
  return parseInt(String(Math.abs(n)).split('').reverse().join('')) * Math.sign(n);
}

// ─── Odd One Out ─────────────────────────────────────────────────

export function solveOddOneOut(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { values: number[] };
  const { values } = inputs;
  if (values.length < 4) return null;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  steps.push(step('s2', 'explain', [writeOp('Check properties of each number:', 'explain')]));

  // Check multiple properties
  const properties: { name: string; test: (n: number) => boolean }[] = [
    { name: 'even', test: n => n % 2 === 0 },
    { name: 'odd', test: n => n % 2 !== 0 },
    { name: 'prime', test: isPrime },
    { name: 'divisible by 3', test: n => n % 3 === 0 },
    { name: 'divisible by 5', test: n => n % 5 === 0 },
    { name: 'perfect square', test: n => n > 0 && Math.sqrt(n) === Math.floor(Math.sqrt(n)) },
    { name: 'multiple of 4', test: n => n % 4 === 0 },
    { name: 'multiple of 6', test: n => n % 6 === 0 },
  ];

  for (const prop of properties) {
    const matching = values.filter(v => prop.test(v));
    const notMatching = values.filter(v => !prop.test(v));

    // If exactly one doesn't match, that's the odd one out
    if (notMatching.length === 1) {
      const odd = notMatching[0]!;
      steps.push(step('s3', 'work', [writeOp(`All except ${fmt(odd)} are ${prop.name}:`)]));

      // Show each value's property
      const tableRows = values.map(v => [fmt(v), prop.test(v) ? `\u2713 ${prop.name}` : '\u2717']);
      steps.push(step('s4', 'work', [{
        op: 'table',
        data: {
          headers: ['Number', prop.name + '?'],
          rows: tableRows,
          highlightCells: tableRows.map((r, i) => r[1]!.startsWith('\u2717') ? [i, 1] as [number, number] : null).filter((x): x is [number, number] => x !== null),
        },
      }], 400));

      steps.push(step('s5', 'checkpoint', [writeOp(`${fmt(odd)} is the odd one out \u2014 it is not ${prop.name}`, 'answer')]));
      return lesson('odd-one-out', 'number.types', problem.rawInput, steps);
    }

    // If exactly one matches, that's the odd one out
    if (matching.length === 1) {
      const odd = matching[0]!;
      steps.push(step('s3', 'work', [writeOp(`Only ${fmt(odd)} is ${prop.name}:`)]));

      const tableRows = values.map(v => [fmt(v), prop.test(v) ? `\u2713 ${prop.name}` : '\u2717']);
      steps.push(step('s4', 'work', [{
        op: 'table',
        data: {
          headers: ['Number', prop.name + '?'],
          rows: tableRows,
          highlightCells: tableRows.map((r, i) => r[1]!.startsWith('\u2713') ? [i, 1] as [number, number] : null).filter((x): x is [number, number] => x !== null),
        },
      }], 400));

      steps.push(step('s5', 'checkpoint', [writeOp(`${fmt(odd)} is the odd one out \u2014 only it is ${prop.name}`, 'answer')]));
      return lesson('odd-one-out', 'number.types', problem.rawInput, steps);
    }
  }

  // Check divisibility pattern: all divisible by same number except one
  for (let div = 2; div <= 12; div++) {
    const notDiv = values.filter(v => v % div !== 0);
    if (notDiv.length === 1) {
      steps.push(step('s3', 'work', [writeOp(`All except ${fmt(notDiv[0]!)} are divisible by ${div}`)]));
      steps.push(step('s4', 'checkpoint', [writeOp(`${fmt(notDiv[0]!)} is the odd one out`, 'answer')]));
      return lesson('odd-one-out', 'number.factors', problem.rawInput, steps);
    }
  }

  steps.push(step('s3', 'explain', [writeOp('Could not identify a clear distinguishing property.', 'explain')]));
  return lesson('odd-one-out', 'number.types', problem.rawInput, steps);
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// ─── Number Matrix ───────────────────────────────────────────────

export function solveMatrix(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { grid: (number | null)[][]; missingRow: number; missingCol: number };
  const { grid, missingRow, missingCol } = inputs;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows < 2 || cols < 2) return null;

  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  // Show the grid as a table
  const tableRows = grid.map(row => row.map(v => v === null ? '?' : fmt(v)));
  steps.push(step('s2', 'work', [{
    op: 'table',
    data: {
      rows: tableRows,
      highlightCells: [[missingRow, missingCol]],
    },
  }], 400));

  // Try row sums
  const rowSums = grid.map(row => {
    const known = row.filter((v): v is number => v !== null);
    return known.length === cols ? known.reduce((a, b) => a + b, 0) : null;
  });

  const knownRowSums = rowSums.filter((s): s is number => s !== null);
  if (knownRowSums.length >= 2 && knownRowSums.every(s => s === knownRowSums[0]!)) {
    const targetSum = knownRowSums[0]!;
    const row = grid[missingRow]!;
    const knownInRow = row.filter((v): v is number => v !== null);
    const missing = targetSum - knownInRow.reduce((a, b) => a + b, 0);

    steps.push(step('s3', 'explain', [writeOp(`Each row sums to ${fmt(targetSum)}`, 'explain')]));
    steps.push(step('s4', 'work', [
      txOp(`Row sum = ${fmt(targetSum)}, known = ${knownInRow.map(fmt).join(' + ')} = ${fmt(knownInRow.reduce((a, b) => a + b, 0))}`, `? = ${fmt(missing)}`, `${fmt(targetSum)} - ${fmt(knownInRow.reduce((a, b) => a + b, 0))}`),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));
    return lesson('matrix', 'sequences.other', problem.rawInput, steps);
  }

  // Try column sums
  const colSums: (number | null)[] = [];
  for (let c = 0; c < cols; c++) {
    const col = grid.map(row => row[c]);
    const known = col.filter((v): v is number => v !== null);
    colSums.push(known.length === rows ? known.reduce((a, b) => a + b, 0) : null);
  }

  const knownColSums = colSums.filter((s): s is number => s !== null);
  if (knownColSums.length >= 2 && knownColSums.every(s => s === knownColSums[0]!)) {
    const targetSum = knownColSums[0]!;
    const col = grid.map(row => row[missingCol]);
    const knownInCol = col.filter((v): v is number => v !== null);
    const missing = targetSum - knownInCol.reduce((a, b) => a + b, 0);

    steps.push(step('s3', 'explain', [writeOp(`Each column sums to ${fmt(targetSum)}`, 'explain')]));
    steps.push(step('s4', 'work', [
      txOp(`Col sum = ${fmt(targetSum)}, known = ${knownInCol.map(fmt).join(' + ')}`, `? = ${fmt(missing)}`, 'subtract known from target'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));
    return lesson('matrix', 'sequences.other', problem.rawInput, steps);
  }

  // Try row products
  const rowProducts = grid.map(row => {
    const known = row.filter((v): v is number => v !== null);
    return known.length === cols ? known.reduce((a, b) => a * b, 1) : null;
  });

  const knownRowProducts = rowProducts.filter((s): s is number => s !== null);
  if (knownRowProducts.length >= 2 && knownRowProducts.every(s => s === knownRowProducts[0]!)) {
    const targetProduct = knownRowProducts[0]!;
    const row = grid[missingRow]!;
    const knownInRow = row.filter((v): v is number => v !== null);
    const knownProduct = knownInRow.reduce((a, b) => a * b, 1);
    if (knownProduct !== 0) {
      const missing = targetProduct / knownProduct;
      steps.push(step('s3', 'explain', [writeOp(`Each row product = ${fmt(targetProduct)}`, 'explain')]));
      steps.push(step('s4', 'work', [txOp(`? = ${fmt(targetProduct)} / ${fmt(knownProduct)}`, fmt(missing), 'divide')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));
      return lesson('matrix', 'sequences.other', problem.rawInput, steps);
    }
  }

  // Try multiplication pattern: row[i][j] = row[i][0] * col multiplier
  // Or row[0] * row[1] = row[2] pattern
  if (rows === 3 && cols >= 2) {
    // Check if third row = first row × second row (element-wise)
    let isProduct = true;
    for (let c = 0; c < cols; c++) {
      if (c === missingCol && missingRow === 2) continue;
      const v0 = grid[0]![c], v1 = grid[1]![c], v2 = grid[2]![c];
      if (v0 !== null && v1 !== null && v2 !== null && v0 * v1 !== v2) { isProduct = false; break; }
    }
    if (isProduct) {
      const v0 = grid[0]![missingCol], v1 = grid[1]![missingCol];
      if (v0 !== null && v1 !== null && missingRow === 2) {
        const missing = v0 * v1;
        steps.push(step('s3', 'explain', [writeOp('Pattern: Row 3 = Row 1 \u00D7 Row 2 (element-wise)', 'explain')]));
        steps.push(step('s4', 'work', [txOp(`? = ${fmt(v0)} \u00D7 ${fmt(v1)}`, fmt(missing), 'multiply')]));
        steps.push(step('s5', 'checkpoint', [writeOp(`Missing number = ${fmt(missing)}`, 'answer')]));
        return lesson('matrix', 'sequences.other', problem.rawInput, steps);
      }
    }
  }

  steps.push(step('s3', 'explain', [writeOp('Could not identify a clear pattern in the matrix.', 'explain')]));
  return lesson('matrix', 'sequences.other', problem.rawInput, steps);
}

// ─── Magic Square ────────────────────────────────────────────────

export function solveMagicSquare(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { grid: (number | null)[][]; magicSum?: number };
  const { grid } = inputs;
  const n = grid.length;
  if (n < 3 || n > 5) return null;

  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  // Find magic sum from a complete row/col/diagonal
  let magicSum = inputs.magicSum ?? 0;
  if (!magicSum) {
    for (const row of grid) {
      if (row.every(v => v !== null)) {
        magicSum = (row as number[]).reduce((a, b) => a + b, 0);
        break;
      }
    }
  }
  if (!magicSum && n === 3) {
    // Standard 3×3 magic square with 1-9: sum = 15
    const allKnown = grid.flat().filter((v): v is number => v !== null);
    if (allKnown.every(v => v >= 1 && v <= 9)) magicSum = 15;
  }
  if (!magicSum) {
    steps.push(step('s2', 'explain', [writeOp('Cannot determine the magic sum.', 'explain')]));
    return lesson('magic-square', 'sequences.other', problem.rawInput, steps);
  }

  steps.push(step('s2', 'explain', [writeOp(`Magic sum = ${fmt(magicSum)} (each row, column, and diagonal must sum to this)`, 'explain')]));

  // Solve iteratively: find cells where all but one value is known
  const solved = grid.map(row => [...row]);
  let changed = true;
  let iterations = 0;
  const solveSteps: string[] = [];

  while (changed && iterations < 20) {
    changed = false;
    iterations++;

    // Check rows
    for (let r = 0; r < n; r++) {
      const row = solved[r]!;
      const nullIdx = row.findIndex(v => v === null);
      if (nullIdx >= 0 && row.filter(v => v === null).length === 1) {
        const known = row.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
        solved[r]![nullIdx] = magicSum - known;
        solveSteps.push(`Row ${r + 1}: ? = ${magicSum} - ${known} = ${magicSum - known}`);
        changed = true;
      }
    }

    // Check columns
    for (let c = 0; c < n; c++) {
      const col = solved.map(row => row[c]);
      const nullIdx = col.findIndex(v => v === null);
      if (nullIdx >= 0 && col.filter(v => v === null).length === 1) {
        const known = col.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
        solved[nullIdx]![c] = magicSum - known;
        solveSteps.push(`Col ${c + 1}: ? = ${magicSum} - ${known} = ${magicSum - known}`);
        changed = true;
      }
    }

    // Check diagonals
    const diag1 = solved.map((row, i) => row[i]);
    if (diag1.filter(v => v === null).length === 1) {
      const nullIdx = diag1.findIndex(v => v === null);
      const known = diag1.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
      solved[nullIdx]![nullIdx] = magicSum - known;
      solveSteps.push(`Main diagonal: ? = ${magicSum} - ${known} = ${magicSum - known}`);
      changed = true;
    }

    const diag2 = solved.map((row, i) => row[n - 1 - i]);
    if (diag2.filter(v => v === null).length === 1) {
      const nullIdx = diag2.findIndex(v => v === null);
      const known = diag2.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);
      solved[nullIdx]![n - 1 - nullIdx] = magicSum - known;
      solveSteps.push(`Anti-diagonal: ? = ${magicSum} - ${known} = ${magicSum - known}`);
      changed = true;
    }
  }

  // Show solve steps
  for (let i = 0; i < solveSteps.length; i++) {
    steps.push(step(`s${3 + i}`, 'work', [writeOp(solveSteps[i]!)], 200));
  }

  // Show completed grid
  const tableRows = solved.map(row => row.map(v => v === null ? '?' : fmt(v)));
  steps.push(step('s_result', 'work', [{
    op: 'table',
    data: { rows: tableRows },
  }], 400));

  const remaining = solved.flat().filter(v => v === null).length;
  if (remaining === 0) {
    steps.push(step('s_ans', 'checkpoint', [writeOp('Magic square complete!', 'answer')]));
  } else {
    steps.push(step('s_ans', 'explain', [writeOp(`${remaining} cells could not be determined.`, 'explain')]));
  }

  return lesson('magic-square', 'sequences.other', problem.rawInput, steps);
}
