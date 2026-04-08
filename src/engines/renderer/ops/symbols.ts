import type { SymbolOp } from '@core/types/op.js';
import type { RenderContext, TargetBounds } from '../state.js';
import { remapColor, type Theme } from '../theme.js';

/**
 * Symbol library — canonical drawings for reusable objects
 * (battery, bulb, atom, etc). New symbols live here, not in content.
 * Every subject gets them for free.
 */
export async function symbolOp(op: SymbolOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const size = op.data.size ?? 40;
  const [x, y] = op.data.at;
  drawSymbol(c, op.data.kind, [x, y], size, theme);
  if (op.data.label) {
    c.save();
    c.fillStyle = remapColor(theme, theme.defaultPen);
    c.font = theme.explainFont;
    c.fillText(op.data.label, x - size / 2, y + size + 16);
    c.restore();
  }
  const bounds: TargetBounds = { x: x - size, y: y - size, w: size * 2, h: size * 2 };
  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, bounds);
  ctx.lastTargetId = id;
  await ctx.sleep(80);
}

export function drawSymbol(c: CanvasRenderingContext2D, kind: string, at: [number, number], size: number, theme: Theme): void {
  const [x, y] = at;
  const s = size;
  c.save();
  c.strokeStyle = remapColor(theme, theme.defaultPen);
  c.fillStyle = remapColor(theme, theme.defaultPen);
  c.lineWidth = 2;
  c.lineCap = 'round';
  switch (kind) {
    case 'battery': {
      // Two vertical plates
      c.beginPath();
      c.moveTo(x - s / 4, y - s / 2); c.lineTo(x - s / 4, y + s / 2);
      c.moveTo(x + s / 4, y - s / 3); c.lineTo(x + s / 4, y + s / 3);
      c.stroke();
      c.font = `bold ${Math.round(s / 3)}px sans-serif`;
      c.fillText('+', x - s / 4 - s / 2, y - s / 2 - 4);
      c.fillText('−', x + s / 4 + 6, y - s / 3 - 4);
      break;
    }
    case 'bulb': {
      c.beginPath();
      c.arc(x, y, s / 2, 0, Math.PI * 2);
      c.stroke();
      // Cross inside
      c.beginPath();
      c.moveTo(x - s / 3, y - s / 3); c.lineTo(x + s / 3, y + s / 3);
      c.moveTo(x + s / 3, y - s / 3); c.lineTo(x - s / 3, y + s / 3);
      c.stroke();
      break;
    }
    case 'resistor': {
      // Zigzag
      c.beginPath();
      const steps = 6;
      const w = s;
      for (let i = 0; i <= steps; i++) {
        const px = x - w / 2 + (i / steps) * w;
        const py = y + (i % 2 === 0 ? -s / 4 : s / 4);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      break;
    }
    case 'atom': {
      // Nucleus
      c.beginPath();
      c.arc(x, y, s / 6, 0, Math.PI * 2);
      c.fill();
      // 3 orbits
      for (const angle of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.beginPath();
        c.ellipse(0, 0, s / 2, s / 5, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
      break;
    }
    case 'cell': {
      // Round cell with nucleus
      c.beginPath();
      c.arc(x, y, s / 2, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(x, y, s / 5, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'magnet': {
      // U-shape
      c.beginPath();
      c.moveTo(x - s / 2, y - s / 2);
      c.lineTo(x - s / 2, y + s / 3);
      c.arc(x, y + s / 3, s / 2, Math.PI, 0, false);
      c.lineTo(x + s / 2, y - s / 2);
      c.stroke();
      c.font = `bold ${Math.round(s / 4)}px sans-serif`;
      c.fillText('N', x - s / 2 - 4, y - s / 2 - 4);
      c.fillText('S', x + s / 4, y - s / 2 - 4);
      break;
    }
    case 'spring': {
      c.beginPath();
      const coils = 6;
      const w = s;
      for (let i = 0; i <= coils * 2; i++) {
        const t = i / (coils * 2);
        const px = x - w / 2 + t * w;
        const py = y + Math.sin(i * Math.PI) * s / 5;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      break;
    }
    case 'gear': {
      // Outer circle with teeth
      const teeth = 10;
      c.beginPath();
      for (let i = 0; i <= teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? s / 2 : s / 2.5;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath();
      c.stroke();
      // Inner circle
      c.beginPath();
      c.arc(x, y, s / 5, 0, Math.PI * 2);
      c.stroke();
      break;
    }
    case 'arrow-big': {
      c.beginPath();
      c.moveTo(x - s / 2, y);
      c.lineTo(x + s / 2, y);
      c.lineTo(x + s / 4, y - s / 3);
      c.moveTo(x + s / 2, y);
      c.lineTo(x + s / 4, y + s / 3);
      c.stroke();
      break;
    }
    // ─── Physics ─────────────────────────────────────────────
    case 'electron': {
      c.fillStyle = remapColor(theme, '#60a5fa');
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = remapColor(theme, '#fff');
      c.font = `bold ${Math.round(s / 3)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('e\u207B', x, y); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'proton': {
      c.fillStyle = remapColor(theme, '#ef4444');
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = remapColor(theme, '#fff');
      c.font = `bold ${Math.round(s / 3)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('p\u207A', x, y); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'neutron': {
      c.fillStyle = remapColor(theme, '#888');
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = remapColor(theme, '#fff');
      c.font = `bold ${Math.round(s / 3)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('n', x, y); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'wave-pulse': {
      c.beginPath();
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 4;
        const px = x - s + (i / 40) * s * 2;
        const py = y + Math.sin(t) * s / 3;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      break;
    }
    case 'lens-convex': {
      c.beginPath();
      c.ellipse(x, y, s / 6, s / 2, 0, 0, Math.PI * 2);
      c.stroke();
      break;
    }
    case 'lens-concave': {
      c.beginPath();
      c.moveTo(x, y - s / 2); c.bezierCurveTo(x - s / 4, y - s / 4, x - s / 4, y + s / 4, x, y + s / 2);
      c.moveTo(x, y - s / 2); c.bezierCurveTo(x + s / 4, y - s / 4, x + s / 4, y + s / 4, x, y + s / 2);
      c.stroke();
      break;
    }
    case 'mirror': {
      c.beginPath();
      c.moveTo(x, y - s / 2); c.lineTo(x, y + s / 2);
      c.stroke();
      // Hatch marks
      for (let i = -3; i <= 3; i++) {
        c.beginPath();
        const py = y + (i * s) / 8;
        c.moveTo(x, py); c.lineTo(x + s / 6, py + s / 8);
        c.stroke();
      }
      break;
    }
    case 'prism': {
      c.beginPath();
      c.moveTo(x, y - s / 2);
      c.lineTo(x - s / 2, y + s / 3);
      c.lineTo(x + s / 2, y + s / 3);
      c.closePath();
      c.stroke();
      break;
    }
    case 'pendulum': {
      c.beginPath();
      c.moveTo(x, y - s / 2); c.lineTo(x + s / 4, y + s / 4);
      c.stroke();
      c.beginPath(); c.arc(x + s / 4, y + s / 4, s / 6, 0, Math.PI * 2); c.fill();
      // Pivot
      c.beginPath(); c.arc(x, y - s / 2, 3, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'pulley': {
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
      // Rope
      c.beginPath(); c.moveTo(x - s / 3, y); c.lineTo(x - s / 3, y + s / 2); c.stroke();
      c.beginPath(); c.moveTo(x + s / 3, y); c.lineTo(x + s / 3, y + s / 2); c.stroke();
      break;
    }
    // ─── Chemistry ───────────────────────────────────────────
    case 'beaker': {
      c.beginPath();
      c.moveTo(x - s / 3, y - s / 2); c.lineTo(x - s / 3, y + s / 3);
      c.lineTo(x + s / 3, y + s / 3); c.lineTo(x + s / 3, y - s / 2);
      c.stroke();
      // Spout
      c.beginPath(); c.moveTo(x + s / 3, y - s / 2); c.lineTo(x + s / 2, y - s / 2 + s / 6); c.stroke();
      // Liquid level
      c.fillStyle = remapColor(theme, '#60a5fa'); c.globalAlpha = 0.3;
      c.fillRect(x - s / 3 + 1, y, s * 2 / 3 - 2, s / 3);
      c.globalAlpha = 1;
      break;
    }
    case 'flask': {
      c.beginPath();
      c.moveTo(x - s / 6, y - s / 2); c.lineTo(x - s / 6, y - s / 6);
      c.lineTo(x - s / 2, y + s / 3); c.lineTo(x + s / 2, y + s / 3);
      c.lineTo(x + s / 6, y - s / 6); c.lineTo(x + s / 6, y - s / 2);
      c.stroke();
      break;
    }
    case 'test-tube': {
      c.beginPath();
      c.moveTo(x - s / 6, y - s / 2); c.lineTo(x - s / 6, y + s / 4);
      c.arc(x, y + s / 4, s / 6, Math.PI, 0, false);
      c.lineTo(x + s / 6, y - s / 2);
      c.stroke();
      break;
    }
    case 'bunsen': {
      // Base
      c.beginPath();
      c.moveTo(x - s / 3, y + s / 3); c.lineTo(x + s / 3, y + s / 3);
      c.stroke();
      // Tube
      c.beginPath();
      c.moveTo(x - s / 8, y + s / 3); c.lineTo(x - s / 8, y - s / 4);
      c.lineTo(x + s / 8, y - s / 4); c.lineTo(x + s / 8, y + s / 3);
      c.stroke();
      // Flame
      c.fillStyle = remapColor(theme, '#fbbf24');
      c.beginPath();
      c.moveTo(x, y - s / 2); c.quadraticCurveTo(x - s / 5, y - s / 3, x, y - s / 4);
      c.quadraticCurveTo(x + s / 5, y - s / 3, x, y - s / 2);
      c.fill();
      break;
    }
    case 'molecule-h2o': {
      // O center, H on sides
      c.fillStyle = remapColor(theme, '#ef4444');
      c.beginPath(); c.arc(x, y, s / 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = remapColor(theme, '#60a5fa');
      c.beginPath(); c.arc(x - s / 2.5, y + s / 4, s / 6, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + s / 2.5, y + s / 4, s / 6, 0, Math.PI * 2); c.fill();
      // Bonds
      c.beginPath(); c.moveTo(x - s / 5, y + s / 8); c.lineTo(x - s / 3, y + s / 5); c.stroke();
      c.beginPath(); c.moveTo(x + s / 5, y + s / 8); c.lineTo(x + s / 3, y + s / 5); c.stroke();
      // Labels
      c.fillStyle = remapColor(theme, '#fff'); c.font = `bold ${Math.round(s / 5)}px sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('O', x, y); c.fillText('H', x - s / 2.5, y + s / 4); c.fillText('H', x + s / 2.5, y + s / 4);
      c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'molecule-co2': {
      // O=C=O linear
      c.fillStyle = remapColor(theme, '#333');
      c.beginPath(); c.arc(x, y, s / 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = remapColor(theme, '#ef4444');
      c.beginPath(); c.arc(x - s / 2, y, s / 5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + s / 2, y, s / 5, 0, Math.PI * 2); c.fill();
      // Double bonds
      c.beginPath(); c.moveTo(x - s / 4, y - 3); c.lineTo(x - s / 3, y - 3); c.moveTo(x - s / 4, y + 3); c.lineTo(x - s / 3, y + 3); c.stroke();
      c.beginPath(); c.moveTo(x + s / 4, y - 3); c.lineTo(x + s / 3, y - 3); c.moveTo(x + s / 4, y + 3); c.lineTo(x + s / 3, y + 3); c.stroke();
      c.fillStyle = remapColor(theme, '#fff'); c.font = `bold ${Math.round(s / 5)}px sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('C', x, y); c.fillText('O', x - s / 2, y); c.fillText('O', x + s / 2, y);
      c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'ion-positive': {
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.stroke();
      c.font = `bold ${Math.round(s / 2.5)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('+', x, y); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    case 'ion-negative': {
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.stroke();
      c.font = `bold ${Math.round(s / 2.5)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('\u2212', x, y); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
      break;
    }
    // ─── Biology ─────────────────────────────────────────────
    case 'dna': {
      c.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * Math.PI * 3;
        const px = x + Math.sin(t) * s / 4;
        const py = y - s / 2 + (i / 30) * s;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      c.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * Math.PI * 3 + Math.PI;
        const px = x + Math.sin(t) * s / 4;
        const py = y - s / 2 + (i / 30) * s;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      // Rungs
      for (let i = 2; i <= 28; i += 4) {
        const t = (i / 30) * Math.PI * 3;
        const px1 = x + Math.sin(t) * s / 4;
        const px2 = x + Math.sin(t + Math.PI) * s / 4;
        const py = y - s / 2 + (i / 30) * s;
        c.beginPath(); c.moveTo(px1, py); c.lineTo(px2, py); c.stroke();
      }
      break;
    }
    case 'mitochondria': {
      c.beginPath(); c.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2); c.stroke();
      // Inner membrane folds
      for (let i = 0; i < 4; i++) {
        const fx = x - s / 3 + (i * s) / 5;
        c.beginPath(); c.moveTo(fx, y - s / 4); c.lineTo(fx + s / 10, y + s / 6); c.stroke();
      }
      break;
    }
    case 'chloroplast': {
      c.fillStyle = remapColor(theme, '#22c55e'); c.globalAlpha = 0.3;
      c.beginPath(); c.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      c.beginPath(); c.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2); c.stroke();
      // Thylakoid stacks
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.ellipse(x + i * s / 8, y, s / 10, s / 5, 0, 0, Math.PI * 2); c.stroke();
      }
      break;
    }
    case 'red-blood-cell': {
      c.fillStyle = remapColor(theme, '#ef4444'); c.globalAlpha = 0.4;
      c.beginPath(); c.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      c.beginPath(); c.ellipse(x, y, s / 2, s / 3, 0, 0, Math.PI * 2); c.stroke();
      // Biconcave dimple
      c.beginPath(); c.ellipse(x, y, s / 5, s / 8, 0, 0, Math.PI * 2); c.stroke();
      break;
    }
    case 'neuron': {
      // Cell body
      c.beginPath(); c.arc(x, y, s / 4, 0, Math.PI * 2); c.fill();
      // Axon
      c.beginPath(); c.moveTo(x + s / 4, y); c.lineTo(x + s, y); c.stroke();
      // Dendrites
      for (const a of [-0.6, -0.3, 0, 0.3, 0.6]) {
        c.beginPath(); c.moveTo(x - s / 4, y);
        c.lineTo(x - s / 2, y + Math.sin(a) * s / 3);
        c.stroke();
      }
      // Axon terminal
      c.beginPath(); c.arc(x + s, y, s / 8, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'heart': {
      c.fillStyle = remapColor(theme, '#ef4444');
      c.beginPath();
      c.moveTo(x, y + s / 3);
      c.bezierCurveTo(x - s / 2, y, x - s / 2, y - s / 3, x, y - s / 6);
      c.bezierCurveTo(x + s / 2, y - s / 3, x + s / 2, y, x, y + s / 3);
      c.fill();
      break;
    }
    case 'lung': {
      // Two lobes
      c.beginPath(); c.ellipse(x - s / 4, y, s / 4, s / 2.5, 0, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.ellipse(x + s / 4, y, s / 4, s / 2.5, 0, 0, Math.PI * 2); c.stroke();
      // Trachea
      c.beginPath(); c.moveTo(x, y - s / 2); c.lineTo(x, y - s / 4);
      c.moveTo(x, y - s / 4); c.lineTo(x - s / 4, y - s / 8);
      c.moveTo(x, y - s / 4); c.lineTo(x + s / 4, y - s / 8);
      c.stroke();
      break;
    }
    case 'eye': {
      // Eye shape
      c.beginPath();
      c.moveTo(x - s / 2, y);
      c.quadraticCurveTo(x, y - s / 3, x + s / 2, y);
      c.quadraticCurveTo(x, y + s / 3, x - s / 2, y);
      c.stroke();
      // Iris
      c.beginPath(); c.arc(x, y, s / 5, 0, Math.PI * 2); c.stroke();
      // Pupil
      c.beginPath(); c.arc(x, y, s / 10, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'bacteria': {
      c.beginPath();
      c.ellipse(x, y, s / 2.5, s / 4, 0, 0, Math.PI * 2);
      c.stroke();
      // Flagella
      c.beginPath();
      for (let i = 0; i <= 10; i++) {
        const px = x + s / 2.5 + (i / 10) * s / 3;
        const py = y + Math.sin(i * Math.PI) * s / 10;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      break;
    }
    case 'virus': {
      // Icosahedral shape approximation
      c.beginPath(); c.arc(x, y, s / 3, 0, Math.PI * 2); c.stroke();
      // Spikes
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        c.beginPath();
        c.moveTo(x + Math.cos(angle) * s / 3, y + Math.sin(angle) * s / 3);
        c.lineTo(x + Math.cos(angle) * s / 2, y + Math.sin(angle) * s / 2);
        c.stroke();
        c.beginPath();
        c.arc(x + Math.cos(angle) * s / 2, y + Math.sin(angle) * s / 2, 2, 0, Math.PI * 2);
        c.fill();
      }
      break;
    }
  }
  c.restore();
}
