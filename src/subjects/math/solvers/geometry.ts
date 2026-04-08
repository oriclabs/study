/**
 * Geometry solver — area, perimeter, circumference, volume, surface area.
 * Natural language input: "area of circle radius 5", "perimeter of rectangle 4 by 6"
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';
import type { Problem } from '@core/types/strategy.js';

function writeOp(text: string, variant?: 'explain' | 'answer'): Op {
  return variant ? { op: 'write', style: { variant }, data: { text } } : { op: 'write', data: { text } };
}
function txOp(from: string, to: string, operation: string): Op {
  return { op: 'transform', data: { from, to, operation, strikeSource: true } };
}
function step(id: string, kind: Step['kind'], ops: Op[], wait?: number): Step {
  return { id, kind, ops, ...(wait ? { waitAfterMs: wait } : {}) };
}
function mOp(expr: string, variant?: 'default' | 'answer' | 'explain'): Op {
  return { op: 'math', data: { expr, variant } };
}
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

/** Create an "Identify values" explain step. */
function identifyStep(id: string, vars: Record<string, number>): Step {
  const text = 'Identify: ' + Object.entries(vars).map(([k, v]) => `${k} = ${fmt(v)}`).join(', ');
  return step(id, 'explain', [writeOp(text, 'explain')], 200);
}

export function solveGeometry(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const measure = inputs.measure as string;
  const shape = inputs.shape as string;

  const steps: Step[] = [];
  steps.push(step('s1', 'work', [writeOp(problem.rawInput)], 400));

  switch (`${measure}-${shape}`) {
    case 'area-circle': {
      const r = inputs.radius as number;
      const area = Math.PI * r * r;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('pi * r^2')]));
      steps.push(identifyStep('s2b', { r }));
      steps.push(step('s3', 'work', [txOp(`A = \u03C0 \u00D7 ${r}\u00B2`, `A = \u03C0 \u00D7 ${r * r}`, `${r}\u00B2 = ${r * r}`)]));
      steps.push(step('s4', 'work', [txOp(`A = \u03C0 \u00D7 ${r * r}`, `A = ${fmt(area)}`, 'multiply by \u03C0')]));
      steps.push(step('s5', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      // Draw circle
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'circle' as const, center: [150, 60] as [number, number], size: Math.min(120, r * 20), parts: [{ x: 0, y: 0, label: `r = ${fmt(r)}` }] },
      }]));
      break;
    }
    case 'circumference-circle':
    case 'perimeter-circle': {
      const r = inputs.radius as number;
      const c = 2 * Math.PI * r;
      steps.push(step('s2', 'explain', [writeOp('Formula: C = 2\u03C0r', 'explain')]));
      steps.push(identifyStep('s2b', { r }));
      steps.push(step('s3', 'work', [txOp(`C = 2 \u00D7 \u03C0 \u00D7 ${r}`, `C = ${fmt(c)}`, 'compute')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Circumference = ${fmt(c)} units`, 'answer')]));
      break;
    }
    case 'area-rectangle': {
      const l = inputs.length as number;
      const w = inputs.width as number;
      const area = l * w;
      steps.push(step('s2', 'explain', [writeOp('Formula: A = length \u00D7 width', 'explain')]));
      steps.push(identifyStep('s2b', { length: l, width: w }));
      steps.push(step('s3', 'work', [txOp(`A = ${l} \u00D7 ${w}`, `A = ${fmt(area)}`, 'multiply')]));
      steps.push(step('s4', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'rect' as const, center: [150, 50] as [number, number], size: 100, parts: [{ x: 0, y: 50, label: `${fmt(l)} \u00D7 ${fmt(w)}` }] },
      }]));
      break;
    }
    case 'perimeter-rectangle': {
      const l = inputs.length as number;
      const w = inputs.width as number;
      const p = 2 * (l + w);
      steps.push(step('s2', 'explain', [writeOp('Formula: P = 2(l + w)', 'explain')]));
      steps.push(identifyStep('s2b', { l, w }));
      steps.push(step('s3', 'work', [txOp(`P = 2(${l} + ${w})`, `P = 2 \u00D7 ${l + w}`, 'add')]));
      steps.push(step('s4', 'work', [txOp(`P = 2 \u00D7 ${l + w}`, `P = ${fmt(p)}`, 'multiply')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Perimeter = ${fmt(p)} units`, 'answer')]));
      break;
    }
    case 'area-triangle': {
      const b = inputs.base as number;
      const h = inputs.height as number;
      const area = 0.5 * b * h;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('(1/2) * base * height')]));
      steps.push(identifyStep('s2b', { base: b, height: h }));
      steps.push(step('s3', 'work', [txOp(`A = \u00BD \u00D7 ${b} \u00D7 ${h}`, `A = \u00BD \u00D7 ${b * h}`, 'multiply base \u00D7 height')]));
      steps.push(step('s4', 'work', [txOp(`A = \u00BD \u00D7 ${b * h}`, `A = ${fmt(area)}`, 'halve')]));
      steps.push(step('s5', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'triangle' as const, center: [150, 60] as [number, number], size: 120, parts: [{ x: 0, y: 55, label: `base=${fmt(b)}, h=${fmt(h)}` }] },
      }]));
      break;
    }
    case 'area-square': {
      const s = inputs.side as number;
      const area = s * s;
      steps.push(step('s2', 'explain', [writeOp('Formula: A = side\u00B2', 'explain')]));
      steps.push(identifyStep('s2b', { side: s }));
      steps.push(step('s3', 'work', [txOp(`A = ${s}\u00B2`, `A = ${fmt(area)}`, `${s} \u00D7 ${s}`)]));
      steps.push(step('s4', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'rect' as const, center: [150, 50] as [number, number], size: 80, parts: [{ x: 0, y: 45, label: `side = ${fmt(s)}` }] },
      }]));
      break;
    }
    case 'perimeter-square': {
      const s = inputs.side as number;
      const p = 4 * s;
      steps.push(step('s2', 'explain', [writeOp('Formula: P = 4 \u00D7 side', 'explain')]));
      steps.push(identifyStep('s2b', { side: s }));
      steps.push(step('s3', 'work', [txOp(`P = 4 \u00D7 ${s}`, `P = ${fmt(p)}`, 'multiply')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Perimeter = ${fmt(p)} units`, 'answer')]));
      break;
    }
    case 'volume-cube': {
      const s = inputs.side as number;
      const v = s * s * s;
      steps.push(step('s2', 'explain', [writeOp('Formula: V = side\u00B3', 'explain')]));
      steps.push(identifyStep('s2b', { side: s }));
      steps.push(step('s3', 'work', [txOp(`V = ${s}\u00B3`, `V = ${fmt(v)}`, `${s}\u00D7${s}\u00D7${s}`)]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Volume = ${fmt(v)} cubic units`, 'answer')]));
      break;
    }
    case 'volume-sphere': {
      const r = inputs.radius as number;
      const v = (4 / 3) * Math.PI * r * r * r;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('(4/3) * pi * r^3')]));
      steps.push(identifyStep('s2b', { r }));
      steps.push(step('s3', 'work', [txOp(`V = (4/3) \u00D7 \u03C0 \u00D7 ${r}\u00B3`, `V = (4/3) \u00D7 \u03C0 \u00D7 ${r * r * r}`, `${r}\u00B3 = ${r * r * r}`)]));
      steps.push(step('s4', 'work', [txOp(`V = (4/3) \u00D7 \u03C0 \u00D7 ${r * r * r}`, `V = ${fmt(v)}`, 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Volume = ${fmt(v)} cubic units`, 'answer')]));
      break;
    }
    case 'volume-cylinder': {
      const r = inputs.radius as number;
      const h = inputs.height as number;
      const v = Math.PI * r * r * h;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('pi * r^2 * h')]));
      steps.push(identifyStep('s2b', { r, h }));
      steps.push(step('s3', 'work', [txOp(`V = \u03C0 \u00D7 ${r}\u00B2 \u00D7 ${h}`, `V = \u03C0 \u00D7 ${r * r} \u00D7 ${h}`, `${r}\u00B2 = ${r * r}`)]));
      steps.push(step('s4', 'work', [txOp(`V = \u03C0 \u00D7 ${r * r} \u00D7 ${h}`, `V = ${fmt(v)}`, 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Volume = ${fmt(v)} cubic units`, 'answer')]));
      break;
    }
    case 'volume-cone': {
      const r = inputs.radius as number;
      const h = inputs.height as number;
      const v = (1 / 3) * Math.PI * r * r * h;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('(1/3) * pi * r^2 * h')]));
      steps.push(identifyStep('s2b', { r, h }));
      steps.push(step('s3', 'work', [txOp(`V = (1/3) \u00D7 \u03C0 \u00D7 ${r}\u00B2 \u00D7 ${h}`, `V = ${fmt(v)}`, 'compute')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Volume = ${fmt(v)} cubic units`, 'answer')]));
      break;
    }
    case 'area-trapezoid':
    case 'area-trapezium': {
      const a = inputs.a as number;
      const b = inputs.b as number;
      const h = inputs.height as number;
      const area = 0.5 * (a + b) * h;
      steps.push(step('s2', 'explain', [writeOp('Formula: A = \u00BD(a + b) \u00D7 h', 'explain')]));
      steps.push(identifyStep('s2b', { a, b, h }));
      steps.push(step('s3', 'work', [txOp(`A = \u00BD(${a} + ${b}) \u00D7 ${h}`, `A = \u00BD \u00D7 ${a + b} \u00D7 ${h}`, 'add parallel sides')]));
      steps.push(step('s4', 'work', [txOp(`A = \u00BD \u00D7 ${a + b} \u00D7 ${h}`, `A = ${fmt(area)}`, 'compute')]));
      steps.push(step('s5', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      break;
    }
    case 'area-parallelogram': {
      const b = inputs.base as number;
      const h = inputs.height as number;
      const area = b * h;
      steps.push(step('s2', 'explain', [writeOp('Formula: A = base \u00D7 height', 'explain')]));
      steps.push(identifyStep('s2b', { base: b, height: h }));
      steps.push(step('s3', 'work', [txOp(`A = ${b} \u00D7 ${h}`, `A = ${fmt(area)}`, 'multiply')]));
      steps.push(step('s4', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'rect' as const, center: [150, 50] as [number, number], size: 100, parts: [{ x: 0, y: 50, label: `base=${fmt(b)}, h=${fmt(h)}` }] },
      }]));
      break;
    }
    case 'area-rhombus': {
      const d1 = inputs.d1 as number;
      const d2 = inputs.d2 as number;
      const area = (d1 * d2) / 2;
      steps.push(step('s2', 'explain', [writeOp('Formula: A = \u00BD \u00D7 d\u2081 \u00D7 d\u2082', 'explain')]));
      steps.push(identifyStep('s2b', { d1, d2 }));
      steps.push(step('s3', 'work', [txOp(`A = \u00BD \u00D7 ${d1} \u00D7 ${d2}`, `A = \u00BD \u00D7 ${d1 * d2}`, 'multiply diagonals')]));
      steps.push(step('s4', 'work', [txOp(`A = \u00BD \u00D7 ${d1 * d2}`, `A = ${fmt(area)}`, 'halve')]));
      steps.push(step('s5', 'checkpoint', [mOp(`A = ${fmt(area)}`, 'answer'), writeOp('square units', 'explain')]));
      break;
    }
    case 'perimeter-triangle': {
      const a = inputs.a as number;
      const b = inputs.b as number;
      const c = inputs.c as number;
      const p = a + b + c;
      steps.push(step('s2', 'explain', [writeOp('Formula: P = a + b + c', 'explain')]));
      steps.push(identifyStep('s2b', { a, b, c }));
      steps.push(step('s3', 'work', [txOp(`P = ${a} + ${b} + ${c}`, `P = ${fmt(p)}`, 'add all sides')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Perimeter = ${fmt(p)} units`, 'answer')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'triangle' as const, center: [150, 60] as [number, number], size: 120, parts: [{ x: -50, y: -10, label: `a=${fmt(a)}` }, { x: 50, y: -10, label: `b=${fmt(b)}` }, { x: 0, y: 55, label: `c=${fmt(c)}` }] },
      }]));
      break;
    }
    case 'surface-area-cube': {
      const s = inputs.side as number;
      const sa = 6 * s * s;
      steps.push(step('s2', 'explain', [writeOp('Formula: SA = 6 \u00D7 side\u00B2', 'explain')]));
      steps.push(identifyStep('s2b', { side: s }));
      steps.push(step('s3', 'work', [txOp(`SA = 6 \u00D7 ${s}\u00B2`, `SA = 6 \u00D7 ${s * s} = ${fmt(sa)}`, 'compute')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Surface area = ${fmt(sa)} square units`, 'answer')]));
      break;
    }
    case 'surface-area-sphere': {
      const r = inputs.radius as number;
      const sa = 4 * Math.PI * r * r;
      steps.push(step('s2', 'explain', [writeOp('Formula: SA = 4\u03C0r\u00B2', 'explain')]));
      steps.push(identifyStep('s2b', { r }));
      steps.push(step('s3', 'work', [txOp(`SA = 4 \u00D7 \u03C0 \u00D7 ${r}\u00B2`, `SA = 4 \u00D7 \u03C0 \u00D7 ${r * r} = ${fmt(sa)}`, 'compute')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Surface area = ${fmt(sa)} square units`, 'answer')]));
      break;
    }
    case 'area-sector': {
      const r = inputs.radius as number;
      const angle = inputs.angle as number;
      const area = (angle / 360) * Math.PI * r * r;
      steps.push(step('s2', 'explain', [writeOp('Formula:', 'explain'), mOp('(theta/360) * pi * r^2')]));
      steps.push(identifyStep('s2b', { r, '\u03B8': angle }));
      steps.push(step('s3', 'work', [txOp(`A = (${angle}/360) \u00D7 \u03C0 \u00D7 ${r}\u00B2`, `A = ${fmt(angle / 360)} \u00D7 \u03C0 \u00D7 ${r * r}`, 'substitute')]));
      steps.push(step('s4', 'work', [txOp(`A = ${fmt(angle / 360)} \u00D7 ${fmt(Math.PI * r * r)}`, `A = ${fmt(area)}`, 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Sector area = ${fmt(area)} square units`, 'answer')]));
      steps.push(step('s_draw', 'visual', [{
        op: 'diagram', data: { shape: 'circle' as const, center: [150, 60] as [number, number], size: 120, parts: [{ x: 0, y: 0, label: `r=${fmt(r)}, \u03B8=${angle}\u00B0` }] },
      }]));
      break;
    }
    case 'arc-length-sector': {
      const r = inputs.radius as number;
      const angle = inputs.angle as number;
      const len = (angle / 360) * 2 * Math.PI * r;
      steps.push(step('s2', 'explain', [writeOp('Formula: L = (\u03B8/360) \u00D7 2\u03C0r', 'explain')]));
      steps.push(identifyStep('s2b', { r, '\u03B8': angle }));
      steps.push(step('s3', 'work', [txOp(`L = (${angle}/360) \u00D7 2\u03C0 \u00D7 ${r}`, `L = ${fmt(angle / 360)} \u00D7 ${fmt(2 * Math.PI * r)}`, 'substitute')]));
      steps.push(step('s4', 'work', [txOp(`L = ${fmt(angle / 360)} \u00D7 ${fmt(2 * Math.PI * r)}`, `L = ${fmt(len)}`, 'compute')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Arc length = ${fmt(len)} units`, 'answer')]));
      break;
    }
    case 'surface-area-cylinder': {
      const r = inputs.radius as number;
      const h = inputs.height as number;
      const sa = 2 * Math.PI * r * (r + h);
      steps.push(step('s2', 'explain', [writeOp('Formula: SA = 2\u03C0r(r + h)', 'explain')]));
      steps.push(identifyStep('s2b', { r, h }));
      steps.push(step('s3', 'work', [txOp(`SA = 2\u03C0 \u00D7 ${r} \u00D7 (${r} + ${h})`, `SA = 2\u03C0 \u00D7 ${r} \u00D7 ${r + h} = ${fmt(sa)}`, 'compute')]));
      steps.push(step('s4', 'checkpoint', [writeOp(`Surface area = ${fmt(sa)} square units`, 'answer')]));
      break;
    }
    default:
      return null;
  }

  return {
    schemaVersion: 1,
    id: `math.solve.geometry.${Date.now()}`,
    subject: 'math',
    topic: shape === 'circle' || shape === 'sphere' ? 'geometry.circles' : 'measurement.area',
    title: `${measure} of ${shape}: ${problem.rawInput}`,
    meta: { difficulty: 2, source: 'generated', objectives: [measure, shape] },
    steps,
  };
}
