import type { EraseOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';

/** Erase a previous target by painting background over it. */
export async function eraseOp(op: EraseOp, ctx: RenderContext): Promise<void> {
  const target = ctx.resolveTarget(op.target ?? 'prev');
  if (!target) return;
  const { ctx: c, theme } = ctx;
  c.save();
  // Scribble-out animation
  c.strokeStyle = theme.background;
  c.lineWidth = Math.max(12, target.h);
  c.lineCap = 'round';
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    if (ctx.aborted) break;
    const y = target.y + (target.h * (i + 0.5)) / steps;
    c.beginPath();
    c.moveTo(target.x - 4, y);
    c.lineTo(target.x + target.w + 4, y);
    c.stroke();
    await ctx.sleep(30);
  }
  c.fillStyle = theme.background;
  c.fillRect(target.x - 4, target.y - 4, target.w + 8, target.h + 8);
  c.restore();
}
