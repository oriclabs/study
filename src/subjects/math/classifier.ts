import type { Problem } from '@core/types/strategy.js';
import { parseLinear, parseQuadratic, parsePolynomial } from './parser.js';
import { buildEquation } from './equation-builder/index.js';

/**
 * Identify the structural type of a math problem from raw input.
 * Tries classifiers in order from most specific to least.
 *
 * Supported types:
 *   - geometry         "area of circle radius 5"
 *   - financial        "compound interest 5000 at 3% for 5 years"
 *   - statistics       "mean of 4, 7, 9, 12"
 *   - sequence         "find nth term: 2, 5, 8, 11"
 *   - percentage       "25% of 80", "what % is 15 of 60"
 *   - fraction         "3/4 + 2/5"
 *   - ratio            "divide 120 in ratio 3:5"
 *   - powers           "simplify √48", "2^3 * 2^4"
 *   - inequality       "2x + 3 > 7"
 *   - simultaneous     "2x + 3y = 10, x - y = 1"
 *   - quadratic        "x^2 - 5x + 6 = 0"
 *   - linear           "2x + 3 = 7"
 *   - expression       "2(x+3)" (simplification)
 */
/** Normalize Unicode math symbols to ASCII for parsing. */
function normalizeUnicode(s: string): string {
  return s
    .replace(/\u2212/g, '-')   // minus sign → hyphen
    .replace(/\u00D7/g, '*')   // ×
    .replace(/\u00F7/g, '/')   // ÷
    .replace(/\u00B2/g, '^2')  // ²
    .replace(/\u00B3/g, '^3')  // ³
    .replace(/\u2070/g, '^0')  // ⁰
    .replace(/\u00B9/g, '^1')  // ¹
    .replace(/\u2074/g, '^4')  // ⁴
    .replace(/\u2075/g, '^5')  // ⁵
    .replace(/\u207B/g, '-')   // superscript minus
    .replace(/\u00B0/g, ' degrees ')  // degree symbol °
    .replace(/\u03C0/g, 'pi')  // π
    .replace(/\u221A/g, 'sqrt'); // √
}

export function identify(input: string): Problem | null {
  const trimmed = normalizeUnicode(input.trim());
  if (!trimmed) return null;

  return identifyMissingNumber(trimmed)
    ?? identifyAnalogy(trimmed)
    ?? identifyOddOneOut(trimmed)
    ?? identifyMatrix(trimmed)
    ?? identifyMagicSquare(trimmed)
    ?? identifyPythagoras(trimmed)
    ?? identifyTrig(trimmed)
    ?? identifyCoordinate(trimmed)
    ?? identifyGeometry(trimmed)
    ?? identifyFinancial(trimmed)
    ?? identifyStatistics(trimmed)
    ?? identifySequence(trimmed)
    ?? identifyProbability(trimmed)
    ?? identifySets(trimmed)
    ?? identifyPercentage(trimmed)
    ?? identifyFraction(trimmed)
    ?? identifyRatio(trimmed)
    ?? identifyPowers(trimmed)
    ?? identifyLogarithm(trimmed)
    ?? identifyUnitConversion(trimmed)
    ?? identifyNumberBase(trimmed)
    ?? identifyTransformation(trimmed)
    ?? identifyFactorise(trimmed)
    ?? identifyCubic(trimmed)
    ?? identifyInequality(trimmed)
    ?? identifySimultaneous(trimmed)
    ?? identifyGraph(trimmed)
    ?? identifyQuadratic(trimmed)
    ?? identifyLinear(trimmed)
    ?? identifyExpression(trimmed)
    ?? buildEquation(trimmed)
    ?? null;
}

// ─── Geometry ────────────────────────────────────────────────────

function identifyGeometry(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  // "area of circle radius 5" / "area of circle r=5" / "area circle 5"
  const circleArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?circle\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (circleArea) return geoProblem(input, 'area', 'circle', { radius: parseFloat(circleArea[1]!) });

  const circleCirc = lower.match(/(?:circumference|perimeter)\s+(?:of\s+)?(?:a\s+)?circle\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (circleCirc) return geoProblem(input, 'circumference', 'circle', { radius: parseFloat(circleCirc[1]!) });

  // "area of rectangle 4 by 6" / "area rectangle length 4 width 6"
  const rectArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?rectangle\s+(?:(?:length\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:by|x|×|,|\s+(?:width\s*[=:]?\s*)?)(\d+\.?\d*))/);
  if (rectArea) return geoProblem(input, 'area', 'rectangle', { length: parseFloat(rectArea[1]!), width: parseFloat(rectArea[2]!) });

  const rectPerim = lower.match(/perimeter\s+(?:of\s+)?(?:a\s+)?rectangle\s+(?:(?:length\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:by|x|×|,|\s+(?:width\s*[=:]?\s*)?)(\d+\.?\d*))/);
  if (rectPerim) return geoProblem(input, 'perimeter', 'rectangle', { length: parseFloat(rectPerim[1]!), width: parseFloat(rectPerim[2]!) });

  // "area of triangle base 6 height 4"
  const triArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?triangle\s+(?:(?:with\s+)?base\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?height\s*[=:]?\s*)(\d+\.?\d*)/);
  if (triArea) return geoProblem(input, 'area', 'triangle', { base: parseFloat(triArea[1]!), height: parseFloat(triArea[2]!) });

  // "area of square side 5"
  const sqArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?square\s+(?:(?:with\s+)?side\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (sqArea) return geoProblem(input, 'area', 'square', { side: parseFloat(sqArea[1]!) });

  const sqPerim = lower.match(/perimeter\s+(?:of\s+)?(?:a\s+)?square\s+(?:(?:with\s+)?side\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (sqPerim) return geoProblem(input, 'perimeter', 'square', { side: parseFloat(sqPerim[1]!) });

  // Volume
  const cubeVol = lower.match(/volume\s+(?:of\s+)?(?:a\s+)?cube\s+(?:(?:with\s+)?side\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (cubeVol) return geoProblem(input, 'volume', 'cube', { side: parseFloat(cubeVol[1]!) });

  const sphereVol = lower.match(/volume\s+(?:of\s+)?(?:a\s+)?sphere\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (sphereVol) return geoProblem(input, 'volume', 'sphere', { radius: parseFloat(sphereVol[1]!) });

  const cylVol = lower.match(/volume\s+(?:of\s+)?(?:a\s+)?cylinder\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?height\s*[=:]?\s*)(\d+\.?\d*)/);
  if (cylVol) return geoProblem(input, 'volume', 'cylinder', { radius: parseFloat(cylVol[1]!), height: parseFloat(cylVol[2]!) });

  const coneVol = lower.match(/volume\s+(?:of\s+)?(?:a\s+)?cone\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?height\s*[=:]?\s*)(\d+\.?\d*)/);
  if (coneVol) return geoProblem(input, 'volume', 'cone', { radius: parseFloat(coneVol[1]!), height: parseFloat(coneVol[2]!) });

  // Parallelogram
  const paraArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?parallelogram\s+(?:(?:with\s+)?(?:base\s*[=:]?\s*)?)?(\d+\.?\d*)\s*(?:(?:cm|m|mm|km|ft|in)\s*)?(?:,?\s*(?:and\s+)?(?:height\s*[=:]?\s*))(\d+\.?\d*)/);
  if (paraArea) return geoProblem(input, 'area', 'parallelogram', { base: parseFloat(paraArea[1]!), height: parseFloat(paraArea[2]!) });

  // "parallelogram has base X and height Y" or "parallelogram base X height Y"
  const paraWord = lower.match(/parallelogram.*?base\s*(?:of\s+)?(\d+\.?\d*).*?height\s*(?:of\s+)?(\d+\.?\d*)/);
  if (paraWord) return geoProblem(input, 'area', 'parallelogram', { base: parseFloat(paraWord[1]!), height: parseFloat(paraWord[2]!) });

  // Rhombus
  const rhombusArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?rhombus\s+(?:(?:with\s+)?(?:d(?:iagonal)?\s*1?\s*[=:]?\s*)?)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?(?:d(?:iagonal)?\s*2?\s*[=:]?\s*))(\d+\.?\d*)/);
  if (rhombusArea) return geoProblem(input, 'area', 'rhombus', { d1: parseFloat(rhombusArea[1]!), d2: parseFloat(rhombusArea[2]!) });

  // Trapezoid/trapezium
  const trapArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?trapez(?:oid|ium)\s+(?:(?:with\s+)?(?:a\s*[=:]?\s*)?)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?(?:b\s*[=:]?\s*)?)(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?height\s*[=:]?\s*)(\d+\.?\d*)/);
  if (trapArea) return geoProblem(input, 'area', 'trapezoid', { a: parseFloat(trapArea[1]!), b: parseFloat(trapArea[2]!), height: parseFloat(trapArea[3]!) });

  // Perimeter of triangle
  const triPerim = lower.match(/perimeter\s+(?:of\s+)?(?:a\s+)?triangle\s+(?:(?:with\s+)?(?:sides?\s*[=:]?\s*)?)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?)(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?)(\d+\.?\d*)/);
  if (triPerim) return geoProblem(input, 'perimeter', 'triangle', { a: parseFloat(triPerim[1]!), b: parseFloat(triPerim[2]!), c: parseFloat(triPerim[3]!) });

  // Surface area
  const saCube = lower.match(/surface\s+area\s+(?:of\s+)?(?:a\s+)?cube\s+(?:(?:with\s+)?side\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (saCube) return geoProblem(input, 'surface-area', 'cube', { side: parseFloat(saCube[1]!) });

  const saSphere = lower.match(/surface\s+area\s+(?:of\s+)?(?:a\s+)?sphere\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)/);
  if (saSphere) return geoProblem(input, 'surface-area', 'sphere', { radius: parseFloat(saSphere[1]!) });

  const saCyl = lower.match(/surface\s+area\s+(?:of\s+)?(?:a\s+)?cylinder\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?height\s*[=:]?\s*)(\d+\.?\d*)/);
  if (saCyl) return geoProblem(input, 'surface-area', 'cylinder', { radius: parseFloat(saCyl[1]!), height: parseFloat(saCyl[2]!) });

  // Sector area: "area of sector radius 5 angle 60"
  const sectorArea = lower.match(/area\s+(?:of\s+)?(?:a\s+)?sector\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?angle\s*[=:]?\s*)(\d+\.?\d*)/);
  if (sectorArea) return geoProblem(input, 'area', 'sector', { radius: parseFloat(sectorArea[1]!), angle: parseFloat(sectorArea[2]!) });

  // Arc length: "arc length radius 5 angle 60"
  const arcLen = lower.match(/arc\s+length\s+(?:(?:with\s+)?radius\s*[=:]?\s*)?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?angle\s*[=:]?\s*)(\d+\.?\d*)/);
  if (arcLen) return geoProblem(input, 'arc-length', 'sector', { radius: parseFloat(arcLen[1]!), angle: parseFloat(arcLen[2]!) });

  return null;
}

function geoProblem(raw: string, measure: string, shape: string, dims: Record<string, number>): Problem {
  return {
    type: 'geometry',
    subject: 'math',
    rawInput: raw,
    inputs: { measure, shape, ...dims },
    goal: `find ${measure}`,
    confidence: 1.0,
    topic: 'measurement.area',
  };
}

// ─── Financial ───────────────────────────────────────────────────

function identifyFinancial(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  // "simple interest 5000 at 3% for 5 years"
  const si = lower.match(/simple\s+interest\s+(\d+\.?\d*)\s+(?:at\s+)?(\d+\.?\d*)\s*%\s+(?:for\s+)?(\d+\.?\d*)\s*(?:year|yr)/);
  if (si) return { type: 'financial', subject: 'math', rawInput: input, inputs: { type: 'simple-interest', principal: parseFloat(si[1]!), rate: parseFloat(si[2]!), time: parseFloat(si[3]!) }, goal: 'find interest', confidence: 1.0, topic: 'financial.interest' };

  // "compound interest 5000 at 3% for 5 years"
  const ci = lower.match(/compound\s+interest\s+(\d+\.?\d*)\s+(?:at\s+)?(\d+\.?\d*)\s*%\s+(?:for\s+)?(\d+\.?\d*)\s*(?:year|yr)/);
  if (ci) return { type: 'financial', subject: 'math', rawInput: input, inputs: { type: 'compound-interest', principal: parseFloat(ci[1]!), rate: parseFloat(ci[2]!), time: parseFloat(ci[3]!), compounds: 1 }, goal: 'find amount', confidence: 1.0, topic: 'financial.interest' };

  // "profit cost 50 selling 65" or "profit on cost 50 sell 65"
  const pl = lower.match(/(?:profit|loss)\s+(?:on\s+)?(?:cost\s*(?:price\s*)?[=:]?\s*)(\d+\.?\d*)\s*(?:,?\s*(?:sell(?:ing)?\s*(?:price\s*)?[=:]?\s*))(\d+\.?\d*)/);
  if (pl) return { type: 'financial', subject: 'math', rawInput: input, inputs: { type: 'profit-loss', cost: parseFloat(pl[1]!), selling: parseFloat(pl[2]!) }, goal: 'find profit/loss', confidence: 1.0, topic: 'financial.profit-loss' };

  // "discount 20% on 150" or "20% discount on 150"
  const disc = lower.match(/(\d+\.?\d*)\s*%\s*discount\s+(?:on\s+)?(\d+\.?\d*)/);
  const disc2 = lower.match(/discount\s+(\d+\.?\d*)\s*%\s+(?:on\s+)?(\d+\.?\d*)/);
  const d = disc || disc2;
  if (d) return { type: 'financial', subject: 'math', rawInput: input, inputs: { type: 'discount', discount: parseFloat(d[1]!), original: parseFloat(d[2]!) }, goal: 'find sale price', confidence: 1.0, topic: 'financial.profit-loss' };

  return null;
}

// ─── Statistics ──────────────────────────────────────────────────

function identifyStatistics(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  const match = lower.match(/^(mean|median|mode|range|average)\s+(?:of\s+)?[{([]?([\d.,\s]+)[})\]]?$/);
  if (!match) return null;

  let operation = match[1]!;
  if (operation === 'average') operation = 'mean';

  const values = match[2]!.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  if (values.length < 2) return null;

  return {
    type: 'statistics',
    subject: 'math',
    rawInput: input,
    inputs: { operation, values },
    goal: `find ${operation}`,
    confidence: 1.0,
    topic: 'statistics.data',
  };
}

// ─── Sequences ───────────────────────────────────────────────────

function identifySequence(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  // "find nth term: 2, 5, 8, 11" or "nth term of 2, 5, 8, 11"
  const nthMatch = lower.match(/(?:find\s+)?(?:the\s+)?nth\s+term\s*(?:of|:)?\s*[{([]?([\d.,\s]+)[})\]]?/);
  if (nthMatch) {
    const values = nthMatch[1]!.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (values.length >= 3) {
      const type = isArithmetic(values) ? 'arithmetic' : isGeometric(values) ? 'geometric' : 'arithmetic';
      return { type: 'sequence', subject: 'math', rawInput: input, inputs: { type, values, findN: 10 }, goal: 'find nth term', confidence: 0.9, topic: 'sequences.arithmetic' };
    }
  }

  // "next term: 2, 5, 8, 11" or "what comes next: 2, 4, 8, 16"
  const nextMatch = lower.match(/(?:next\s+term|what\s+comes\s+next|continue)\s*(?:of|:|\s+in)?\s*[{([]?([\d.,\s]+)[})\]]?/);
  if (nextMatch) {
    const values = nextMatch[1]!.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (values.length >= 3) {
      return { type: 'sequence', subject: 'math', rawInput: input, inputs: { type: 'find-next', values }, goal: 'find next term', confidence: 0.9, topic: 'sequences.arithmetic' };
    }
  }

  return null;
}

function isArithmetic(values: number[]): boolean {
  if (values.length < 2) return false;
  const d = values[1]! - values[0]!;
  return values.slice(1).every((v, i) => Math.abs((v - values[i]!) - d) < 1e-9);
}

function isGeometric(values: number[]): boolean {
  if (values.length < 2 || values[0] === 0) return false;
  const r = values[1]! / values[0]!;
  return values.slice(1).every((v, i) => values[i] !== 0 && Math.abs((v / values[i]!) - r) < 1e-9);
}

// ─── Percentage ──────────────────────────────────────────────────

function identifyPercentage(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  const pctOf = lower.match(/^(-?\d+\.?\d*)\s*%?\s*(?:percent\s+)?of\s+(-?\d+\.?\d*)$/);
  if (pctOf) return { type: 'percentage-of', subject: 'math', rawInput: input, inputs: { percent: parseFloat(pctOf[1]!), value: parseFloat(pctOf[2]!) }, goal: 'find the result', confidence: 1.0, topic: 'fractions.percentages' };

  const whatPct = lower.match(/^what\s*%?\s*(?:percent\s+)?is\s+(-?\d+\.?\d*)\s+of\s+(-?\d+\.?\d*)$/);
  if (whatPct) return { type: 'percentage-find', subject: 'math', rawInput: input, inputs: { part: parseFloat(whatPct[1]!), whole: parseFloat(whatPct[2]!) }, goal: 'find the percentage', confidence: 1.0, topic: 'fractions.percentages' };

  const pctOfWhat = lower.match(/^(-?\d+\.?\d*)\s+is\s+(-?\d+\.?\d*)\s*%?\s*(?:percent\s+)?of\s+what$/);
  if (pctOfWhat) return { type: 'percentage-whole', subject: 'math', rawInput: input, inputs: { part: parseFloat(pctOfWhat[1]!), percent: parseFloat(pctOfWhat[2]!) }, goal: 'find the whole', confidence: 1.0, topic: 'fractions.percentages' };

  return null;
}

// ─── Fraction arithmetic ─────────────────────────────────────────

function identifyFraction(input: string): Problem | null {
  const cleaned = input.replace(/\s+/g, '');
  const fracOp = cleaned.match(/^(-?\d+)\/(\d+)\s*([+\-*/×÷])\s*(-?\d+)\/(\d+)$/);
  if (!fracOp) return null;
  const op = fracOp[3] === '×' ? '*' : fracOp[3] === '÷' ? '/' : fracOp[3]!;
  return {
    type: 'fraction', subject: 'math', rawInput: input,
    inputs: { a_num: parseInt(fracOp[1]!), a_den: parseInt(fracOp[2]!), b_num: parseInt(fracOp[4]!), b_den: parseInt(fracOp[5]!), op },
    goal: `compute ${input}`, confidence: 1.0, topic: 'fractions.fractions',
  };
}

// ─── Ratio ───────────────────────────────────────────────────────

function identifyRatio(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ');

  // "divide 120 in ratio 3:5" or "share 120 in the ratio 3:5:2"
  const divideMatch = lower.match(/(?:divide|share|split)\s+(\d+\.?\d*)\s+(?:in\s+)?(?:the\s+)?ratio\s+([\d:]+)/);
  if (divideMatch) {
    const total = parseFloat(divideMatch[1]!);
    const parts = divideMatch[2]!.split(':').map(Number);
    if (parts.length >= 2 && parts.every(p => !isNaN(p) && p > 0)) {
      return { type: 'ratio', subject: 'math', rawInput: input, inputs: { type: 'divide', total, parts }, goal: 'divide in ratio', confidence: 1.0, topic: 'ratio.ratios' };
    }
  }

  // "simplify ratio 12:8" or "simplify 12:8"
  const simplifyMatch = lower.match(/(?:simplify\s+)?(?:ratio\s+)?(\d+)\s*:\s*(\d+)$/);
  if (simplifyMatch && lower.includes('simplify')) {
    return { type: 'ratio', subject: 'math', rawInput: input, inputs: { type: 'simplify', a: parseInt(simplifyMatch[1]!), b: parseInt(simplifyMatch[2]!) }, goal: 'simplify ratio', confidence: 1.0, topic: 'ratio.ratios' };
  }

  return null;
}

// ─── Powers & Surds ──────────────────────────────────────────────

function identifyPowers(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ').replace(/√/g, 'sqrt');

  // "simplify √48" or "simplify sqrt(48)" or "simplify sqrt 48"
  const surdMatch = lower.match(/simplify\s+sqrt\s*\(?(\d+)\)?/);
  if (surdMatch) {
    return { type: 'powers', subject: 'math', rawInput: input, inputs: { type: 'simplify-surd', value: parseInt(surdMatch[1]!) }, goal: 'simplify surd', confidence: 1.0, topic: 'powers.surds' };
  }

  // Also match just "√48"
  const surdDirect = input.match(/^[√]\s*(\d+)$/);
  if (surdDirect) {
    return { type: 'powers', subject: 'math', rawInput: input, inputs: { type: 'simplify-surd', value: parseInt(surdDirect[1]!) }, goal: 'simplify surd', confidence: 0.8, topic: 'powers.surds' };
  }

  // "2^3 * 2^4" or "3^5 / 3^2" — same base power operations
  const powerOp = input.match(/^(\d+)\s*\^\s*(\d+)\s*([*/×÷])\s*\1\s*\^\s*(\d+)$/);
  if (powerOp) {
    const op = powerOp[3] === '×' ? '*' : powerOp[3] === '÷' ? '/' : powerOp[3]!;
    return { type: 'powers', subject: 'math', rawInput: input, inputs: { type: 'index-law', base: parseInt(powerOp[1]!), exp1: parseInt(powerOp[2]!), exp2: parseInt(powerOp[4]!), op }, goal: 'apply index law', confidence: 1.0, topic: 'powers.index-laws' };
  }

  // "2^5" — simple power evaluation
  const simplePower = input.match(/^(\d+\.?\d*)\s*\^\s*(-?\d+)$/);
  if (simplePower) {
    return { type: 'powers', subject: 'math', rawInput: input, inputs: { type: 'evaluate-power', base: parseFloat(simplePower[1]!), exponent: parseInt(simplePower[2]!) }, goal: 'evaluate', confidence: 0.8, topic: 'powers.index-laws' };
  }

  return null;
}

// ─── Inequality ──────────────────────────────────────────────────

function identifyInequality(input: string): Problem | null {
  const cleaned = input.replace(/\s+/g, '').toLowerCase();
  if (!/>|<|>=|<=|≥|≤/.test(cleaned)) return null;
  if (!/x/.test(cleaned)) return null;

  const normalized = cleaned.replace(/≥/g, '>=').replace(/≤/g, '<=');
  const match = normalized.match(/^(.+?)(>=|<=|>|<)(.+)$/);
  if (!match) return null;

  const lhs = parseLinearSide(match[1]!);
  const rhs = parseLinearSide(match[3]!);
  if (!lhs || !rhs) return null;

  const a = lhs.a - rhs.a;
  const b = lhs.b - rhs.b;
  if (a === 0) return null;

  return { type: 'inequality', subject: 'math', rawInput: input, coefficients: { a, b }, inputs: { operator: match[2]! }, goal: 'solve for x', confidence: 1.0, topic: 'algebra.inequalities' };
}

function parseLinearSide(src: string): { a: number; b: number } | null {
  const termRe = /([+-]?\d*\.?\d*)(x?)/g;
  let a = 0, b = 0, found = false;
  let m: RegExpExecArray | null;
  while ((m = termRe.exec(src)) !== null) {
    const [full, numRaw, xPart] = m;
    if (!full || full === '' || full === '+' || full === '-') continue;
    found = true;
    let num: number;
    if (numRaw === '' || numRaw === '+') num = 1;
    else if (numRaw === '-') num = -1;
    else num = parseFloat(numRaw!);
    if (isNaN(num)) continue;
    if (xPart === 'x') a += num;
    else b += num;
  }
  return found ? { a, b } : null;
}

// ─── Simultaneous equations ──────────────────────────────────────

function identifySimultaneous(input: string): Problem | null {
  const parts = input.split(/[,;\n]|\band\b/i).map(s => s.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  if (!parts[0]!.includes('=') || !parts[1]!.includes('=')) return null;
  if (!/[xy]/.test(parts[0]!) || !/[xy]/.test(parts[1]!)) return null;

  const eq1 = parseSimultaneousEq(parts[0]!);
  const eq2 = parseSimultaneousEq(parts[1]!);
  if (!eq1 || !eq2) return null;

  return { type: 'simultaneous', subject: 'math', rawInput: input, inputs: { eq1, eq2 }, goal: 'solve for x and y', confidence: 1.0, topic: 'algebra.simultaneous' };
}

function parseSimultaneousEq(src: string): { a: number; b: number; c: number } | null {
  const cleaned = src.replace(/\s+/g, '').toLowerCase();
  const sides = cleaned.split('=');
  if (sides.length !== 2) return null;
  const lhs = parseSimSide(sides[0]!);
  const rhs = parseSimSide(sides[1]!);
  if (!lhs || !rhs) return null;
  return { a: lhs.a - rhs.a, b: lhs.b - rhs.b, c: -(lhs.c - rhs.c) };
}

function parseSimSide(src: string): { a: number; b: number; c: number } | null {
  const termRe = /([+-]?\d*\.?\d*)([xy]?)/g;
  let a = 0, b = 0, c = 0, found = false;
  let m: RegExpExecArray | null;
  while ((m = termRe.exec(src)) !== null) {
    const [full, numRaw, varPart] = m;
    if (!full || full === '' || full === '+' || full === '-') continue;
    found = true;
    let num: number;
    if (numRaw === '' || numRaw === '+') num = 1;
    else if (numRaw === '-') num = -1;
    else num = parseFloat(numRaw!);
    if (isNaN(num)) continue;
    if (varPart === 'x') a += num;
    else if (varPart === 'y') b += num;
    else c += num;
  }
  return found ? { a, b, c } : null;
}

// ─── Quadratic / Linear / Expression ─────────────────────────────

function identifyQuadratic(input: string): Problem | null {
  if (!/x\s*\^\s*2/.test(input)) return null;
  const coeffs = parseQuadratic(input);
  if (!coeffs) return null;
  return { type: 'quadratic', subject: 'math', rawInput: input, coefficients: { a: coeffs.a, b: coeffs.b, c: coeffs.c }, goal: 'solve for x', confidence: 1.0, topic: 'algebra.quadratics' };
}

function identifyLinear(input: string): Problem | null {
  if (!/x/.test(input) || !input.includes('=')) return null;
  const coeffs = parseLinear(input);
  if (!coeffs) return null;
  return { type: 'linear', subject: 'math', rawInput: input, coefficients: { a: coeffs.a, b: coeffs.b }, goal: 'solve for x', confidence: 1.0, topic: 'algebra.linear-equations' };
}

// ─── Graph/Sketch ────────────────────────────────────────────────

function identifyGraph(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ').replace(/\u2212/g, '-').replace(/\u00D7/g, '*');

  // Normalize expression helper
  const normExpr = (e: string) => e.trim();

  // "sketch y = x² - 4" or "graph y = 2x + 3" or "plot y = ..."
  const sketchMatch = s.match(/(?:sketch|graph|plot|draw)\s+y\s*=\s*(.+?)(?:\.|$|where|find|how)/);
  if (sketchMatch) {
    const expr = normExpr(sketchMatch[1]!);
    return { type: 'graph-function', subject: 'math', rawInput: input, inputs: { expr, original: sketchMatch[1]!.trim() }, goal: 'sketch graph', confidence: 1.0, topic: 'algebra.non-linear' };
  }

  // "y = x² - 4. Where does it cross the x-axis?" or "y = x² − 4. Where..."
  const yEquals = s.match(/y\s*=\s*([^.?!]+?)(?:[.?!]\s*(?:where|find|what|how)|$)/);
  if (yEquals && (/x.*(?:axis|intercept|cross|root|zero)/.test(s) || /sketch|graph|plot|draw/.test(s))) {
    const expr = normExpr(yEquals[1]!);
    return { type: 'graph-function', subject: 'math', rawInput: input, inputs: { expr, original: yEquals[1]!.trim(), findIntercepts: true }, goal: 'find intercepts', confidence: 1.0, topic: 'algebra.non-linear' };
  }

  // Catch-all: any "y = expression" that contains x and is a question
  const yExpr = s.match(/y\s*=\s*([^.?!]+)/);
  if (yExpr && /x/.test(yExpr[1]!) && /\?|find|sketch|graph|where|cross/.test(s)) {
    const expr = normExpr(yExpr[1]!);
    return { type: 'graph-function', subject: 'math', rawInput: input, inputs: { expr, original: yExpr[1]!.trim(), findIntercepts: true }, goal: 'graph and analyse', confidence: 0.85, topic: 'algebra.non-linear' };
  }

  return null;
}

function identifyExpression(input: string): Problem | null {
  if (input.includes('=')) return null;
  if (!/[a-z]/i.test(input)) return null;
  const poly = parsePolynomial(input);
  if (poly && poly.degree > 0) {
    return { type: 'expression', subject: 'math', rawInput: input, inputs: { degree: poly.degree }, goal: 'simplify', confidence: 0.7, topic: 'algebra.expressions' };
  }
  return null;
}

// ─── Pythagoras ──────────────────────────────────────────────────

function identifyPythagoras(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  // "find hypotenuse a=3 b=4" or "pythagoras 3 4"
  const hyp = s.match(/(?:find\s+)?(?:hypotenuse|pythagoras).*?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?)(\d+\.?\d*)/);
  if (hyp) return { type: 'pythagoras', subject: 'math', rawInput: input, inputs: { find: 'hypotenuse', a: parseFloat(hyp[1]!), b: parseFloat(hyp[2]!) }, goal: 'find hypotenuse', confidence: 1.0, topic: 'geometry.pythagoras' };

  const side = s.match(/(?:find\s+)?(?:missing\s+)?side.*?hypotenuse\s*[=:]?\s*(\d+\.?\d*).*?(?:side|leg)\s*[=:]?\s*(\d+\.?\d*)/);
  if (side) return { type: 'pythagoras', subject: 'math', rawInput: input, inputs: { find: 'side', hypotenuse: parseFloat(side[1]!), known: parseFloat(side[2]!) }, goal: 'find missing side', confidence: 1.0, topic: 'geometry.pythagoras' };

  const pyth = s.match(/pythagoras.*?(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?)(\d+\.?\d*)\s*(?:,?\s*(?:and\s+)?)(\d+\.?\d*)?/);
  if (pyth && !pyth[3]) return { type: 'pythagoras', subject: 'math', rawInput: input, inputs: { find: 'hypotenuse', a: parseFloat(pyth[1]!), b: parseFloat(pyth[2]!) }, goal: 'find hypotenuse', confidence: 0.8, topic: 'geometry.pythagoras' };

  return null;
}

// ─── Trigonometry ────────────────────────────────────────────────

function identifyTrig(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  // Preserve original case for angle (A,B,C) vs side (a,b,c) distinction
  const original = input.replace(/\s+/g, ' ');

  // Extract angle assignments: A = 40° or A=40 degrees (UPPERCASE = angles)
  // After normalization: ° becomes " degrees ", ² becomes "^2"
  const angles: Record<string, number> = {};
  const angleRe = /([A-C])\s*=\s*(\d+\.?\d*)\s*(?:\u00B0|degrees?|deg|°)?\s*,?/g;
  let am: RegExpExecArray | null;
  while ((am = angleRe.exec(original)) !== null) {
    angles[am[1]!] = parseFloat(am[2]!);
  }

  // Extract side assignments: a = 10 cm or a=10 (lowercase = sides)
  const sides: Record<string, number> = {};
  const sideRe = /\b([a-c])\s*=\s*(\d+\.?\d*)\s*(?:cm|m|mm|km)?/g;
  let sm: RegExpExecArray | null;
  while ((sm = sideRe.exec(original)) !== null) {
    sides[sm[1]!] = parseFloat(sm[2]!);
  }

  // Extract "find b" or "Find B"
  let findVar = '';
  const findMatch = original.match(/[Ff]ind\s+([a-cA-C])/);
  if (findMatch) findVar = findMatch[1]!;

  // Sine rule: 2+ angles + 1+ side + find variable
  if (Object.keys(angles).length >= 2 && Object.keys(sides).length >= 1 && findVar) {
    return { type: 'sine-rule', subject: 'math', rawInput: input, inputs: { angles, sides, find: findVar }, goal: `find ${findVar}`, confidence: 1.0, topic: 'geometry.triangles' };
  }

  // Sine rule: 1 angle + 1 side with matching letter + find different side
  if (Object.keys(angles).length >= 1 && Object.keys(sides).length >= 1 && findVar) {
    // Check if we have a matching pair (e.g., A and a)
    const hasMatch = Object.keys(angles).some(ak => sides[ak.toLowerCase()] !== undefined);
    if (hasMatch) {
      return { type: 'sine-rule', subject: 'math', rawInput: input, inputs: { angles, sides, find: findVar }, goal: `find ${findVar}`, confidence: 0.9, topic: 'geometry.triangles' };
    }
  }

  // Cosine rule: 2+ sides + 1+ angle + find variable
  if (Object.keys(sides).length >= 2 && Object.keys(angles).length >= 1 && findVar) {
    return { type: 'cosine-rule', subject: 'math', rawInput: input, inputs: { angles, sides, find: findVar }, goal: `find ${findVar}`, confidence: 1.0, topic: 'geometry.triangles' };
  }

  // Cosine rule: 3 sides, find angle
  if (Object.keys(sides).length >= 3 && findVar && findVar === findVar.toUpperCase()) {
    return { type: 'cosine-rule', subject: 'math', rawInput: input, inputs: { angles, sides, find: findVar }, goal: `find ${findVar}`, confidence: 1.0, topic: 'geometry.triangles' };
  }

  // "sin 30", "cos(45)", "tan 60 degrees"
  const evalTrig = s.match(/^(sin|cos|tan)\s*\(?(\d+\.?\d*)\)?\s*(degrees?|deg|rad|radians)?$/);
  if (evalTrig) {
    const unit = (!evalTrig[3] || /deg/.test(evalTrig[3])) ? 'degrees' : 'radians';
    return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'evaluate', fn: evalTrig[1]!, angle: parseFloat(evalTrig[2]!), unit }, goal: 'evaluate', confidence: 1.0, topic: 'geometry.triangles' };
  }

  // "find angle opposite=3 hypotenuse=5"
  const findAngle = s.match(/find\s+(?:the\s+)?angle.*?opposite\s*[=:]?\s*(\d+\.?\d*).*?hypotenuse\s*[=:]?\s*(\d+\.?\d*)/);
  if (findAngle) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-angle', ratio: 'sin', opposite: parseFloat(findAngle[1]!), hypotenuse: parseFloat(findAngle[2]!) }, goal: 'find angle', confidence: 1.0, topic: 'geometry.triangles' };

  const findAngle2 = s.match(/find\s+(?:the\s+)?angle.*?adjacent\s*[=:]?\s*(\d+\.?\d*).*?hypotenuse\s*[=:]?\s*(\d+\.?\d*)/);
  if (findAngle2) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-angle', ratio: 'cos', adjacent: parseFloat(findAngle2[1]!), hypotenuse: parseFloat(findAngle2[2]!) }, goal: 'find angle', confidence: 1.0, topic: 'geometry.triangles' };

  const findAngle3 = s.match(/find\s+(?:the\s+)?angle.*?opposite\s*[=:]?\s*(\d+\.?\d*).*?adjacent\s*[=:]?\s*(\d+\.?\d*)/);
  if (findAngle3) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-angle', ratio: 'tan', opposite: parseFloat(findAngle3[1]!), adjacent: parseFloat(findAngle3[2]!) }, goal: 'find angle', confidence: 1.0, topic: 'geometry.triangles' };

  // ─── Trig word problems ─────────────────────────────────────
  // "A ladder makes a 65° angle with the ground. Base is 3m from wall. How long is the ladder?"
  const ladderHyp = s.match(/(?:ladder|pole|rope|wire|ramp).*?(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:base|bottom|foot|ground)\s*(?:is\s+)?(\d+\.?\d*)\s*(?:m|metre|meter|ft|foot)?.*?(?:how\s+long|find\s+(?:the\s+)?(?:length|ladder|hypotenuse))/);
  if (ladderHyp) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn: 'cos', angle: parseFloat(ladderHyp[1]!), known: parseFloat(ladderHyp[2]!), findSide: 'hypotenuse', context: 'Length of ladder' }, goal: 'find hypotenuse', confidence: 0.95, topic: 'geometry.triangles' };

  // "A tree casts a shadow 12m long. Angle of elevation is 40°. Find height"
  const shadowHeight = s.match(/(?:shadow|distance).*?(\d+\.?\d*)\s*(?:m|metre|meter|ft)?.*?angle.*?(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:height|tall|how\s+high)/);
  if (shadowHeight) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn: 'tan', angle: parseFloat(shadowHeight[2]!), known: parseFloat(shadowHeight[1]!), findSide: 'opposite', context: 'Height' }, goal: 'find height', confidence: 0.95, topic: 'geometry.triangles' };

  // Reverse: "Height 10m, angle 35°, find distance/shadow"
  const heightDist = s.match(/(?:height|tall|high).*?(\d+\.?\d*)\s*(?:m|metre|meter|ft)?.*?angle.*?(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:shadow|distance|far|base)/);
  if (heightDist) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn: 'tan', angle: parseFloat(heightDist[2]!), known: parseFloat(heightDist[1]!), findSide: 'adjacent', context: 'Distance' }, goal: 'find distance', confidence: 0.95, topic: 'geometry.triangles' };

  // "From 20m away, angle of elevation to top of building is 55°. Find height"
  const elevationHeight = s.match(/(\d+\.?\d*)\s*(?:m|metre|meter|ft)?\s*(?:away|from|distance).*?angle.*?(?:elevation\s+)?(?:is\s+)?(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:height|find|how)/);
  if (elevationHeight) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn: 'tan', angle: parseFloat(elevationHeight[2]!), known: parseFloat(elevationHeight[1]!), findSide: 'opposite', context: 'Height' }, goal: 'find height', confidence: 0.95, topic: 'geometry.triangles' };

  // "Angle of depression from 50m cliff is 30°. How far is the boat?"
  const depressionDist = s.match(/(?:angle\s+of\s+)?depression.*?(\d+\.?\d*)\s*(?:m|metre|meter|ft)?.*?(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:how\s+far|distance|find)/);
  if (depressionDist) return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn: 'tan', angle: parseFloat(depressionDist[2]!), known: parseFloat(depressionDist[1]!), findSide: 'adjacent', context: 'Distance' }, goal: 'find distance', confidence: 0.95, topic: 'geometry.triangles' };

  // Generic: "angle X°, side Y, find [hypotenuse/opposite/adjacent]"
  const genericTrig = s.match(/(\d+\.?\d*)\s*(?:\u00B0|degrees?).*?(?:side|length|distance)\s*(?:is\s+)?(\d+\.?\d*).*?find\s+(?:the\s+)?(hypotenuse|opposite|adjacent|height|length|ladder|distance)/);
  if (genericTrig) {
    const findWhat = genericTrig[3]!;
    const findSide = /hypotenuse|ladder|length/.test(findWhat) ? 'hypotenuse' : /opposite|height/.test(findWhat) ? 'opposite' : 'adjacent';
    const fn = findSide === 'hypotenuse' ? 'cos' : findSide === 'opposite' ? 'tan' : 'tan';
    return { type: 'trig', subject: 'math', rawInput: input, inputs: { type: 'find-side', fn, angle: parseFloat(genericTrig[1]!), known: parseFloat(genericTrig[2]!), findSide, context: findWhat }, goal: `find ${findWhat}`, confidence: 0.85, topic: 'geometry.triangles' };
  }

  // ─── Bearing / Navigation problems ────────────────────────────
  // "flies 200km on a bearing of 040°" or "walks 5km on bearing 120°"
  const bearing = s.match(/(\d+\.?\d*)\s*(?:km|m|miles?|metres?|meters?)?\s+(?:on\s+)?(?:a\s+)?bearing\s+(?:of\s+)?0?(\d+)\s*(?:\u00B0|degrees?)?/);
  if (bearing) {
    const dist = parseFloat(bearing[1]!);
    const angle = parseInt(bearing[2]!);
    return { type: 'bearing', subject: 'math', rawInput: input, inputs: { distance: dist, bearing: angle }, goal: 'find components', confidence: 1.0, topic: 'geometry.triangles' };
  }

  // "bearing from A to B" with coordinates
  const bearingCoords = s.match(/bearing.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?(?:to|and)\s*\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (bearingCoords) {
    return { type: 'bearing-coords', subject: 'math', rawInput: input, inputs: { x1: parseFloat(bearingCoords[1]!), y1: parseFloat(bearingCoords[2]!), x2: parseFloat(bearingCoords[3]!), y2: parseFloat(bearingCoords[4]!) }, goal: 'find bearing', confidence: 1.0, topic: 'geometry.triangles' };
  }

  return null;
}

// ─── Coordinate Geometry ─────────────────────────────────────────

function identifyCoordinate(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  // "distance between (1,2) and (4,6)" or "distance (1,2) (4,6)"
  const dist = s.match(/distance.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (dist) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'distance', x1: parseFloat(dist[1]!), y1: parseFloat(dist[2]!), x2: parseFloat(dist[3]!), y2: parseFloat(dist[4]!) }, goal: 'find distance', confidence: 1.0, topic: 'geometry.coordinate' };

  const mid = s.match(/midpoint.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (mid) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'midpoint', x1: parseFloat(mid[1]!), y1: parseFloat(mid[2]!), x2: parseFloat(mid[3]!), y2: parseFloat(mid[4]!) }, goal: 'find midpoint', confidence: 1.0, topic: 'geometry.coordinate' };

  const grad = s.match(/(?:gradient|slope).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (grad) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'gradient', x1: parseFloat(grad[1]!), y1: parseFloat(grad[2]!), x2: parseFloat(grad[3]!), y2: parseFloat(grad[4]!) }, goal: 'find gradient', confidence: 1.0, topic: 'geometry.coordinate' };

  const eq = s.match(/(?:equation of line|line through).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (eq) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'equation', x1: parseFloat(eq[1]!), y1: parseFloat(eq[2]!), x2: parseFloat(eq[3]!), y2: parseFloat(eq[4]!) }, goal: 'find equation', confidence: 1.0, topic: 'geometry.coordinate' };

  // Word problems: "how far from A(1,2) to B(4,6)" / "find distance from (1,2) to (4,6)"
  const distWord = s.match(/(?:how\s+far|find\s+(?:the\s+)?distance|length).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?(?:to|and)\s*\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (distWord) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'distance', x1: parseFloat(distWord[1]!), y1: parseFloat(distWord[2]!), x2: parseFloat(distWord[3]!), y2: parseFloat(distWord[4]!) }, goal: 'find distance', confidence: 0.95, topic: 'geometry.coordinate' };

  // "find the midpoint of A(1,2) and B(4,6)"
  const midWord = s.match(/(?:find\s+(?:the\s+)?)?(?:midpoint|middle|centre|center).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?(?:and|to)\s*\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (midWord) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'midpoint', x1: parseFloat(midWord[1]!), y1: parseFloat(midWord[2]!), x2: parseFloat(midWord[3]!), y2: parseFloat(midWord[4]!) }, goal: 'find midpoint', confidence: 0.95, topic: 'geometry.coordinate' };

  // "find the slope/gradient of line from (1,2) to (4,6)"
  const gradWord = s.match(/(?:find\s+(?:the\s+)?)?(?:slope|gradient|steepness).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?(?:to|and)\s*\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (gradWord) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'gradient', x1: parseFloat(gradWord[1]!), y1: parseFloat(gradWord[2]!), x2: parseFloat(gradWord[3]!), y2: parseFloat(gradWord[4]!) }, goal: 'find gradient', confidence: 0.95, topic: 'geometry.coordinate' };

  // "find the equation of line through (1,2) and (4,6)"
  const eqWord = s.match(/(?:find\s+(?:the\s+)?)?(?:equation|formula).*?(?:line|through).*?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?.*?(?:and|to)\s*\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (eqWord) return { type: 'coordinate', subject: 'math', rawInput: input, inputs: { type: 'equation', x1: parseFloat(eqWord[1]!), y1: parseFloat(eqWord[2]!), x2: parseFloat(eqWord[3]!), y2: parseFloat(eqWord[4]!) }, goal: 'find equation', confidence: 0.95, topic: 'geometry.coordinate' };

  return null;
}

// ─── Logarithms ──────────────────────────────────────────────────

function identifyLogarithm(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  // "log2(8)" or "log base 2 of 8" or "log_2 8"
  const logEval = s.match(/log\s*(?:_?\s*(\d+)\s*)?(?:\((\d+\.?\d*)\)|(?:of\s+)?(\d+\.?\d*))/);
  if (logEval) {
    const base = logEval[1] ? parseInt(logEval[1]) : 10;
    const value = parseFloat(logEval[2] || logEval[3] || '0');
    if (value > 0) return { type: 'logarithm', subject: 'math', rawInput: input, inputs: { type: 'evaluate', base, value }, goal: 'evaluate', confidence: 1.0, topic: 'powers.logarithms' };
  }

  // "solve 2^x = 16"
  const expEq = s.match(/(?:solve\s+)?(\d+\.?\d*)\s*\^\s*x\s*=\s*(\d+\.?\d*)/);
  if (expEq) return { type: 'logarithm', subject: 'math', rawInput: input, inputs: { type: 'solve-exponential', base: parseFloat(expEq[1]!), value: parseFloat(expEq[2]!) }, goal: 'solve for x', confidence: 1.0, topic: 'powers.logarithms' };

  return null;
}

// ─── Unit Conversion ─────────────────────────────────────────────

function identifyUnitConversion(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  const m = s.match(/convert\s+(\d+\.?\d*)\s*(\w+)\s+to\s+(\w+)/);
  if (m) return { type: 'unit-conversion', subject: 'math', rawInput: input, inputs: { value: parseFloat(m[1]!), from: m[2]!, to: m[3]! }, goal: 'convert', confidence: 1.0, topic: 'measurement.perimeter' };

  // "5km in metres" or "5 km to m"
  const m2 = s.match(/(\d+\.?\d*)\s*(\w+)\s+(?:in|to)\s+(\w+)/);
  if (m2 && /^(km|m|cm|mm|miles?|ft|in|kg|g|mg|lb|oz|hours?|minutes?|seconds?|days?|weeks?|litres?|ml|gallons?|celsius|fahrenheit|c|f)$/.test(m2[2]!)) {
    return { type: 'unit-conversion', subject: 'math', rawInput: input, inputs: { value: parseFloat(m2[1]!), from: m2[2]!, to: m2[3]! }, goal: 'convert', confidence: 0.9, topic: 'measurement.perimeter' };
  }

  return null;
}

// ─── Number Bases ────────────────────────────────────────────────

function identifyNumberBase(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  // "convert 101 binary to decimal" or "101 base 2 to decimal"
  const toDecimal = s.match(/(?:convert\s+)?([01]+)\s+(?:binary|base\s*2)\s+to\s+decimal/);
  if (toDecimal) return { type: 'number-base', subject: 'math', rawInput: input, inputs: { type: 'to-decimal', value: toDecimal[1]!, base: 2 }, goal: 'convert to decimal', confidence: 1.0, topic: 'number.types' };

  const toDecimalN = s.match(/(?:convert\s+)?(\w+)\s+base\s*(\d+)\s+to\s+(?:decimal|base\s*10)/);
  if (toDecimalN) return { type: 'number-base', subject: 'math', rawInput: input, inputs: { type: 'to-decimal', value: toDecimalN[1]!, base: parseInt(toDecimalN[2]!) }, goal: 'convert to decimal', confidence: 1.0, topic: 'number.types' };

  // "convert 25 to binary" or "25 decimal to base 2"
  const fromDecimal = s.match(/(?:convert\s+)?(\d+)\s+(?:decimal\s+)?to\s+(?:binary|base\s*2)/);
  if (fromDecimal) return { type: 'number-base', subject: 'math', rawInput: input, inputs: { type: 'from-decimal', value: parseInt(fromDecimal[1]!), base: 2 }, goal: 'convert from decimal', confidence: 1.0, topic: 'number.types' };

  const fromDecimalN = s.match(/(?:convert\s+)?(\d+)\s+(?:decimal\s+)?to\s+base\s*(\d+)/);
  if (fromDecimalN) return { type: 'number-base', subject: 'math', rawInput: input, inputs: { type: 'from-decimal', value: parseInt(fromDecimalN[1]!), base: parseInt(fromDecimalN[2]!) }, goal: 'convert from decimal', confidence: 1.0, topic: 'number.types' };

  return null;
}

// ─── Transformations ─────────────────────────────────────────────

function identifyTransformation(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  const reflect = s.match(/reflect\s+\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?\s+(?:in\s+)?(?:the\s+)?(x[- ]?axis|y[- ]?axis|origin|y\s*=\s*x)/);
  if (reflect) {
    const line = reflect[3]!.replace(/\s/g, '');
    const type = line.includes('x') && line.includes('axis') ? 'reflect-x' : line.includes('y') && line.includes('axis') ? 'reflect-y' : line === 'origin' ? 'reflect-origin' : 'reflect-y=x';
    return { type: 'transformation', subject: 'math', rawInput: input, inputs: { type, x: parseFloat(reflect[1]!), y: parseFloat(reflect[2]!) }, goal: 'reflect point', confidence: 1.0, topic: 'geometry.transformations' };
  }

  const rotate = s.match(/rotate\s+\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?\s+(?:by\s+)?(\d+)\s*(?:\u00B0|degrees?)?/);
  if (rotate) {
    const angle = parseInt(rotate[3]!);
    const type = angle === 90 ? 'rotate-90' : angle === 180 ? 'rotate-180' : 'rotate-90';
    return { type: 'transformation', subject: 'math', rawInput: input, inputs: { type, x: parseFloat(rotate[1]!), y: parseFloat(rotate[2]!) }, goal: 'rotate point', confidence: 1.0, topic: 'geometry.transformations' };
  }

  const translate = s.match(/translate\s+\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?\s+(?:by\s+)?\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/);
  if (translate) {
    return { type: 'transformation', subject: 'math', rawInput: input, inputs: { type: 'translate', x: parseFloat(translate[1]!), y: parseFloat(translate[2]!), dx: parseFloat(translate[3]!), dy: parseFloat(translate[4]!) }, goal: 'translate point', confidence: 1.0, topic: 'geometry.transformations' };
  }

  const enlarge = s.match(/enlarge\s+\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?\s+(?:by\s+)?(?:scale\s+)?(?:factor\s+)?(-?\d+\.?\d*)/);
  if (enlarge) {
    return { type: 'transformation', subject: 'math', rawInput: input, inputs: { type: 'enlarge', x: parseFloat(enlarge[1]!), y: parseFloat(enlarge[2]!), scaleFactor: parseFloat(enlarge[3]!) }, goal: 'enlarge point', confidence: 1.0, topic: 'geometry.transformations' };
  }

  return null;
}

// ─── Factorisation ───────────────────────────────────────────────

function identifyFactorise(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  if (!/factoris|factori?ze/.test(s)) return null;

  // "factorise x²+5x+6"
  const quad = s.match(/factoris[ez]\s*:?\s*(.+)/);
  if (quad) {
    const expr = quad[1]!.trim();
    // Try parsing as quadratic
    const qCoeffs = parseQuadratic(expr + ' = 0');
    if (qCoeffs) {
      return { type: 'factorise', subject: 'math', rawInput: input, inputs: { type: 'quadratic', a: qCoeffs.a, b: qCoeffs.b, c: qCoeffs.c }, goal: 'factorise', confidence: 1.0, topic: 'algebra.expressions' };
    }
  }

  return null;
}

// ─── Cubic ───────────────────────────────────────────────────────

function identifyCubic(input: string): Problem | null {
  if (!/x\s*\^\s*3/.test(input)) return null;
  if (!input.includes('=')) return null;

  const cleaned = input.replace(/\s+/g, '').toLowerCase();
  const sides = cleaned.split('=');
  if (sides.length !== 2) return null;

  // Simple parsing of ax³ + bx² + cx + d
  const coeffs = parseCubicSide(sides[0]!);
  const rhs = parseCubicSide(sides[1]!);
  if (!coeffs || !rhs) return null;

  return {
    type: 'cubic', subject: 'math', rawInput: input,
    inputs: { a: coeffs.a - rhs.a, b: coeffs.b - rhs.b, c: coeffs.c - rhs.c, d: coeffs.d - rhs.d },
    goal: 'solve cubic', confidence: 1.0, topic: 'algebra.polynomials',
  };
}

function parseCubicSide(src: string): { a: number; b: number; c: number; d: number } | null {
  const termRe = /([+-]?\d*\.?\d*)(x(?:\^[23])?)?/g;
  let a = 0, b = 0, c = 0, d = 0, found = false;
  let m: RegExpExecArray | null;
  while ((m = termRe.exec(src)) !== null) {
    const [full, numRaw, xPart] = m;
    if (!full || full === '') { termRe.lastIndex++; continue; }
    if (full === '+' || full === '-') continue;
    found = true;
    let num: number;
    if (numRaw === '' || numRaw === '+') num = 1;
    else if (numRaw === '-') num = -1;
    else num = parseFloat(numRaw!);
    if (isNaN(num)) continue;
    if (xPart === 'x^3') a += num;
    else if (xPart === 'x^2') b += num;
    else if (xPart === 'x') c += num;
    else d += num;
  }
  return found ? { a, b, c, d } : null;
}

// ─── Probability ─────────────────────────────────────────────────

function identifyProbability(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  // "probability of rolling 7 on two dice"
  const dice = s.match(/(?:probability|chance)\s+(?:of\s+)?(?:rolling|getting|sum)\s+(\d+)\s+(?:on|with)\s+(\d+)?\s*(?:two\s+)?dic/);
  if (dice) return { type: 'probability', subject: 'math', rawInput: input, inputs: { type: 'dice', target: parseInt(dice[1]!), count: dice[2] ? parseInt(dice[2]) : 2 }, goal: 'find probability', confidence: 1.0, topic: 'statistics.probability' };

  // "probability of 3 heads in 5 flips"
  const coins = s.match(/(?:probability|chance)\s+(?:of\s+)?(\d+)\s+heads?\s+in\s+(\d+)\s+(?:flip|toss|coin)/);
  if (coins) return { type: 'probability', subject: 'math', rawInput: input, inputs: { type: 'coins', heads: parseInt(coins[1]!), flips: parseInt(coins[2]!) }, goal: 'find probability', confidence: 1.0, topic: 'statistics.probability' };

  // "probability: 3 favourable out of 10"
  const simple = s.match(/(?:probability|chance)\s*:?\s*(\d+)\s+(?:favourable|favorable|out)\s+(?:of|from)\s+(\d+)/);
  if (simple) return { type: 'probability', subject: 'math', rawInput: input, inputs: { type: 'simple', favourable: parseInt(simple[1]!), total: parseInt(simple[2]!) }, goal: 'find probability', confidence: 1.0, topic: 'statistics.probability' };

  return null;
}

// ─── Sets ────────────────────────────────────────────────────────

function identifySets(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');

  // "A union B: A={1,2,3} B={3,4,5}" or "A ∪ B where A={1,2,3} B={3,4,5}"
  const setOp = s.match(/(union|intersection|difference|\u222a|\u2229).*?a\s*=?\s*\{([\d,\s]+)\}.*?b\s*=?\s*\{([\d,\s]+)\}/);
  if (setOp) {
    const op = setOp[1]!;
    const type = /union|\u222a/.test(op) ? 'union' : /intersection|\u2229/.test(op) ? 'intersection' : 'difference';
    const a = setOp[2]!.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const b = setOp[3]!.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    return { type: 'sets', subject: 'math', rawInput: input, inputs: { type, a, b }, goal: `find ${type}`, confidence: 1.0, topic: 'statistics.data' };
  }

  return null;
}

// ─── Missing Number ──────────────────────────────────────────────

function identifyMissingNumber(input: string): Problem | null {
  // "2, 4, ?, 16, 32" or "2, 4, _, 16, 32"
  if (!/[?_]/.test(input)) return null;
  const parts = input.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 4) return null;

  const values: (number | null)[] = [];
  let missingIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '?' || parts[i] === '_') {
      values.push(null);
      missingIndex = i;
    } else {
      const n = parseFloat(parts[i]!);
      if (isNaN(n)) return null;
      values.push(n);
    }
  }

  if (missingIndex < 0) return null;
  if (values.filter(v => v !== null).length < 3) return null;

  return { type: 'missing-number', subject: 'math', rawInput: input, inputs: { values, missingIndex }, goal: 'find missing number', confidence: 1.0, topic: 'sequences.other' };
}

// ─── Number Analogies ────────────────────────────────────────────

function identifyAnalogy(input: string): Problem | null {
  const s = input.replace(/\s+/g, ' ').trim();

  // "3→9, 4→16, 5→?" or "3->9, 4->16, 5->?"
  const pairRe = /(\d+\.?\d*)\s*(?:→|->|=>)\s*(\d+\.?\d*)/g;
  const queryRe = /(\d+\.?\d*)\s*(?:→|->|=>)\s*\?/;

  const pairs: [number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(s)) !== null) {
    pairs.push([parseFloat(m[1]!), parseFloat(m[2]!)]);
  }

  const queryMatch = s.match(queryRe);
  if (!queryMatch || pairs.length < 2) return null;

  return { type: 'analogy', subject: 'math', rawInput: input, inputs: { pairs, query: parseFloat(queryMatch[1]!) }, goal: 'find pattern', confidence: 1.0, topic: 'sequences.other' };
}

// ─── Odd One Out ─────────────────────────────────────────────────

function identifyOddOneOut(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  if (!/odd\s+one\s+out|doesn'?t\s+belong|which\s+is\s+different|which\s+does\s+not\s+belong/.test(s)) return null;

  const numbers = [...s.matchAll(/\d+/g)].map(m => parseInt(m[0]));
  if (numbers.length < 4) return null;

  return { type: 'odd-one-out', subject: 'math', rawInput: input, inputs: { values: numbers }, goal: 'find odd one out', confidence: 1.0, topic: 'number.types' };
}

// ─── Number Matrix ───────────────────────────────────────────────

function identifyMatrix(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  if (!/matrix|grid|table/.test(s) && !/\|/.test(input) && !/\n/.test(input)) return null;

  // Try to parse grid from "2,4,6 | 3,6,? | 4,8,12" or rows separated by |, /, or newline
  const rowSep = input.includes('|') ? '|' : input.includes('/') ? '/' : '\n';
  const rows = input.split(rowSep).map(r => r.trim()).filter(Boolean);
  if (rows.length < 2) return null;

  const grid: (number | null)[][] = [];
  let missingRow = -1, missingCol = -1;

  for (let r = 0; r < rows.length; r++) {
    const cells = rows[r]!.split(/[,\s]+/).map(c => c.trim()).filter(Boolean);
    const row: (number | null)[] = [];
    for (let c = 0; c < cells.length; c++) {
      if (cells[c] === '?' || cells[c] === '_') {
        row.push(null);
        missingRow = r;
        missingCol = c;
      } else {
        const n = parseFloat(cells[c]!);
        row.push(isNaN(n) ? null : n);
      }
    }
    grid.push(row);
  }

  if (missingRow < 0) return null;

  return { type: 'matrix', subject: 'math', rawInput: input, inputs: { grid, missingRow, missingCol }, goal: 'find missing number', confidence: 0.9, topic: 'sequences.other' };
}

// ─── Magic Square ────────────────────────────────────────────────

function identifyMagicSquare(input: string): Problem | null {
  const s = input.toLowerCase().replace(/\s+/g, ' ');
  if (!/magic\s+square/.test(s)) return null;

  // Parse grid from the input
  const gridPart = s.replace(/magic\s+square\s*:?\s*/i, '');
  const rows = gridPart.split(/[|\/\n]/).map(r => r.trim()).filter(Boolean);
  if (rows.length < 3) return null;

  const grid: (number | null)[][] = [];
  for (const row of rows) {
    const cells = row.split(/[,\s]+/).map(c => {
      if (c === '?' || c === '_') return null;
      const n = parseFloat(c);
      return isNaN(n) ? null : n;
    });
    grid.push(cells);
  }

  // Extract magic sum if provided
  const sumMatch = s.match(/sum\s*[=:]\s*(\d+)/);
  const magicSum = sumMatch ? parseInt(sumMatch[1]!) : undefined;

  return { type: 'magic-square', subject: 'math', rawInput: input, inputs: { grid, magicSum }, goal: 'complete magic square', confidence: 1.0, topic: 'sequences.other' };
}
