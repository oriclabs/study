import type { NumberlineOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';
import { autoScrollToCursor } from '../state.js';

/** 1D number line with marks, labels, intervals. */
export async function numberlineOp(op: NumberlineOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { from, to, marks = [], labels = {}, intervals = [] } = op.data;

  const lineW = Math.min(ctx.canvas.width - ctx.marginX * 2, 600);
  const lx = ctx.marginX + 20;
  const ly = ctx.cursor.y + 40;
  const xAt = (v: number) => lx + ((v - from) / (to - from)) * lineW;

  // Scroll to make the number line visible before drawing
  autoScrollToCursor(ctx.canvas, ly + 50);

  c.save();

  // Main line
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 2;
  const steps = 24;
  for (let i = 1; i <= steps; i++) {
    if (ctx.aborted) break;
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(lx + (lineW * i) / steps, ly);
    c.stroke();
    await ctx.sleep(10);
  }

  // Tick marks every integer
  c.font = '14px sans-serif';
  c.fillStyle = remapColor(theme, theme.defaultPen);
  for (let v = Math.ceil(from); v <= Math.floor(to); v++) {
    const x = xAt(v);
    c.beginPath();
    c.moveTo(x, ly - 5);
    c.lineTo(x, ly + 5);
    c.stroke();
    c.fillText(String(v), x - 4, ly + 22);
  }

  // Special marks + labels
  c.fillStyle = remapColor(theme, theme.answerPen);
  for (const m of marks) {
    if (ctx.aborted) break;
    const x = xAt(m);
    c.beginPath();
    c.arc(x, ly, 6, 0, Math.PI * 2);
    c.fill();
    const label = labels[String(m)];
    if (label) {
      c.font = theme.explainFont;
      c.fillText(label, x - 12, ly - 14);
    }
    await ctx.sleep(150);
  }

  // Intervals as thick bars
  for (const iv of intervals) {
    if (ctx.aborted) break;
    c.strokeStyle = remapColor(theme, theme.explainPen);
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(xAt(iv.from), ly);
    c.lineTo(xAt(iv.to), ly);
    c.stroke();
  }

  c.restore();

  const bounds: TargetBounds = { x: lx, y: ly - 30, w: lineW, h: 70 };
  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;
  ctx.cursor.y = ly + 50;
  ctx.cursor.x = ctx.marginX;
}
