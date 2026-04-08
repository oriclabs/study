/**
 * Science op handlers: molecule, reaction, wave, field, diagram, process, circuit.
 * Used by physics, chemistry, biology subjects for animated explanations.
 */

import type { MoleculeOp, ReactionOp, WaveOp, FieldOp, DiagramOp, ProcessOp, CircuitOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';
import { drawSymbol } from './symbols.js';

// ─── Molecule ────────────────────────────────────────────────────

export async function moleculeOp(op: MoleculeOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { atoms, bonds, label } = op.data;
  const ox = op.at?.[0] ?? ctx.cursor.x + 100;
  const oy = op.at?.[1] ?? ctx.cursor.y + 40;

  c.save();

  // Draw bonds first (behind atoms)
  for (const bond of bonds) {
    const from = atoms.find(a => a.id === bond.from);
    const to = atoms.find(a => a.id === bond.to);
    if (!from || !to) continue;

    c.strokeStyle = remapColor(theme, bond.color ?? theme.defaultPen);
    c.lineWidth = 2;

    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len, ny = dx / len; // normal

    const bondType = bond.type ?? 'single';
    const lines = bondType === 'triple' ? 3 : bondType === 'double' ? 2 : 1;
    const spacing = 4;

    for (let i = 0; i < lines; i++) {
      const offset = (i - (lines - 1) / 2) * spacing;
      c.beginPath();
      c.moveTo(ox + from.x + nx * offset, oy + from.y + ny * offset);
      c.lineTo(ox + to.x + nx * offset, oy + to.y + ny * offset);
      c.stroke();
      await ctx.sleep(30);
    }
  }

  // Draw atoms
  for (const atom of atoms) {
    const ax = ox + atom.x, ay = oy + atom.y;
    const r = 18;

    // Filled circle
    c.fillStyle = remapColor(theme, atom.color ?? '#4b5563');
    c.beginPath();
    c.arc(ax, ay, r, 0, Math.PI * 2);
    c.fill();

    // Symbol
    c.fillStyle = '#fff';
    c.font = 'bold 14px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(atom.symbol, ax, ay);

    // Charge
    if (atom.charge) {
      c.font = '10px sans-serif';
      c.fillText(atom.charge, ax + r - 4, ay - r + 6);
    }

    await ctx.sleep(50);
  }

  c.textAlign = 'start';
  c.textBaseline = 'alphabetic';

  // Label
  if (label) {
    c.font = theme.explainFont;
    c.fillStyle = remapColor(theme, theme.explainPen);
    c.fillText(label, ox, oy + 60);
  }

  c.restore();
  ctx.cursor.y = oy + 80;
  ctx.newline();
}

// ─── Reaction ────────────────────────────────────────────────────

export async function reactionOp(op: ReactionOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { reactants, products, conditions, reversible } = op.data;
  const y = ctx.cursor.y;
  const startX = ctx.marginX;

  c.save();
  c.font = theme.font;
  c.fillStyle = remapColor(theme, undefined);

  // Reactants
  let x = startX;
  for (let i = 0; i < reactants.length; i++) {
    if (i > 0) {
      c.fillStyle = remapColor(theme, theme.explainPen);
      c.fillText(' + ', x, y);
      x += c.measureText(' + ').width;
    }
    c.fillStyle = remapColor(theme, undefined);
    c.fillText(reactants[i]!, x, y);
    x += c.measureText(reactants[i]!).width;
    await ctx.sleep(40);
  }

  // Arrow
  const arrowX = x + 20;
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(arrowX, y - 4);
  c.lineTo(arrowX + 40, y - 4);
  c.lineTo(arrowX + 34, y - 10);
  c.moveTo(arrowX + 40, y - 4);
  c.lineTo(arrowX + 34, y + 2);
  c.stroke();

  if (reversible) {
    c.beginPath();
    c.moveTo(arrowX + 40, y + 4);
    c.lineTo(arrowX, y + 4);
    c.lineTo(arrowX + 6, y - 2);
    c.moveTo(arrowX, y + 4);
    c.lineTo(arrowX + 6, y + 10);
    c.stroke();
  }

  // Conditions above arrow
  if (conditions) {
    c.font = theme.explainFont;
    c.fillStyle = remapColor(theme, theme.explainPen);
    c.fillText(conditions, arrowX + 5, y - 16);
  }

  await ctx.sleep(100);

  // Products
  x = arrowX + 50;
  c.font = theme.font;
  for (let i = 0; i < products.length; i++) {
    if (i > 0) {
      c.fillStyle = remapColor(theme, theme.explainPen);
      c.fillText(' + ', x, y);
      x += c.measureText(' + ').width;
    }
    c.fillStyle = remapColor(theme, theme.answerPen);
    c.fillText(products[i]!, x, y);
    x += c.measureText(products[i]!).width;
    await ctx.sleep(40);
  }

  c.restore();
  ctx.newline();
}

// ─── Wave ────────────────────────────────────────────────────────

export async function waveOp(op: WaveOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { type, amplitude = 30, cycles = 3, color, label } = op.data;
  const w = Math.min(ctx.canvas.width - ctx.marginX * 2, 500);
  const x0 = ctx.marginX + 20;
  const y0 = ctx.cursor.y + amplitude + 20;

  c.save();
  c.strokeStyle = remapColor(theme, color ?? '#2563eb');
  c.lineWidth = 2.5;

  if (type === 'transverse') {
    // Sinusoidal wave drawn left to right
    const steps = 100;
    let prev: [number, number] | null = null;
    for (let i = 0; i <= steps; i++) {
      if (ctx.aborted) break;
      const t = (i / steps) * Math.PI * 2 * cycles;
      const px = x0 + (i / steps) * w;
      const py = y0 + Math.sin(t) * amplitude;
      if (prev) {
        c.beginPath();
        c.moveTo(prev[0], prev[1]);
        c.lineTo(px, py);
        c.stroke();
      }
      prev = [px, py];
      if (i % 4 === 0) await ctx.sleep(8);
    }

    // Baseline
    c.strokeStyle = remapColor(theme, '#888');
    c.lineWidth = 0.5;
    c.setLineDash([4, 4]);
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x0 + w, y0);
    c.stroke();
    c.setLineDash([]);

    // Amplitude arrow
    c.strokeStyle = remapColor(theme, theme.answerPen);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x0 + w / (cycles * 4), y0);
    c.lineTo(x0 + w / (cycles * 4), y0 - amplitude);
    c.stroke();
    c.fillStyle = remapColor(theme, theme.explainPen);
    c.font = theme.explainFont;
    c.fillText('A', x0 + w / (cycles * 4) + 4, y0 - amplitude / 2);

    // Wavelength bracket
    const wl = w / cycles;
    c.strokeStyle = remapColor(theme, theme.explainPen);
    c.beginPath();
    c.moveTo(x0, y0 + amplitude + 15);
    c.lineTo(x0 + wl, y0 + amplitude + 15);
    c.stroke();
    c.fillText('\u03BB', x0 + wl / 2 - 4, y0 + amplitude + 30);

  } else {
    // Longitudinal: compressions and rarefactions
    const dotCount = 60;
    for (let i = 0; i < dotCount; i++) {
      if (ctx.aborted) break;
      const t = (i / dotCount) * Math.PI * 2 * cycles;
      const compression = Math.sin(t);
      const spacing = 6 + compression * 4; // compressed vs expanded
      const px = x0 + (i / dotCount) * w;
      c.fillStyle = remapColor(theme, color ?? '#2563eb');
      c.globalAlpha = 0.5 + compression * 0.3;
      c.beginPath();
      c.arc(px, y0, 3, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
      if (i % 3 === 0) await ctx.sleep(10);
    }
    // Labels
    c.fillStyle = remapColor(theme, theme.explainPen);
    c.font = theme.explainFont;
    c.fillText('C', x0 + w / (cycles * 2), y0 + 20);
    c.fillText('R', x0 + w / (cycles * 2) + w / (cycles * 2), y0 + 20);
  }

  if (label) {
    c.fillStyle = remapColor(theme, theme.explainPen);
    c.font = theme.explainFont;
    c.fillText(label, x0, y0 + amplitude + 45);
  }

  c.restore();
  ctx.cursor.y = y0 + amplitude + 55;
  ctx.cursor.x = ctx.marginX;
}

// ─── Field Lines ─────────────────────────────────────────────────

export async function fieldOp(op: FieldOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { type, sources, lineCount = 8 } = op.data;
  const ox = ctx.marginX + 100;
  const oy = ctx.cursor.y + 80;

  c.save();

  // Draw sources
  for (const src of sources) {
    const sx = ox + src.x, sy = oy + src.y;
    const isPositive = src.charge === '+';
    c.fillStyle = remapColor(theme, isPositive ? '#ef4444' : '#60a5fa');
    c.beginPath();
    c.arc(sx, sy, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff';
    c.font = 'bold 14px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(src.charge ?? '', sx, sy);
    if (src.label) {
      c.fillStyle = remapColor(theme, theme.explainPen);
      c.font = theme.explainFont;
      c.fillText(src.label, sx - 10, sy + 24);
    }
    await ctx.sleep(60);
  }

  c.textAlign = 'start';
  c.textBaseline = 'alphabetic';

  // Draw field lines
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 1;

  for (const src of sources) {
    const sx = ox + src.x, sy = oy + src.y;
    const outward = src.charge !== '-';

    for (let i = 0; i < lineCount; i++) {
      if (ctx.aborted) break;
      const angle = (i / lineCount) * Math.PI * 2;
      const r1 = 14, r2 = 60;
      const x1 = sx + Math.cos(angle) * r1;
      const y1 = sy + Math.sin(angle) * r1;
      const x2 = sx + Math.cos(angle) * r2;
      const y2 = sy + Math.sin(angle) * r2;

      c.beginPath();
      c.moveTo(outward ? x1 : x2, outward ? y1 : y2);
      c.lineTo(outward ? x2 : x1, outward ? y2 : y1);
      c.stroke();

      // Arrow head
      const ax = outward ? x2 : x1;
      const ay = outward ? y2 : y1;
      const dir = outward ? 1 : -1;
      c.beginPath();
      c.moveTo(ax, ay);
      c.lineTo(ax - dir * Math.cos(angle - 0.3) * 8, ay - dir * Math.sin(angle - 0.3) * 8);
      c.moveTo(ax, ay);
      c.lineTo(ax - dir * Math.cos(angle + 0.3) * 8, ay - dir * Math.sin(angle + 0.3) * 8);
      c.stroke();

      await ctx.sleep(15);
    }
  }

  c.restore();
  ctx.cursor.y = oy + 100;
  ctx.cursor.x = ctx.marginX;
}

// ─── Labeled Diagram ─────────────────────────────────────────────

export async function diagramOp(op: DiagramOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { shape, center, size, parts, title } = op.data;
  const [cx, cy] = [ctx.marginX + center[0], ctx.cursor.y + center[1]];

  c.save();

  // Title
  if (title) {
    c.font = theme.titleFont;
    c.fillStyle = remapColor(theme, theme.defaultPen);
    c.fillText(title, ctx.marginX, ctx.cursor.y);
    await ctx.sleep(60);
  }

  // Draw base shape
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 2;

  if (shape === 'circle' || shape === 'cell') {
    c.beginPath();
    c.arc(cx, cy, size / 2, 0, Math.PI * 2);
    c.stroke();
    if (shape === 'cell') {
      // Nucleus
      c.beginPath();
      c.arc(cx - size / 6, cy, size / 5, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = remapColor(theme, theme.defaultPen);
      c.globalAlpha = 0.2;
      c.fill();
      c.globalAlpha = 1;
    }
  } else if (shape === 'rect') {
    c.strokeRect(cx - size / 2, cy - size / 3, size, size * 2 / 3);
  } else if (shape === 'triangle') {
    // Right triangle: A (bottom-left), B (bottom-right), C (top-right)
    const ax = cx - size / 2, ay = cy + size / 3;
    const bx = cx + size / 2, by = cy + size / 3;
    const tcx = cx + size / 2, tcy = cy - size / 2;
    c.beginPath();
    c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(tcx, tcy); c.closePath();
    c.stroke();
    // Right angle marker at B
    const rs = 12;
    c.beginPath(); c.moveTo(bx - rs, by); c.lineTo(bx - rs, by - rs); c.lineTo(bx, by - rs); c.stroke();
  } else if (shape === 'eye') {
    drawSymbol(c, 'eye', [cx, cy], size, theme);
  } else if (shape === 'heart') {
    drawSymbol(c, 'heart', [cx, cy], size, theme);
  } else if (shape === 'lung') {
    drawSymbol(c, 'lung', [cx, cy], size, theme);
  } else {
    // Default circle
    c.beginPath();
    c.arc(cx, cy, size / 2, 0, Math.PI * 2);
    c.stroke();
  }

  await ctx.sleep(100);

  // Draw callout labels with lines
  for (const part of parts) {
    if (ctx.aborted) break;
    const px = cx + part.x, py = cy + part.y;

    // Dot at the part location
    c.fillStyle = remapColor(theme, part.color ?? theme.answerPen);
    c.beginPath();
    c.arc(px, py, 3, 0, Math.PI * 2);
    c.fill();

    // Line to label position (extend outward)
    const dx = part.x, dy = part.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const labelX = px + (dx / dist) * 50;
    const labelY = py + (dy / dist) * 30;

    c.strokeStyle = remapColor(theme, '#888');
    c.lineWidth = 1;
    c.setLineDash([3, 3]);
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(labelX, labelY);
    c.stroke();
    c.setLineDash([]);

    // Label text
    c.font = theme.explainFont;
    c.fillStyle = remapColor(theme, part.color ?? theme.explainPen);
    c.fillText(part.label, labelX + 4, labelY + 4);

    await ctx.sleep(80);
  }

  c.restore();
  ctx.cursor.y = cy + size / 2 + 40;
  ctx.cursor.x = ctx.marginX;
}

// ─── Process Flow ────────────────────────────────────────────────

export async function processOp(op: ProcessOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { steps: procSteps, direction = 'horizontal', cyclic } = op.data;
  const isHoriz = direction === 'horizontal';
  const boxW = isHoriz ? 120 : 200;
  const boxH = isHoriz ? 50 : 40;
  const gap = isHoriz ? 40 : 20;
  const startX = ctx.marginX + 10;
  const startY = ctx.cursor.y + 10;

  c.save();

  for (let i = 0; i < procSteps.length; i++) {
    if (ctx.aborted) break;
    const step = procSteps[i]!;
    const bx = isHoriz ? startX + i * (boxW + gap) : startX;
    const by = isHoriz ? startY : startY + i * (boxH + gap);

    // Box
    c.fillStyle = remapColor(theme, step.color ?? theme.explainPen);
    c.globalAlpha = 0.15;
    c.fillRect(bx, by, boxW, boxH);
    c.globalAlpha = 1;
    c.strokeStyle = remapColor(theme, step.color ?? theme.explainPen);
    c.lineWidth = 1.5;
    c.strokeRect(bx, by, boxW, boxH);

    // Label
    c.fillStyle = remapColor(theme, theme.defaultPen);
    c.font = 'bold 13px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(step.label, bx + boxW / 2, by + boxH / 2);

    // Detail below
    if (step.detail) {
      c.font = theme.explainFont;
      c.fillStyle = remapColor(theme, theme.explainPen);
      const detailY = isHoriz ? by + boxH + 14 : by + boxH / 2;
      c.fillText(step.detail, bx + boxW / 2, detailY);
    }

    // Arrow to next
    if (i < procSteps.length - 1 || cyclic) {
      const nextI = (i + 1) % procSteps.length;
      c.strokeStyle = remapColor(theme, theme.defaultPen);
      c.lineWidth = 1.5;

      if (isHoriz) {
        const ax = bx + boxW + 4;
        const ay = by + boxH / 2;
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(ax + gap - 8, ay);
        c.lineTo(ax + gap - 14, ay - 5);
        c.moveTo(ax + gap - 8, ay);
        c.lineTo(ax + gap - 14, ay + 5);
        c.stroke();
      } else {
        const ax = bx + boxW / 2;
        const ay = by + boxH + 4;
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(ax, ay + gap - 8);
        c.lineTo(ax - 5, ay + gap - 14);
        c.moveTo(ax, ay + gap - 8);
        c.lineTo(ax + 5, ay + gap - 14);
        c.stroke();
      }
    }

    c.textAlign = 'start';
    c.textBaseline = 'alphabetic';

    await ctx.sleep(100);
  }

  c.restore();
  const totalH = isHoriz ? boxH + 40 : procSteps.length * (boxH + gap);
  ctx.cursor.y = startY + totalH + 10;
  ctx.cursor.x = ctx.marginX;
}

// ─── Circuit ─────────────────────────────────────────────────────

export async function circuitOp(op: CircuitOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { components, current } = op.data;
  const ox = ctx.marginX;
  const oy = ctx.cursor.y;

  c.save();
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 2;

  for (const comp of components) {
    if (ctx.aborted) break;
    const [fx, fy] = [ox + comp.from[0], oy + comp.from[1]];
    const [tx, ty] = [ox + comp.to[0], oy + comp.to[1]];
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;

    if (comp.type === 'wire') {
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(tx, ty);
      c.stroke();
    } else if (comp.type === 'battery') {
      // Wire to middle, battery symbol, wire out
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(mx - 10, my); c.stroke();
      drawSymbol(c, 'battery', [mx, my], 20, theme);
      c.beginPath(); c.moveTo(mx + 10, my); c.lineTo(tx, ty); c.stroke();
    } else if (comp.type === 'bulb') {
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(mx - 12, my); c.stroke();
      drawSymbol(c, 'bulb', [mx, my], 20, theme);
      c.beginPath(); c.moveTo(mx + 12, my); c.lineTo(tx, ty); c.stroke();
    } else if (comp.type === 'resistor') {
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(mx - 15, my); c.stroke();
      drawSymbol(c, 'resistor', [mx, my], 30, theme);
      c.beginPath(); c.moveTo(mx + 15, my); c.lineTo(tx, ty); c.stroke();
    } else if (comp.type === 'switch') {
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(mx - 10, my); c.stroke();
      // Open switch
      c.beginPath(); c.arc(mx - 10, my, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(mx - 10, my); c.lineTo(mx + 10, my - 12); c.stroke();
      c.beginPath(); c.arc(mx + 10, my, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(mx + 10, my); c.lineTo(tx, ty); c.stroke();
    } else if (comp.type === 'ammeter' || comp.type === 'voltmeter') {
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(mx - 12, my); c.stroke();
      c.beginPath(); c.arc(mx, my, 12, 0, Math.PI * 2); c.stroke();
      c.font = 'bold 12px sans-serif';
      c.fillStyle = remapColor(theme, theme.defaultPen);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(comp.type === 'ammeter' ? 'A' : 'V', mx, my);
      c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      c.beginPath(); c.moveTo(mx + 12, my); c.lineTo(tx, ty); c.stroke();
    }

    // Label
    if (comp.label) {
      c.font = theme.explainFont;
      c.fillStyle = remapColor(theme, theme.explainPen);
      c.fillText(comp.label, mx - 10, my + 24);
    }

    await ctx.sleep(80);
  }

  // Animated current flow
  if (current && components.length > 0) {
    c.fillStyle = remapColor(theme, '#fbbf24');
    for (let frame = 0; frame < 20; frame++) {
      if (ctx.aborted) break;
      for (const comp of components) {
        if (comp.type !== 'wire') continue;
        const [fx, fy] = [ox + comp.from[0], oy + comp.from[1]];
        const [tx, ty] = [ox + comp.to[0], oy + comp.to[1]];
        const t = ((frame * 0.1) % 1);
        const px = fx + (tx - fx) * t;
        const py = fy + (ty - fy) * t;
        c.beginPath();
        c.arc(px, py, 3, 0, Math.PI * 2);
        c.fill();
      }
      await ctx.sleep(50);
    }
  }

  c.restore();

  // Calculate bottom extent
  let maxY = oy;
  for (const comp of components) {
    maxY = Math.max(maxY, oy + comp.from[1], oy + comp.to[1]);
  }
  ctx.cursor.y = maxY + 40;
  ctx.cursor.x = ctx.marginX;
}
