/**
 * Minimal expression evaluator for plotting and answer checking.
 * Supports: +, -, *, /, ^, parentheses, unary minus, variables (x),
 * and functions: sin, cos, tan, sqrt, abs, exp, log, ln.
 * Used by renderer's graph op and by the math subject's answer checker.
 * No eval/Function — safe under extension CSP.
 */

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'ident'; value: string }
  | { kind: 'op'; value: string }
  | { kind: 'lparen' } | { kind: 'rparen' } | { kind: 'comma' };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === ' ' || c === '\t') { i++; continue; }
    if (c >= '0' && c <= '9' || c === '.') {
      let j = i;
      while (j < src.length && (src[j]! >= '0' && src[j]! <= '9' || src[j]! === '.')) j++;
      tokens.push({ kind: 'num', value: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j]!)) j++;
      tokens.push({ kind: 'ident', value: src.slice(i, j) });
      i = j; continue;
    }
    if ('+-*/^'.includes(c)) { tokens.push({ kind: 'op', value: c }); i++; continue; }
    if (c === '(') { tokens.push({ kind: 'lparen' }); i++; continue; }
    if (c === ')') { tokens.push({ kind: 'rparen' }); i++; continue; }
    if (c === ',') { tokens.push({ kind: 'comma' }); i++; continue; }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  return tokens;
}

type AST =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'unary'; op: string; arg: AST }
  | { kind: 'binary'; op: string; left: AST; right: AST }
  | { kind: 'call'; name: string; args: AST[] };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): AST {
    const ast = this.expr();
    if (this.pos < this.tokens.length) throw new Error('Unexpected trailing tokens');
    return ast;
  }

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private eat(): Token { return this.tokens[this.pos++]!; }

  private expr(): AST { return this.addsub(); }

  private addsub(): AST {
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

  private muldiv(): AST {
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

  private unary(): AST {
    const t = this.peek();
    if (t && t.kind === 'op' && (t.value === '+' || t.value === '-')) {
      this.eat();
      return { kind: 'unary', op: t.value, arg: this.unary() };
    }
    return this.pow();
  }

  private pow(): AST {
    const left = this.atom();
    const t = this.peek();
    if (t && t.kind === 'op' && t.value === '^') {
      this.eat();
      return { kind: 'binary', op: '^', left, right: this.unary() };
    }
    return left;
  }

  private atom(): AST {
    const t = this.eat();
    if (t.kind === 'num') return { kind: 'num', value: t.value };
    if (t.kind === 'lparen') {
      const e = this.expr();
      const close = this.eat();
      if (close.kind !== 'rparen') throw new Error('Expected )');
      return e;
    }
    if (t.kind === 'ident') {
      const next = this.peek();
      if (next && next.kind === 'lparen') {
        this.eat();
        const args: AST[] = [];
        if (this.peek()?.kind !== 'rparen') {
          args.push(this.expr());
          while (this.peek()?.kind === 'comma') { this.eat(); args.push(this.expr()); }
        }
        const close = this.eat();
        if (close.kind !== 'rparen') throw new Error('Expected )');
        return { kind: 'call', name: t.value, args };
      }
      return { kind: 'var', name: t.value };
    }
    throw new Error(`Unexpected token: ${JSON.stringify(t)}`);
  }
}

export function parseExpression(src: string): AST {
  return new Parser(tokenize(src)).parse();
}

const FUNCS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp,
  log: Math.log10, ln: Math.log, floor: Math.floor, ceil: Math.ceil,
};

export function evalAST(ast: AST, env: Record<string, number>): number {
  switch (ast.kind) {
    case 'num': return ast.value;
    case 'var': {
      const v = env[ast.name];
      if (v === undefined) throw new Error(`Unknown variable: ${ast.name}`);
      return v;
    }
    case 'unary': {
      const v = evalAST(ast.arg, env);
      return ast.op === '-' ? -v : v;
    }
    case 'binary': {
      const l = evalAST(ast.left, env);
      const r = evalAST(ast.right, env);
      switch (ast.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '^': return Math.pow(l, r);
        default: throw new Error(`Unknown operator: ${ast.op}`);
      }
    }
    case 'call': {
      const fn = FUNCS[ast.name];
      if (!fn) throw new Error(`Unknown function: ${ast.name}`);
      return fn(...ast.args.map(a => evalAST(a, env)));
    }
  }
}

export function evalExpression(src: string, env: Record<string, number>): number {
  return evalAST(parseExpression(src), env);
}
