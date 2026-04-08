/**
 * Graph/sketch solver — plots a function and finds key features
 * (intercepts, vertex, asymptotes).
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import type { Problem } from '@core/types/strategy.js';
import { parse, evaluate, extractCoeffs } from '@core/math-parser/index.js';

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant ? { op: 'write', style: { variant }, data: { text } } : { op: 'write', data: { text } };
}
function txOp(from: string, to: string, operation: string): Op {
  return { op: 'transform', data: { from, to, operation, strikeSource: true } };
}
function mOp(expr: string, variant?: 'default' | 'answer' | 'explain'): Op {
  return { op: 'math', data: { expr, variant } };
}
function step(id: string, kind: Step['kind'], ops: Op[], wait?: number): Step {
  return { id, kind, ops, ...(wait ? { waitAfterMs: wait } : {}) };
}
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(3)).toString();
}

export function solveGraphFunction(problem: Problem): Lesson | null {
  const inputs = problem.inputs as { expr: string; original: string; findIntercepts?: boolean };
  const { expr, original, findIntercepts } = inputs;

  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  // Parse the expression
  let ast;
  try {
    ast = parse(expr);
  } catch {
    return null;
  }

  // Show the equation in math notation
  steps.push(step('s2', 'work', [mOp(`y = ${original}`)]));

  // Try to get polynomial coefficients for analysis
  const poly = extractCoeffs(ast, 'x');
  const degree = poly?.degree ?? 0;

  // Find x-intercepts (set y = 0)
  const xIntercepts: number[] = [];
  if (poly && degree <= 3) {
    steps.push(step('s3', 'explain', [writeOp('Find x-intercepts: set y = 0', 'explain')]));

    if (degree === 1) {
      const a = poly.coeffs.get(1) ?? 0;
      const b = poly.coeffs.get(0) ?? 0;
      if (a !== 0) {
        const x = -b / a;
        xIntercepts.push(x);
        steps.push(step('s4', 'work', [txOp(`0 = ${fmt(a)}x + ${fmt(b)}`, `x = ${fmt(x)}`, 'solve')]));
      }
    } else if (degree === 2) {
      const a = poly.coeffs.get(2) ?? 0;
      const b = poly.coeffs.get(1) ?? 0;
      const c = poly.coeffs.get(0) ?? 0;
      const disc = b * b - 4 * a * c;

      steps.push(step('s4', 'work', [
        txOp(`0 = ${fmt(a)}x\u00B2 + ${fmt(b)}x + ${fmt(c)}`, `Discriminant = ${fmt(b)}\u00B2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(disc)}`, 'compute discriminant'),
      ], 300));

      if (disc >= 0) {
        const sq = Math.sqrt(disc);
        const x1 = (-b + sq) / (2 * a);
        const x2 = (-b - sq) / (2 * a);
        xIntercepts.push(x1);
        if (Math.abs(x1 - x2) > 0.001) xIntercepts.push(x2);

        steps.push(step('s5', 'checkpoint', [
          writeOp(`x-intercepts: (${xIntercepts.map(x => fmt(x)).join(', 0) and (')}, 0)`, 'answer'),
        ]));
      } else {
        steps.push(step('s5', 'explain', [writeOp('No real x-intercepts (discriminant < 0)', 'explain')]));
      }

      // Vertex
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      steps.push(step('s_vertex', 'explain', [
        writeOp(`Vertex: x = -b/2a = ${fmt(vx)}`, 'explain'),
        writeOp(`y = ${fmt(vy)}`, 'explain'),
        writeOp(`Vertex at (${fmt(vx)}, ${fmt(vy)})`, 'explain'),
      ]));
    }
  }

  // Find y-intercept (set x = 0)
  try {
    const yIntercept = evaluate(ast, { x: 0 });
    if (isFinite(yIntercept)) {
      steps.push(step('s_yint', 'work', [
        txOp(`y(0) = ${original.replace(/x/g, '(0)')}`, `y-intercept: (0, ${fmt(yIntercept)})`, 'substitute x = 0'),
      ], 300));
    }
  } catch { /* expression may not evaluate at x=0 (e.g. 1/x) */ }

  // Determine graph range
  let xMin = -5, xMax = 5;
  if (xIntercepts.length > 0) {
    const minRoot = Math.min(...xIntercepts);
    const maxRoot = Math.max(...xIntercepts);
    const pad = Math.max(2, (maxRoot - minRoot) * 0.5);
    xMin = Math.floor(Math.min(minRoot - pad, -2));
    xMax = Math.ceil(Math.max(maxRoot + pad, 2));
  }

  // Sample y values for range
  let yMin = -5, yMax = 5;
  try {
    const yVals: number[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = xMin + ((xMax - xMin) * i) / 20;
      const y = evaluate(ast, { x });
      if (isFinite(y) && Math.abs(y) < 100) yVals.push(y);
    }
    if (yVals.length > 0) {
      yMin = Math.floor(Math.min(...yVals) - 2);
      yMax = Math.ceil(Math.max(...yVals) + 2);
    }
  } catch { /* keep defaults */ }

  // Build graph expression for the graph op
  // Need to convert the user expression to evaluatable form
  const graphExpr = expr.replace(/\^/g, '^').replace(/\s/g, '');

  // Plot the graph
  const points: { x: number; y: number; label?: string }[] = [];
  for (const xi of xIntercepts) {
    points.push({ x: xi, y: 0, label: `(${fmt(xi)}, 0)` });
  }
  try {
    const y0 = evaluate(ast, { x: 0 });
    if (isFinite(y0)) points.push({ x: 0, y: y0, label: `(0, ${fmt(y0)})` });
  } catch { /* skip */ }

  // Add vertex for quadratics
  if (poly && degree === 2) {
    const a = poly.coeffs.get(2) ?? 0;
    const b = poly.coeffs.get(1) ?? 0;
    const c = poly.coeffs.get(0) ?? 0;
    const vx = -b / (2 * a);
    const vy = a * vx * vx + b * vx + c;
    points.push({ x: vx, y: vy, label: `vertex (${fmt(vx)}, ${fmt(vy)})` });
  }

  steps.push(step('s_graph', 'visual', [{
    op: 'graph',
    data: {
      xRange: [xMin, xMax] as [number, number],
      yRange: [yMin, yMax] as [number, number],
      plots: [{ expr: graphExpr, color: '#2563eb', label: `y = ${original}` }],
      points,
    },
  }]));

  return {
    schemaVersion: 1,
    id: `math.solve.graph.${Date.now()}`,
    subject: 'math',
    topic: 'algebra.non-linear',
    title: `Graph: y = ${original}`,
    meta: { difficulty: 2, source: 'generated', objectives: ['graphing', 'intercepts'] },
    steps,
  };
}
