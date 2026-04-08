import type { HighlightOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';

/** Box/underline/circle highlight around a previously rendered target. */
export async function highlightOp(op: HighlightOp, ctx: RenderContext): Promise<void> {
  const target = ctx.resolveTarget(op.target ?? 'prev');
  if (!target) return;
  const { ctx: c, theme } = ctx;
  c.save();
  c.strokeStyle = remapColor(theme, op.style?.color ?? '#d32f2f');
  c.lineWidth = op.style?.width ?? 2.2;

  let tx = target.x, ty = target.y, tw = target.w, th = target.h;

  // If a range is specified on a text target, narrow to that char range.
  if (op.data.range && target.charX && target.baselineY !== undefined) {
    const [f, t] = op.data.range;
    const x1 = target.charX[Math.max(0, f)] ?? target.x;
    const x2 = target.charX[Math.min(target.charX.length - 1, t)] ?? target.x + target.w;
    tx = x1; tw = x2 - x1;
  }

  const style = op.data.style ?? 'box';
  if (style === 'underline') {
    const y = ty + th + 4;
    const steps = 14;
    for (let i = 1; i <= steps; i++) {
      if (ctx.aborted) break;
      c.beginPath();
      c.moveTo(tx, y);
      c.lineTo(tx + (tw * i) / steps, y + (Math.random() - 0.5));
      c.stroke();
      await ctx.sleep(15);
    }
  } else if (style === 'circle') {
    const cx = tx + tw / 2;
    const cy = ty + th / 2;
    const r = Math.max(tw, th) * 0.7;
    const steps = 40;
    let prev: [number, number] = [cx + r, cy];
    for (let i = 1; i <= steps; i++) {
      if (ctx.aborted) break;
      const a = (i / steps) * Math.PI * 2;
      const pt: [number, number] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6];
      c.beginPath();
      c.moveTo(prev[0], prev[1]);
      c.lineTo(pt[0], pt[1]);
      c.stroke();
      prev = pt;
      await ctx.sleep(10);
    }
  } else {
    // box
    const pad = 4;
    const x = tx - pad, y = ty - pad, w = tw + pad * 2, h = th + pad * 2;
    c.beginPath();
    c.rect(x, y, w, h);
    c.stroke();
    await ctx.sleep(80);
  }

  if (op.data.label) {
    c.font = theme.explainFont;
    c.fillStyle = c.strokeStyle as string;
    c.fillText(op.data.label, tx, ty - 8);
  }
  c.restore();
}
