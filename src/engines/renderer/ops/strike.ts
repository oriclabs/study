import type { StrikeOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';

/**
 * Strike-through a range of chars on a previously written text target.
 */
export async function strikeOp(op: StrikeOp, ctx: RenderContext): Promise<void> {
  const target = ctx.resolveTarget(op.target ?? 'prev');
  if (!target || !target.charX || target.baselineY === undefined) return;

  const { from, to } = op.data;
  const x1 = target.charX[Math.max(0, from)] ?? target.x;
  const x2 = target.charX[Math.min(target.charX.length - 1, to)] ?? target.x + target.w;
  const y = target.baselineY - 10;

  const { ctx: c, theme } = ctx;
  c.save();
  c.strokeStyle = remapColor(theme, op.style?.color);
  c.lineWidth = op.style?.width ?? 2.5;
  c.lineCap = 'round';

  // Animate the stroke left → right
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    if (ctx.aborted) break;
    const t = i / steps;
    c.beginPath();
    c.moveTo(x1, y);
    c.lineTo(x1 + (x2 - x1) * t, y + (Math.random() - 0.5) * 0.8);
    c.stroke();
    await ctx.sleep(18);
  }
  c.restore();
}
