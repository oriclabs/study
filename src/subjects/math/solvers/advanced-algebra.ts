/**
 * Solvers: logarithms, factorisation, cubic/polynomial equations.
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
  return { schemaVersion: 1, id: `math.solve.${id}.${Date.now()}`, subject: 'math', topic, title, meta: { difficulty: 3, source: 'generated', objectives: [id] }, steps };
}

// ─── Logarithms ──────────────────────────────────────────────────

export function solveLogarithm(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'evaluate') {
    const base = inputs.base as number;
    const value = inputs.value as number;
    if (value <= 0 || base <= 0 || base === 1) return null;
    const result = Math.log(value) / Math.log(base);

    steps.push(step('s2', 'explain', [writeOp(`log\u2080(x) means "what power of base gives x?"`, 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: base = ${fmt(base)}, value = ${fmt(value)}`, 'explain')], 200));

    if (Number.isInteger(result) && Math.abs(result - Math.round(result)) < 1e-9) {
      steps.push(step('s3', 'work', [txOp(`log${base === 10 ? '' : '\u2080'}(${fmt(value)})`, `${fmt(base)}^? = ${fmt(value)}`, 'rewrite as power')]));
      steps.push(step('s4', 'work', [txOp(`${fmt(base)}^${fmt(result)} = ${fmt(value)}`, `answer = ${fmt(result)}`, `${fmt(base)}^${fmt(result)} = ${fmt(value)} \u2713`)]));
    } else {
      steps.push(step('s3', 'work', [txOp(`log(${fmt(value)}) / log(${fmt(base)})`, `${fmt(Math.log(value))} / ${fmt(Math.log(base))}`, 'change of base')]));
      steps.push(step('s4', 'work', [txOp(`${fmt(Math.log(value))} / ${fmt(Math.log(base))}`, fmt(result), 'divide')]));
    }
    steps.push(step('s5', 'checkpoint', [writeOp(`log\u2080(${fmt(value)}) = ${fmt(result)}`.replace('\u2080', base === 10 ? '' : `\u2080`), 'answer')]));

  } else if (type === 'solve-exponential') {
    // Solve b^x = n
    const base = inputs.base as number;
    const value = inputs.value as number;
    if (value <= 0 || base <= 0 || base === 1) return null;
    const x = Math.log(value) / Math.log(base);

    steps.push(step('s2', 'explain', [writeOp('Take logarithm of both sides.', 'explain')]));
    steps.push(step('s3', 'work', [txOp(`${fmt(base)}^x = ${fmt(value)}`, `x \u00D7 log(${fmt(base)}) = log(${fmt(value)})`, 'take log')]));
    steps.push(step('s4', 'work', [txOp(`x = log(${fmt(value)}) / log(${fmt(base)})`, `x = ${fmt(x)}`, 'compute')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`x = ${fmt(x)}`, 'answer')]));

  } else if (type === 'log-law') {
    // Simplify using log laws
    const law = inputs.law as string;
    const a = inputs.a as number;
    const b = inputs.b as number;
    const base = (inputs.base as number) || 10;

    if (law === 'product') {
      steps.push(step('s2', 'explain', [writeOp('Log law: log(a) + log(b) = log(a\u00D7b)', 'explain')]));
      steps.push(step('s3', 'work', [txOp(`log(${fmt(a)}) + log(${fmt(b)})`, `log(${fmt(a * b)})`, 'product rule')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`= log(${fmt(a * b)}) = ${fmt(Math.log10(a * b))}`, 'answer')]));
    } else if (law === 'quotient') {
      steps.push(step('s2', 'explain', [writeOp('Log law: log(a) - log(b) = log(a/b)', 'explain')]));
      steps.push(step('s3', 'work', [txOp(`log(${fmt(a)}) - log(${fmt(b)})`, `log(${fmt(a / b)})`, 'quotient rule')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`= log(${fmt(a / b)}) = ${fmt(Math.log10(a / b))}`, 'answer')]));
    } else if (law === 'power') {
      steps.push(step('s2', 'explain', [writeOp('Log law: log(a^n) = n\u00D7log(a)', 'explain')]));
      steps.push(step('s3', 'work', [txOp(`log(${fmt(a)}^${fmt(b)})`, `${fmt(b)} \u00D7 log(${fmt(a)})`, 'power rule')]));
      steps.push(step('s4', 'work', [txOp(`${fmt(b)} \u00D7 ${fmt(Math.log10(a))}`, fmt(b * Math.log10(a)), 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`= ${fmt(b * Math.log10(a))}`, 'answer')]));
    }
  } else {
    return null;
  }

  return lesson('logarithm', 'powers.logarithms', problem.rawInput, steps);
}

// ─── Factorisation ───────────────────────────────────────────────

export function solveFactorise(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number>;
  const type = (problem.inputs as Record<string, string>).type;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'quadratic') {
    const a = inputs.a, b = inputs.b, c = inputs.c;
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      steps.push(step('s2', 'explain', [writeOp('Cannot factorise over reals (discriminant < 0).', 'explain')]));
      return lesson('factorise', 'algebra.expressions', problem.rawInput, steps);
    }

    const sqrt = Math.sqrt(disc);
    const r1 = (-b + sqrt) / (2 * a);
    const r2 = (-b - sqrt) / (2 * a);

    steps.push(step('s2', 'explain', [writeOp('Find the roots using the quadratic formula, then write factored form.', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: a = ${a}, b = ${b}, c = ${c}`, 'explain')], 200));

    // Find factor pair (AC method)
    const product = a * c;
    const sum = b;
    steps.push(step('s3', 'work', [writeOp(`Find two numbers: multiply to ${product}, add to ${sum}`)]));

    const pair = findFactorPair(product, sum);
    if (pair) {
      steps.push(step('s4', 'work', [txOp(`${pair[0]} \u00D7 ${pair[1]} = ${product}, ${pair[0]} + ${pair[1]} = ${sum}`, `factors: ${pair[0]} and ${pair[1]} \u2713`, 'verify')]));
    }

    // Factored form
    const fmtRoot = (r: number) => r >= 0 ? `- ${fmt(r)}` : `+ ${fmt(-r)}`;
    const factored = a === 1
      ? `(x ${fmtRoot(r1)})(x ${fmtRoot(r2)})`
      : `${a}(x ${fmtRoot(r1)})(x ${fmtRoot(r2)})`;

    steps.push(step('s5', 'work', [txOp(problem.rawInput, factored, 'write in factored form')]));
    steps.push(step('s6', 'checkpoint', [writeOp(factored, 'answer')]));

  } else if (type === 'common-factor') {
    // ax + ay → a(x + y) style
    const terms = (problem.inputs as Record<string, unknown>).terms as string[];
    const gcfVal = inputs.gcf;
    if (!terms || !gcfVal) return null;

    steps.push(step('s2', 'explain', [writeOp('Find the highest common factor (HCF) of all terms.', 'explain')]));
    steps.push(step('s3', 'work', [writeOp(`HCF = ${fmt(gcfVal)}`)]));

    const divided = terms.map(t => `${t}/${fmt(gcfVal)}`).join(', ');
    steps.push(step('s4', 'work', [txOp(problem.rawInput, `${fmt(gcfVal)}(${terms.map(t => t.replace(String(gcfVal), '1')).join(' + ')})`, `factor out ${fmt(gcfVal)}`)]));
    steps.push(step('s5', 'checkpoint', [writeOp(`${fmt(gcfVal)}(...)`, 'answer')]));

  } else {
    return null;
  }

  return lesson('factorise', 'algebra.expressions', problem.rawInput, steps);
}

function findFactorPair(product: number, sum: number): [number, number] | null {
  const limit = Math.max(100, Math.abs(product) + 10);
  for (let i = -limit; i <= limit; i++) {
    if (i === 0) continue;
    if (product % i === 0) {
      const other = product / i;
      if (i + other === sum) return [i, other];
    }
  }
  return null;
}

// ─── Cubic / Polynomial ──────────────────────────────────────────

export function solveCubic(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number>;
  const { a, b, c, d } = inputs; // ax³ + bx² + cx + d = 0
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  steps.push(step('s2', 'explain', [writeOp('Try rational roots: factors of d / factors of a', 'explain')]));
  steps.push(step('s2b', 'explain', [writeOp(`Identify: a = ${a}, b = ${b}, c = ${c}, d = ${d}`, 'explain')], 200));

  // Find rational roots by testing factors of d / factors of a
  const dFactors = getFactors(Math.abs(d || 1));
  const aFactors = getFactors(Math.abs(a));
  const candidates: number[] = [];
  for (const df of dFactors) {
    for (const af of aFactors) {
      candidates.push(df / af, -df / af);
    }
  }

  const roots: number[] = [];
  let remainA = a, remainB = b, remainC = c, remainD = d;

  for (const r of [...new Set(candidates)]) {
    const val = remainA * r * r * r + remainB * r * r + remainC * r + remainD;
    if (Math.abs(val) < 1e-9) {
      roots.push(r);
      steps.push(step(`s_root${roots.length}`, 'work', [
        txOp(`f(${fmt(r)}) = ${fmt(a)}(${fmt(r)})\u00B3 + ${fmt(b)}(${fmt(r)})\u00B2 + ${fmt(c)}(${fmt(r)}) + ${fmt(d)}`, `f(${fmt(r)}) = 0 \u2713`, `x = ${fmt(r)} is a root`),
      ], 300));

      // Synthetic division to reduce degree
      const newA = remainA;
      const newB = remainB + remainA * r;
      const newC = remainC + (remainB + remainA * r) * r;
      remainA = 0; // not used further in simple case
      remainB = newA;
      remainC = newB;
      remainD = newC;

      steps.push(step(`s_div${roots.length}`, 'work', [
        txOp(
          `\u00F7 (x ${r >= 0 ? '-' : '+'} ${fmt(Math.abs(r))})`,
          `${fmt(newA)}x\u00B2 + ${fmt(newB)}x + ${fmt(newC)} = 0`,
          'synthetic division',
        ),
      ], 300));

      // Solve remaining quadratic
      const qDisc = newB * newB - 4 * newA * newC;
      if (qDisc >= 0) {
        const r1 = (-newB + Math.sqrt(qDisc)) / (2 * newA);
        const r2 = (-newB - Math.sqrt(qDisc)) / (2 * newA);
        if (Math.abs(r1 - r2) < 1e-9) {
          roots.push(r1);
          steps.push(step('s_quad', 'work', [txOp(`Discriminant = ${fmt(qDisc)}`, `x = ${fmt(r1)} (double root)`, 'solve quadratic')]));
        } else {
          roots.push(r1, r2);
          steps.push(step('s_quad', 'work', [txOp(`Discriminant = ${fmt(qDisc)}`, `x = ${fmt(r1)} or x = ${fmt(r2)}`, 'solve quadratic')]));
        }
      } else {
        steps.push(step('s_quad', 'explain', [writeOp('Remaining quadratic has no real roots.', 'explain')]));
      }
      break;
    }
  }

  if (roots.length === 0) {
    steps.push(step('s3', 'explain', [writeOp('No rational roots found. Numerical methods needed.', 'explain')]));
    // Use Newton's method for one real root
    let x = -d / c || 1;
    for (let i = 0; i < 50; i++) {
      const fx = a * x * x * x + b * x * x + c * x + d;
      const fpx = 3 * a * x * x + 2 * b * x + c;
      if (Math.abs(fpx) < 1e-12) break;
      x -= fx / fpx;
    }
    roots.push(x);
    steps.push(step('s4', 'work', [txOp(`Newton's method`, `x \u2248 ${fmt(x)}`, 'numerical approximation')]));
  }

  const unique = [...new Set(roots.map(r => parseFloat(fmt(r))))];
  steps.push(step('s_ans', 'checkpoint', [
    writeOp(`Roots: ${unique.map(fmt).join(', ')}`, 'answer'),
  ]));

  // Graph the cubic
  const minR = Math.min(0, ...unique);
  const maxR = Math.max(0, ...unique);
  const pad = Math.max(2, (maxR - minR) * 0.3);
  const xR: [number, number] = [Math.floor(minR - pad), Math.ceil(maxR + pad)];
  // Evaluate y at bounds for range
  const yAtBounds = [a * xR[0]! ** 3 + b * xR[0]! ** 2 + c * xR[0]! + d, a * xR[1]! ** 3 + b * xR[1]! ** 2 + c * xR[1]! + d];
  const yR: [number, number] = [Math.floor(Math.min(0, ...yAtBounds) - 2), Math.ceil(Math.max(0, ...yAtBounds) + 2)];
  const expr = `${a}*x^3+${b}*x^2+${c}*x+${d}`;
  const pts = unique.filter(r => isFinite(r)).map(r => ({ x: r, y: 0, label: `x=${fmt(r)}` }));
  steps.push(step('s_graph', 'visual', [{
    op: 'graph', data: { xRange: xR, yRange: yR, plots: [{ expr, color: '#7c3aed', label: `y = ${a}x\u00B3+...` }], points: pts },
  }]));

  return lesson('cubic', 'algebra.polynomials', problem.rawInput, steps);
}

function getFactors(n: number): number[] {
  if (n === 0) return [0];
  const factors: number[] = [];
  for (let i = 1; i <= Math.abs(n); i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}
