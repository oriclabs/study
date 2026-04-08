/**
 * Tokenizer for math expressions.
 * Handles: numbers, variables, operators, parentheses, =, unicode superscripts,
 * and inserts implicit multiplication tokens where needed.
 *
 * Implicit multiplication is detected between:
 *   num-ident:   2x → 2*x
 *   num-lparen:  2(x+1) → 2*(x+1)
 *   rparen-ident: (x+1)y → (x+1)*y
 *   rparen-lparen: (x+1)(x-2) → (x+1)*(x-2)
 *   rparen-num:  (x+1)2 → (x+1)*2
 *   ident-lparen: x(3) → x*(3)  (only if ident is single char, not a function)
 *   ident-num:   x2 → x*2 (rare but valid)
 */

import { Token, ParseError } from './types.js';

/** Unicode superscript → digit mapping. */
const SUPERSCRIPTS: Record<string, string> = {
  '\u2070': '0', '\u00B9': '1', '\u00B2': '2', '\u00B3': '3',
  '\u2074': '4', '\u2075': '5', '\u2076': '6', '\u2077': '7',
  '\u2078': '8', '\u2079': '9',
};

/** Known multi-char function names — these don't get implicit multiplication before '('. */
const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sqrt', 'abs', 'exp', 'log', 'ln', 'floor', 'ceil',
  'min', 'max', 'gcd', 'lcm',
]);

function isDigit(c: string): boolean { return c >= '0' && c <= '9'; }
function isAlpha(c: string): boolean { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }
function isAlphaNum(c: string): boolean { return isAlpha(c) || isDigit(c); }

export function tokenize(src: string): Token[] {
  const raw: Token[] = [];
  let i = 0;

  while (i < src.length) {
    const c = src[i]!;

    // Whitespace
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }

    // Unicode superscripts → ^N
    if (SUPERSCRIPTS[c] !== undefined) {
      const pos = i;
      let digits = '';
      while (i < src.length && SUPERSCRIPTS[src[i]!] !== undefined) {
        digits += SUPERSCRIPTS[src[i]!];
        i++;
      }
      raw.push({ kind: 'op', value: '^', pos });
      raw.push({ kind: 'num', value: parseInt(digits, 10), pos });
      continue;
    }

    // Numbers (integers and decimals)
    if (isDigit(c) || (c === '.' && i + 1 < src.length && isDigit(src[i + 1]!))) {
      const pos = i;
      let j = i;
      while (j < src.length && isDigit(src[j]!)) j++;
      if (j < src.length && src[j] === '.') {
        j++;
        while (j < src.length && isDigit(src[j]!)) j++;
      }
      raw.push({ kind: 'num', value: parseFloat(src.slice(i, j)), pos });
      i = j;
      continue;
    }

    // Identifiers (variables and function names)
    if (isAlpha(c)) {
      const pos = i;
      let j = i;
      while (j < src.length && isAlphaNum(src[j]!)) j++;
      raw.push({ kind: 'ident', value: src.slice(i, j), pos });
      i = j;
      continue;
    }

    // Operators
    if ('+-*/^'.includes(c)) {
      raw.push({ kind: 'op', value: c, pos: i });
      i++;
      continue;
    }

    // Parentheses
    if (c === '(') { raw.push({ kind: 'lparen', pos: i }); i++; continue; }
    if (c === ')') { raw.push({ kind: 'rparen', pos: i }); i++; continue; }

    // Comma
    if (c === ',') { raw.push({ kind: 'comma', pos: i }); i++; continue; }

    // Equals
    if (c === '=') { raw.push({ kind: 'eq', pos: i }); i++; continue; }

    throw new ParseError(`Unexpected character '${c}'`, i);
  }

  return insertImplicitMul(raw);
}

/**
 * Insert implicit multiplication tokens where juxtaposition implies multiplication.
 */
function insertImplicitMul(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    result.push(t);

    if (i + 1 >= tokens.length) continue;
    const next = tokens[i + 1]!;

    if (needsImplicitMul(t, next)) {
      result.push({ kind: 'op', value: '*', pos: t.pos });
    }
  }

  return result;
}

function needsImplicitMul(left: Token, right: Token): boolean {
  const lk = left.kind;
  const rk = right.kind;

  // After num: 2x, 2(x+1)
  if (lk === 'num' && (rk === 'ident' || rk === 'lparen')) return true;

  // After rparen: (...)x, (...)(...)
  if (lk === 'rparen' && (rk === 'ident' || rk === 'lparen' || rk === 'num')) return true;

  // After single-char ident (variable, not function): x(3), x2
  // But NOT sin(x) — multi-char idents followed by ( are function calls
  if (lk === 'ident') {
    const name = (left as { kind: 'ident'; value: string }).value;
    if (!FUNCTIONS.has(name)) {
      if (rk === 'lparen' || rk === 'num') return true;
      // xy → x*y (two different single-char variables)
      if (rk === 'ident') return true;
    }
  }

  return false;
}
