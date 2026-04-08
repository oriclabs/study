/**
 * Math notation renderer — proper typeset math on canvas.
 *
 * Takes a math expression string, parses it to AST, lays out with
 * proper notation (fractions, superscripts, roots, etc.), then draws
 * animated on the canvas.
 *
 * Layout is done in two passes:
 *   1. Measure pass: compute bounding boxes for each node
 *   2. Draw pass: render with animation
 */

import type { MathOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';
import { parse, type Expr } from '@core/math-parser/index.js';

/** A positioned drawing command. */
interface LayoutBox {
  kind: 'text' | 'line' | 'radical' | 'paren';
  x: number;
  y: number;
  w: number;
  h: number;
  // For text
  text?: string;
  fontSize?: number;
  // For line (fraction bar)
  x2?: number;
  // For radical
  innerW?: number;
  innerH?: number;
  // For paren
  parenHeight?: number;
  open?: boolean;
}

/** Greek letter map. */
const GREEK: Record<string, string> = {
  alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4',
  epsilon: '\u03B5', zeta: '\u03B6', eta: '\u03B7', theta: '\u03B8',
  iota: '\u03B9', kappa: '\u03BA', lambda: '\u03BB', mu: '\u03BC',
  nu: '\u03BD', xi: '\u03BE', pi: '\u03C0', rho: '\u03C1',
  sigma: '\u03C3', tau: '\u03C4', phi: '\u03C6', chi: '\u03C7',
  psi: '\u03C8', omega: '\u03C9', Pi: '\u03A0', Sigma: '\u03A3',
  Omega: '\u03A9', infinity: '\u221E',
};

/** Layout result: boxes + total dimensions. */
interface LayoutResult {
  boxes: LayoutBox[];
  width: number;
  height: number;
  baseline: number; // y of the main baseline from top
}

/**
 * Lay out a math AST node into positioned boxes.
 * Coordinates are relative (0,0 = top-left of this node's bounding box).
 */
function layout(node: Expr, fontSize: number, ctx: CanvasRenderingContext2D): LayoutResult {
  ctx.font = `${fontSize}px "Caveat", "Comic Sans MS", cursive`;

  switch (node.kind) {
    case 'num': {
      const text = formatNum(node.value);
      const m = ctx.measureText(text);
      const h = fontSize * 1.2;
      return { boxes: [{ kind: 'text', x: 0, y: h * 0.8, w: m.width, h, text, fontSize }], width: m.width, height: h, baseline: h * 0.8 };
    }

    case 'var': {
      const text = GREEK[node.name] ?? node.name;
      ctx.font = `italic ${fontSize}px "Caveat", "Comic Sans MS", cursive`;
      const m = ctx.measureText(text);
      const h = fontSize * 1.2;
      return { boxes: [{ kind: 'text', x: 0, y: h * 0.8, w: m.width, h, text, fontSize }], width: m.width, height: h, baseline: h * 0.8 };
    }

    case 'unary': {
      if (node.op === '-') {
        const inner = layout(node.arg, fontSize, ctx);
        const minusW = ctx.measureText('\u2212').width;
        const boxes = [
          { kind: 'text' as const, x: 0, y: inner.baseline, w: minusW, h: inner.height, text: '\u2212', fontSize },
          ...inner.boxes.map(b => ({ ...b, x: b.x + minusW + 2 })),
        ];
        return { boxes, width: minusW + 2 + inner.width, height: inner.height, baseline: inner.baseline };
      }
      return layout(node.arg, fontSize, ctx);
    }

    case 'binary': {
      if (node.op === '/') {
        // Fraction layout: numerator over denominator with line
        const numLayout = layout(node.left, fontSize * 0.85, ctx);
        const denLayout = layout(node.right, fontSize * 0.85, ctx);
        const maxW = Math.max(numLayout.width, denLayout.width);
        const pad = 6;
        const totalW = maxW + pad * 2;
        const lineY = numLayout.height + 3;
        const totalH = numLayout.height + 6 + denLayout.height;
        const baseline = lineY;

        const boxes: LayoutBox[] = [];
        // Numerator centered
        const numOffX = (totalW - numLayout.width) / 2;
        boxes.push(...numLayout.boxes.map(b => ({ ...b, x: b.x + numOffX, y: b.y })));
        // Fraction bar
        boxes.push({ kind: 'line', x: 0, y: lineY, w: totalW, h: 1, x2: totalW });
        // Denominator centered
        const denOffX = (totalW - denLayout.width) / 2;
        boxes.push(...denLayout.boxes.map(b => ({ ...b, x: b.x + denOffX, y: b.y + lineY + 6 })));

        return { boxes, width: totalW, height: totalH, baseline };
      }

      if (node.op === '^') {
        // Superscript
        const base = layout(node.left, fontSize, ctx);
        const sup = layout(node.right, fontSize * 0.65, ctx);
        const supY = -sup.height * 0.3; // raise above baseline
        const boxes: LayoutBox[] = [
          ...base.boxes,
          ...sup.boxes.map(b => ({ ...b, x: b.x + base.width + 1, y: b.y + supY })),
        ];
        const totalH = Math.max(base.height, sup.height - supY);
        return { boxes, width: base.width + 1 + sup.width, height: totalH, baseline: base.baseline };
      }

      // Binary operators: +, -, *, with spacing
      const left = layout(node.left, fontSize, ctx);
      const right = layout(node.right, fontSize, ctx);
      const opSymbol = node.op === '*' ? '\u00D7' : node.op === '-' ? '\u2212' : node.op;
      const opW = ctx.measureText(` ${opSymbol} `).width;
      const maxBaseline = Math.max(left.baseline, right.baseline);
      const maxH = Math.max(left.height, right.height);

      const boxes: LayoutBox[] = [
        ...left.boxes.map(b => ({ ...b, y: b.y + (maxBaseline - left.baseline) })),
        { kind: 'text' as const, x: left.width + 3, y: maxBaseline, w: opW, h: maxH, text: ` ${opSymbol} `, fontSize: fontSize * 0.9 },
        ...right.boxes.map(b => ({ ...b, x: b.x + left.width + opW + 6, y: b.y + (maxBaseline - right.baseline) })),
      ];

      return { boxes, width: left.width + opW + 6 + right.width, height: maxH, baseline: maxBaseline };
    }

    case 'call': {
      const fnName = node.name;

      if (fnName === 'sqrt' && node.args.length === 1) {
        // Square root: radical sign + overline
        const inner = layout(node.args[0]!, fontSize, ctx);
        const radW = 14;
        const pad = 4;
        const totalW = radW + inner.width + pad;
        const totalH = inner.height + 4;

        const boxes: LayoutBox[] = [
          // Radical symbol
          { kind: 'radical', x: 0, y: 0, w: radW, h: totalH, innerW: inner.width + pad, innerH: totalH },
          // Inner expression
          ...inner.boxes.map(b => ({ ...b, x: b.x + radW + 2, y: b.y + 4 })),
        ];

        return { boxes, width: totalW, height: totalH, baseline: inner.baseline + 4 };
      }

      // Regular function: name(args)
      const fnText = GREEK[fnName] ?? fnName;
      ctx.font = `${fontSize}px "Caveat", "Comic Sans MS", cursive`;
      const fnW = ctx.measureText(fnText).width;
      const argLayouts = node.args.map(a => layout(a, fontSize, ctx));
      const parenW = 8;

      let totalW = fnW + parenW; // fn(
      let maxH = fontSize * 1.2;
      let maxBL = fontSize * 0.96;
      const argBoxes: LayoutBox[] = [];

      for (let i = 0; i < argLayouts.length; i++) {
        const al = argLayouts[i]!;
        if (i > 0) {
          argBoxes.push({ kind: 'text', x: totalW, y: maxBL, w: ctx.measureText(', ').width, h: maxH, text: ', ', fontSize: fontSize * 0.85 });
          totalW += ctx.measureText(', ').width;
        }
        argBoxes.push(...al.boxes.map(b => ({ ...b, x: b.x + totalW })));
        totalW += al.width;
        maxH = Math.max(maxH, al.height);
        maxBL = Math.max(maxBL, al.baseline);
      }

      totalW += parenW; // )

      const boxes: LayoutBox[] = [
        { kind: 'text', x: 0, y: maxBL, w: fnW, h: maxH, text: fnText, fontSize },
        { kind: 'paren', x: fnW, y: 0, w: parenW, h: maxH, parenHeight: maxH, open: true },
        ...argBoxes,
        { kind: 'paren', x: totalW - parenW, y: 0, w: parenW, h: maxH, parenHeight: maxH, open: false },
      ];

      return { boxes, width: totalW, height: maxH, baseline: maxBL };
    }

    case 'equation': {
      const left = layout(node.left, fontSize, ctx);
      const right = layout(node.right, fontSize, ctx);
      const eqW = ctx.measureText(' = ').width;
      const maxBL = Math.max(left.baseline, right.baseline);
      const maxH = Math.max(left.height, right.height);

      const boxes: LayoutBox[] = [
        ...left.boxes.map(b => ({ ...b, y: b.y + (maxBL - left.baseline) })),
        { kind: 'text' as const, x: left.width + 3, y: maxBL, w: eqW, h: maxH, text: ' = ', fontSize },
        ...right.boxes.map(b => ({ ...b, x: b.x + left.width + eqW + 6, y: b.y + (maxBL - right.baseline) })),
      ];

      return { boxes, width: left.width + eqW + 6 + right.width, height: maxH, baseline: maxBL };
    }
  }
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

// ─── Renderer Op ─────────────────────────────────────────────────

export async function mathOp(op: MathOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const variant = op.style?.variant ?? op.data.variant ?? 'default';

  const color = remapColor(theme,
    variant === 'explain' ? theme.explainPen
    : variant === 'answer' ? theme.answerPen
    : undefined
  );

  const baseFontSize = variant === 'answer' ? 30 : variant === 'explain' ? 22 : 26;

  c.save();

  let ast: Expr;
  try {
    ast = parse(op.data.expr);
  } catch {
    // Fallback: just write the expression as text if parsing fails
    c.font = theme.font;
    c.fillStyle = color;
    c.fillText(op.data.expr, ctx.cursor.x, ctx.cursor.y);
    ctx.newline();
    c.restore();
    return;
  }

  const result = layout(ast, baseFontSize, c);
  const startX = op.at?.[0] ?? ctx.cursor.x;
  const startY = op.at?.[1] ?? ctx.cursor.y;

  // Record bounds
  const id = op.target ?? `auto.${ctx.targets.size}`;
  const bounds: TargetBounds = { x: startX, y: startY, w: result.width, h: result.height };
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;

  // Draw each box with animation
  c.fillStyle = color;
  c.strokeStyle = color;

  for (const box of result.boxes) {
    if (ctx.aborted) break;

    const bx = startX + box.x;
    const by = startY + box.y;

    switch (box.kind) {
      case 'text': {
        const fs = box.fontSize ?? baseFontSize;
        const isItalic = box.text && /^[a-zα-ω]$/i.test(box.text);
        c.font = `${isItalic ? 'italic ' : ''}${fs}px "Caveat", "Comic Sans MS", cursive`;
        c.fillStyle = color;

        // Animate character by character
        const text = box.text ?? '';
        let cx = bx;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]!;
          const jitter = (Math.random() - 0.5) * 1.0;
          c.fillText(ch, cx, by + jitter);
          cx += c.measureText(ch).width;
          ctx.onCursorMove?.(cx, by);
          if (text.length <= 4) await ctx.sleep(25);
        }
        if (text.length > 4) await ctx.sleep(15);
        break;
      }

      case 'line': {
        // Animated fraction bar
        c.strokeStyle = color;
        c.lineWidth = 1.5;
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          c.beginPath();
          c.moveTo(bx, by);
          c.lineTo(bx + (box.w * i) / steps, by);
          c.stroke();
          await ctx.sleep(8);
        }
        break;
      }

      case 'radical': {
        // Draw √ symbol
        c.strokeStyle = color;
        c.lineWidth = 1.5;
        const rw = box.w;
        const rh = box.h;
        const innerW = box.innerW ?? rw;
        const innerH = box.innerH ?? rh;

        c.beginPath();
        // Tail
        c.moveTo(bx, by + rh * 0.6);
        // Down stroke
        c.lineTo(bx + rw * 0.3, by + rh);
        // Up stroke
        c.lineTo(bx + rw * 0.7, by);
        // Overline
        c.lineTo(bx + rw + innerW, by);
        c.stroke();
        await ctx.sleep(40);
        break;
      }

      case 'paren': {
        c.strokeStyle = color;
        c.lineWidth = 1.5;
        const ph = box.parenHeight ?? box.h;
        const mid = by + ph / 2;

        if (box.open) {
          c.beginPath();
          c.moveTo(bx + 6, by);
          c.quadraticCurveTo(bx, mid, bx + 6, by + ph);
          c.stroke();
        } else {
          c.beginPath();
          c.moveTo(bx, by);
          c.quadraticCurveTo(bx + 6, mid, bx, by + ph);
          c.stroke();
        }
        await ctx.sleep(15);
        break;
      }
    }
  }

  c.restore();
  ctx.cursor.x = startX + result.width + 8;
  ctx.cursor.y = startY + result.height;
  ctx.newline();
}
