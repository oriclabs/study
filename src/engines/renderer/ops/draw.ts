import type { DrawOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor } from '../theme.js';

/** Draw geometric primitives with a sketched animation. */
export async function drawOp(op: DrawOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  c.save();
  c.strokeStyle = remapColor(theme, op.data.color ?? op.style?.color);
  c.lineWidth = op.data.width ?? op.style?.width ?? 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  const d = op.data;
  let bounds: TargetBounds | null = null;

  switch (d.shape) {
    case 'line': {
      if (!d.from || !d.to) break;
      await animateLine(ctx, d.from, d.to);
      bounds = boundsOfLine(d.from, d.to);
      break;
    }
    case 'rect': {
      if (!d.from || !d.to) break;
      const [x1, y1] = d.from, [x2, y2] = d.to;
      await animateLine(ctx, [x1, y1], [x2, y1]);
      await animateLine(ctx, [x2, y1], [x2, y2]);
      await animateLine(ctx, [x2, y2], [x1, y2]);
      await animateLine(ctx, [x1, y2], [x1, y1]);
      bounds = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
      break;
    }
    case 'triangle':
    case 'polygon': {
      const pts = d.points ?? [];
      if (pts.length < 2) break;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!, b = pts[(i + 1) % pts.length]!;
        await animateLine(ctx, a, b);
      }
      bounds = boundsOfPoints(pts);
      break;
    }
    case 'circle': {
      if (!d.center || d.radius === undefined) break;
      await animateCircle(ctx, d.center, d.radius);
      bounds = { x: d.center[0] - d.radius, y: d.center[1] - d.radius, w: d.radius * 2, h: d.radius * 2 };
      break;
    }
    case 'arc': {
      if (!d.center || d.radius === undefined) break;
      await animateCircle(ctx, d.center, d.radius);
      bounds = { x: d.center[0] - d.radius, y: d.center[1] - d.radius, w: d.radius * 2, h: d.radius * 2 };
      break;
    }
    case 'rightAngle': {
      if (!d.at) break;
      const [x, y] = d.at;
      const s = d.size ?? 15;
      const dir = d.dir ?? 'bl';
      const dx = dir.includes('r') ? s : -s;
      const dy = dir.includes('t') ? -s : s;
      c.beginPath();
      c.moveTo(x + dx, y);
      c.lineTo(x + dx, y + dy);
      c.lineTo(x, y + dy);
      c.stroke();
      bounds = { x: Math.min(x, x + dx), y: Math.min(y, y + dy), w: Math.abs(dx), h: Math.abs(dy) };
      break;
    }
    case 'arrow': {
      if (!d.from || !d.to) break;
      await animateLine(ctx, d.from, d.to);
      drawArrowHead(c, d.from, d.to);
      bounds = boundsOfLine(d.from, d.to);
      break;
    }
  }

  if (bounds) {
    const id = op.target ?? `auto.${ctx.targets.size}`;
    ctx.targets.set(id, bounds);
    ctx.lastTargetId = id;
  }
  c.restore();
}

async function animateLine(ctx: RenderContext, from: [number, number], to: [number, number]): Promise<void> {
  const c = ctx.ctx;
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    if (ctx.aborted) return;
    const t = i / steps;
    c.beginPath();
    c.moveTo(from[0], from[1]);
    c.lineTo(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t);
    c.stroke();
    await ctx.sleep(12);
  }
}

async function animateCircle(ctx: RenderContext, center: [number, number], r: number): Promise<void> {
  const c = ctx.ctx;
  const steps = 40;
  let prev: [number, number] = [center[0] + r, center[1]];
  for (let i = 1; i <= steps; i++) {
    if (ctx.aborted) return;
    const a = (i / steps) * Math.PI * 2;
    const pt: [number, number] = [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r];
    c.beginPath();
    c.moveTo(prev[0], prev[1]);
    c.lineTo(pt[0], pt[1]);
    c.stroke();
    prev = pt;
    await ctx.sleep(8);
  }
}

function drawArrowHead(c: CanvasRenderingContext2D, from: [number, number], to: [number, number]) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const len = 10;
  c.beginPath();
  c.moveTo(to[0], to[1]);
  c.lineTo(to[0] - len * Math.cos(angle - Math.PI / 6), to[1] - len * Math.sin(angle - Math.PI / 6));
  c.moveTo(to[0], to[1]);
  c.lineTo(to[0] - len * Math.cos(angle + Math.PI / 6), to[1] - len * Math.sin(angle + Math.PI / 6));
  c.stroke();
}

function boundsOfLine(a: [number, number], b: [number, number]): TargetBounds {
  return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) };
}
function boundsOfPoints(pts: [number, number][]): TargetBounds {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
