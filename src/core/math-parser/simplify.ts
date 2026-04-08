/**
 * Algebraic simplification engine.
 *
 * Applies rules bottom-up until no more changes occur:
 *   - Constant folding: 2 + 3 → 5
 *   - Identity removal: x + 0 → x, x * 1 → x, x * 0 → 0, x ^ 1 → x, x ^ 0 → 1
 *   - Double negation: -(-x) → x
 *   - Subtraction of negative: x - (-y) → x + y
 *   - Flatten nested add/sub and mul/div where safe
 *
 * Does NOT reorder terms or collect like terms across the tree — that's
 * handled by extractCoeffs + rebuild. This keeps each simplify step
 * explainable for the whiteboard.
 */

import type { Expr } from './types.js';
import { evaluate } from './utils.js';

/** Simplify an expression. Returns a structurally simpler (or equal) AST. */
export function simplify(node: Expr): Expr {
  // Iterate until stable
  let current = node;
  for (let i = 0; i < 20; i++) {
    const next = simplifyPass(current);
    if (exprEqual(next, current)) return next;
    current = next;
  }
  return current;
}

function simplifyPass(node: Expr): Expr {
  switch (node.kind) {
    case 'num':
    case 'var':
      return node;

    case 'unary': {
      const arg = simplifyPass(node.arg);
      // Double negation: -(-x) → x
      if (node.op === '-' && arg.kind === 'unary' && arg.op === '-') return arg.arg;
      // -(num) → num
      if (node.op === '-' && arg.kind === 'num') return { kind: 'num', value: -arg.value };
      // +(x) → x
      if (node.op === '+') return arg;
      return { kind: 'unary', op: node.op, arg };
    }

    case 'binary': {
      const left = simplifyPass(node.left);
      const right = simplifyPass(node.right);
      return simplifyBinary(node.op, left, right);
    }

    case 'call': {
      const args = node.args.map(simplifyPass);
      // Constant fold function calls
      if (args.every(a => a.kind === 'num')) {
        try {
          const val = evaluate({ kind: 'call', name: node.name, args } as Expr);
          if (isFinite(val)) return { kind: 'num', value: val };
        } catch { /* not foldable */ }
      }
      return { kind: 'call', name: node.name, args };
    }

    case 'equation': {
      return { kind: 'equation', left: simplifyPass(node.left), right: simplifyPass(node.right) };
    }
  }
}

function simplifyBinary(op: string, left: Expr, right: Expr): Expr {
  const ln = left.kind === 'num' ? left.value : null;
  const rn = right.kind === 'num' ? right.value : null;

  // Constant folding
  if (ln !== null && rn !== null) {
    switch (op) {
      case '+': return { kind: 'num', value: ln + rn };
      case '-': return { kind: 'num', value: ln - rn };
      case '*': return { kind: 'num', value: ln * rn };
      case '/': if (rn !== 0) return { kind: 'num', value: ln / rn }; break;
      case '^': return { kind: 'num', value: Math.pow(ln, rn) };
    }
  }

  switch (op) {
    case '+':
      // x + 0 → x
      if (rn === 0) return left;
      // 0 + x → x
      if (ln === 0) return right;
      // x + (-y) → x - y
      if (right.kind === 'unary' && right.op === '-') {
        return simplifyBinary('-', left, right.arg);
      }
      break;

    case '-':
      // x - 0 → x
      if (rn === 0) return left;
      // 0 - x → -x
      if (ln === 0) return { kind: 'unary', op: '-', arg: right };
      // x - x → 0
      if (exprEqual(left, right)) return { kind: 'num', value: 0 };
      // x - (-y) → x + y
      if (right.kind === 'unary' && right.op === '-') {
        return simplifyBinary('+', left, right.arg);
      }
      break;

    case '*':
      // x * 0 → 0, 0 * x → 0
      if (rn === 0 || ln === 0) return { kind: 'num', value: 0 };
      // x * 1 → x
      if (rn === 1) return left;
      // 1 * x → x
      if (ln === 1) return right;
      // x * (-1) → -x
      if (rn === -1) return { kind: 'unary', op: '-', arg: left };
      // (-1) * x → -x
      if (ln === -1) return { kind: 'unary', op: '-', arg: right };
      break;

    case '/':
      // x / 1 → x
      if (rn === 1) return left;
      // 0 / x → 0 (x ≠ 0)
      if (ln === 0 && rn !== 0) return { kind: 'num', value: 0 };
      // x / x → 1
      if (exprEqual(left, right)) return { kind: 'num', value: 1 };
      break;

    case '^':
      // x ^ 0 → 1
      if (rn === 0) return { kind: 'num', value: 1 };
      // x ^ 1 → x
      if (rn === 1) return left;
      // 0 ^ x → 0 (x > 0)
      if (ln === 0 && rn !== null && rn > 0) return { kind: 'num', value: 0 };
      // 1 ^ x → 1
      if (ln === 1) return { kind: 'num', value: 1 };
      break;
  }

  return { kind: 'binary', op, left, right };
}

/** Structural equality check for AST nodes. */
export function exprEqual(a: Expr, b: Expr): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'num': return a.value === (b as typeof a).value;
    case 'var': return a.name === (b as typeof a).name;
    case 'unary': return a.op === (b as typeof a).op && exprEqual(a.arg, (b as typeof a).arg);
    case 'binary': {
      const bb = b as typeof a;
      return a.op === bb.op && exprEqual(a.left, bb.left) && exprEqual(a.right, bb.right);
    }
    case 'call': {
      const bc = b as typeof a;
      return a.name === bc.name && a.args.length === bc.args.length && a.args.every((arg, i) => exprEqual(arg, bc.args[i]!));
    }
    case 'equation': {
      const be = b as typeof a;
      return exprEqual(a.left, be.left) && exprEqual(a.right, be.right);
    }
  }
}
