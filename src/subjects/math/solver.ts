import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

/**
 * Lightweight equation solver (quick-solve mode).
 * Uses transformOp for step-by-step visual transformations.
 */

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}

function mOp(expr: string, variant?: 'default' | 'answer' | 'explain'): Op {
  return { op: 'math', data: { expr, variant } };
}

function txOp(from: string, to: string, operation: string, highlights?: { text: string; label?: string }[]): Op {
  return { op: 'transform', data: { from, to, operation, highlights, strikeSource: true } };
}

function graphOp(
  xRange: [number, number], yRange: [number, number],
  plots: { expr: string; color?: string; label?: string }[],
  points?: { x: number; y: number; label?: string }[],
): Op {
  return { op: 'graph', data: { xRange, yRange, plots, points } };
}

function numberlineOp(from: number, to: number, marks: number[], labels?: Record<string, string>): Op {
  return { op: 'numberline', data: { from, to, marks, labels } };
}

function linearExpr(a: number, b: number): string {
  if (b === 0) return `${a}*x`;
  return b > 0 ? `${a}*x+${b}` : `${a}*x${b}`;
}

function quadExpr(a: number, b: number, c: number): string {
  let expr = `${a}*x^2`;
  if (b !== 0) expr += b > 0 ? `+${b}*x` : `${b}*x`;
  if (c !== 0) expr += c > 0 ? `+${c}` : `${c}`;
  return expr;
}

function niceRange(values: number[], padding = 2): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 2;
  return [Math.floor(min - span * 0.3 - padding), Math.ceil(max + span * 0.3 + padding)];
}

function step(id: string, kind: Step['kind'], ops: Op[], narration?: string, waitAfterMs?: number): Step {
  return { id, kind, ops, ...(narration !== undefined ? { narration } : {}), ...(waitAfterMs !== undefined ? { waitAfterMs } : {}) };
}

// ─── Parsing (delegates to shared parser, kept for backward compat) ──

import { parseLinear as sharedParseLinear, parseQuadratic as sharedParseQuadratic, formatNum } from './parser.js';

interface LinearCoeffs { a: number; b: number; }
interface QuadCoeffs { a: number; b: number; c: number; }

function parseLinear(input: string): LinearCoeffs | null { return sharedParseLinear(input); }
function parseQuadratic(input: string): QuadCoeffs | null { return sharedParseQuadratic(input); }

/** Extract the numeric constant (non-x terms) from one side of an equation. */
function extractConstant(side: string): number {
  const termRe = /([+-]?\d*\.?\d*)(x?)/g;
  let c = 0;
  let m: RegExpExecArray | null;
  while ((m = termRe.exec(side)) !== null) {
    const [full, numRaw, xPart] = m;
    if (!full || full === '') { termRe.lastIndex++; continue; }
    if (full === '+' || full === '-') continue;
    if (xPart === 'x') continue;
    const num = parseFloat(numRaw!);
    if (!isNaN(num)) c += num;
  }
  return c;
}

function formatCoeff(a: number): string {
  if (a === 1) return '';
  if (a === -1) return '-';
  return String(a);
}

function formatLinear(a: number, b: number): string {
  const terms: string[] = [];
  if (a !== 0) {
    if (a === 1) terms.push('x');
    else if (a === -1) terms.push('-x');
    else terms.push(`${a}x`);
  }
  if (b !== 0) terms.push(b > 0 ? `+ ${b}` : `- ${-b}`);
  return terms.join(' ').replace(/^\+\s*/, '');
}

// ─── Linear solver ───────────────────────────────────────────────

export function solveLinear(input: string): Lesson | null {
  const coeffs = parseLinear(input);
  if (!coeffs) return null;
  const { a, b } = coeffs;
  const solution = -b / a;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(input)], undefined, 400));

  // Step: remove constant term
  // b is in ax+b=0 form (combined). To describe the action on the ORIGINAL equation,
  // find the constant term on the side that has x, and describe removing it.
  let currentEq = input;
  if (b !== 0) {
    const rhsValue = -b; // ax = rhsValue
    const nextEq = `${formatLinear(a, 0)} = ${formatNum(rhsValue)}`;

    // Parse original equation to find the constant next to x
    const sides = input.replace(/\s+/g, '').split('=');
    const lhsConst = extractConstant(sides[0] ?? '');
    const action = lhsConst > 0
      ? `subtract ${formatNum(lhsConst)} from both sides`
      : lhsConst < 0
        ? `add ${formatNum(-lhsConst)} to both sides`
        : 'rearrange';

    steps.push(step('s2', 'work', [
      txOp(currentEq, nextEq, action),
    ], action, 400));
    currentEq = nextEq;
  }

  // Step: divide by coefficient
  if (a !== 1 && a !== -1) {
    const nextEq = `x = ${formatNum(solution)}`;
    steps.push(step('s3', 'work', [
      txOp(currentEq, nextEq, `divide both sides by ${formatNum(a)}`, [{ text: formatNum(a), label: 'divide' }]),
    ], `Divide both sides by ${a}.`, 400));
  } else if (a === -1) {
    const nextEq = `x = ${formatNum(solution)}`;
    steps.push(step('s3', 'work', [
      txOp(currentEq, nextEq, 'multiply both sides by -1', [{ text: '-', label: 'negate' }]),
    ], 'Multiply both sides by -1.', 400));
  }

  // Answer
  steps.push(step('s4', 'checkpoint', [mOp(`x = ${formatNum(solution)}`, 'answer')], undefined, 500));

  // Verification — substitute back into the ORIGINAL equation, not the normalized form
  const sides = input.replace(/\s+/g, '').split('=');
  const lhsVerify = (sides[0] ?? '').replace(/x/gi, `(${formatNum(solution)})`);
  const rhsVerify = sides[1] ?? '0';
  const verify = `Verify: ${lhsVerify} = ${rhsVerify} \u2713`;
  steps.push(step('s5', 'explain', [writeOp(verify, 'explain')], verify));

  // Graph — always include origin so axes are visible, extend to cover solution
  const expr = linearExpr(a, b);
  const xPad = Math.max(2, Math.ceil(Math.abs(solution) * 0.2));
  const xR: [number, number] = [
    Math.floor(Math.min(0, solution) - xPad),
    Math.ceil(Math.max(0, solution) + xPad),
  ];
  // y-range: include 0 and the y-values at the x bounds
  const yAtLeft = a * xR[0] + b;
  const yAtRight = a * xR[1] + b;
  const yR = niceRange([0, yAtLeft, yAtRight], 1);
  steps.push(step('s_graph', 'explain', [
    writeOp('Graphically:', 'explain'),
    graphOp(xR, yR,
      [{ expr, color: '#2563eb', label: `y = ${formatLinear(a, b)}` }],
      [{ x: solution, y: 0, label: `x = ${formatNum(solution)}` }]),
  ], `The line crosses the x-axis at x = ${formatNum(solution)}.`));

  // Number line
  const nlFrom = Math.floor(solution - 3);
  const nlTo = Math.ceil(solution + 3);
  steps.push(step('s_nl', 'explain', [
    numberlineOp(nlFrom, nlTo, [solution], { [String(solution)]: `x = ${formatNum(solution)}` }),
  ]));

  return {
    schemaVersion: 1,
    id: `math.solve.linear.${Date.now()}`,
    subject: 'math',
    topic: 'algebra.linear-equations',
    title: `Solve: ${input}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['isolate variable'] },
    steps,
  };
}

// ─── Quadratic solver ────────────────────────────────────────────

export function solveQuadratic(input: string): Lesson | null {
  const coeffs = parseQuadratic(input);
  if (!coeffs) return null;
  const { a, b, c } = coeffs;
  const discriminant = b * b - 4 * a * c;
  const steps: Step[] = [];

  const startEq = input;
  steps.push(step('s1', 'work', [mOp(startEq)], undefined, 400));
  steps.push(step('s2', 'explain', [writeOp('Using the quadratic formula:', 'explain')], 'Using the quadratic formula.'));

  // Show formula with proper notation
  steps.push(step('s3', 'work', [mOp('(-b + sqrt(b^2 - 4*a*c)) / (2*a)')], undefined, 400));

  // Identify coefficients
  steps.push(step('s3b', 'explain', [
    writeOp(`Identify: a = ${a},  b = ${b},  c = ${c}`, 'explain'),
  ], undefined, 300));

  // Substitute
  steps.push(step('s4', 'work', [
    txOp(
      'x = (-b \u00B1 \u221A(b\u00B2 - 4ac)) / 2a',
      `x = (${-b} \u00B1 \u221A(${b}\u00B2 - 4\u00B7${a}\u00B7${c})) / ${2 * a}`,
      `substitute a=${a}, b=${b}, c=${c}`,
    ),
  ], undefined, 400));

  // Discriminant
  steps.push(step('s5', 'work', [
    txOp(
      `x = (${-b} \u00B1 \u221A(${b}\u00B2 - 4\u00B7${a}\u00B7${c})) / ${2 * a}`,
      `Discriminant = ${b}\u00B2 - 4(${a})(${c}) = ${discriminant}`,
      'compute discriminant',
    ),
  ], undefined, 400));

  const expr = quadExpr(a, b, c);
  const vertex_x = -b / (2 * a);
  const vertex_y = a * vertex_x * vertex_x + b * vertex_x + c;

  if (discriminant < 0) {
    steps.push(step('s6', 'explain',
      [writeOp('Discriminant < 0 \u2014 no real solutions.', 'explain')], 'No real solutions.'));

    // Show complex/imaginary solutions
    const absDisc = Math.abs(discriminant);
    const sqrtAbsDisc = Math.sqrt(absDisc);
    const realPart = -b / (2 * a);
    const imagPart = sqrtAbsDisc / (2 * a);
    const isPerfect = Math.abs(sqrtAbsDisc - Math.round(sqrtAbsDisc)) < 1e-9;

    steps.push(step('s7', 'explain', [
      writeOp('But we can find complex (imaginary) solutions:', 'explain'),
    ]));

    steps.push(step('s8', 'work', [
      txOp(
        `\u221A(${discriminant})`,
        `\u221A(${absDisc}) \u00D7 i${isPerfect ? ` = ${Math.round(sqrtAbsDisc)}i` : ''}`,
        `\u221A(-1) = i`,
      ),
    ], undefined, 300));

    if (isPerfect) {
      const sqrtInt = Math.round(sqrtAbsDisc);
      steps.push(step('s9', 'work', [
        txOp(
          `x = (${-b} \u00B1 ${sqrtInt}i) / ${2 * a}`,
          `x = ${formatNum(realPart)} \u00B1 ${formatNum(Math.abs(imagPart))}i`,
          'divide by ' + (2 * a),
        ),
      ], undefined, 300));
    } else {
      steps.push(step('s9', 'work', [
        txOp(
          `x = (${-b} \u00B1 \u221A${absDisc} \u00D7 i) / ${2 * a}`,
          `x = ${formatNum(realPart)} \u00B1 ${formatNum(Math.abs(imagPart))}i`,
          'compute',
        ),
      ], undefined, 300));
    }

    // Show both solutions
    const x1 = `${formatNum(realPart)} + ${formatNum(Math.abs(imagPart))}i`;
    const x2 = `${formatNum(realPart)} - ${formatNum(Math.abs(imagPart))}i`;
    steps.push(step('s10', 'checkpoint', [
      mOp(`x = ${x1}  or  x = ${x2}`, 'answer'),
      writeOp('(complex conjugate pair)', 'explain'),
    ]));

    // Show vertex calculation
    steps.push(step('s_vx', 'explain', [
      writeOp('Find the vertex to understand the parabola:', 'explain'),
    ]));
    steps.push(step('s_vx2', 'work', [
      txOp(
        `x = -b / 2a = ${-b} / ${2 * a}`,
        `x = ${formatNum(vertex_x)}`,
        'vertex x-coordinate',
      ),
    ], undefined, 300));
    steps.push(step('s_vy', 'work', [
      txOp(
        `y = ${a}(${formatNum(vertex_x)})\u00B2 + ${b}(${formatNum(vertex_x)}) + ${c}`,
        `y = ${formatNum(a * vertex_x * vertex_x)} + ${formatNum(b * vertex_x)} + ${c} = ${formatNum(vertex_y)}`,
        'substitute x into equation',
      ),
    ], undefined, 300));
    steps.push(step('s_vres', 'explain', [
      writeOp(`Vertex at (${formatNum(vertex_x)}, ${formatNum(vertex_y)}) \u2014 above x-axis, confirming no real roots.`, 'explain'),
    ]));

    // Graph shows parabola not touching x-axis
    const xR = niceRange([vertex_x - 3, vertex_x + 3]);
    const yR = niceRange([0, vertex_y], 1);
    steps.push(step('s_graph', 'visual', [
      graphOp(xR, yR,
        [{ expr, color: '#7c3aed', label: `y = ${input.split('=')[0]!.trim()}` }],
        [{ x: vertex_x, y: vertex_y, label: `vertex (${formatNum(vertex_x)}, ${formatNum(vertex_y)})` }]),
    ]));

  } else if (discriminant === 0) {
    const x = -b / (2 * a);
    steps.push(step('s6', 'work', [
      txOp(`Discriminant = ${discriminant}`, `x = -b/2a = ${formatNum(x)}`, 'single root (discriminant = 0)'),
    ]));
    steps.push(step('s7', 'checkpoint', [mOp(`x = ${formatNum(x)}`, 'answer'), writeOp('(double root)', 'explain')]));

    const xR = niceRange([x - 4, x + 4]);
    const yR = niceRange([vertex_y - 2, vertex_y + Math.abs(vertex_y) + 4]);
    steps.push(step('s_graph', 'explain', [
      writeOp('The parabola touches the x-axis:', 'explain'),
      graphOp(xR, yR,
        [{ expr, color: '#7c3aed', label: `y = ${input.split('=')[0]!.trim()}` }],
        [{ x, y: 0, label: `x = ${formatNum(x)}` }]),
    ]));

    const nlFrom = Math.floor(x - 3);
    const nlTo = Math.ceil(x + 3);
    steps.push(step('s_nl', 'explain', [
      numberlineOp(nlFrom, nlTo, [x], { [String(x)]: `x = ${formatNum(x)}` }),
    ]));

  } else {
    const sq = Math.sqrt(discriminant);
    const x1 = (-b + sq) / (2 * a);
    const x2 = (-b - sq) / (2 * a);
    const isPerfect = Math.abs(sq - Math.round(sq)) < 1e-9;

    steps.push(step('s6', 'work', [
      txOp(
        `Discriminant = ${discriminant}`,
        isPerfect
          ? `x = (${-b} \u00B1 ${Math.round(sq)}) / ${2 * a}`
          : `x = (${-b} \u00B1 \u221A${discriminant}) / ${2 * a}`,
        `\u221A${discriminant}${isPerfect ? ` = ${Math.round(sq)}` : ''}`,
      ),
    ], undefined, 300));

    steps.push(step('s7', 'checkpoint', [
      writeOp(isPerfect
        ? `x = ${formatNum(x1)}  or  x = ${formatNum(x2)}`
        : `x \u2248 ${formatNum(x1)}  or  x \u2248 ${formatNum(x2)}`,
        'answer'),
    ]));

    const xR = niceRange([Math.min(x1, x2), Math.max(x1, x2)]);
    const yR = niceRange([vertex_y, 0, Math.abs(vertex_y) * 0.5]);
    steps.push(step('s_graph', 'explain', [
      writeOp('Graphically:', 'explain'),
      graphOp(xR, yR,
        [{ expr, color: '#7c3aed', label: `y = ${input.split('=')[0]!.trim()}` }],
        [
          { x: x1, y: 0, label: `x = ${formatNum(x1)}` },
          { x: x2, y: 0, label: `x = ${formatNum(x2)}` },
          { x: vertex_x, y: vertex_y, label: 'vertex' },
        ]),
    ]));

    const allRoots = [x1, x2].sort((a, b) => a - b);
    const nlFrom = Math.floor(allRoots[0]! - 3);
    const nlTo = Math.ceil(allRoots[1]! + 3);
    steps.push(step('s_nl', 'explain', [
      numberlineOp(nlFrom, nlTo, allRoots, {
        [String(allRoots[0])]: `x\u2081 = ${formatNum(allRoots[0]!)}`,
        [String(allRoots[1])]: `x\u2082 = ${formatNum(allRoots[1]!)}`,
      }),
    ]));
  }

  return {
    schemaVersion: 1,
    id: `math.solve.quadratic.${Date.now()}`,
    subject: 'math',
    topic: 'algebra.quadratics',
    title: `Solve: ${input}`,
    meta: { difficulty: 3, source: 'generated', objectives: ['quadratic formula'] },
    steps,
  };
}

import { identify } from './classifier.js';
import { solveFraction } from './solvers/fractions.js';
import { solvePercentage } from './solvers/percentage.js';
import { solveInequality } from './solvers/inequality.js';
import { solveSimultaneous } from './solvers/simultaneous.js';
import { solveExpression } from './solvers/expression.js';
import { solveStatistics } from './solvers/statistics.js';
import { solveGeometry } from './solvers/geometry.js';
import { solveRatio, solvePowers } from './solvers/ratio.js';
import { solveFinancial, solveSequence } from './solvers/financial.js';
import { solveSDT, solveHcfLcm, solveAge, solveComparison, solveProportion, solveArithmetic } from './solvers/word-problems.js';
import { solvePythagoras, solveTrig, solveCoordinate, solveBearing, solveSineRule, solveCosineRule } from './solvers/trigonometry.js';
import { solveLogarithm, solveFactorise, solveCubic } from './solvers/advanced-algebra.js';
import { solveTransformation, solveUnitConversion, solveNumberBase, solveProbability, solveSets } from './solvers/misc.js';
import { solveGraphFunction } from './solvers/graph-function.js';
import { solveRearrange } from './solvers/rearrange.js';
import { solveMissingNumber, solveAnalogy, solveOddOneOut, solveMatrix, solveMagicSquare } from './solvers/quantitative.js';

export function solve(input: string): Lesson | null {
  // Strip common prefixes and normalize Unicode
  let trimmed = input.trim();
  trimmed = trimmed
    // Strip instruction prefixes: "Solve:", "Solve by factoring:", "Find the value of:", etc.
    .replace(/^(?:solve|find|calculate|evaluate|simplify|expand|factorise|factorize|sketch|graph|plot|draw|triangle|standard|extension|foundation)\s*(?:by\s+\w+\s*)?[:.]?\s*/i, '')
    .replace(/^(?:the\s+)?(?:value|area|perimeter|volume|angle|length|height|distance|equation)\s+(?:of\s+)?[:.]?\s*/i, '')
    .replace(/^make\s+(\w)\s+the\s+subject\s+(?:of\s+)?/i, 'REARRANGE:$1:')
    .replace(/\u2212/g, '-').replace(/\u00D7/g, '*').replace(/\u00F7/g, '/')
    .replace(/\u00B2/g, '^2').replace(/\u00B3/g, '^3')
    .replace(/\u00B0/g, ' degrees ')  // °
    .replace(/\u02E3/g, '^x') // ˣ
    .replace(/\u03C0/g, 'pi') // π
    .trim();
  if (!trimmed) return null;

  // Handle "Make X the subject" rearrangement
  const rearrangeMatch = trimmed.match(/^REARRANGE:(\w):(.+)/);
  if (rearrangeMatch) {
    return solveRearrange(rearrangeMatch[2]!.trim(), rearrangeMatch[1]!);
  }

  // Use the classifier to identify the problem type
  const problem = identify(trimmed);
  if (problem) {
    switch (problem.type) {
      case 'fraction': return solveFraction(problem);
      case 'percentage-of':
      case 'percentage-find':
      case 'percentage-whole': return solvePercentage(problem);
      case 'inequality': return solveInequality(problem);
      case 'simultaneous': return solveSimultaneous(problem);
      case 'expression': return solveExpression(problem);
      case 'statistics': return solveStatistics(problem);
      case 'geometry': return solveGeometry(problem);
      case 'ratio': return solveRatio(problem);
      case 'powers': return solvePowers(problem);
      case 'financial': return solveFinancial(problem);
      case 'sequence': return solveSequence(problem);
      case 'word-sdt': return solveSDT(problem);
      case 'word-hcf-lcm': return solveHcfLcm(problem);
      case 'word-age': return solveAge(problem);
      case 'word-comparison': return solveComparison(problem);
      case 'word-proportion': return solveProportion(problem);
      case 'word-arithmetic': return solveArithmetic(problem);
      case 'pythagoras': return solvePythagoras(problem);
      case 'trig': return solveTrig(problem);
      case 'coordinate': return solveCoordinate(problem);
      case 'bearing':
      case 'bearing-coords': return solveBearing(problem);
      case 'sine-rule': return solveSineRule(problem);
      case 'cosine-rule': return solveCosineRule(problem);
      case 'logarithm': return solveLogarithm(problem);
      case 'factorise': return solveFactorise(problem);
      case 'cubic': return solveCubic(problem);
      case 'transformation': return solveTransformation(problem);
      case 'unit-conversion': return solveUnitConversion(problem);
      case 'number-base': return solveNumberBase(problem);
      case 'probability': return solveProbability(problem);
      case 'sets': return solveSets(problem);
      case 'missing-number': return solveMissingNumber(problem);
      case 'analogy': return solveAnalogy(problem);
      case 'odd-one-out': return solveOddOneOut(problem);
      case 'matrix': return solveMatrix(problem);
      case 'magic-square': return solveMagicSquare(problem);
      case 'graph-function': return solveGraphFunction(problem);
      case 'quadratic': return solveQuadratic(trimmed);
      case 'linear': return solveLinear(trimmed);
    }
  }

  // Fallback: try direct parsing
  if (/x\s*\^\s*2|x²/.test(trimmed)) return solveQuadratic(trimmed);
  return solveLinear(trimmed);
}
