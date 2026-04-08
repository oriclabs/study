/**
 * AST node types for the math parser.
 * Supports expressions, equations, and symbolic manipulation.
 * No runtime dependencies — safe under extension CSP.
 */

/** Token types produced by the tokenizer. */
export type Token =
  | { kind: 'num'; value: number; pos: number }
  | { kind: 'ident'; value: string; pos: number }
  | { kind: 'op'; value: string; pos: number }
  | { kind: 'lparen'; pos: number }
  | { kind: 'rparen'; pos: number }
  | { kind: 'comma'; pos: number }
  | { kind: 'eq'; pos: number };

/** AST node representing any mathematical expression or equation. */
export type Expr =
  | NumNode
  | VarNode
  | UnaryNode
  | BinaryNode
  | CallNode
  | EquationNode;

export interface NumNode { kind: 'num'; value: number; }
export interface VarNode { kind: 'var'; name: string; }
export interface UnaryNode { kind: 'unary'; op: string; arg: Expr; }
export interface BinaryNode { kind: 'binary'; op: string; left: Expr; right: Expr; }
export interface CallNode { kind: 'call'; name: string; args: Expr[]; }
/** Top-level equation: lhs = rhs. */
export interface EquationNode { kind: 'equation'; left: Expr; right: Expr; }

/** Polynomial coefficients keyed by degree: { 0: constant, 1: linear, 2: quadratic, ... } */
export type PolyCoeffs = Map<number, number>;

/** Result of coefficient extraction for a single variable. */
export interface PolyResult {
  variable: string;
  coeffs: PolyCoeffs;
  /** Highest degree with non-zero coefficient. */
  degree: number;
}

/** Parse error with position info. */
export class ParseError extends Error {
  constructor(message: string, public pos: number) {
    super(message);
    this.name = 'ParseError';
  }
}
