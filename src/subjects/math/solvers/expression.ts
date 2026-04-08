/**
 * Expression simplification solver — detailed algebraic steps.
 *
 * Shows:
 *   1. Identify brackets to expand
 *   2. Distribute (multiply each term)
 *   3. Write expanded form
 *   4. Group like terms
 *   5. Combine coefficients
 *   6. Final simplified form
 *
 * Inspired by mathsteps' step-by-step approach but built on our AST.
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import type { Problem } from '@core/types/strategy.js';
import { parse, toString, extractCoeffs, type Expr } from '@core/math-parser/index.js';

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

/** Build a polynomial string from coefficients map. */
function polyToString(coeffs: Map<number, number>, variable = 'x'): string {
  const degrees = [...coeffs.entries()]
    .filter(([, v]) => Math.abs(v) > 1e-12)
    .sort((a, b) => b[0] - a[0]);

  if (degrees.length === 0) return '0';

  const parts: string[] = [];
  for (const [deg, coeff] of degrees) {
    const isFirst = parts.length === 0;
    const absCoeff = Math.abs(coeff);
    const sign = coeff < 0 ? '-' : (isFirst ? '' : '+');

    let term: string;
    if (deg === 0) {
      term = fmt(absCoeff);
    } else if (deg === 1) {
      term = absCoeff === 1 ? variable : `${fmt(absCoeff)}${variable}`;
    } else if (deg === 2) {
      term = absCoeff === 1 ? `${variable}^2` : `${fmt(absCoeff)}${variable}^2`;
    } else {
      term = absCoeff === 1 ? `${variable}^${deg}` : `${fmt(absCoeff)}${variable}^${deg}`;
    }

    if (isFirst) {
      parts.push(coeff < 0 ? `-${term}` : term);
    } else {
      parts.push(`${sign} ${term}`);
    }
  }

  return parts.join(' ');
}

/** Check if node is a multiplication of number × (sum). e.g. 2(x+3) */
function isDistribution(node: Expr): node is Expr & { kind: 'binary'; op: '*' } {
  if (node.kind !== 'binary' || node.op !== '*') return false;
  const hasNumSide = node.left.kind === 'num' || node.right.kind === 'num';
  const hasSumSide = (node.left.kind === 'binary' && (node.left.op === '+' || node.left.op === '-'))
    || (node.right.kind === 'binary' && (node.right.op === '+' || node.right.op === '-'));
  return hasNumSide && hasSumSide;
}

/** Check if node is (expr)(expr) — two brackets multiplied */
function isFOIL(node: Expr): boolean {
  if (node.kind !== 'binary' || node.op !== '*') return false;
  const leftIsBracketed = node.left.kind === 'binary' && (node.left.op === '+' || node.left.op === '-');
  const rightIsBracketed = node.right.kind === 'binary' && (node.right.op === '+' || node.right.op === '-');
  return leftIsBracketed && rightIsBracketed;
}

/** Collect all additive terms from a tree: a + b - c → [a, b, -c] */
function collectTerms(node: Expr): { coeff: number; varPart: string }[] {
  const poly = extractCoeffs(node, 'x');
  if (!poly) return [];
  const terms: { coeff: number; varPart: string }[] = [];
  for (const [deg, coeff] of poly.coeffs) {
    if (Math.abs(coeff) < 1e-12) continue;
    const varPart = deg === 0 ? '' : deg === 1 ? 'x' : `x^${deg}`;
    terms.push({ coeff, varPart });
  }
  return terms.sort((a, b) => {
    const degA = a.varPart === '' ? 0 : a.varPart === 'x' ? 1 : parseInt(a.varPart.slice(2));
    const degB = b.varPart === '' ? 0 : b.varPart === 'x' ? 1 : parseInt(b.varPart.slice(2));
    return degB - degA;
  });
}

/** Find distribution nodes in the AST */
function findDistributions(node: Expr): Expr[] {
  const found: Expr[] = [];
  function walk(n: Expr) {
    if (isDistribution(n) || isFOIL(n)) found.push(n);
    if (n.kind === 'binary') { walk(n.left); walk(n.right); }
    if (n.kind === 'unary') walk(n.arg);
    if (n.kind === 'call') n.args.forEach(walk);
  }
  walk(node);
  return found;
}

export function solveExpression(problem: Problem): Lesson | null {
  const input = problem.rawInput;

  try {
    const ast = parse(input);
    const steps: Step[] = [];
    let stepNum = 1;

    // Step 1: Show the expression
    steps.push(step(`s${stepNum++}`, 'work', [mOp(input)], 400));

    // Detect what operations are needed
    const distributions = findDistributions(ast);
    const hasBrackets = distributions.length > 0;
    const astStr = toString(ast);

    if (hasBrackets) {
      // Step 2: Explain the approach
      steps.push(step(`s${stepNum++}`, 'explain', [
        writeOp(isFOIL(distributions[0]!) ? 'Expand using FOIL (First, Outer, Inner, Last):' : 'Expand by distributing:', 'explain'),
      ], 300));

      // Step 3: Show distribution for each bracket
      for (const dist of distributions) {
        const distStr = toString(dist);

        if (isDistribution(dist) && dist.kind === 'binary') {
          // a(b + c) → a×b + a×c
          const numNode = dist.left.kind === 'num' ? dist.left : dist.right;
          const sumNode = dist.left.kind === 'num' ? dist.right : dist.left;
          const a = numNode.kind === 'num' ? numNode.value : 1;

          if (sumNode.kind === 'binary' && (sumNode.op === '+' || sumNode.op === '-')) {
            const leftTerm = toString(sumNode.left);
            const rightTerm = toString(sumNode.right);
            const op = sumNode.op;

            // Show: a × leftTerm + a × rightTerm
            const expanded = `${fmt(a)} \u00D7 ${leftTerm} ${op} ${fmt(a)} \u00D7 ${rightTerm}`;
            steps.push(step(`s${stepNum++}`, 'work', [
              txOp(distStr, expanded, `distribute ${fmt(a)}`),
            ], 300));

            // Compute each multiplication
            const leftPoly = extractCoeffs(sumNode.left, 'x');
            const rightPoly = extractCoeffs(sumNode.right, 'x');

            if (leftPoly && rightPoly) {
              const leftResult: string[] = [];
              for (const [deg, coeff] of leftPoly.coeffs) {
                if (Math.abs(coeff) < 1e-12) continue;
                const newCoeff = a * coeff;
                const varP = deg === 0 ? '' : deg === 1 ? 'x' : `x^${deg}`;
                leftResult.push(`${fmt(newCoeff)}${varP}`);
              }
              const rightResult: string[] = [];
              for (const [deg, coeff] of rightPoly.coeffs) {
                if (Math.abs(coeff) < 1e-12) continue;
                const newCoeff = a * coeff;
                const varP = deg === 0 ? '' : deg === 1 ? 'x' : `x^${deg}`;
                rightResult.push(`${fmt(newCoeff)}${varP}`);
              }
              const computed = `${leftResult.join(' + ')} ${op} ${rightResult.join(' + ')}`;
              steps.push(step(`s${stepNum++}`, 'work', [
                txOp(expanded, computed, 'multiply'),
              ], 300));
            }
          }
        } else if (isFOIL(dist) && dist.kind === 'binary') {
          // (a + b)(c + d) → ac + ad + bc + bd
          const left = dist.left;
          const right = dist.right;
          if (left.kind === 'binary' && right.kind === 'binary') {
            const a = toString(left.left), b = toString(left.right);
            const c = toString(right.left), d = toString(right.right);
            const lOp = left.op, rOp = right.op;

            steps.push(step(`s${stepNum++}`, 'explain', [
              writeOp(`First: ${a} \u00D7 ${c}`, 'explain'),
              writeOp(`Outer: ${a} \u00D7 ${d}`, 'explain'),
              writeOp(`Inner: ${b} \u00D7 ${c}`, 'explain'),
              writeOp(`Last: ${b} \u00D7 ${d}`, 'explain'),
            ], 300));

            // Show FOIL expansion
            const foilStr = `${a}\u00D7${c} ${rOp} ${a}\u00D7${d} ${lOp} ${b}\u00D7${c} ${lOp === rOp ? lOp : '+'} ${b}\u00D7${d}`;
            steps.push(step(`s${stepNum++}`, 'work', [
              txOp(distStr, foilStr, 'FOIL'),
            ], 300));
          }
        }
      }
    } else {
      steps.push(step(`s${stepNum++}`, 'explain', [
        writeOp('Collect like terms:', 'explain'),
      ], 300));
    }

    // Extract final polynomial
    const poly = extractCoeffs(ast, 'x');
    if (!poly) {
      // Can't extract polynomial — just show simplified
      const simplified = toString(parse(input));
      steps.push(step(`s${stepNum++}`, 'checkpoint', [mOp(simplified, 'answer')]));
      return {
        schemaVersion: 1,
        id: `math.solve.expression.${Date.now()}`,
        subject: 'math', topic: 'algebra.expressions',
        title: `Simplify: ${input}`,
        meta: { difficulty: 2, source: 'generated', objectives: ['simplification'] },
        steps,
      };
    }

    const finalStr = polyToString(poly.coeffs);

    // Step: Group like terms (show which terms combine)
    const terms = collectTerms(ast);
    const grouped: Record<string, number[]> = {};
    for (const t of terms) {
      const key = t.varPart || 'const';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t.coeff);
    }

    // Show grouping if there are like terms to combine
    const hasLikeTerms = Object.values(grouped).some(coeffs => coeffs.length > 1);
    if (hasLikeTerms) {
      const groupParts: string[] = [];
      for (const [varPart, coeffs] of Object.entries(grouped)) {
        if (coeffs.length > 1) {
          const sum = coeffs.reduce((a, b) => a + b, 0);
          const coeffStr = coeffs.map(c => fmt(c)).join(' + ');
          const label = varPart === 'const' ? '' : varPart;
          groupParts.push(`(${coeffStr})${label} = ${fmt(sum)}${label}`);
        }
      }

      if (groupParts.length > 0) {
        steps.push(step(`s${stepNum++}`, 'explain', [
          writeOp('Group like terms:', 'explain'),
        ]));
        for (const gp of groupParts) {
          steps.push(step(`s${stepNum++}`, 'work', [writeOp(gp)], 200));
        }
      }
    }

    // Final answer
    steps.push(step(`s${stepNum++}`, 'work', [
      txOp(astStr !== input.trim() ? astStr : input, finalStr, 'simplified'),
    ], 300));

    steps.push(step(`s${stepNum++}`, 'checkpoint', [mOp(finalStr, 'answer')]));

    return {
      schemaVersion: 1,
      id: `math.solve.expression.${Date.now()}`,
      subject: 'math',
      topic: 'algebra.expressions',
      title: `Simplify: ${input}`,
      meta: { difficulty: 2, source: 'generated', objectives: ['simplification', 'distribution', 'like terms'] },
      steps,
    };
  } catch {
    return null;
  }
}
