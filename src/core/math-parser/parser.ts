/**
 * Recursive descent parser for math expressions and equations.
 *
 * Precedence (lowest → highest):
 *   equation  =
 *   addsub    + -
 *   muldiv    * /
 *   power     ^  (right-associative)
 *   unary     + -
 *   atom      num | var | (expr) | func(args)
 *
 * Implicit multiplication is handled in the tokenizer (inserted as '*'),
 * so the parser sees it as normal multiplication.
 */

import { tokenize } from './tokenizer.js';
import type { Token, Expr } from './types.js';
import { ParseError } from './types.js';

class ExprParser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): Expr {
    if (this.tokens.length === 0) throw new ParseError('Empty expression', 0);
    const ast = this.equation();
    if (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos]!;
      throw new ParseError(`Unexpected token after expression`, t.pos);
    }
    return ast;
  }

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private eat(): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new ParseError('Unexpected end of expression', this.tokens.length > 0 ? this.tokens[this.tokens.length - 1]!.pos + 1 : 0);
    this.pos++;
    return t;
  }

  /** equation → expr ('=' expr)? */
  private equation(): Expr {
    const left = this.addsub();
    const t = this.peek();
    if (t && t.kind === 'eq') {
      this.eat();
      const right = this.addsub();
      // Only one '=' allowed
      if (this.peek()?.kind === 'eq') {
        throw new ParseError('Multiple = signs not supported', this.peek()!.pos);
      }
      return { kind: 'equation', left, right };
    }
    return left;
  }

  /** addsub → muldiv (('+' | '-') muldiv)* */
  private addsub(): Expr {
    let left = this.muldiv();
    while (true) {
      const t = this.peek();
      if (t && t.kind === 'op' && (t.value === '+' || t.value === '-')) {
        this.eat();
        left = { kind: 'binary', op: t.value, left, right: this.muldiv() };
      } else break;
    }
    return left;
  }

  /** muldiv → unary (('*' | '/') unary)* */
  private muldiv(): Expr {
    let left = this.unary();
    while (true) {
      const t = this.peek();
      if (t && t.kind === 'op' && (t.value === '*' || t.value === '/')) {
        this.eat();
        left = { kind: 'binary', op: t.value, left, right: this.unary() };
      } else break;
    }
    return left;
  }

  /** unary → ('+' | '-') unary | power */
  private unary(): Expr {
    const t = this.peek();
    if (t && t.kind === 'op' && (t.value === '+' || t.value === '-')) {
      this.eat();
      return { kind: 'unary', op: t.value, arg: this.unary() };
    }
    return this.power();
  }

  /** power → atom ('^' unary)?  — right-associative */
  private power(): Expr {
    const left = this.atom();
    const t = this.peek();
    if (t && t.kind === 'op' && t.value === '^') {
      this.eat();
      return { kind: 'binary', op: '^', left, right: this.unary() };
    }
    return left;
  }

  /** atom → NUM | IDENT | IDENT '(' args ')' | '(' expr ')' */
  private atom(): Expr {
    const t = this.eat();

    if (t.kind === 'num') return { kind: 'num', value: t.value };

    if (t.kind === 'lparen') {
      const e = this.addsub();
      const close = this.eat();
      if (close.kind !== 'rparen') throw new ParseError('Expected )', close.pos);
      return e;
    }

    if (t.kind === 'ident') {
      const next = this.peek();
      if (next && next.kind === 'lparen') {
        // Function call
        this.eat(); // consume '('
        const args: Expr[] = [];
        if (this.peek()?.kind !== 'rparen') {
          args.push(this.addsub());
          while (this.peek()?.kind === 'comma') {
            this.eat();
            args.push(this.addsub());
          }
        }
        const close = this.eat();
        if (close.kind !== 'rparen') throw new ParseError('Expected )', close.pos);
        return { kind: 'call', name: t.value, args };
      }
      return { kind: 'var', name: t.value };
    }

    throw new ParseError(`Unexpected token: ${t.kind}`, t.pos);
  }
}

/** Parse a math expression or equation string into an AST. */
export function parse(src: string): Expr {
  return new ExprParser(tokenize(src)).parse();
}
