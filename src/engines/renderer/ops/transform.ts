import type { TransformOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';

/**
 * Transform op: shows an equation transformation with clear visual progression.
 *
 * Layout:
 *   source equation                 ← operation label
 *   ─── (strikethrough on source) ───
 *   → result equation
 */
export async function transformOp(op: TransformOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { from, to, operation, highlights } = op.data;
  const changePen = remapColor(theme, op.data.changeColor ?? '#d32f2f');
  const arrowPen = remapColor(theme, theme.explainPen);

  c.save();

  // ─── Phase 1: Write source equation ───────────────────────────
  const sourceX = op.at?.[0] ?? ctx.cursor.x;
  const sourceY = op.at?.[1] ?? ctx.cursor.y;
  ctx.cursor.x = sourceX;
  ctx.cursor.y = sourceY;

  c.font = theme.font;
  c.fillStyle = remapColor(theme, undefined);
  c.textBaseline = 'alphabetic';

  const metrics = c.measureText('Mg');
  const ascent = metrics.actualBoundingBoxAscent || 24;
  const descent = metrics.actualBoundingBoxDescent || 6;

  const sourceCharX = await writeAnimated(c, ctx, from, sourceX, sourceY);
  const sourceEndX = ctx.cursor.x;

  // Record source bounds
  const sourceId = op.target ? `${op.target}.from` : `auto.${ctx.targets.size}`;
  ctx.targets.set(sourceId, {
    x: sourceX, y: sourceY - ascent,
    w: sourceEndX - sourceX, h: ascent + descent,
    charX: sourceCharX, baselineY: sourceY,
  });
  ctx.lastTargetId = sourceId;

  await ctx.sleep(200);

  // ─── Phase 2: Highlight changed portions ──────────────────────
  if (highlights && highlights.length > 0) {
    for (const hl of highlights) {
      const startChar = from.indexOf(hl.text);
      if (startChar < 0) continue;
      const endChar = startChar + hl.text.length;
      const x1 = sourceCharX[startChar] ?? sourceX;
      const x2 = sourceCharX[Math.min(endChar, sourceCharX.length - 1)] ?? sourceEndX;
      const underY = sourceY + descent + 3;

      c.save();
      c.strokeStyle = changePen;
      c.lineWidth = 2.5;
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        if (ctx.aborted) break;
        c.beginPath();
        c.moveTo(x1, underY);
        c.lineTo(x1 + ((x2 - x1) * i) / steps, underY);
        c.stroke();
        await ctx.sleep(10);
      }
      c.restore();
    }
    await ctx.sleep(200);
  }

  // ─── Phase 3: Strikethrough source + dim it ───────────────────
  if (op.data.strikeSource) {
    c.save();
    c.strokeStyle = changePen;
    c.lineWidth = 1.5;
    c.globalAlpha = 0.6;
    const strikeY = sourceY - ascent / 3;
    // Animated strikethrough
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      if (ctx.aborted) break;
      c.beginPath();
      c.moveTo(sourceX, strikeY);
      c.lineTo(sourceX + ((sourceEndX - sourceX) * i) / steps, strikeY);
      c.stroke();
      await ctx.sleep(12);
    }
    c.restore();

    // Dim the source by overlaying background at low opacity
    c.save();
    c.fillStyle = theme.background;
    c.globalAlpha = 0.35;
    c.fillRect(sourceX - 2, sourceY - ascent - 2, sourceEndX - sourceX + 4, ascent + descent + 4);
    c.restore();

    await ctx.sleep(150);
  }

  // ─── Phase 4: Operation label (to the right of source) ────────
  if (operation) {
    c.save();
    c.font = theme.explainFont;
    c.fillStyle = arrowPen;
    const labelX = sourceEndX + 12;
    c.fillText(`\u2190 ${operation}`, labelX, sourceY);
    c.restore();
    await ctx.sleep(200);
  }

  // ─── Phase 5: Write result with arrow prefix ──────────────────
  ctx.newline();

  const resultX = sourceX;
  const resultY = ctx.cursor.y;
  ctx.cursor.x = resultX;

  // Draw "→ " prefix in accent color
  c.save();
  c.font = theme.font;
  c.fillStyle = arrowPen;
  c.fillText('\u2192 ', resultX, resultY);
  const prefixWidth = c.measureText('\u2192 ').width;
  ctx.cursor.x = resultX + prefixWidth;
  c.restore();

  // Write result text
  c.font = theme.font;
  c.fillStyle = remapColor(theme, undefined);
  c.textBaseline = 'alphabetic';

  const resultCharX = await writeAnimated(c, ctx, to, ctx.cursor.x, resultY);
  const resultEndX = ctx.cursor.x;

  // Record result bounds
  const resultId = op.target ? `${op.target}.to` : `auto.${ctx.targets.size}`;
  ctx.targets.set(resultId, {
    x: resultX, y: resultY - ascent,
    w: resultEndX - resultX, h: ascent + descent,
    charX: resultCharX, baselineY: resultY,
  });
  ctx.lastTargetId = resultId;

  c.restore();
  ctx.newline();
}

/** Character-by-character animated text write. Returns array of char x-positions. */
async function writeAnimated(
  c: CanvasRenderingContext2D,
  ctx: RenderContext,
  text: string,
  startX: number,
  baselineY: number,
): Promise<number[]> {
  const charX: number[] = [];
  ctx.cursor.x = startX;

  const baseDelay = text.length > 40 ? 12 : text.length > 20 ? 20 : 30;
  const batchSize = text.length > 60 ? 3 : text.length > 30 ? 2 : 1;

  let i = 0;
  while (i < text.length) {
    if (ctx.aborted) break;
    const end = Math.min(i + batchSize, text.length);
    for (let j = i; j < end; j++) {
      const ch = text[j]!;
      charX.push(ctx.cursor.x);
      const jitter = (Math.random() - 0.5) * 1.2;
      c.fillText(ch, ctx.cursor.x, baselineY + jitter);
      ctx.cursor.x += c.measureText(ch).width;
    }
    ctx.onCursorMove?.(ctx.cursor.x, baselineY);
    await ctx.sleep(baseDelay * (0.7 + Math.random() * 0.6));
    i = end;
  }
  charX.push(ctx.cursor.x);
  return charX;
}
