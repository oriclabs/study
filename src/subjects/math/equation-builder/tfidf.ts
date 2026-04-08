/**
 * Layer 2: TF-IDF keyword classifier for word problems.
 *
 * Uses weighted keyword bags per problem category. When the pattern matcher
 * (Layer 1) fails, this scores the input against all categories and picks
 * the best match above a confidence threshold.
 *
 * Not a true TF-IDF (no corpus), but a weighted keyword frequency scorer
 * that achieves similar results for classification.
 */

import type { Problem } from '@core/types/strategy.js';

interface Category {
  type: string;
  topic: string;
  goal: string;
  /** Keywords with weights. Higher = more indicative of this category. */
  keywords: Record<string, number>;
  /** Extract structured inputs from the matched text. Returns null if extraction fails. */
  extract: (input: string, numbers: number[]) => Record<string, unknown> | null;
}

const CATEGORIES: Category[] = [
  {
    type: 'word-sdt',
    topic: 'ratio.rates',
    goal: 'find speed/distance/time',
    keywords: {
      speed: 5, distance: 4, time: 3, travel: 4, km: 3, mile: 3, hour: 3, minute: 2,
      fast: 2, slow: 2, velocity: 4, rate: 2, covers: 3, journey: 2, train: 2,
      car: 2, bus: 2, walk: 2, run: 2, cycle: 2, drive: 2, per: 2,
    },
    extract: (s, nums) => {
      if (nums.length < 2) return null;
      const lower = s.toLowerCase();
      if (/speed|fast|velocity|rate/.test(lower)) return { find: 'speed', distance: nums[0]!, time: nums[1]! };
      if (/distance|far|long/.test(lower) && !/how long|time/.test(lower)) return { find: 'distance', speed: nums[0]!, time: nums[1]! };
      return { find: 'time', distance: nums[0]!, speed: nums[1]! };
    },
  },
  {
    type: 'word-hcf-lcm',
    topic: 'number.factors',
    goal: 'find HCF/LCM',
    keywords: {
      hcf: 8, gcf: 8, gcd: 8, lcm: 8, factor: 5, multiple: 5, common: 4, highest: 4,
      lowest: 4, greatest: 4, least: 4, divisor: 4, divisible: 3,
    },
    extract: (s, nums) => {
      if (nums.length < 2) return null;
      const op = /lcm|lowest|least|multiple/.test(s.toLowerCase()) ? 'lcm' : 'hcf';
      return { operation: op, values: nums.slice(0, 3) };
    },
  },
  {
    type: 'statistics',
    topic: 'statistics.data',
    goal: 'find statistic',
    keywords: {
      mean: 6, average: 6, median: 6, mode: 6, range: 4, data: 3, set: 2,
      values: 2, numbers: 2, frequency: 3, distribution: 2,
    },
    extract: (s, nums) => {
      if (nums.length < 3) return null;
      const lower = s.toLowerCase();
      let op = 'mean';
      if (/median/.test(lower)) op = 'median';
      else if (/mode/.test(lower)) op = 'mode';
      else if (/range/.test(lower)) op = 'range';
      return { operation: op, values: nums };
    },
  },
  {
    type: 'financial',
    topic: 'financial.interest',
    goal: 'find interest/amount',
    keywords: {
      interest: 6, compound: 5, simple: 4, principal: 5, rate: 3, annual: 3,
      invest: 4, deposit: 3, loan: 3, borrow: 3, bank: 2, year: 2, annum: 3,
    },
    extract: (s, nums) => {
      if (nums.length < 3) return null;
      const isCompound = /compound/.test(s.toLowerCase());
      return {
        type: isCompound ? 'compound-interest' : 'simple-interest',
        principal: nums[0]!, rate: nums[1]!, time: nums[2]!, compounds: 1,
      };
    },
  },
  {
    type: 'financial',
    topic: 'financial.profit-loss',
    goal: 'find profit/loss',
    keywords: {
      profit: 6, loss: 6, cost: 5, sell: 5, bought: 5, sold: 5, price: 4,
      markup: 4, margin: 3, wholesale: 3, retail: 3, discount: 4,
    },
    extract: (s, nums) => {
      if (nums.length < 2) return null;
      if (/discount/.test(s.toLowerCase())) {
        return { type: 'discount', discount: nums[0]!, original: nums[1]! };
      }
      return { type: 'profit-loss', cost: nums[0]!, selling: nums[1]! };
    },
  },
  {
    type: 'word-proportion',
    topic: 'ratio.proportion',
    goal: 'find using proportion',
    keywords: {
      proportion: 5, proportional: 5, varies: 4, directly: 4, inversely: 5,
      worker: 4, pipe: 3, tap: 3, machine: 3, days: 3, fill: 3, complete: 3,
    },
    extract: (s, nums) => {
      if (nums.length < 3) return null;
      const isInverse = /inversely|worker|pipe|tap|machine|less time|more people/.test(s.toLowerCase());
      if (isInverse) {
        const t2 = (nums[0]! * nums[1]!) / nums[2]!;
        return { type: 'inverse', w1: nums[0]!, t1: nums[1]!, w2: nums[2]!, t2 };
      }
      const v2 = (nums[1]! / nums[0]!) * nums[2]!;
      return { type: 'direct', n1: nums[0]!, v1: nums[1]!, n2: nums[2]!, v2 };
    },
  },
  {
    type: 'sequence',
    topic: 'sequences.arithmetic',
    goal: 'find pattern',
    keywords: {
      sequence: 6, series: 5, pattern: 5, term: 5, nth: 6, next: 4,
      arithmetic: 5, geometric: 5, common: 3, difference: 3, ratio: 3,
      progression: 4, ap: 4, gp: 4,
    },
    extract: (_s, nums) => {
      if (nums.length < 3) return null;
      return { type: 'find-next', values: nums };
    },
  },
  {
    type: 'geometry',
    topic: 'measurement.area',
    goal: 'find measurement',
    keywords: {
      area: 6, perimeter: 6, circumference: 5, volume: 6, surface: 4,
      circle: 4, rectangle: 4, triangle: 4, square: 3, cube: 4, sphere: 4,
      cylinder: 4, cone: 4, radius: 4, diameter: 4, base: 3, height: 3,
      length: 3, width: 3, side: 3,
    },
    extract: (s, nums) => {
      if (nums.length < 1) return null;
      const lower = s.toLowerCase();
      const measure = /volume/.test(lower) ? 'volume' : /perimeter|circumference/.test(lower) ? 'perimeter' : 'area';
      let shape = 'rectangle';
      if (/circle|circular|round/.test(lower)) shape = 'circle';
      else if (/triangle|triangular/.test(lower)) shape = 'triangle';
      else if (/square/.test(lower)) shape = 'square';
      else if (/cube/.test(lower)) shape = 'cube';
      else if (/sphere/.test(lower)) shape = 'sphere';
      else if (/cylinder/.test(lower)) shape = 'cylinder';
      else if (/cone/.test(lower)) shape = 'cone';

      const dims: Record<string, number> = {};
      if (shape === 'circle' || shape === 'sphere' || shape === 'cylinder') dims.radius = nums[0]!;
      else if (shape === 'triangle') { dims.base = nums[0]!; dims.height = nums[1] ?? nums[0]!; }
      else if (shape === 'square' || shape === 'cube') dims.side = nums[0]!;
      else { dims.length = nums[0]!; dims.width = nums[1] ?? nums[0]!; }
      if ((shape === 'cylinder' || shape === 'cone') && nums.length >= 2) dims.height = nums[1]!;

      return { measure, shape, ...dims };
    },
  },
  {
    type: 'ratio',
    topic: 'ratio.ratios',
    goal: 'work with ratios',
    keywords: {
      ratio: 6, share: 4, divide: 3, proportion: 3, split: 3, parts: 3,
      simplify: 3, equivalent: 3,
    },
    extract: (s, nums) => {
      if (nums.length < 2) return null;
      // Look for a:b pattern
      const ratioMatch = s.match(/([\d:]+)/);
      if (ratioMatch && ratioMatch[1]!.includes(':')) {
        const parts = ratioMatch[1]!.split(':').map(Number);
        // Find total (number not in the ratio)
        const total = nums.find(n => !parts.includes(n));
        if (total && parts.length >= 2) return { type: 'divide', total, parts };
        if (parts.length >= 2) return { type: 'simplify', a: parts[0]!, b: parts[1]! };
      }
      return null;
    },
  },
];

/** Extract all numbers from text. */
function extractNumbers(s: string): number[] {
  return [...s.matchAll(/\d+\.?\d*/g)].map(m => parseFloat(m[0]));
}

/** Tokenize input into lowercase words. */
function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Score input against a category using weighted keyword matching.
 * Returns a score 0..1 indicating confidence.
 */
function scoreCategory(tokens: string[], category: Category): number {
  let score = 0;
  let maxPossible = 0;

  for (const [keyword, weight] of Object.entries(category.keywords)) {
    maxPossible += weight;
    // Check if any token starts with or matches the keyword
    if (tokens.some(t => t === keyword || t.startsWith(keyword) || keyword.startsWith(t))) {
      score += weight;
    }
  }

  return maxPossible > 0 ? score / maxPossible : 0;
}

/**
 * Classify a word problem using TF-IDF keyword scoring.
 * Returns the best matching Problem or null if confidence is too low.
 */
export function classifyByKeywords(input: string): Problem | null {
  const tokens = tokenize(input);
  if (tokens.length < 2) return null;

  const numbers = extractNumbers(input);

  let bestScore = 0;
  let bestCategory: Category | null = null;

  for (const cat of CATEGORIES) {
    const score = scoreCategory(tokens, cat);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  // Require minimum confidence
  if (!bestCategory || bestScore < 0.15) return null;

  // Try to extract structured data
  const extracted = bestCategory.extract(input, numbers);
  if (!extracted) return null;

  return {
    type: bestCategory.type,
    subject: 'math',
    rawInput: input,
    inputs: extracted,
    goal: bestCategory.goal,
    confidence: Math.min(bestScore * 1.5, 0.95), // scale up but cap
    topic: bestCategory.topic,
  };
}
