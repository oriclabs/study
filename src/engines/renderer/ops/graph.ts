import type { GraphOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';
import { autoScrollToCursor, growCanvasIfNeeded } from '../state.js';
import { parseExpression, evalAST } from '@core/expression/index.js';

/**
 * Compute a nice tick interval so labels don't overlap.
 * Prefers intervals of 1, 2, 5, 10, 20, 50, ...
 */
function niceTickInterval(range: number, maxTicks: number): number {
  const rough = range / maxTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  let nice: number;
  if (residual <= 1.5) nice = 1;
  else if (residual <= 3.5) nice = 2;
  else if (residual <= 7.5) nice = 5;
  else nice = 10;
  return nice * mag;
}

/** 2D plot: axes + one or more expressions + labeled points. */
export async function graphOp(op: GraphOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { xRange, yRange, plots, points } = op.data;

  // Layout constants
  const padTop = 18;
  const padBot = 28;
  const padLeft = 8;
  const totalW = Math.min(ctx.canvas.width - ctx.marginX * 2, 520);
  const gw = totalW - padLeft;
  const gh = 280;
  const gx = ctx.marginX + padLeft;
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;

  // Compute tick intervals based on available pixel space
  const maxXTicks = Math.floor(gw / 50); // ~50px minimum between labels
  const maxYTicks = Math.floor(gh / 40); // ~40px minimum between labels
  const xTick = niceTickInterval(xSpan, maxXTicks);
  const yTick = niceTickInterval(ySpan, maxYTicks);

  // Pre-scan to find topmost curve pixel
  let curveMinPx = gh;
  const sampleCount = 100;
  for (const plot of plots) {
    try {
      const ast = parseExpression(plot.expr);
      for (let i = 0; i <= sampleCount; i++) {
        const x = xMin + (xSpan * i) / sampleCount;
        const y = evalAST(ast, { x });
        if (!isFinite(y) || y < yMin || y > yMax) continue;
        const relPy = gh - ((y - yMin) / ySpan) * gh;
        if (relPy < curveMinPx) curveMinPx = relPy;
      }
    } catch { /* skip */ }
  }
  if (points) {
    for (const p of points) {
      if (p.y >= yMin && p.y <= yMax) {
        const relPy = gh - ((p.y - yMin) / ySpan) * gh;
        if (relPy < curveMinPx) curveMinPx = relPy;
      }
    }
  }

  const gapFromText = 30;
  const gy = ctx.cursor.y + gapFromText + padTop - Math.min(curveMinPx, padTop);

  // Ensure canvas is tall enough for the entire graph in one go
  const graphBottom = gy + gh + padBot + 60;
  if (graphBottom > ctx.canvas.height - 20) {
    const oldHeight = ctx.canvas.height;
    const newHeight = graphBottom + 40;
    const imgData = c.getImageData(0, 0, ctx.canvas.width, oldHeight);
    ctx.canvas.height = newHeight;
    c.putImageData(imgData, 0, 0);
    c.fillStyle = ctx.theme.background;
    c.fillRect(0, oldHeight, ctx.canvas.width, newHeight - oldHeight);
  }
  autoScrollToCursor(ctx.canvas, gy + gh + padBot);

  const xToPx = (x: number) => gx + ((x - xMin) / xSpan) * gw;
  const yToPx = (y: number) => gy + gh - ((y - yMin) / ySpan) * gh;

  c.save();

  // ─── Animated grid lines ──────────────────────────────────────
  c.strokeStyle = theme.gridLine;
  c.lineWidth = 0.5;

  // Vertical grid lines (at tick intervals)
  const xStart = Math.ceil(xMin / xTick) * xTick;
  for (let x = xStart; x <= xMax; x += xTick) {
    const px = xToPx(x);
    c.beginPath();
    c.moveTo(px, gy);
    c.lineTo(px, gy + gh);
    c.stroke();
  }
  // Horizontal grid lines
  const yStart = Math.ceil(yMin / yTick) * yTick;
  for (let y = yStart; y <= yMax; y += yTick) {
    const py = yToPx(y);
    c.beginPath();
    c.moveTo(gx, py);
    c.lineTo(gx + gw, py);
    c.stroke();
  }

  await ctx.sleep(60);

  // ─── Animated axes ────────────────────────────────────────────
  c.strokeStyle = remapColor(theme, '#888');
  c.lineWidth = 1.5;

  // X-axis (y=0)
  if (yMin <= 0 && yMax >= 0) {
    const axisY = yToPx(0);
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      if (ctx.aborted) break;
      c.beginPath();
      c.moveTo(gx, axisY);
      c.lineTo(gx + (gw * i) / steps, axisY);
      c.stroke();
      await ctx.sleep(8);
    }
  }

  // Y-axis (x=0)
  if (xMin <= 0 && xMax >= 0) {
    const axisX = xToPx(0);
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      if (ctx.aborted) break;
      c.beginPath();
      c.moveTo(axisX, gy + gh);
      c.lineTo(axisX, gy + gh - (gh * i) / steps);
      c.stroke();
      await ctx.sleep(8);
    }
  }

  await ctx.sleep(80);

  // ─── Animated axis labels ─────────────────────────────────────
  c.fillStyle = remapColor(theme, '#888');
  c.font = '13px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'top';

  // X-axis labels
  const xLabelY = yMin <= 0 && yMax >= 0 ? yToPx(0) + 6 : gy + gh + 4;
  for (let x = xStart; x <= xMax; x += xTick) {
    if (ctx.aborted) break;
    if (Math.abs(x) < xTick * 0.01) continue; // skip 0
    const px = xToPx(x);
    const label = formatTickLabel(x, xTick);
    c.fillText(label, px, xLabelY);
    await ctx.sleep(25);
  }

  // Y-axis labels
  c.textAlign = 'right';
  c.textBaseline = 'middle';
  const yLabelX = xMin <= 0 && xMax >= 0 ? xToPx(0) - 6 : gx - 4;
  for (let y = yStart; y <= yMax; y += yTick) {
    if (ctx.aborted) break;
    if (Math.abs(y) < yTick * 0.01) continue; // skip 0
    const py = yToPx(y);
    const label = formatTickLabel(y, yTick);
    c.fillText(label, yLabelX, py);
    await ctx.sleep(25);
  }

  // Origin label
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    c.textAlign = 'right';
    c.textBaseline = 'top';
    c.fillText('0', xToPx(0) - 4, yToPx(0) + 4);
  }

  c.textAlign = 'start'; // reset
  c.textBaseline = 'alphabetic';

  await ctx.sleep(100);

  // ─── Clip + animate curves ────────────────────────────────────
  c.save();
  c.beginPath();
  c.rect(gx - 1, gy - 1, gw + 2, gh + 2);
  c.clip();

  const samples = 200;
  for (const plot of plots) {
    if (ctx.aborted) break;
    const ast = parseExpression(plot.expr);
    c.strokeStyle = remapColor(theme, plot.color ?? theme.defaultPen);
    c.lineWidth = 2.2;

    let prev: [number, number] | null = null;
    const step = Math.max(1, Math.floor(samples / 80));
    for (let i = 0; i <= samples; i++) {
      if (ctx.aborted) break;
      const x = xMin + (xSpan * i) / samples;
      let y: number;
      try { y = evalAST(ast, { x }); } catch { prev = null; continue; }
      if (!isFinite(y) || y < yMin - 5 || y > yMax + 5) { prev = null; continue; }
      const px = xToPx(x), py = yToPx(y);
      if (prev) {
        c.beginPath();
        c.moveTo(prev[0], prev[1]);
        c.lineTo(px, py);
        c.stroke();
      }
      prev = [px, py];
      if (i % step === 0) {
        autoScrollToCursor(ctx.canvas, py);
        await ctx.sleep(6);
      }
    }
  }

  c.restore(); // un-clip

  // ─── Plot labels ──────────────────────────────────────────────
  for (const plot of plots) {
    if (plot.label) {
      c.fillStyle = remapColor(theme, plot.color ?? theme.defaultPen);
      c.font = theme.explainFont;
      const labelW = c.measureText(plot.label).width;
      c.fillText(plot.label, gx + gw - labelW - 8, gy + 20 + plots.indexOf(plot) * 24);
    }
  }

  // ─── Animated marked points ───────────────────────────────────
  if (points) {
    for (const p of points) {
      if (ctx.aborted) break;
      const px = xToPx(p.x), py = yToPx(p.y);
      // Animated dot (grow)
      c.fillStyle = remapColor(theme, theme.answerPen);
      for (let r = 1; r <= 5; r++) {
        c.beginPath();
        c.arc(px, py, r, 0, Math.PI * 2);
        c.fill();
        await ctx.sleep(20);
      }
      if (p.label) {
        c.font = '14px sans-serif';
        c.fillStyle = remapColor(theme, theme.answerPen);
        // Animated label text
        const labelX = px + 10;
        const labelY = py - 8;
        for (let i = 0; i < p.label.length; i++) {
          if (ctx.aborted) break;
          c.fillText(p.label[i]!, labelX + c.measureText(p.label.slice(0, i)).width, labelY);
          await ctx.sleep(18);
        }
      }
      autoScrollToCursor(ctx.canvas, py);
      await ctx.sleep(80);
    }
  }

  c.restore();

  const totalH = (gy + gh + padBot) - (gy - padTop);
  const bounds: TargetBounds = { x: gx, y: gy - padTop, w: gw, h: totalH };
  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;
  ctx.cursor.y = gy + gh + padBot + 20;
  ctx.cursor.x = ctx.marginX;
}

/** Format a tick label — show integers as integers, small decimals with minimal precision. */
function formatTickLabel(value: number, interval: number): string {
  if (Number.isInteger(value)) return String(value);
  // Use enough decimal places to distinguish ticks
  const decimals = Math.max(0, -Math.floor(Math.log10(interval))) + 1;
  return value.toFixed(Math.min(decimals, 2));
}
