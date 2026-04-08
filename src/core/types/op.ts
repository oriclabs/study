/**
 * Render op types. See docs/render-ops.md.
 * Every op shares the same envelope; only `data` varies.
 */

export interface OpStyle {
  color?: string;
  font?: string;
  size?: number;
  speed?: number;
  opacity?: number;
  width?: number;
  variant?: 'default' | 'explain' | 'answer' | 'title';
  indent?: boolean;
}

export interface OpBase<K extends string, D> {
  op: K;
  target?: string;
  at?: [number, number];
  style?: OpStyle;
  data: D;
}

/* Text / handwriting */
export type WriteOp = OpBase<'write', { text: string; indent?: boolean }>;
export type LabelOp = OpBase<'label', { text: string; font?: string }>;
export type StrikeOp = OpBase<'strike', { from: number; to: number }>;
export type EraseOp = OpBase<'erase', Record<string, never>>;

/* Geometry */
export type ShapeKind = 'line' | 'circle' | 'rect' | 'triangle' | 'polygon' | 'arc' | 'rightAngle' | 'arrow';
export type DrawOp = OpBase<'draw', {
  shape: ShapeKind;
  from?: [number, number];
  to?: [number, number];
  center?: [number, number];
  radius?: number;
  points?: [number, number][];
  at?: [number, number];
  size?: number;
  dir?: 'br' | 'bl' | 'tr' | 'tl';
  width?: number;
  color?: string;
}>;

export type HighlightOp = OpBase<'highlight', {
  style?: 'box' | 'underline' | 'circle';
  range?: [number, number];
  label?: string;
}>;

/* Plotting */
export type GraphOp = OpBase<'graph', {
  xRange: [number, number];
  yRange: [number, number];
  plots: { expr: string; color?: string; label?: string }[];
  points?: { x: number; y: number; label?: string }[];
}>;

export type NumberlineOp = OpBase<'numberline', {
  from: number;
  to: number;
  marks?: number[];
  labels?: Record<string, string>;
  intervals?: { from: number; to: number; closed?: [boolean, boolean] }[];
}>;

/* Reading / language */
export type PassageOp = OpBase<'passage', {
  text: string;
  spans?: { id: string; start: number; end: number }[];
}>;
export type AnnotateOp = OpBase<'annotate', { note: string }>;

/* Motion / scenes (Phase 2) */
export type MoveOp = OpBase<'move', {
  from: [number, number];
  to: [number, number];
  durationMs?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  trail?: boolean;
  symbol?: string; // renders a symbol at the moving position
}>;

export type RotateOp = OpBase<'rotate', {
  center: [number, number];
  from: number;      // radians
  to: number;
  radius: number;
  durationMs?: number;
  symbol?: string;
}>;

export type ParticlesOp = OpBase<'particles', {
  from: [number, number];
  to: [number, number];
  count?: number;
  durationMs?: number;
  color?: string;
}>;

export type GlowOp = OpBase<'glow', {
  center: [number, number];
  radius?: number;
  pulses?: number;
  color?: string;
}>;

export type SymbolOp = OpBase<'symbol', {
  kind: 'battery' | 'bulb' | 'resistor' | 'atom' | 'cell' | 'magnet' | 'spring' | 'gear' | 'arrow-big'
    // Physics
    | 'electron' | 'proton' | 'neutron' | 'wave-pulse' | 'lens-convex' | 'lens-concave' | 'mirror' | 'prism' | 'pendulum' | 'pulley'
    // Chemistry
    | 'beaker' | 'flask' | 'test-tube' | 'bunsen' | 'molecule-h2o' | 'molecule-co2' | 'ion-positive' | 'ion-negative'
    // Biology
    | 'dna' | 'mitochondria' | 'chloroplast' | 'red-blood-cell' | 'neuron' | 'heart' | 'lung' | 'eye' | 'bacteria' | 'virus';
  at: [number, number];
  size?: number;
  label?: string;
}>;

/* Algebraic transformation */
export type TransformOp = OpBase<'transform', {
  /** Source equation/expression text. */
  from: string;
  /** Result equation/expression text after transformation. */
  to: string;
  /** Description of what was done, e.g. "subtract 4 from both sides". */
  operation?: string;
  /** Substrings in `from` to highlight as changed parts. */
  highlights?: { text: string; label?: string }[];
  /** Color for highlighted/changed portions. */
  changeColor?: string;
  /** Color for arrows and annotations. */
  arrowColor?: string;
  /** Whether to strike through the source after showing result. */
  strikeSource?: boolean;
}>;

/* Structured grid layout */
export type TableOp = OpBase<'table', {
  /** Column headers (optional). */
  headers?: string[];
  /** Row data — each row is an array of cell strings. */
  rows: string[][];
  /** Cells to highlight as [rowIndex, colIndex] pairs (0-based, rows only). */
  highlightCells?: [number, number][];
  /** Custom column widths in pixels. Auto-computed if omitted. */
  colWidths?: number[];
}>;

/* Math notation — proper typeset rendering on canvas */
export type MathOp = OpBase<'math', {
  /** Math expression string (parsed by math-parser). */
  expr: string;
  /** Optional variant styling. */
  variant?: 'default' | 'answer' | 'explain';
}>;

/* ═══ Science / General ═══ */

/** Molecule: atoms with bonds for chemistry. */
export type MoleculeOp = OpBase<'molecule', {
  atoms: { id: string; symbol: string; x: number; y: number; color?: string; charge?: string }[];
  bonds: { from: string; to: string; type?: 'single' | 'double' | 'triple'; color?: string }[];
  label?: string;
}>;

/** Chemical reaction: animated A + B → C. */
export type ReactionOp = OpBase<'reaction', {
  reactants: string[];
  products: string[];
  conditions?: string;
  reversible?: boolean;
}>;

/** Wave animation: transverse or longitudinal. */
export type WaveOp = OpBase<'wave', {
  type: 'transverse' | 'longitudinal';
  wavelength?: number;
  amplitude?: number;
  frequency?: number;
  cycles?: number;
  color?: string;
  label?: string;
}>;

/** Field lines: electric, magnetic, or gravitational. */
export type FieldOp = OpBase<'field', {
  type: 'electric' | 'magnetic' | 'gravitational';
  sources: { x: number; y: number; charge?: '+' | '-'; label?: string }[];
  lineCount?: number;
}>;

/** Labeled diagram with callout lines. */
export type DiagramOp = OpBase<'diagram', {
  /** Base shape or background image description. */
  shape?: 'circle' | 'rect' | 'triangle' | 'cell' | 'eye' | 'heart' | 'lung' | 'custom';
  center: [number, number];
  size: number;
  parts: { x: number; y: number; label: string; color?: string }[];
  title?: string;
}>;

/** Process flow: boxes with arrows showing a sequence. */
export type ProcessOp = OpBase<'process', {
  steps: { label: string; detail?: string; color?: string }[];
  direction?: 'horizontal' | 'vertical';
  cyclic?: boolean;
}>;

/** Circuit diagram with components. */
export type CircuitOp = OpBase<'circuit', {
  components: { type: 'battery' | 'bulb' | 'resistor' | 'switch' | 'ammeter' | 'voltmeter' | 'wire'; from: [number, number]; to: [number, number]; label?: string }[];
  current?: boolean;
}>;

/* Meta */
export type PauseOp = OpBase<'pause', { ms: number }>;
export type SpeakOp = OpBase<'speak', { text: string; rate?: number }>;

export type Op =
  | WriteOp | LabelOp | StrikeOp | EraseOp
  | DrawOp | HighlightOp
  | GraphOp | NumberlineOp
  | PassageOp | AnnotateOp
  | MoveOp | RotateOp | ParticlesOp | GlowOp | SymbolOp
  | TransformOp | TableOp | MathOp
  | MoleculeOp | ReactionOp | WaveOp | FieldOp | DiagramOp | ProcessOp | CircuitOp
  | PauseOp | SpeakOp;

export type OpKind = Op['op'];
