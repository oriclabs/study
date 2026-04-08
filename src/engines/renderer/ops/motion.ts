import type { MoveOp, RotateOp, ParticlesOp, GlowOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';
import { drawSymbol } from './symbols.js';

function ease(t: number, kind: string | undefined): number {
  switch (kind) {
    case 'ease-in': return t * t;
    case 'ease-out': return t * (2 - t);
    case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default: return t;
  }
}

/** Animate an object (or symbol) from A to B. */
export async function moveOp(op: MoveOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { from, to, symbol } = op.data;
  const duration = op.data.durationMs ?? 800;
  const steps = Math.max(20, Math.round(duration / 16));
  const trailPoints: [number, number][] = [];

  c.save();
  for (let i = 0; i <= steps; i++) {
    if (ctx.aborted) break;
    const t = ease(i / steps, op.data.easing);
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;

    // Clear previous frame's symbol area (minimal — we accept slight smearing)
    if (op.data.trail) trailPoints.push([x, y]);
    if (symbol) {
      drawSymbol(c, symbol, [x, y], 24, theme);
    } else {
      c.fillStyle = remapColor(theme, op.style?.color ?? theme.answerPen);
      c.beginPath();
      c.arc(x, y, 6, 0, Math.PI * 2);
      c.fill();
    }
    await ctx.sleep(duration / steps);
  }

  if (op.data.trail && trailPoints.length > 1) {
    c.strokeStyle = remapColor(theme, op.style?.color ?? theme.answerPen);
    c.lineWidth = 1.5;
    c.setLineDash([4, 4]);
    c.beginPath();
    c.moveTo(trailPoints[0]![0], trailPoints[0]![1]);
    for (const [x, y] of trailPoints.slice(1)) c.lineTo(x, y);
    c.stroke();
    c.setLineDash([]);
  }
  c.restore();
}

/** Rotate a symbol around a center. */
export async function rotateOp(op: RotateOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { center, from, to, radius, symbol } = op.data;
  const duration = op.data.durationMs ?? 1200;
  const steps = Math.max(30, Math.round(duration / 16));

  c.save();
  for (let i = 0; i <= steps; i++) {
    if (ctx.aborted) break;
    const t = i / steps;
    const angle = from + (to - from) * t;
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + Math.sin(angle) * radius;
    if (symbol) {
      drawSymbol(c, symbol, [x, y], 20, theme);
    } else {
      c.fillStyle = remapColor(theme, theme.answerPen);
      c.beginPath();
      c.arc(x, y, 5, 0, Math.PI * 2);
      c.fill();
    }
    await ctx.sleep(duration / steps);
  }
  c.restore();
}

/** Emit particles flowing from A to B (current, blood flow, diffusion, etc). */
export async function particlesOp(op: ParticlesOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { from, to } = op.data;
  const count = op.data.count ?? 8;
  const duration = op.data.durationMs ?? 1500;
  const color = remapColor(theme, op.data.color ?? theme.explainPen);

  // Each particle has its own staggered start time
  const particles = Array.from({ length: count }, (_, i) => ({
    offset: (i / count) * duration,
    phase: 0,
  }));
  const steps = Math.round(duration / 30);

  c.save();
  c.fillStyle = color;
  for (let step = 0; step <= steps; step++) {
    if (ctx.aborted) break;
    const tGlobal = (step / steps) * (duration * 1.5);
    // Redraw background strip to erase previous frame
    for (const p of particles) {
      const dt = (tGlobal - p.offset + duration) % duration;
      const t = dt / duration;
      if (t < 0 || t > 1) continue;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      c.globalAlpha = Math.sin(t * Math.PI);
      c.beginPath();
      c.arc(x, y, 3, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    await ctx.sleep(30);
  }
  c.restore();
}

/** Pulsing glow at a point. */
export async function glowOp(op: GlowOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { center } = op.data;
  const baseRadius = op.data.radius ?? 20;
  const pulses = op.data.pulses ?? 3;
  const color = remapColor(theme, op.data.color ?? theme.answerPen);

  c.save();
  for (let p = 0; p < pulses; p++) {
    if (ctx.aborted) break;
    for (let i = 0; i <= 20; i++) {
      if (ctx.aborted) break;
      const t = i / 20;
      const r = baseRadius * (0.5 + t);
      const alpha = (1 - t) * 0.6;
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      c.arc(center[0], center[1], r, 0, Math.PI * 2);
      c.fill();
      await ctx.sleep(20);
    }
  }
  c.globalAlpha = 1;
  c.restore();
}
