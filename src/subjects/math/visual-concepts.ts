/**
 * Visual concept explanations — canvas-based diagram lessons
 * that show WHY formulas work, not just state them.
 *
 * Each function returns a Lesson with draw/write/label ops
 * that animate geometric diagrams with labels and annotations.
 */

import type { Lesson, Step } from '@core/types/lesson.js';
import type { Op } from '@core/types/op.js';

function write(text: string, variant?: 'explain' | 'answer'): Op {
  return variant
    ? { op: 'write', style: { variant }, data: { text } }
    : { op: 'write', data: { text } };
}
function label(text: string, at: [number, number], font?: string, color?: string): Op {
  return { op: 'label', at, style: color ? { color } : undefined, data: { text, font } };
}
function draw(shape: string, data: Record<string, unknown>, color?: string, width?: number): Op {
  return { op: 'draw', data: { shape, ...data, ...(color ? { color } : {}), ...(width ? { width } : {}) } } as Op;
}
function pause(ms: number): Op { return { op: 'pause', data: { ms } }; }
function arrow(from: [number, number], to: [number, number], color?: string): Op {
  return draw('arrow', { from, to }, color);
}
function line(from: [number, number], to: [number, number], color?: string, width?: number): Op {
  return draw('line', { from, to }, color, width);
}

function step(id: string, kind: Step['kind'], ops: Op[], narration?: string, waitMs?: number): Step {
  return { id, kind, ops, ...(narration ? { narration } : {}), ...(waitMs ? { waitAfterMs: waitMs } : {}) };
}

function lesson(id: string, title: string, steps: Step[]): Lesson {
  return {
    schemaVersion: 1, id, subject: 'math', topic: 'measurement',
    title, meta: { difficulty: 1, source: 'generated', objectives: ['visual understanding'] },
    steps,
  };
}

// ============ RECTANGLE AREA ============

export function rectangleArea(): Lesson {
  // Draw at canvas coordinates
  const x = 100, y = 120, w = 300, h = 180;

  return lesson('visual.rect-area', 'Area of a Rectangle', [
    step('s1', 'explain', [
      write('Area of a Rectangle', 'explain'),
    ], undefined, 300),

    // Draw the rectangle
    step('s2', 'visual', [
      draw('rect', { from: [x, y], to: [x + w, y + h] }, '#3b82f6', 3),
    ], undefined, 200),

    // Label width
    step('s3', 'visual', [
      arrow([x, y + h + 25], [x + w, y + h + 25], '#60a5fa'),
      label('width = 6 cm', [x + w/2 - 35, y + h + 45], '18px sans-serif', '#60a5fa'),
    ], undefined, 300),

    // Label height
    step('s4', 'visual', [
      arrow([x - 25, y + h], [x - 25, y], '#4ade80'),
      label('height', [x - 75, y + h/2 - 10], '18px sans-serif', '#4ade80'),
      label('= 3 cm', [x - 70, y + h/2 + 12], '18px sans-serif', '#4ade80'),
    ], undefined, 300),

    // Draw grid lines to show unit squares
    step('s5', 'visual', [
      // Horizontal grid (3 rows)
      line([x, y + 60], [x + w, y + 60], '#3b82f6'),
      line([x, y + 120], [x + w, y + 120], '#3b82f6'),
      // Vertical grid (6 cols)
      line([x + 50, y], [x + 50, y + h], '#3b82f6'),
      line([x + 100, y], [x + 100, y + h], '#3b82f6'),
      line([x + 150, y], [x + 150, y + h], '#3b82f6'),
      line([x + 200, y], [x + 200, y + h], '#3b82f6'),
      line([x + 250, y], [x + 250, y + h], '#3b82f6'),
    ], 'Each small square is 1 cm². Count them: 6 columns × 3 rows.', 400),

    // Count
    step('s6', 'explain', [
      write('Count the unit squares: 6 × 3 = 18 squares', 'explain'),
    ], undefined, 300),

    // Formula
    step('s7', 'work', [
      write('Area = width × height'),
      write('Area = 6 × 3 = 18 cm²', 'answer'),
    ]),
  ]);
}

// ============ CIRCLE AREA ============

export function circleArea(): Lesson {
  const cx = 250, cy = 220, r = 100;

  return lesson('visual.circle-area', 'Area of a Circle', [
    step('s1', 'explain', [
      write('Area of a Circle', 'explain'),
    ], undefined, 300),

    // Draw the circle
    step('s2', 'visual', [
      draw('circle', { center: [cx, cy], radius: r }, '#7c3aed', 3),
    ], undefined, 200),

    // Mark center
    step('s3', 'visual', [
      draw('circle', { center: [cx, cy], radius: 4 }, '#f87171', 4),
      label('centre', [cx + 8, cy + 5], '14px sans-serif', '#f87171'),
    ], undefined, 200),

    // Draw radius
    step('s4', 'visual', [
      line([cx, cy], [cx + r, cy], '#f87171', 3),
      label('r = 5 cm', [cx + r/2 - 20, cy - 12], '18px sans-serif', '#f87171'),
    ], 'The radius is the distance from the centre to the edge.', 400),

    // Draw diameter
    step('s5', 'visual', [
      line([cx - r, cy], [cx + r, cy], '#60a5fa', 2),
      label('diameter = 2r = 10 cm', [cx - 65, cy + 22], '16px sans-serif', '#60a5fa'),
    ], 'The diameter is twice the radius.', 400),

    // Show π concept
    step('s6', 'explain', [
      write('The circumference wraps around: C = 2πr', 'explain'),
      write('The area fills the inside: A = πr²', 'explain'),
    ], undefined, 400),

    // Calculate
    step('s7', 'work', [
      write('A = π × r²'),
      write('A = π × 5²'),
      write('A = π × 25'),
      write('A = 25π ≈ 78.5 cm²', 'answer'),
    ]),
  ]);
}

// ============ TRIANGLE AREA ============

export function triangleArea(): Lesson {
  const bx = 100, by = 350, bw = 280, th = 200;
  const apex: [number, number] = [bx + 120, by - th];

  return lesson('visual.triangle-area', 'Area of a Triangle', [
    step('s1', 'explain', [
      write('Area of a Triangle', 'explain'),
    ], undefined, 300),

    // Draw the triangle
    step('s2', 'visual', [
      draw('triangle', { points: [[bx, by], [bx + bw, by], apex] }, '#f59e0b', 3),
    ], undefined, 200),

    // Label base
    step('s3', 'visual', [
      arrow([bx, by + 25], [bx + bw, by + 25], '#60a5fa'),
      label('base = 7 cm', [bx + bw/2 - 30, by + 48], '18px sans-serif', '#60a5fa'),
    ], undefined, 300),

    // Draw and label height (perpendicular)
    step('s4', 'visual', [
      line([apex[0], apex[1]], [apex[0], by], '#4ade80', 2),
      draw('rightAngle', { at: [apex[0], by], size: 12, dir: 'bl' }, '#4ade80'),
      label('height', [apex[0] + 10, apex[1] + th/2 - 10], '18px sans-serif', '#4ade80'),
      label('= 5 cm', [apex[0] + 10, apex[1] + th/2 + 12], '18px sans-serif', '#4ade80'),
    ], 'The height is PERPENDICULAR to the base — shown by the right angle mark.', 400),

    // Show why it's half a rectangle
    step('s5', 'visual', [
      write('Why half? A triangle is half a rectangle:', 'explain'),
      // Draw the enclosing rectangle with dashed lines
      line([bx, by - th], [bx + bw, by - th], '#888', 1),
      line([bx + bw, by - th], [bx + bw, by], '#888', 1),
      line([bx, by - th], [bx, by], '#888', 1),
    ], undefined, 500),

    // Formula
    step('s6', 'work', [
      write('Area = ½ × base × height'),
      write('Area = ½ × 7 × 5'),
      write('Area = 17.5 cm²', 'answer'),
    ]),
  ]);
}

// ============ PYTHAGORAS ============

export function pythagorasVisual(): Lesson {
  const x = 100, y = 340, base = 240, height = 180;

  return lesson('visual.pythagoras', "Pythagoras' Theorem — Visual Proof", [
    step('s1', 'explain', [
      write("Pythagoras' Theorem: a² + b² = c²", 'explain'),
    ], undefined, 300),

    // Draw right triangle
    step('s2', 'visual', [
      draw('triangle', { points: [[x, y], [x + base, y], [x + base, y - height]] }, '#3b82f6', 3),
      draw('rightAngle', { at: [x + base, y], size: 15, dir: 'tl' }, '#f87171'),
    ], undefined, 200),

    // Label sides
    step('s3', 'visual', [
      // base (a)
      label('a = 3', [x + base/2 - 15, y + 25], '20px sans-serif', '#60a5fa'),
      // height (b)
      label('b = 4', [x + base + 15, y - height/2 + 5], '20px sans-serif', '#4ade80'),
      // hypotenuse (c)
      label('c = ?', [x + base/2 - 50, y - height/2 - 15], '20px sans-serif', '#f87171'),
    ], undefined, 400),

    // Draw squares on each side
    step('s4', 'visual', [
      write('Build a square on each side:', 'explain'),
    ], undefined, 200),

    // Square on a (bottom) — small representation
    step('s5', 'visual', [
      draw('rect', { from: [x + 60, y + 5], to: [x + 60 + 60, y + 5 + 60] }, '#60a5fa', 2),
      label('a² = 9', [x + 68, y + 40], '14px sans-serif', '#60a5fa'),
    ], 'Square on side a: 3² = 9 square units', 300),

    // Square on b (right)
    step('s6', 'visual', [
      draw('rect', { from: [x + base + 5, y - 80], to: [x + base + 5 + 80, y] }, '#4ade80', 2),
      label('b² = 16', [x + base + 15, y - 35], '14px sans-serif', '#4ade80'),
    ], 'Square on side b: 4² = 16 square units', 300),

    // Calculate
    step('s7', 'work', [
      write('c² = a² + b²'),
      write('c² = 9 + 16 = 25'),
      write('c = √25 = 5', 'answer'),
    ], undefined, 300),

    // Square on c (hypotenuse)
    step('s8', 'visual', [
      label('c² = 25', [x + 30, y - height - 30], '18px sans-serif', '#f87171'),
      write('The square on the hypotenuse equals the sum of squares on the other two sides.', 'explain'),
    ]),
  ]);
}

// ============ CIRCUMFERENCE ============

export function circumferenceVisual(): Lesson {
  const cx = 250, cy = 220, r = 90;

  return lesson('visual.circumference', 'Circumference of a Circle', [
    step('s1', 'explain', [
      write('Circumference = distance around a circle', 'explain'),
    ], undefined, 300),

    // Draw circle
    step('s2', 'visual', [
      draw('circle', { center: [cx, cy], radius: r }, '#7c3aed', 3),
    ], undefined, 200),

    // Show diameter
    step('s3', 'visual', [
      line([cx - r, cy], [cx + r, cy], '#f87171', 3),
      label('d = 10 cm', [cx - 30, cy - 12], '18px sans-serif', '#f87171'),
    ], undefined, 300),

    // π explanation
    step('s4', 'explain', [
      write('If you unrolled the circle into a straight line...', 'explain'),
      write('it would be π × d long — about 3.14 diameters!', 'explain'),
    ], undefined, 500),

    // Draw "unrolled" line
    step('s5', 'visual', [
      line([80, cy + r + 50], [80 + 314, cy + r + 50], '#7c3aed', 3),
      // Mark 3 diameter segments + a bit more
      line([80, cy + r + 40], [80, cy + r + 60], '#f87171', 2),
      line([180, cy + r + 40], [180, cy + r + 60], '#f87171', 2),
      line([280, cy + r + 40], [280, cy + r + 60], '#f87171', 2),
      line([80 + 314, cy + r + 40], [80 + 314, cy + r + 60], '#7c3aed', 2),
      label('d', [120, cy + r + 38], '14px sans-serif', '#f87171'),
      label('d', [220, cy + r + 38], '14px sans-serif', '#f87171'),
      label('d', [320, cy + r + 38], '14px sans-serif', '#f87171'),
      label('+ 0.14d', [350, cy + r + 38], '12px sans-serif', '#7c3aed'),
    ], 'The circumference is just over 3 diameters long.', 400),

    // Formula
    step('s6', 'work', [
      write('C = π × d  or  C = 2πr'),
      write('C = π × 10 = 10π ≈ 31.4 cm', 'answer'),
    ]),
  ]);
}

// ============ VOLUME OF A BOX ============

export function boxVolume(): Lesson {
  // Isometric-ish box
  const ox = 150, oy = 300;
  const w = 200, h = 120, d = 80;

  return lesson('visual.box-volume', 'Volume of a Rectangular Prism', [
    step('s1', 'explain', [
      write('Volume of a Rectangular Prism (Box)', 'explain'),
    ], undefined, 300),

    // Draw front face
    step('s2', 'visual', [
      draw('rect', { from: [ox, oy - h], to: [ox + w, oy] }, '#3b82f6', 3),
    ], undefined, 200),

    // Draw depth (3D effect)
    step('s3', 'visual', [
      line([ox, oy - h], [ox + d * 0.6, oy - h - d * 0.5], '#3b82f6', 2),
      line([ox + w, oy - h], [ox + w + d * 0.6, oy - h - d * 0.5], '#3b82f6', 2),
      line([ox + w, oy], [ox + w + d * 0.6, oy - d * 0.5], '#3b82f6', 2),
      line([ox + d * 0.6, oy - h - d * 0.5], [ox + w + d * 0.6, oy - h - d * 0.5], '#3b82f6', 2),
      line([ox + w + d * 0.6, oy - h - d * 0.5], [ox + w + d * 0.6, oy - d * 0.5], '#3b82f6', 2),
    ], undefined, 300),

    // Label dimensions
    step('s4', 'visual', [
      arrow([ox, oy + 20], [ox + w, oy + 20], '#60a5fa'),
      label('length = 5', [ox + w/2 - 30, oy + 42], '16px sans-serif', '#60a5fa'),
      arrow([ox - 20, oy], [ox - 20, oy - h], '#4ade80'),
      label('height = 3', [ox - 85, oy - h/2 + 5], '16px sans-serif', '#4ade80'),
      label('depth = 2', [ox + w + 15, oy - h/2 - d*0.2], '16px sans-serif', '#f59e0b'),
    ], undefined, 400),

    // Explain layers
    step('s5', 'explain', [
      write('Think of it as layers:', 'explain'),
      write('Bottom layer = 5 × 2 = 10 unit cubes', 'explain'),
      write('Stack 3 layers high = 10 × 3 = 30 cubes', 'explain'),
    ], undefined, 400),

    // Formula
    step('s6', 'work', [
      write('V = length × width × height'),
      write('V = 5 × 2 × 3 = 30 cm³', 'answer'),
    ]),
  ]);
}

/** Get all visual concept lessons */
export function getAllVisualConcepts(): { id: string; title: string; generator: () => Lesson }[] {
  return [
    { id: 'rect-area', title: 'Area of a Rectangle', generator: rectangleArea },
    { id: 'triangle-area', title: 'Area of a Triangle', generator: triangleArea },
    { id: 'circle-area', title: 'Area of a Circle', generator: circleArea },
    { id: 'circumference', title: 'Circumference of a Circle', generator: circumferenceVisual },
    { id: 'pythagoras', title: "Pythagoras' Theorem", generator: pythagorasVisual },
    { id: 'box-volume', title: 'Volume of a Box', generator: boxVolume },
  ];
}
