import type { WriteOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';

/**
 * Handwritten text: character-by-character reveal with per-char y-jitter
 * and speed variation to simulate a pen on paper.
 */
export async function writeOp(op: WriteOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const variant = op.style?.variant ?? 'default';

  const font = op.style?.font
    ?? (variant === 'title' ? theme.titleFont
      : variant === 'explain' ? theme.explainFont
      : variant === 'answer' ? theme.answerFont
      : theme.font);

  const color = remapColor(
    theme,
    op.style?.color
      ?? (variant === 'explain' ? theme.explainPen
        : variant === 'answer' ? theme.answerPen
        : undefined)
  );

  c.save();
  c.font = font;
  c.fillStyle = color;
  c.textBaseline = 'alphabetic';

  // Position
  if (op.at) {
    ctx.cursor.x = op.at[0]!;
    ctx.cursor.y = op.at[1]!;
  } else if (op.data.indent || op.style?.indent) {
    ctx.cursor.x = ctx.marginX + 40;
  } else {
    ctx.cursor.x = ctx.marginX;
  }

  const text = op.data.text;
  const startX = ctx.cursor.x;
  const baselineY = ctx.cursor.y;
  const charX: number[] = [];

  // Measure text height for bounds
  const metrics = c.measureText('Mg');
  const ascent = metrics.actualBoundingBoxAscent || 24;
  const descent = metrics.actualBoundingBoxDescent || 6;

  // Adaptive delay: shorter for long text to avoid perceived "hang"
  const baseCharDelay = text.length > 60 ? 15 : text.length > 30 ? 25 : 35;
  // For very long text, batch characters to avoid excessive sleeps
  const batchSize = text.length > 80 ? 3 : text.length > 40 ? 2 : 1;

  let i = 0;
  while (i < text.length) {
    if (ctx.aborted) return;

    // Draw a batch of characters
    const end = Math.min(i + batchSize, text.length);
    for (let j = i; j < end; j++) {
      const ch = text[j]!;
      charX.push(ctx.cursor.x);
      const jitter = (Math.random() - 0.5) * 1.6;
      c.fillText(ch, ctx.cursor.x, baselineY + jitter);
      const w = c.measureText(ch).width;
      ctx.cursor.x += w;
    }

    ctx.onCursorMove?.(ctx.cursor.x, baselineY);

    // Pause varies per char for natural rhythm
    const delay = baseCharDelay * (0.7 + Math.random() * 0.6);
    await ctx.sleep(delay);
    i = end;
  }
  // Record end-of-text sentinel for strike/highlight
  charX.push(ctx.cursor.x);

  const bounds: TargetBounds = {
    x: startX,
    y: baselineY - ascent,
    w: ctx.cursor.x - startX,
    h: ascent + descent,
    charX,
    baselineY,
  };

  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;

  c.restore();
  ctx.newline();
}
