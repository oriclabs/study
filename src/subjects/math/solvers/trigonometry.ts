/**
 * Solvers: Pythagoras theorem, trigonometry, coordinate geometry.
 * All include labeled diagrams.
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
function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}
function lesson(id: string, topic: string, title: string, steps: Step[]): Lesson {
  return { schemaVersion: 1, id: `math.solve.${id}.${Date.now()}`, subject: 'math', topic, title, meta: { difficulty: 2, source: 'generated', objectives: [id] }, steps };
}

/**
 * Create a labeled right triangle using the diagram op.
 * The diagram op positions everything relative to cursor — no absolute coordinates.
 * The triangle is drawn as part of the diagram, with side/angle labels as callout parts.
 */
function labeledTriangle(
  labels: { hyp?: string; opp?: string; adj?: string; angle?: string },
): Op[] {
  // Use diagram op — it handles cursor-relative positioning
  const parts: { x: number; y: number; label: string; color?: string }[] = [];

  // Position labels around the triangle (relative to diagram center)
  // Triangle shape: bottom-left to bottom-right (adj), bottom-right to top-right (opp), hypotenuse diagonal
  if (labels.adj) parts.push({ x: 0, y: 65, label: `\u2500 ${labels.adj}` }); // bottom
  if (labels.opp) parts.push({ x: 75, y: 0, label: `| ${labels.opp}` }); // right
  if (labels.hyp) parts.push({ x: -55, y: -15, label: `\u2571 ${labels.hyp}` }); // diagonal
  if (labels.angle) parts.push({ x: -55, y: 45, label: `\u2220 ${labels.angle}` }); // bottom-left angle

  return [{
    op: 'diagram',
    data: {
      shape: 'triangle' as const,
      center: [150, 80] as [number, number],
      size: 140,
      parts,
      title: '',
    },
  }];
}

// ─── Pythagoras ──────────────────────────────────────────────────

export function solvePythagoras(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const find = inputs.find as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  steps.push(step('s2', 'explain', [writeOp('Pythagoras: a\u00B2 + b\u00B2 = c\u00B2', 'explain')]));

  if (find === 'hypotenuse') {
    const a = inputs.a as number, b = inputs.b as number;
    const c = Math.sqrt(a * a + b * b);
    steps.push(step('s2b', 'explain', [writeOp(`Identify: a = ${fmt(a)}, b = ${fmt(b)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`c\u00B2 = ${fmt(a)}\u00B2 + ${fmt(b)}\u00B2`, `c\u00B2 = ${a * a} + ${b * b} = ${a * a + b * b}`, 'square and add')]));
    steps.push(step('s4', 'work', [txOp(`c = \u221A${a * a + b * b}`, `c = ${fmt(c)}`, 'take square root')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`Hypotenuse = ${fmt(c)}`, 'answer')]));

    // Labeled diagram
    steps.push(step('s_draw', 'visual', labeledTriangle({
      adj: `a = ${fmt(a)}`,
      opp: `b = ${fmt(b)}`,
      hyp: `c = ${fmt(c)}`,
    })));
  } else {
    const known = inputs.known as number, hyp = inputs.hypotenuse as number;
    const other = Math.sqrt(hyp * hyp - known * known);
    steps.push(step('s2b', 'explain', [writeOp(`Identify: c = ${fmt(hyp)}, known side = ${fmt(known)}`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`b\u00B2 = c\u00B2 - a\u00B2 = ${hyp * hyp} - ${known * known}`, `b\u00B2 = ${hyp * hyp - known * known}`, 'subtract')]));
    steps.push(step('s4', 'work', [txOp(`b = \u221A${hyp * hyp - known * known}`, `b = ${fmt(other)}`, 'take square root')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`Missing side = ${fmt(other)}`, 'answer')]));

    steps.push(step('s_draw', 'visual', labeledTriangle({
      adj: `a = ${fmt(known)}`,
      opp: `b = ${fmt(other)}`,
      hyp: `c = ${fmt(hyp)}`,
    })));
  }

  return lesson('pythagoras', 'geometry.pythagoras', problem.rawInput, steps);
}

// ─── Trigonometry ────────────────────────────────────────────────

const TRIG_FNS: Record<string, (x: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
};

export function solveTrig(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number | string>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (type === 'evaluate') {
    const fn = inputs.fn as string;
    const angle = inputs.angle as number;
    const isDegs = inputs.unit === 'degrees';
    const radians = isDegs ? angle * Math.PI / 180 : angle;
    const evalFn = TRIG_FNS[fn];
    if (!evalFn) return null;
    const result = evalFn(radians);

    steps.push(step('s2', 'explain', [writeOp(`${fn}(${fmt(angle)}${isDegs ? '\u00B0' : ' rad'})`, 'explain')]));
    if (isDegs) {
      steps.push(step('s3', 'work', [txOp(`${angle}\u00B0`, `${fmt(radians)} radians`, 'convert to radians')]));
    }
    steps.push(step('s4', 'work', [txOp(`${fn}(${fmt(radians)})`, fmt(result), 'evaluate')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`${fn}(${fmt(angle)}${isDegs ? '\u00B0' : ''}) = ${fmt(result)}`, 'answer')]));

    // Labeled triangle showing the trig ratio
    steps.push(step('s_draw', 'visual', labeledTriangle({
      angle: `${fmt(angle)}\u00B0`,
      opp: 'opposite',
      adj: 'adjacent',
      hyp: 'hypotenuse',
    })));

  } else if (type === 'find-angle') {
    const ratio = inputs.ratio as string;
    const opp = inputs.opposite as number | undefined;
    const adj = inputs.adjacent as number | undefined;
    const hyp = inputs.hypotenuse as number | undefined;

    let value: number;
    let ratioStr: string;
    let inverseFn: string;
    const triLabels: { hyp?: string; opp?: string; adj?: string; angle?: string } = {};

    if (ratio === 'sin' && opp !== undefined && hyp !== undefined) {
      value = opp / hyp;
      ratioStr = `sin(\u03B8) = opposite/hypotenuse = ${fmt(opp)}/${fmt(hyp)} = ${fmt(value)}`;
      inverseFn = 'arcsin';
      triLabels.opp = `opp = ${fmt(opp)}`;
      triLabels.hyp = `hyp = ${fmt(hyp)}`;
    } else if (ratio === 'cos' && adj !== undefined && hyp !== undefined) {
      value = adj / hyp;
      ratioStr = `cos(\u03B8) = adjacent/hypotenuse = ${fmt(adj)}/${fmt(hyp)} = ${fmt(value)}`;
      inverseFn = 'arccos';
      triLabels.adj = `adj = ${fmt(adj)}`;
      triLabels.hyp = `hyp = ${fmt(hyp)}`;
    } else if (ratio === 'tan' && opp !== undefined && adj !== undefined) {
      value = opp / adj;
      ratioStr = `tan(\u03B8) = opposite/adjacent = ${fmt(opp)}/${fmt(adj)} = ${fmt(value)}`;
      inverseFn = 'arctan';
      triLabels.opp = `opp = ${fmt(opp)}`;
      triLabels.adj = `adj = ${fmt(adj)}`;
    } else return null;

    const angleDeg = (ratio === 'sin' ? Math.asin(value) : ratio === 'cos' ? Math.acos(value) : Math.atan(value)) * 180 / Math.PI;
    triLabels.angle = `\u03B8 = ${fmt(angleDeg)}\u00B0`;

    steps.push(step('s2', 'explain', [writeOp('SOH CAH TOA', 'explain')]));
    steps.push(step('s3', 'work', [writeOp(ratioStr)]));
    steps.push(step('s4', 'work', [txOp(`\u03B8 = ${inverseFn}(${fmt(value)})`, `\u03B8 = ${fmt(angleDeg)}\u00B0`, 'inverse trig')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`\u03B8 = ${fmt(angleDeg)}\u00B0`, 'answer')]));

    steps.push(step('s_draw', 'visual', labeledTriangle(triLabels)));

  } else if (type === 'find-side') {
    const fn = inputs.fn as string;
    const angle = inputs.angle as number;
    const known = inputs.known as number;
    const findSide = inputs.findSide as string;
    const context = inputs.context as string | undefined;
    const radians = angle * Math.PI / 180;

    steps.push(step('s2', 'explain', [
      writeOp('SOH CAH TOA', 'explain'),
      writeOp('sin = opp/hyp,  cos = adj/hyp,  tan = opp/adj', 'explain'),
    ]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: angle = ${fmt(angle)}\u00B0, known = ${fmt(known)}`, 'explain')], 200));

    let result: number;
    let formula: string;
    let substitution: string;
    const triLabels: { hyp?: string; opp?: string; adj?: string; angle?: string } = { angle: `${fmt(angle)}\u00B0` };

    if (fn === 'cos' && findSide === 'hypotenuse') {
      // cos(angle) = adjacent / hypotenuse → hyp = adj / cos(angle)
      result = known / Math.cos(radians);
      formula = `cos(${angle}\u00B0) = adjacent / hypotenuse`;
      substitution = `hypotenuse = ${fmt(known)} / cos(${angle}\u00B0) = ${fmt(known)} / ${fmt(Math.cos(radians))}`;
      triLabels.adj = `adj = ${fmt(known)}`;
      triLabels.hyp = `hyp = ? = ${fmt(result)}`;
    } else if (fn === 'sin' && findSide === 'hypotenuse') {
      result = known / Math.sin(radians);
      formula = `sin(${angle}\u00B0) = opposite / hypotenuse`;
      substitution = `hypotenuse = ${fmt(known)} / sin(${angle}\u00B0) = ${fmt(known)} / ${fmt(Math.sin(radians))}`;
      triLabels.opp = `opp = ${fmt(known)}`;
      triLabels.hyp = `hyp = ? = ${fmt(result)}`;
    } else if (fn === 'tan' && findSide === 'opposite') {
      result = known * Math.tan(radians);
      formula = `tan(${angle}\u00B0) = opposite / adjacent`;
      substitution = `opposite = ${fmt(known)} \u00D7 tan(${angle}\u00B0) = ${fmt(known)} \u00D7 ${fmt(Math.tan(radians))}`;
      triLabels.adj = `adj = ${fmt(known)}`;
      triLabels.opp = `opp = ? = ${fmt(result)}`;
    } else if (fn === 'sin' && findSide === 'opposite') {
      result = known * Math.sin(radians);
      formula = `sin(${angle}\u00B0) = opposite / hypotenuse`;
      substitution = `opposite = ${fmt(known)} \u00D7 sin(${angle}\u00B0) = ${fmt(known)} \u00D7 ${fmt(Math.sin(radians))}`;
      triLabels.hyp = `hyp = ${fmt(known)}`;
      triLabels.opp = `opp = ? = ${fmt(result)}`;
    } else if (fn === 'cos' && findSide === 'adjacent') {
      result = known * Math.cos(radians);
      formula = `cos(${angle}\u00B0) = adjacent / hypotenuse`;
      substitution = `adjacent = ${fmt(known)} \u00D7 cos(${angle}\u00B0) = ${fmt(known)} \u00D7 ${fmt(Math.cos(radians))}`;
      triLabels.hyp = `hyp = ${fmt(known)}`;
      triLabels.adj = `adj = ? = ${fmt(result)}`;
    } else if (fn === 'tan' && findSide === 'adjacent') {
      result = known / Math.tan(radians);
      formula = `tan(${angle}\u00B0) = opposite / adjacent`;
      substitution = `adjacent = ${fmt(known)} / tan(${angle}\u00B0) = ${fmt(known)} / ${fmt(Math.tan(radians))}`;
      triLabels.opp = `opp = ${fmt(known)}`;
      triLabels.adj = `adj = ? = ${fmt(result)}`;
    } else {
      return null;
    }

    steps.push(step('s3', 'work', [writeOp(formula)]));
    steps.push(step('s4', 'work', [txOp(substitution, fmt(result), 'compute')]));

    // Context-aware answer
    if (context) {
      steps.push(step('s5', 'checkpoint', [writeOp(`${context} = ${fmt(result)}`, 'answer')]));
    } else {
      steps.push(step('s5', 'checkpoint', [writeOp(`${findSide} = ${fmt(result)}`, 'answer')]));
    }

    // Labeled diagram
    steps.push(step('s_draw', 'visual', labeledTriangle(triLabels)));

  } else {
    return null;
  }

  return lesson('trig', 'geometry.triangles', problem.rawInput, steps);
}

// ─── Coordinate Geometry ─────────────────────────────────────────

export function solveCoordinate(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const type = inputs.type as string;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  function coordGraph(pts: { x: number; y: number; label?: string }[], lines?: { expr: string; color: string; label: string }[]): Op {
    const allX = pts.map(p => p.x);
    const allY = pts.map(p => p.y);
    const pad = 2;
    const xRange: [number, number] = [Math.floor(Math.min(0, ...allX) - pad), Math.ceil(Math.max(0, ...allX) + pad)];
    const yRange: [number, number] = [Math.floor(Math.min(0, ...allY) - pad), Math.ceil(Math.max(0, ...allY) + pad)];
    return { op: 'graph', data: { xRange, yRange, plots: lines ?? [], points: pts } };
  }

  if (type === 'distance') {
    const x1 = inputs.x1 as number, y1 = inputs.y1 as number;
    const x2 = inputs.x2 as number, y2 = inputs.y2 as number;
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    steps.push(step('s2', 'explain', [writeOp('Formula: d = \u221A((x\u2082-x\u2081)\u00B2 + (y\u2082-y\u2081)\u00B2)', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: (x\u2081,y\u2081) = (${fmt(x1)},${fmt(y1)}), (x\u2082,y\u2082) = (${fmt(x2)},${fmt(y2)})`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`d = \u221A((${fmt(x2)}-${fmt(x1)})\u00B2 + (${fmt(y2)}-${fmt(y1)})\u00B2)`, `d = \u221A(${dx * dx} + ${dy * dy})`, 'compute differences')]));
    steps.push(step('s4', 'work', [txOp(`d = \u221A${dx * dx + dy * dy}`, `d = ${fmt(dist)}`, 'take square root')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`Distance = ${fmt(dist)}`, 'answer')]));
    steps.push(step('s_graph', 'visual', [coordGraph([
      { x: x1, y: y1, label: `A(${fmt(x1)},${fmt(y1)})` },
      { x: x2, y: y2, label: `B(${fmt(x2)},${fmt(y2)})` },
    ])]));

  } else if (type === 'midpoint') {
    const x1 = inputs.x1 as number, y1 = inputs.y1 as number;
    const x2 = inputs.x2 as number, y2 = inputs.y2 as number;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

    steps.push(step('s2', 'explain', [writeOp('Formula: M = ((x\u2081+x\u2082)/2, (y\u2081+y\u2082)/2)', 'explain')]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: (${fmt(x1)},${fmt(y1)}) and (${fmt(x2)},${fmt(y2)})`, 'explain')], 200));
    steps.push(step('s3', 'work', [txOp(`M = ((${fmt(x1)}+${fmt(x2)})/2, (${fmt(y1)}+${fmt(y2)})/2)`, `M = (${fmt(x1 + x2)}/2, ${fmt(y1 + y2)}/2)`, 'add')]));
    steps.push(step('s4', 'work', [txOp(`M = (${fmt(x1 + x2)}/2, ${fmt(y1 + y2)}/2)`, `M = (${fmt(mx)}, ${fmt(my)})`, 'divide by 2')]));
    steps.push(step('s5', 'checkpoint', [writeOp(`Midpoint = (${fmt(mx)}, ${fmt(my)})`, 'answer')]));
    steps.push(step('s_graph', 'visual', [coordGraph([
      { x: x1, y: y1, label: `A(${fmt(x1)},${fmt(y1)})` },
      { x: x2, y: y2, label: `B(${fmt(x2)},${fmt(y2)})` },
      { x: mx, y: my, label: `M(${fmt(mx)},${fmt(my)})` },
    ])]));

  } else if (type === 'gradient') {
    const x1 = inputs.x1 as number, y1 = inputs.y1 as number;
    const x2 = inputs.x2 as number, y2 = inputs.y2 as number;
    if (x2 === x1) {
      steps.push(step('s2', 'checkpoint', [writeOp('Gradient is undefined (vertical line)', 'answer')]));
    } else {
      const m = (y2 - y1) / (x2 - x1);
      steps.push(step('s2', 'explain', [writeOp('Formula: m = (y\u2082-y\u2081) / (x\u2082-x\u2081)', 'explain')]));
      steps.push(step('s2b', 'explain', [writeOp(`Identify: (${fmt(x1)},${fmt(y1)}) and (${fmt(x2)},${fmt(y2)})`, 'explain')], 200));
      steps.push(step('s3', 'work', [txOp(`m = (${fmt(y2)}-${fmt(y1)}) / (${fmt(x2)}-${fmt(x1)})`, `m = ${fmt(y2 - y1)} / ${fmt(x2 - x1)}`, 'subtract')]));
      steps.push(step('s4', 'work', [txOp(`m = ${fmt(y2 - y1)} / ${fmt(x2 - x1)}`, `m = ${fmt(m)}`, 'divide')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`Gradient = ${fmt(m)}`, 'answer')]));
      const c = y1 - m * x1;
      const expr = `${m}*x${c >= 0 ? '+' : ''}${c}`;
      steps.push(step('s_graph', 'visual', [coordGraph(
        [{ x: x1, y: y1, label: `(${fmt(x1)},${fmt(y1)})` }, { x: x2, y: y2, label: `(${fmt(x2)},${fmt(y2)})` }],
        [{ expr, color: '#2563eb', label: `m = ${fmt(m)}` }],
      )]));
    }

  } else if (type === 'equation') {
    const x1 = inputs.x1 as number, y1 = inputs.y1 as number;
    const x2 = inputs.x2 as number, y2 = inputs.y2 as number;
    if (x2 === x1) {
      steps.push(step('s2', 'checkpoint', [writeOp(`x = ${fmt(x1)} (vertical line)`, 'answer')]));
    } else {
      const m = (y2 - y1) / (x2 - x1);
      const c = y1 - m * x1;
      steps.push(step('s2', 'explain', [writeOp('y = mx + c', 'explain')]));
      steps.push(step('s3', 'work', [txOp(`m = (${fmt(y2)}-${fmt(y1)})/(${fmt(x2)}-${fmt(x1)})`, `m = ${fmt(m)}`, 'find gradient')]));
      steps.push(step('s4', 'work', [txOp(`c = ${fmt(y1)} - ${fmt(m)} \u00D7 ${fmt(x1)}`, `c = ${fmt(c)}`, 'find y-intercept')]));
      steps.push(step('s5', 'checkpoint', [writeOp(`y = ${fmt(m)}x ${c >= 0 ? '+' : '-'} ${fmt(Math.abs(c))}`, 'answer')]));
      const expr = `${m}*x${c >= 0 ? '+' : ''}${c}`;
      steps.push(step('s_graph', 'visual', [coordGraph(
        [{ x: x1, y: y1, label: `(${fmt(x1)},${fmt(y1)})` }, { x: x2, y: y2, label: `(${fmt(x2)},${fmt(y2)})` }],
        [{ expr, color: '#2563eb', label: `y = ${fmt(m)}x ${c >= 0 ? '+' : '-'} ${fmt(Math.abs(c))}` }],
      )]));
    }
  } else {
    return null;
  }

  return lesson('coordinate', 'geometry.coordinate', problem.rawInput, steps);
}

// ─── Bearing / Navigation ────────────────────────────────────────

export function solveBearing(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, number>;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  if (inputs.distance !== undefined && inputs.bearing !== undefined) {
    const dist = inputs.distance;
    const bearing = inputs.bearing;
    const radians = bearing * Math.PI / 180;

    // Bearing is measured clockwise from North
    // North = dist × cos(bearing), East = dist × sin(bearing)
    const north = dist * Math.cos(radians);
    const east = dist * Math.sin(radians);

    steps.push(step('s2', 'explain', [
      writeOp(`Bearing ${bearing}\u00B0 is measured clockwise from North.`, 'explain'),
      writeOp('North component = distance \u00D7 cos(bearing)', 'explain'),
      writeOp('East component = distance \u00D7 sin(bearing)', 'explain'),
    ]));
    steps.push(step('s2b', 'explain', [writeOp(`Identify: distance = ${fmt(dist)}, bearing = ${bearing}\u00B0`, 'explain')], 200));

    steps.push(step('s3', 'work', [
      txOp(`North = ${fmt(dist)} \u00D7 cos(${bearing}\u00B0)`, `North = ${fmt(dist)} \u00D7 ${fmt(Math.cos(radians))} = ${fmt(north)}`, 'compute'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`East = ${fmt(dist)} \u00D7 sin(${bearing}\u00B0)`, `East = ${fmt(dist)} \u00D7 ${fmt(Math.sin(radians))} = ${fmt(east)}`, 'compute'),
    ], 300));

    steps.push(step('s5', 'checkpoint', [
      writeOp(`North: ${fmt(north)} ${north >= 0 ? '(north)' : '(south)'}`, 'answer'),
      writeOp(`East: ${fmt(east)} ${east >= 0 ? '(east)' : '(west)'}`, 'answer'),
    ]));

    // Compass diagram showing the bearing and components
    steps.push(step('s_diagram', 'visual', [{
      op: 'diagram',
      data: {
        shape: 'circle' as const,
        center: [150, 100] as [number, number],
        size: 160,
        parts: [
          { x: 0, y: -90, label: 'N' },
          { x: 90, y: 0, label: 'E' },
          { x: 0, y: 90, label: 'S' },
          { x: -90, y: 0, label: 'W' },
          { x: Math.sin(radians) * 60, y: -Math.cos(radians) * 60, label: `${bearing}\u00B0 \u2192 ${fmt(dist)}`, color: '#ef4444' },
          { x: 0, y: -Math.cos(radians) * 40, label: `N=${fmt(Math.abs(north))}`, color: '#22c55e' },
          { x: Math.sin(radians) * 40, y: 0, label: `E=${fmt(Math.abs(east))}`, color: '#3b82f6' },
        ],
        title: 'Compass Bearing',
      },
    }]));

  } else if (inputs.x1 !== undefined) {
    // Bearing between coordinates
    const x1 = inputs.x1, y1 = inputs.y1 as number;
    const x2 = inputs.x2 as number, y2 = inputs.y2 as number;
    const dx = x2 - x1, dy = y2 - y1;

    // Bearing = atan2(dx, dy) converted to 0-360 clockwise from North
    let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
    if (bearing < 0) bearing += 360;

    steps.push(step('s2', 'explain', [
      writeOp('Bearing = angle measured clockwise from North', 'explain'),
    ]));
    steps.push(step('s2b', 'explain', [writeOp(`From (${fmt(x1)},${fmt(y1)}) to (${fmt(x2)},${fmt(y2)})`, 'explain')], 200));
    steps.push(step('s3', 'work', [
      txOp(`\u0394x = ${fmt(dx)}, \u0394y = ${fmt(dy)}`, `bearing = atan2(${fmt(dx)}, ${fmt(dy)})`, 'compute differences'),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`bearing = ${fmt(bearing)}\u00B0`, `bearing = ${String(Math.round(bearing)).padStart(3, '0')}\u00B0`, 'format as 3-digit bearing'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [
      writeOp(`Bearing = ${String(Math.round(bearing)).padStart(3, '0')}\u00B0`, 'answer'),
    ]));
  } else {
    return null;
  }

  return lesson('bearing', 'geometry.triangles', problem.rawInput, steps);
}

// ─── Sine Rule ───────────────────────────────────────────────────

export function solveSineRule(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  // Extract angles and sides
  const angles: Record<string, number> = (inputs.angles as Record<string, number>) ?? {};
  const sides: Record<string, number> = (inputs.sides as Record<string, number>) ?? {};
  const findVar = (inputs.find as string) ?? '';

  // Handle old format: known = { A: 40, B: 65, a: 10 }
  if (inputs.known) {
    const known = inputs.known as Record<string, number>;
    for (const [k, v] of Object.entries(known)) {
      if (k === k.toUpperCase()) angles[k] = v;
      else sides[k] = v;
    }
  }

  // Calculate third angle if two are known: C = 180 - A - B
  const angleKeys = Object.keys(angles);
  if (angleKeys.length === 2) {
    const knownSum = Object.values(angles).reduce((a, b) => a + b, 0);
    const missingAngle = ['A', 'B', 'C'].find(k => !angles[k]);
    if (missingAngle) {
      angles[missingAngle] = 180 - knownSum;
      steps.push(step('s2', 'explain', [writeOp('Sine Rule: a/sin(A) = b/sin(B) = c/sin(C)', 'explain')]));
      steps.push(step('s2b', 'explain', [
        writeOp(`Identify: ${Object.entries(angles).map(([k, v]) => `${k} = ${fmt(v)}\u00B0`).join(', ')}, ${Object.entries(sides).map(([k, v]) => `${k} = ${fmt(v)}`).join(', ')}`, 'explain'),
      ], 200));
      steps.push(step('s3', 'work', [
        txOp(`${missingAngle} = 180\u00B0 - ${angleKeys.map(k => `${fmt(angles[k]!)}\u00B0`).join(' - ')}`, `${missingAngle} = ${fmt(angles[missingAngle]!)}\u00B0`, 'angle sum of triangle'),
      ], 300));
    }
  }

  const findIsAngle = findVar === findVar.toUpperCase();
  const findKey = findVar.toLowerCase();

  if (!findIsAngle) {
    // Find a side using sine rule: b/sin(B) = a/sin(A) → b = a × sin(B) / sin(A)
    const findAngle = angles[findVar.toUpperCase()]; // angle opposite to the side we want
    if (!findAngle) {
      steps.push(step('s_err', 'explain', [writeOp(`Need angle ${findVar.toUpperCase()} to find side ${findVar}.`, 'explain')]));
      return lesson('sine-rule', 'geometry.triangles', problem.rawInput, steps);
    }

    // Find a known side-angle pair
    let knownSide = 0, knownAngle = 0, knownSideName = '', knownAngleName = '';
    for (const [sk, sv] of Object.entries(sides)) {
      const ak = sk.toUpperCase();
      if (angles[ak] !== undefined) {
        knownSide = sv;
        knownAngle = angles[ak]!;
        knownSideName = sk;
        knownAngleName = ak;
        break;
      }
    }

    if (!knownSide) {
      steps.push(step('s_err', 'explain', [writeOp('Need a matching side-angle pair to apply sine rule.', 'explain')]));
      return lesson('sine-rule', 'geometry.triangles', problem.rawInput, steps);
    }

    const findAngleRad = findAngle * Math.PI / 180;
    const knownAngleRad = knownAngle * Math.PI / 180;
    const result = knownSide * Math.sin(findAngleRad) / Math.sin(knownAngleRad);

    steps.push(step('s4', 'work', [
      writeOp(`${findVar}/sin(${findVar.toUpperCase()}) = ${knownSideName}/sin(${knownAngleName})`),
    ]));
    steps.push(step('s5', 'work', [
      txOp(
        `${findVar} = ${fmt(knownSide)} \u00D7 sin(${fmt(findAngle)}\u00B0) / sin(${fmt(knownAngle)}\u00B0)`,
        `${findVar} = ${fmt(knownSide)} \u00D7 ${fmt(Math.sin(findAngleRad))} / ${fmt(Math.sin(knownAngleRad))}`,
        'substitute',
      ),
    ], 300));
    steps.push(step('s6', 'work', [
      txOp(`${findVar} = ${fmt(knownSide * Math.sin(findAngleRad))} / ${fmt(Math.sin(knownAngleRad))}`, `${findVar} = ${fmt(result)}`, 'divide'),
    ], 300));
    steps.push(step('s7', 'checkpoint', [writeOp(`${findVar} = ${fmt(result)}`, 'answer')]));

    // Labeled triangle diagram
    steps.push(step('s_draw', 'visual', labeledTriangle({
      angle: Object.entries(angles).map(([k, v]) => `${k}=${fmt(v)}\u00B0`).join(', '),
      adj: Object.entries(sides).map(([k, v]) => `${k}=${fmt(v)}`).join(', '),
      hyp: `${findVar} = ${fmt(result)}`,
    })));

  } else {
    // Find an angle — less common but possible
    steps.push(step('s_err', 'explain', [writeOp('Finding angles via sine rule: use sin(A)/a = sin(B)/b', 'explain')]));
  }

  return lesson('sine-rule', 'geometry.triangles', problem.rawInput, steps);
}

// ─── Cosine Rule ─────────────────────────────────────────────────

export function solveCosineRule(problem: Problem): Lesson | null {
  const inputs = problem.inputs as Record<string, unknown>;
  const angles: Record<string, number> = (inputs.angles as Record<string, number>) ?? {};
  const sides: Record<string, number> = (inputs.sides as Record<string, number>) ?? {};
  const findVar = (inputs.find as string) ?? '';
  const steps: Step[] = [step('s1', 'work', [writeOp(problem.rawInput)], 400)];

  steps.push(step('s2', 'explain', [writeOp('Cosine Rule: c\u00B2 = a\u00B2 + b\u00B2 - 2ab\u00D7cos(C)', 'explain')]));
  steps.push(step('s2b', 'explain', [
    writeOp(`Identify: ${Object.entries(angles).map(([k, v]) => `${k} = ${fmt(v)}\u00B0`).join(', ')}, ${Object.entries(sides).map(([k, v]) => `${k} = ${fmt(v)}`).join(', ')}`, 'explain'),
  ], 200));

  const findIsAngle = findVar === findVar.toUpperCase();

  if (!findIsAngle && Object.keys(sides).length >= 2 && Object.keys(angles).length >= 1) {
    // Find side: c² = a² + b² - 2ab·cos(C)
    const sideKeys = Object.keys(sides);
    const a = sides[sideKeys[0]!]!;
    const b = sides[sideKeys[1]!]!;
    const angleKey = Object.keys(angles)[0]!;
    const C = angles[angleKey]! * Math.PI / 180;
    const c2 = a * a + b * b - 2 * a * b * Math.cos(C);
    const c = Math.sqrt(c2);

    steps.push(step('s3', 'work', [
      txOp(
        `${findVar}\u00B2 = ${fmt(a)}\u00B2 + ${fmt(b)}\u00B2 - 2\u00D7${fmt(a)}\u00D7${fmt(b)}\u00D7cos(${fmt(angles[angleKey]!)}\u00B0)`,
        `${findVar}\u00B2 = ${fmt(a * a)} + ${fmt(b * b)} - ${fmt(2 * a * b)}\u00D7${fmt(Math.cos(C))}`,
        'substitute',
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`${findVar}\u00B2 = ${fmt(a * a + b * b)} - ${fmt(2 * a * b * Math.cos(C))}`, `${findVar}\u00B2 = ${fmt(c2)}`, 'compute'),
    ], 300));
    steps.push(step('s5', 'work', [
      txOp(`${findVar} = \u221A${fmt(c2)}`, `${findVar} = ${fmt(c)}`, 'square root'),
    ], 300));
    steps.push(step('s6', 'checkpoint', [writeOp(`${findVar} = ${fmt(c)}`, 'answer')]));

    steps.push(step('s_draw', 'visual', labeledTriangle({
      adj: `${sideKeys[0]} = ${fmt(a)}`,
      opp: `${sideKeys[1]} = ${fmt(b)}`,
      hyp: `${findVar} = ${fmt(c)}`,
      angle: `${angleKey} = ${fmt(angles[angleKey]!)}\u00B0`,
    })));

  } else if (findIsAngle && Object.keys(sides).length >= 3) {
    // Find angle: cos(C) = (a² + b² - c²) / 2ab
    const sideVals = Object.values(sides);
    const a = sideVals[0]!, b = sideVals[1]!, c = sideVals[2]!;
    const cosC = (a * a + b * b - c * c) / (2 * a * b);
    const C = Math.acos(cosC) * 180 / Math.PI;

    steps.push(step('s3', 'work', [
      txOp(
        `cos(${findVar}) = (${fmt(a)}\u00B2 + ${fmt(b)}\u00B2 - ${fmt(c)}\u00B2) / (2\u00D7${fmt(a)}\u00D7${fmt(b)})`,
        `cos(${findVar}) = ${fmt(a * a + b * b - c * c)} / ${fmt(2 * a * b)}`,
        'substitute',
      ),
    ], 300));
    steps.push(step('s4', 'work', [
      txOp(`cos(${findVar}) = ${fmt(cosC)}`, `${findVar} = arccos(${fmt(cosC)}) = ${fmt(C)}\u00B0`, 'inverse cos'),
    ], 300));
    steps.push(step('s5', 'checkpoint', [writeOp(`${findVar} = ${fmt(C)}\u00B0`, 'answer')]));
  } else {
    steps.push(step('s3', 'explain', [writeOp('Need 2 sides + included angle, or 3 sides.', 'explain')]));
  }

  return lesson('cosine-rule', 'geometry.triangles', problem.rawInput, steps);
}
