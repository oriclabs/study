/**
 * Solvers: transformations, unit conversion, number bases, probability, set operations.
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
function lesson(id: string, topic: string, title: string, steps: Step[]): Lesson {
  return { schemaVersion: 1, id: `math.solve.${id}.${Date.now()}`, subject: 'math', topic, title, meta: { difficulty: 2, source: 'generated', objectives: [id] }, steps };
}

// ─── Transformations ─────────────────────────────────────────────

export function solveTransformation(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;
  const x = inputs.x as number, y = inputs.y as number;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  function transformGraph(x1: number, y1: number, x2: number, y2: number): Op {
    const pad = 2;
    const xRange: [number, number] = [Math.floor(Math.min(0, x1, x2) - pad), Math.ceil(Math.max(0, x1, x2) + pad)];
    const yRange: [number, number] = [Math.floor(Math.min(0, y1, y2) - pad), Math.ceil(Math.max(0, y1, y2) + pad)];
    return { op: 'graph', data: { xRange, yRange, plots: [], points: [
      { x: x1, y: y1, label: `A(${fmt(x1)},${fmt(y1)})` },
      { x: x2, y: y2, label: `A'(${fmt(x2)},${fmt(y2)})` },
    ] } };
  }

  if (type === 'reflect-x') {
    steps.push(step('s2', 'explain', [writeOp('Reflect in x-axis: (x, y) \u2192 (x, -y)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(x)}, ${fmt(-y)})`, 'negate y')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(x)}, ${fmt(-y)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, x, -y)]));
  } else if (type === 'reflect-y') {
    steps.push(step('s2', 'explain', [writeOp('Reflect in y-axis: (x, y) \u2192 (-x, y)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(-x)}, ${fmt(y)})`, 'negate x')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(-x)}, ${fmt(y)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, -x, y)]));
  } else if (type === 'reflect-origin') {
    steps.push(step('s2', 'explain', [writeOp('Reflect in origin: (x, y) \u2192 (-x, -y)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(-x)}, ${fmt(-y)})`, 'negate both')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(-x)}, ${fmt(-y)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, -x, -y)]));
  } else if (type === 'reflect-y=x') {
    steps.push(step('s2', 'explain', [writeOp('Reflect in y = x: (x, y) \u2192 (y, x)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(y)}, ${fmt(x)})`, 'swap x and y')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(y)}, ${fmt(x)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, y, x)]));
  } else if (type === 'rotate-90') {
    steps.push(step('s2', 'explain', [writeOp('Rotate 90\u00B0 clockwise: (x, y) \u2192 (y, -x)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(y)}, ${fmt(-x)})`, 'apply rotation')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(y)}, ${fmt(-x)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, y, -x)]));
  } else if (type === 'rotate-180') {
    steps.push(step('s2', 'explain', [writeOp('Rotate 180\u00B0: (x, y) \u2192 (-x, -y)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)}, ${fmt(y)})`, `(${fmt(-x)}, ${fmt(-y)})`, 'negate both')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(-x)}, ${fmt(-y)})`, 'answer')]));
  } else if (type === 'translate') {
    const dx = inputs.dx as number, dy = inputs.dy as number;
    steps.push(step('s2', 'explain', [writeOp(`Translate by (${fmt(dx)}, ${fmt(dy)})`, 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)} + ${fmt(dx)}, ${fmt(y)} + ${fmt(dy)})`, `(${fmt(x + dx)}, ${fmt(y + dy)})`, 'add')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(x + dx)}, ${fmt(y + dy)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, x + dx, y + dy)]));
  } else if (type === 'enlarge') {
    const sf = inputs.scaleFactor as number;
    steps.push(step('s2', 'explain', [writeOp(`Enlarge by scale factor ${fmt(sf)} from origin`, 'explain')]));
    steps.push(step('s3', 'work', [txOp(`(${fmt(x)} \u00D7 ${fmt(sf)}, ${fmt(y)} \u00D7 ${fmt(sf)})`, `(${fmt(x * sf)}, ${fmt(y * sf)})`, 'multiply')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`(${fmt(x * sf)}, ${fmt(y * sf)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [transformGraph(x, y, x * sf, y * sf)]));
  } else return null;

  return lesson('transformation', 'geometry.transformations', problem.rawInput, steps);
}

// ─── Unit Conversion ─────────────────────────────────────────────

const CONVERSIONS: Record<string, Record<string, number>> = {
  // Length
  km: { m: 1000, cm: 100000, mm: 1000000, miles: 0.621371, ft: 3280.84, in: 39370.1 },
  m: { km: 0.001, cm: 100, mm: 1000, ft: 3.28084, in: 39.3701 },
  cm: { m: 0.01, mm: 10, in: 0.393701, ft: 0.0328084 },
  mm: { cm: 0.1, m: 0.001 },
  miles: { km: 1.60934, m: 1609.34, ft: 5280 },
  ft: { m: 0.3048, cm: 30.48, in: 12 },
  in: { cm: 2.54, mm: 25.4, ft: 0.0833333 },
  // Weight
  kg: { g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
  g: { kg: 0.001, mg: 1000, oz: 0.035274 },
  lb: { kg: 0.453592, oz: 16 },
  oz: { g: 28.3495, lb: 0.0625 },
  // Time
  hours: { minutes: 60, seconds: 3600, days: 1/24 },
  minutes: { seconds: 60, hours: 1/60 },
  seconds: { minutes: 1/60, hours: 1/3600 },
  days: { hours: 24, minutes: 1440 },
  weeks: { days: 7, hours: 168 },
  // Volume
  litres: { ml: 1000, gallons: 0.264172 },
  ml: { litres: 0.001 },
  gallons: { litres: 3.78541 },
  // Temperature handled separately
};

export function solveUnitConversion(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const value = inputs.value as number;
  const from = inputs.from as string;
  const to = inputs.to as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  // Temperature special case
  if ((from === 'celsius' || from === 'c') && (to === 'fahrenheit' || to === 'f')) {
    const result = value * 9/5 + 32;
    steps.push(step('s2', 'explain', [writeOp('Formula: \u00B0F = \u00B0C \u00D7 9/5 + 32', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: \u00B0C = ${fmt(value)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`${fmt(value)} \u00D7 9/5 + 32`, `${fmt(value * 9/5)} + 32 = ${fmt(result)}`, 'compute')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`${fmt(value)}\u00B0C = ${fmt(result)}\u00B0F`, 'answer')]));
    return lesson('convert', 'measurement.perimeter', problem.rawInput, steps);
  }
  if ((from === 'fahrenheit' || from === 'f') && (to === 'celsius' || to === 'c')) {
    const result = (value - 32) * 5/9;
    steps.push(step('s2', 'explain', [writeOp('Formula: \u00B0C = (\u00B0F - 32) \u00D7 5/9', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: \u00B0F = ${fmt(value)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`(${fmt(value)} - 32) \u00D7 5/9`, `${fmt(value - 32)} \u00D7 5/9 = ${fmt(result)}`, 'compute')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`${fmt(value)}\u00B0F = ${fmt(result)}\u00B0C`, 'answer')]));
    return lesson('convert', 'measurement.perimeter', problem.rawInput, steps);
  }

  const fromUnit = from.toLowerCase().replace(/s$/, '');
  const toUnit = to.toLowerCase().replace(/s$/, '');
  const factor = CONVERSIONS[fromUnit]?.[toUnit] ?? CONVERSIONS[fromUnit]?.[toUnit + 's'] ?? CONVERSIONS[fromUnit + 's']?.[toUnit];

  if (!factor) {
    // Try reverse
    const reverseFactor = CONVERSIONS[toUnit]?.[fromUnit] ?? CONVERSIONS[toUnit]?.[fromUnit + 's'];
    if (reverseFactor) {
      const result = value / reverseFactor;
      steps.push(step('s2', 'explain', [writeOp(`1 ${to} = ${fmt(reverseFactor)} ${from}`, 'explain')]));
      steps.push(step('s3', 'work', [txOp(`${fmt(value)} \u00F7 ${fmt(reverseFactor)}`, fmt(result), 'divide')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`${fmt(value)} ${from} = ${fmt(result)} ${to}`, 'answer')]));
      return lesson('convert', 'measurement.perimeter', problem.rawInput, steps);
    }
    return null;
  }

  const result = value * factor;
  steps.push(step('s2', 'explain', [writeOp(`1 ${from} = ${fmt(factor)} ${to}`, 'explain')]));
  steps.push(step('s2b', 'explain', [writeOp(`Identify: value = ${fmt(value)} ${from}`, 'explain')], 200));
  steps.push(step('s3', 'work', [txOp(`${fmt(value)} \u00D7 ${fmt(factor)}`, fmt(result), 'multiply')]));
  steps.push(step('s4', 'checkpoint', [writeOp(`${fmt(value)} ${from} = ${fmt(result)} ${to}`, 'answer')]));

  return lesson('convert', 'measurement.perimeter', problem.rawInput, steps);
}

// ─── Number Bases ────────────────────────────────────────────────

export function solveNumberBase(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'to-decimal') {
    const value = String(inputs.value);
    const base = inputs.base as number;
    const digits = value.split('').reverse();
    let decimal = 0;
    const parts: string[] = [];

    for (let i = 0; i < digits.length; i++) {
      const d = parseInt(digits[i]!, base);
      if (isNaN(d)) return null;
      const contribution = d * Math.pow(base, i);
      decimal += contribution;
      parts.push(`${digits[i]} \u00D7 ${base}^${i} = ${contribution}`);
    }

    steps.push(step('s2', 'explain', [writeOp(`Convert from base ${base} to decimal (base 10)`, 'explain')]));
    steps.push(step('s3', 'explain', [writeOp('Multiply each digit by its place value:', 'explain')]));

    for (let i = parts.length - 1; i >= 0; i--) {
      steps.push(step(`s${4 + parts.length - 1 - i}`, 'work', [writeOp(parts[i]!)], 200));
    }

    steps.push(step('s_sum', 'work', [txOp(parts.map(p => p.split('=')[1]!.trim()).join(' + '), String(decimal), 'add all')]));
    steps.push(step('s_ans', 'checkpoint', [writeOp(`${value} (base ${base}) = ${decimal} (base 10)`, 'answer')]));

    // Place value table
    const pvRows = digits.reverse().map((d, i) => [d, `${base}^${i}`, String(Math.pow(base, i)), String(parseInt(d, base) * Math.pow(base, i))]);
    steps.push(step('s_pv', 'visual', [{
      op: 'table', data: { headers: ['Digit', 'Place', 'Value', 'Contribution'], rows: pvRows },
    }]));

  } else if (type === 'from-decimal') {
    let value = inputs.value as number;
    const base = inputs.base as number;
    if (!Number.isInteger(value) || value < 0) return null;

    steps.push(step('s2', 'explain', [writeOp(`Convert ${value} from decimal to base ${base}`, 'explain')]));
    steps.push(step('s3', 'explain', [writeOp('Repeatedly divide by the base and collect remainders:', 'explain')]));

    const remainders: number[] = [];
    let current = value;
    let stepNum = 4;

    while (current > 0) {
      const remainder = current % base;
      const quotient = Math.floor(current / base);
      steps.push(step(`s${stepNum++}`, 'work', [
        txOp(`${current} \u00F7 ${base}`, `${quotient} remainder ${remainder}`, 'divide'),
      ], 200));
      remainders.push(remainder);
      current = quotient;
    }

    const result = remainders.reverse().join('');
    steps.push(step('s_ans', 'checkpoint', [writeOp(`${value} (base 10) = ${result} (base ${base})`, 'answer')]));

  } else {
    return null;
  }

  return lesson('base', 'number.types', problem.rawInput, steps);
}

// ─── Probability ─────────────────────────────────────────────────

export function solveProbability(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'simple') {
    const favourable = inputs.favourable as number;
    const total = inputs.total as number;
    if (total === 0) return null;
    const p = favourable / total;

    steps.push(step('s2', 'explain', [writeOp('P(event) = favourable outcomes / total outcomes', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: favourable = ${favourable}, total = ${total}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`P = ${favourable} / ${total}`, `P = ${fmt(p)}`, 'divide')]));

    // Simplify fraction
    const g = gcd(favourable, total);
    if (g > 1) {
      steps.push(step('s4', 'work', [txOp(`${favourable}/${total}`, `${favourable / g}/${total / g}`, `simplify \u00F7${g}`)]));
    }

    steps.push(step('s5', 'checkpoint', [writeOp(`P = ${favourable / g}/${total / g} = ${fmt(p)} = ${fmt(p * 100)}%`, 'answer')]));

    // Probability bar
    steps.push(step('s_bar', 'visual', [{
      op: 'numberline', data: { from: 0, to: 1, marks: [p], labels: { [String(p)]: `P = ${fmt(p)}` }, intervals: [{ from: 0, to: p, closed: [true, true] as [boolean, boolean] }] },
    }]));

  } else if (type === 'dice') {
    const count = (inputs.count as number) || 1;
    const target = inputs.target as number;

    if (count === 1) {
      steps.push(step('s2', 'explain', [writeOp('Single die: each face has probability 1/6', 'explain')]));
      steps.push(step('s3', 'checkpoint', [writeOp(`P(${target}) = 1/6 \u2248 ${fmt(1/6)}`, 'answer')]));
    } else if (count === 2) {
      // Two dice: count favourable outcomes
      let favourable = 0;
      const outcomes: string[] = [];
      for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
          if (i + j === target) {
            favourable++;
            outcomes.push(`(${i},${j})`);
          }
        }
      }
      steps.push(step('s2', 'explain', [writeOp(`Two dice: ${6 * 6} = 36 total outcomes`, 'explain')]));
      steps.push(step('s3', 'work', [writeOp(`Combinations that sum to ${target}: ${outcomes.join(', ')}`)]));
      steps.push(step('s4', 'work', [txOp(`P = ${favourable}/36`, fmt(favourable / 36), 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`P(sum = ${target}) = ${favourable}/36 \u2248 ${fmt(favourable / 36)}`, 'answer')]));

      // Outcome grid table
      const gridRows: string[][] = [];
      for (let i = 1; i <= 6; i++) {
        const row: string[] = [];
        for (let j = 1; j <= 6; j++) {
          row.push(i + j === target ? `*${i + j}*` : String(i + j));
        }
        gridRows.push(row);
      }
      const highlights: [number, number][] = [];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        if ((i + 1) + (j + 1) === target) highlights.push([i, j]);
      }
      steps.push(step('s_grid', 'visual', [{
        op: 'table', data: { headers: ['', '1', '2', '3', '4', '5', '6'], rows: gridRows.map((r, i) => [String(i + 1), ...r]), highlightCells: highlights.map(([r, c]) => [r, c + 1] as [number, number]) },
      }]));
    }

  } else if (type === 'coins') {
    const flips = inputs.flips as number;
    const heads = inputs.heads as number;

    const total = Math.pow(2, flips);
    const favourable = comb(flips, heads);

    steps.push(step('s2', 'explain', [writeOp(`${flips} coin flips: 2^${flips} = ${total} total outcomes`, 'explain')]));
    steps.push(step('s3', 'work', [txOp(`C(${flips},${heads})`, `${favourable}`, `${flips}! / (${heads}! \u00D7 ${flips - heads}!)`)]));
    steps.push(step('s4', 'work', [txOp(`P = ${favourable}/${total}`, fmt(favourable / total), 'divide')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`P(${heads} heads in ${flips} flips) = ${favourable}/${total} = ${fmt(favourable / total)}`, 'answer')]));

  } else if (type === 'complement') {
    const p = inputs.p as number;
    steps.push(step('s2', 'explain', [writeOp("P(not A) = 1 - P(A)", 'explain')]));
    steps.push(step('s3', 'work', [txOp(`1 - ${fmt(p)}`, fmt(1 - p), 'subtract')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`P(not A) = ${fmt(1 - p)}`, 'answer')]));

  } else if (type === 'independent') {
    const pa = inputs.pa as number, pb = inputs.pb as number;
    steps.push(step('s2', 'explain', [writeOp('Independent events: P(A and B) = P(A) \u00D7 P(B)', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`${fmt(pa)} \u00D7 ${fmt(pb)}`, fmt(pa * pb), 'multiply')]));
    steps.push(step('s4', 'checkpoint', [writeOp(`P(A and B) = ${fmt(pa * pb)}`, 'answer')]));
  } else {
    return null;
  }

  return lesson('probability', 'statistics.probability', problem.rawInput, steps);
}

function comb(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) result = result * (n - i) / (i + 1);
  return Math.round(result);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ─── Set Operations ──────────────────────────────────────────────

export function solveSets(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;
  const setA = inputs.a as number[];
  const setB = inputs.b as number[];
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  const strA = `{${setA.join(', ')}}`;
  const strB = `{${setB.join(', ')}}`;

  steps.push(step('s2', 'work', [
    writeOp(`A = ${strA}`),
    writeOp(`B = ${strB}`),
  ], 300));

  if (type === 'union') {
    const result = [...new Set([...setA, ...setB])].sort((a, b) => a - b);
    steps.push(step('s3', 'explain', [writeOp('A \u222A B = all elements in A or B (or both)', 'explain')]));
    steps.push(step('s4', 'work', [txOp(`A \u222A B`, `{${result.join(', ')}}`, 'combine all elements')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`A \u222A B = {${result.join(', ')}}`, 'answer')]));

    // Venn breakdown table
    const bSet = new Set(setB);
    const onlyA = setA.filter(x => !bSet.has(x)).sort((a, b) => a - b);
    const aSet = new Set(setA);
    const onlyB = setB.filter(x => !aSet.has(x)).sort((a, b) => a - b);
    const both = setA.filter(x => bSet.has(x)).sort((a, b) => a - b);
    steps.push(step('s_venn', 'visual', [{
      op: 'table', data: {
        headers: ['Only A', 'A \u2229 B', 'Only B'],
        rows: [[onlyA.join(', ') || '\u2205', both.join(', ') || '\u2205', onlyB.join(', ') || '\u2205']],
      },
    }]));

  } else if (type === 'intersection') {
    const bSet = new Set(setB);
    const result = setA.filter(x => bSet.has(x)).sort((a, b) => a - b);
    steps.push(step('s3', 'explain', [writeOp('A \u2229 B = elements in both A and B', 'explain')]));
    steps.push(step('s4', 'work', [txOp(`A \u2229 B`, result.length > 0 ? `{${result.join(', ')}}` : '\u2205 (empty set)', 'find common elements')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`A \u2229 B = ${result.length > 0 ? `{${result.join(', ')}}` : '\u2205'}`, 'answer')]));

    const aSet = new Set(setA);
    const onlyA = setA.filter(x => !bSet.has(x)).sort((a, b) => a - b);
    const onlyB = setB.filter(x => !aSet.has(x)).sort((a, b) => a - b);
    steps.push(step('s_venn', 'visual', [{
      op: 'table', data: {
        headers: ['Only A', 'A \u2229 B (common)', 'Only B'],
        rows: [[onlyA.join(', ') || '\u2205', result.join(', ') || '\u2205', onlyB.join(', ') || '\u2205']],
        highlightCells: [[0, 1]],
      },
    }]));

  } else if (type === 'difference') {
    const bSet = new Set(setB);
    const result = setA.filter(x => !bSet.has(x)).sort((a, b) => a - b);
    steps.push(step('s3', 'explain', [writeOp('A \\ B = elements in A but not in B', 'explain')]));
    steps.push(step('s4', 'work', [txOp(`A \\ B`, result.length > 0 ? `{${result.join(', ')}}` : '\u2205', 'remove B elements from A')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`A \\ B = ${result.length > 0 ? `{${result.join(', ')}}` : '\u2205'}`, 'answer')]));

  } else if (type === 'complement') {
    const universal = inputs.universal as number[];
    const aSet = new Set(setA);
    const result = universal.filter(x => !aSet.has(x)).sort((a, b) => a - b);
    steps.push(step('s3', 'explain', [writeOp(`A' = elements in U but not in A (U = {${universal.join(', ')}})`, 'explain')]));
    steps.push(step('s4', 'work', [txOp(`A'`, `{${result.join(', ')}}`, 'remove A from U')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`A' = {${result.join(', ')}}`, 'answer')]));

  } else if (type === 'cardinality') {
    const bSet = new Set(setB);
    const union = [...new Set([...setA, ...setB])];
    const intersection = setA.filter(x => bSet.has(x));
    steps.push(step('s3', 'explain', [writeOp('|A \u222A B| = |A| + |B| - |A \u2229 B|', 'explain')]));
    steps.push(step('s4', 'work', [txOp(`|A \u222A B| = ${setA.length} + ${setB.length} - ${intersection.length}`, `${union.length}`, 'inclusion-exclusion')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`|A| = ${setA.length}, |B| = ${setB.length}, |A \u2229 B| = ${intersection.length}, |A \u222A B| = ${union.length}`, 'answer')]));
  } else {
    return null;
  }

  return lesson('sets', 'statistics.data', problem.rawInput, steps);
}
