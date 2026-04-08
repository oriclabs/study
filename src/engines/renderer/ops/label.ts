import type { LabelOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';

/**
 * Static text placed at a position (no handwriting animation).
 * Used for axis labels, annotations, captions.
 */
export async function labelOp(op: LabelOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  c.save();
  c.font = op.data.font ?? op.style?.font ?? theme.font;
  c.fillStyle = remapColor(theme, op.style?.color);
  c.textBaseline = 'alphabetic';

  const x = op.at?.[0] ?? ctx.cursor.x;
  const y = op.at?.[1] ?? ctx.cursor.y;
  c.fillText(op.data.text, x, y);

  const w = c.measureText(op.data.text).width;
  const bounds: TargetBounds = { x, y: y - 20, w, h: 28 };
  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;

  c.restore();
  await ctx.sleep(40);
}
