/**
 * Shared input parsing for math problems.
 * Used by both the classic solver and the strategy-aware pipeline.
 *
 * Now delegates to the AST-based math-parser for robust parsing,
 * then extracts polynomial coefficients from the AST.
 */

import { parse, extractCoeffs, ParseError } from '@core/math-parser/index.js';

export interface LinearCoeffs { a: number; b: number; }     // ax + b = 0
export interface QuadCoeffs { a: number; b: number; c: number; }  // ax² + bx + c = 0

export function parseLinear(input: string): LinearCoeffs | null {
  try {
    const ast = parse(input);
    const poly = extractCoeffs(ast, 'x');
    if (!poly || poly.degree !== 1) return null;
    const a = poly.coeffs.get(1) ?? 0;
    const b = poly.coeffs.get(0) ?? 0;
    if (a === 0) return null;
    return { a, b };
  } catch (e) {
    if (e instanceof ParseError) return null;
    throw e;
  }
}

export function parseQuadratic(input: string): QuadCoeffs | null {
  try {
    const ast = parse(input);
    const poly = extractCoeffs(ast, 'x');
    if (!poly || poly.degree !== 2) return null;
    const a = poly.coeffs.get(2) ?? 0;
    const b = poly.coeffs.get(1) ?? 0;
    const c = poly.coeffs.get(0) ?? 0;
    if (a === 0) return null;
    return { a, b, c };
  } catch (e) {
    if (e instanceof ParseError) return null;
    throw e;
  }
}

/**
 * Parse any polynomial equation up to degree 6.
 * Returns coefficients map and degree, or null if not polynomial.
 */
export function parsePolynomial(input: string, variable = 'x') {
  try {
    const ast = parse(input);
    return extractCoeffs(ast, variable);
  } catch (e) {
    if (e instanceof ParseError) return null;
    throw e;
  }
}

export function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(3)).toString();
}
