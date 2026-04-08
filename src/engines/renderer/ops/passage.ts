import type { PassageOp, AnnotateOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';

interface PassageTargetExtras {
  spanBounds?: Map<string, TargetBounds>;
}
type PassageTarget = TargetBounds & PassageTargetExtras;

/** Render a block of prose with identifiable spans for later highlighting. */
export async function passageOp(op: PassageOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  c.save();
  c.font = theme.font.replace(/\d+px/, '22px');
  c.fillStyle = remapColor(theme, theme.defaultPen);
  c.textBaseline = 'alphabetic';

  const { text, spans = [] } = op.data;
  const maxW = ctx.canvas.width - ctx.marginX * 2;
  const words = text.split(/(\s+)/);
  let x = ctx.marginX;
  const startY = ctx.cursor.y + 10;
  let y = startY;
  const lineHeight = 32;

  // Record char index → (x, y) for span lookup
  const charPos: { x: number; y: number }[] = [];
  let charIdx = 0;

  for (const w of words) {
    const ww = c.measureText(w).width;
    if (x + ww > ctx.marginX + maxW) {
      x = ctx.marginX;
      y += lineHeight;
    }
    // Reveal word-by-word (not char, for speed)
    c.fillText(w, x, y);
    for (let i = 0; i < w.length; i++) {
      charPos.push({ x: x + c.measureText(w.slice(0, i)).width, y });
      charIdx++;
    }
    x += ww;
    await ctx.sleep(10);
  }

  // Compute span bounds from char positions
  const spanBounds = new Map<string, TargetBounds>();
  for (const s of spans) {
    const startPos = charPos[s.start];
    const endPos = charPos[Math.min(charPos.length - 1, s.end)];
    if (startPos && endPos) {
      const w = (endPos.x - startPos.x) || c.measureText(text.slice(s.start, s.end)).width;
      spanBounds.set(s.id, { x: startPos.x, y: startPos.y - 22, w, h: 28 });
    }
  }

  const passageId = op.target ?? `auto.${ctx.targets.size}`;
  const passageBounds: PassageTarget = {
    x: ctx.marginX, y: startY - 22, w: maxW, h: y - startY + 40,
    spanBounds,
  };
  ctx.targets.set(passageId, passageBounds);
  ctx.lastTargetId = passageId;

  // Also record spans as dotted targets like `passage.spanId`
  for (const [id, b] of spanBounds) {
    ctx.targets.set(`${passageId}.${id}`, b);
  }

  c.restore();
  ctx.cursor.y = y + lineHeight;
  ctx.cursor.x = ctx.marginX;
}

export async function annotateOp(op: AnnotateOp, ctx: RenderContext): Promise<void> {
  const target = ctx.resolveTarget(op.target);
  if (!target) return;
  const { ctx: c, theme } = ctx;
  c.save();
  c.font = theme.explainFont;
  c.fillStyle = remapColor(theme, theme.explainPen);
  c.fillText(op.data.note, target.x + target.w + 10, target.y + 18);
  c.restore();
  await ctx.sleep(80);
}
