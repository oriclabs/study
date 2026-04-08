/**
 * AST utilities: pretty-print, evaluate, extract polynomial coefficients.
 */

import type { Expr, PolyResult } from './types.js';

// ─── Pretty-print ────────────────────────────────────────────────

/** Convert AST back to a human-readable math string. */
export function toString(node: Expr): string {
  switch (node.kind) {
    case 'num': return formatNum(node.value);
    case 'var': return node.name;
    case 'unary': {
      const arg = toString(node.arg);
      const wrap = node.arg.kind === 'binary';
      return `${node.op}${wrap ? `(${arg})` : arg}`;
    }
    case 'binary': {
      const l = maybeParen(node.left, node, 'left');
      const r = maybeParen(node.right, node, 'right');
      if (node.op === '^') return `${l}^${r}`;
      if (node.op === '*') {
        // Pretty implicit multiplication: 2*x → 2x, but 2*3 → 2 * 3
        if (isCoeffTimesVar(node)) return `${l}${r}`;
        return `${l} * ${r}`;
      }
      return `${l} ${node.op} ${r}`;
    }
    case 'call': return `${node.name}(${node.args.map(toString).join(', ')})`;
    case 'equation': return `${toString(node.left)} = ${toString(node.right)}`;
  }
}

/** Check if binary * should print as implicit (2x, not 2 * x). */
function isCoeffTimesVar(node: Expr & { kind: 'binary' }): boolean {
  if (node.op !== '*') return false;
  return (node.left.kind === 'num' && (node.right.kind === 'var' || node.right.kind === 'binary' && node.right.op === '^'));
}

function precedence(op: string): number {
  switch (op) {
    case '+': case '-': return 1;
    case '*': case '/': return 2;
    case '^': return 3;
    default: return 0;
  }
}

function maybeParen(child: Expr, parent: Expr & { kind: 'binary' }, side: 'left' | 'right'): string {
  const s = toString(child);
  if (child.kind !== 'binary') return s;
  const cp = precedence(child.op);
  const pp = precedence(parent.op);
  if (cp < pp) return `(${s})`;
  // Right-associative ^ and subtraction/division need parens on right child
  if (cp === pp && side === 'right' && (parent.op === '-' || parent.op === '/' || parent.op === '^')) return `(${s})`;
  return s;
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(6)).toString();
}

// ─── Evaluate ────────────────────────────────────────────────────

const FUNCS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp,
  log: Math.log10, ln: Math.log, floor: Math.floor, ceil: Math.ceil,
  min: Math.min, max: Math.max,
};

/** Numerically evaluate an expression given variable values. Throws on equations. */
export function evaluate(node: Expr, env: Record<string, number> = {}): number {
  switch (node.kind) {
    case 'num': return node.value;
    case 'var': {
      const v = env[node.name];
      if (v === undefined) throw new Error(`Unknown variable: ${node.name}`);
      return v;
    }
    case 'unary': {
      const v = evaluate(node.arg, env);
      return node.op === '-' ? -v : v;
    }
    case 'binary': {
      const l = evaluate(node.left, env);
      const r = evaluate(node.right, env);
      switch (node.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '^': return Math.pow(l, r);
        default: throw new Error(`Unknown operator: ${node.op}`);
      }
    }
    case 'call': {
      const fn = FUNCS[node.name];
      if (!fn) throw new Error(`Unknown function: ${node.name}`);
      return fn(...node.args.map(a => evaluate(a, env)));
    }
    case 'equation':
      throw new Error('Cannot evaluate an equation — use left/right sides separately');
  }
}

// ─── Coefficient extraction ──────────────────────────────────────

/**
 * Extract polynomial coefficients for a variable from an expression.
 * Returns null if the expression is not polynomial in the given variable
 * (e.g., contains sin(x) or x in a denominator).
 *
 * For an equation, moves everything to the left side (lhs - rhs).
 */
export function extractCoeffs(node: Expr, variable = 'x'): PolyResult | null {
  const expr = node.kind === 'equation'
    ? { kind: 'binary' as const, op: '-', left: node.left, right: node.right }
    : node;

  const coeffs = collectPoly(expr, variable);
  if (!coeffs) return null;

  // Find degree
  let degree = 0;
  for (const [deg, val] of coeffs) {
    if (val !== 0 && deg > degree) degree = deg;
  }

  return { variable, coeffs, degree };
}

/**
 * Recursively collect polynomial coefficients.
 * Returns a Map<degree, coefficient> or null if not polynomial.
 */
function collectPoly(node: Expr, v: string): Map<number, number> | null {
  switch (node.kind) {
    case 'num': return new Map([[0, node.value]]);

    case 'var':
      return node.name === v ? new Map([[1, 1]]) : new Map([[0, 0]]);

    case 'unary': {
      if (node.op === '+') return collectPoly(node.arg, v);
      if (node.op === '-') {
        const inner = collectPoly(node.arg, v);
        if (!inner) return null;
        const result = new Map<number, number>();
        for (const [deg, coeff] of inner) result.set(deg, -coeff);
        return result;
      }
      return null;
    }

    case 'binary': {
      switch (node.op) {
        case '+': case '-': {
          const left = collectPoly(node.left, v);
          const right = collectPoly(node.right, v);
          if (!left || !right) return null;
          const result = new Map(left);
          const sign = node.op === '+' ? 1 : -1;
          for (const [deg, coeff] of right) {
            result.set(deg, (result.get(deg) ?? 0) + sign * coeff);
          }
          return result;
        }
        case '*': {
          const left = collectPoly(node.left, v);
          const right = collectPoly(node.right, v);
          if (!left || !right) return null;
          const result = new Map<number, number>();
          for (const [ld, lc] of left) {
            for (const [rd, rc] of right) {
              const deg = ld + rd;
              result.set(deg, (result.get(deg) ?? 0) + lc * rc);
            }
          }
          return result;
        }
        case '/': {
          // Only allow division by constants (no variable in denominator)
          const right = collectPoly(node.right, v);
          if (!right) return null;
          // Check denominator is constant
          for (const [deg, coeff] of right) {
            if (deg !== 0 && coeff !== 0) return null;
          }
          const divisor = right.get(0) ?? 0;
          if (divisor === 0) return null;
          const left = collectPoly(node.left, v);
          if (!left) return null;
          const result = new Map<number, number>();
          for (const [deg, coeff] of left) result.set(deg, coeff / divisor);
          return result;
        }
        case '^': {
          // x^n where n is a non-negative integer constant
          if (node.left.kind === 'var' && node.left.name === v && node.right.kind === 'num') {
            const exp = node.right.value;
            if (Number.isInteger(exp) && exp >= 0) {
              return new Map([[exp, 1]]);
            }
          }
          // constant^constant is fine
          const left = collectPoly(node.left, v);
          const right = collectPoly(node.right, v);
          if (!left || !right) return null;
          // Both must be constant
          const leftConst = isConstantPoly(left);
          const rightConst = isConstantPoly(right);
          if (leftConst && rightConst) {
            const val = Math.pow(left.get(0) ?? 0, right.get(0) ?? 0);
            return new Map([[0, val]]);
          }
          // Polynomial raised to integer constant: (ax+b)^n — expand
          if (rightConst) {
            const n = right.get(0) ?? 0;
            if (Number.isInteger(n) && n >= 0 && n <= 6) {
              return polyPow(left, n);
            }
          }
          return null;
        }
        default: return null;
      }
    }

    case 'call':
      // Functions of constants are fine, functions of variable are not polynomial
      if (!containsVar(node, v)) {
        try {
          const val = evaluate(node);
          return new Map([[0, val]]);
        } catch { return null; }
      }
      return null;

    case 'equation': return null;
  }
}

function isConstantPoly(p: Map<number, number>): boolean {
  for (const [deg, coeff] of p) {
    if (deg !== 0 && coeff !== 0) return false;
  }
  return true;
}

/** Raise polynomial to integer power via repeated multiplication. */
function polyPow(p: Map<number, number>, n: number): Map<number, number> {
  if (n === 0) return new Map([[0, 1]]);
  let result = new Map(p);
  for (let i = 1; i < n; i++) {
    const next = new Map<number, number>();
    for (const [ld, lc] of result) {
      for (const [rd, rc] of p) {
        const deg = ld + rd;
        next.set(deg, (next.get(deg) ?? 0) + lc * rc);
      }
    }
    result = next;
  }
  return result;
}

/** Check if an expression contains a given variable. */
export function containsVar(node: Expr, v: string): boolean {
  switch (node.kind) {
    case 'num': return false;
    case 'var': return node.name === v;
    case 'unary': return containsVar(node.arg, v);
    case 'binary': return containsVar(node.left, v) || containsVar(node.right, v);
    case 'call': return node.args.some(a => containsVar(a, v));
    case 'equation': return containsVar(node.left, v) || containsVar(node.right, v);
  }
}

/** List all unique variable names in an expression. */
export function variables(node: Expr): string[] {
  const vars = new Set<string>();
  function walk(n: Expr): void {
    switch (n.kind) {
      case 'var': vars.add(n.name); break;
      case 'unary': walk(n.arg); break;
      case 'binary': walk(n.left); walk(n.right); break;
      case 'call': n.args.forEach(walk); break;
      case 'equation': walk(n.left); walk(n.right); break;
    }
  }
  walk(node);
  return [...vars].sort();
}
