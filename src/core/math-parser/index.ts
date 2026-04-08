/**
 * Math parser — AST-based expression and equation parser.
 *
 * Features:
 *   - Implicit multiplication: 2x, 2(x+1), (x+1)(x-2), xy
 *   - Unicode superscripts: x² → x^2, x³ → x^3
 *   - Equations: 2x + 3 = 7
 *   - Functions: sin, cos, sqrt, abs, ...
 *   - Polynomial coefficient extraction
 *   - Algebraic simplification
 *   - Pretty-print back to string
 *
 * Zero dependencies. CSP-safe (no eval/Function). Works in PWA, extension, desktop.
 */

export type { Expr, NumNode, VarNode, UnaryNode, BinaryNode, CallNode, EquationNode, PolyResult, PolyCoeffs } from './types.js';
export { ParseError } from './types.js';
export { tokenize } from './tokenizer.js';
export { parse } from './parser.js';
export { toString, evaluate, extractCoeffs, containsVar, variables } from './utils.js';
export { simplify, exprEqual } from './simplify.js';
