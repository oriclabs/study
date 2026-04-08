/**
 * Layer 1: Pattern matching for word problems.
 * Converts common natural language formats into structured problem data.
 * Returns null if no pattern matches — falls through to TF-IDF classifier.
 */

import type { Problem } from '@core/types/strategy.js';

type Extractor = (input: string, lower: string) => Problem | null;

const EXTRACTORS: Extractor[] = [
  extractSpeedDistanceTime,
  extractHcfLcm,
  extractPercentageWord,
  extractProfitLossWord,
  extractAgeWord,
  extractRatioWord,
  extractProportionWord,
  extractComparisonWord,
  extractIncreaseDecrease,
  extractGeometryWord,
  extractSimpleArithmetic,
];

export function matchPattern(input: string): Problem | null {
  const lower = input.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const extract of EXTRACTORS) {
    const result = extract(input, lower);
    if (result) return result;
  }
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────

function num(s: string): number { return parseFloat(s.replace(/[,$]/g, '')); }

function problem(type: string, raw: string, inputs: Record<string, unknown>, goal: string, topic: string, confidence = 0.9): Problem {
  return { type, subject: 'math', rawInput: raw, inputs, goal, confidence, topic };
}

// ─── Speed / Distance / Time ─────────────────────────────────────

function extractSpeedDistanceTime(raw: string, s: string): Problem | null {
  // "A train travels 240km in 3 hours. Find speed"
  const findSpeed = s.match(/(?:travel|cover|go|drive|run|walk|cycle)s?\s+(\d+\.?\d*)\s*(?:km|m|miles?|mi|metres?|meters?)\s+in\s+(\d+\.?\d*)\s*(?:hour|hr|min|second|sec)/);
  if (findSpeed) {
    return problem('word-sdt', raw, { find: 'speed', distance: num(findSpeed[1]!), time: num(findSpeed[2]!) }, 'find speed', 'ratio.rates');
  }

  // "speed is 60km/h, travels for 3 hours. Find distance"
  const findDist = s.match(/speed\s+(?:is\s+)?(\d+\.?\d*)\s*(?:km|m|miles?)\/(?:h|hr|hour).*?(\d+\.?\d*)\s*(?:hour|hr|min)/);
  if (findDist) {
    return problem('word-sdt', raw, { find: 'distance', speed: num(findDist[1]!), time: num(findDist[2]!) }, 'find distance', 'ratio.rates');
  }

  // "covers 300km at 60km/h. How long / find time"
  const findTime = s.match(/(\d+\.?\d*)\s*(?:km|m|miles?)\s+at\s+(\d+\.?\d*)\s*(?:km|m|miles?)\/(?:h|hr|hour)/);
  if (findTime && /time|how long|duration/.test(s)) {
    return problem('word-sdt', raw, { find: 'time', distance: num(findTime[1]!), speed: num(findTime[2]!) }, 'find time', 'ratio.rates');
  }

  // Generic: "find speed/distance/time" with numbers
  const genericSDT = s.match(/(?:find|calculate|what is)\s+(?:the\s+)?(?:speed|distance|time)/);
  if (genericSDT) {
    const numbers = [...s.matchAll(/(\d+\.?\d*)/g)].map(m => num(m[1]!));
    if (numbers.length >= 2) {
      if (/speed/.test(s)) return problem('word-sdt', raw, { find: 'speed', distance: numbers[0]!, time: numbers[1]! }, 'find speed', 'ratio.rates');
      if (/distance/.test(s)) return problem('word-sdt', raw, { find: 'distance', speed: numbers[0]!, time: numbers[1]! }, 'find distance', 'ratio.rates');
      if (/time/.test(s)) return problem('word-sdt', raw, { find: 'time', distance: numbers[0]!, speed: numbers[1]! }, 'find time', 'ratio.rates');
    }
  }

  return null;
}

// ─── HCF / LCM ──────────────────────────────────────────────────

function extractHcfLcm(_raw: string, s: string): Problem | null {
  const hcf = s.match(/(?:hcf|gcf|gcd|highest common factor|greatest common (?:factor|divisor))\s+(?:of\s+)?(\d+)\s*(?:,?\s*(?:and\s+)?)(\d+)(?:\s*(?:,?\s*(?:and\s+)?)(\d+))?/);
  if (hcf) {
    const values = [parseInt(hcf[1]!), parseInt(hcf[2]!)];
    if (hcf[3]) values.push(parseInt(hcf[3]));
    return problem('word-hcf-lcm', _raw, { operation: 'hcf', values }, 'find HCF', 'number.factors');
  }

  const lcm = s.match(/(?:lcm|lowest common multiple|least common multiple)\s+(?:of\s+)?(\d+)\s*(?:,?\s*(?:and\s+)?)(\d+)(?:\s*(?:,?\s*(?:and\s+)?)(\d+))?/);
  if (lcm) {
    const values = [parseInt(lcm[1]!), parseInt(lcm[2]!)];
    if (lcm[3]) values.push(parseInt(lcm[3]));
    return problem('word-hcf-lcm', _raw, { operation: 'lcm', values }, 'find LCM', 'number.factors');
  }

  return null;
}

// ─── Percentage word problems ────────────────────────────────────

function extractPercentageWord(_raw: string, s: string): Problem | null {
  // "increase 80 by 15%" / "80 increased by 15%"
  const increase = s.match(/(?:increase|raise|markup)\s+(\d+\.?\d*)\s+by\s+(\d+\.?\d*)\s*%/);
  const increase2 = s.match(/(\d+\.?\d*)\s+(?:increased|raised)\s+by\s+(\d+\.?\d*)\s*%/);
  const inc = increase || increase2;
  if (inc) {
    const val = num(inc[1]!), pct = num(inc[2]!);
    return problem('percentage-of', _raw, { percent: pct, value: val, operation: 'increase' }, 'find increased value', 'fractions.percentages');
  }

  // "decrease 200 by 10%"
  const decrease = s.match(/(?:decrease|reduce|markdown)\s+(\d+\.?\d*)\s+by\s+(\d+\.?\d*)\s*%/);
  const decrease2 = s.match(/(\d+\.?\d*)\s+(?:decreased|reduced)\s+by\s+(\d+\.?\d*)\s*%/);
  const dec = decrease || decrease2;
  if (dec) {
    const val = num(dec[1]!), pct = num(dec[2]!);
    return problem('percentage-of', _raw, { percent: pct, value: val, operation: 'decrease' }, 'find decreased value', 'fractions.percentages');
  }

  // "find 15% of 300" / "calculate 20% of 450"
  const findPct = s.match(/(?:find|calculate|what is|work out)\s+(\d+\.?\d*)\s*%\s+of\s+(\d+\.?\d*)/);
  if (findPct) {
    return problem('percentage-of', _raw, { percent: num(findPct[1]!), value: num(findPct[2]!) }, 'find the result', 'fractions.percentages');
  }

  return null;
}

// ─── Profit / Loss word problems ─────────────────────────────────

function extractProfitLossWord(_raw: string, s: string): Problem | null {
  // "cost price $50 selling price $65" or "bought for 50 sold for 65"
  const pl = s.match(/(?:cost|bought|purchased)\s+(?:price\s+)?(?:is\s+)?(?:\$)?(\d+\.?\d*).*?(?:sell|sold|selling)\s+(?:price\s+)?(?:is\s+)?(?:for\s+)?(?:\$)?(\d+\.?\d*)/);
  if (pl) {
    return problem('financial', _raw, { type: 'profit-loss', cost: num(pl[1]!), selling: num(pl[2]!) }, 'find profit/loss', 'financial.profit-loss');
  }

  // Reverse order: "sold for 65, cost was 50"
  const pl2 = s.match(/(?:sell|sold|selling)\s+(?:price\s+)?(?:for\s+)?(?:\$)?(\d+\.?\d*).*?(?:cost|bought|purchased)\s+(?:price\s+)?(?:is\s+|was\s+)?(?:\$)?(\d+\.?\d*)/);
  if (pl2) {
    return problem('financial', _raw, { type: 'profit-loss', cost: num(pl2[2]!), selling: num(pl2[1]!) }, 'find profit/loss', 'financial.profit-loss');
  }

  return null;
}

// ─── Age problems ────────────────────────────────────────────────

function extractAgeWord(_raw: string, s: string): Problem | null {
  // "John is 3 years older than Mary. Together their ages are 25. Find their ages."
  const ageSum = s.match(/(\d+)\s*(?:years?\s+)?(?:older|more)\s+than.*?(?:together|total|sum|combined).*?(\d+)/);
  if (ageSum) {
    const diff = parseInt(ageSum[1]!);
    const total = parseInt(ageSum[2]!);
    // x + (x + diff) = total → 2x + diff = total → 2x = total - diff
    const younger = (total - diff) / 2;
    const older = younger + diff;
    return problem('word-age', _raw, { diff, total, younger, older }, 'find ages', 'algebra.linear-equations');
  }

  // "twice as old" pattern: "A is twice as old as B. Sum of ages is 36"
  const ageTwice = s.match(/(?:twice|double|two times)\s+(?:as\s+)?(?:old|age).*?(?:sum|total|together|combined).*?(\d+)/);
  if (ageTwice) {
    const total = parseInt(ageTwice[1]!);
    // x + 2x = total → 3x = total
    const younger = total / 3;
    return problem('word-age', _raw, { multiplier: 2, total, younger, older: younger * 2 }, 'find ages', 'algebra.linear-equations');
  }

  return null;
}

// ─── Ratio word problems ────────────────────────────────────────

function extractRatioWord(_raw: string, s: string): Problem | null {
  // "divide 120 in the ratio 3:5" — already handled by main classifier
  // "shared in ratio 2:3:5, total is 200"
  const share = s.match(/(?:share|divide|split|distribute)\s+(?:\$)?(\d+\.?\d*)\s+(?:in\s+)?(?:the\s+)?ratio\s+([\d:]+)/);
  if (share) {
    const total = num(share[1]!);
    const parts = share[2]!.split(':').map(Number);
    if (parts.length >= 2) return problem('ratio', _raw, { type: 'divide', total, parts }, 'divide in ratio', 'ratio.ratios');
  }

  return null;
}

// ─── Proportion word problems ────────────────────────────────────

function extractProportionWord(_raw: string, s: string): Problem | null {
  // "if 5 workers take 12 days, how long for 8 workers" (inverse proportion)
  const inverseProp = s.match(/(\d+)\s*(?:worker|men|people|pipe|tap|machine)s?\s+(?:take|finish|complete|need|require)s?\s+(\d+\.?\d*)\s*(?:day|hour|minute|week)s?.*?(\d+)\s*(?:worker|men|people|pipe|tap|machine)/);
  if (inverseProp) {
    const w1 = num(inverseProp[1]!), t1 = num(inverseProp[2]!), w2 = num(inverseProp[3]!);
    const t2 = (w1 * t1) / w2;
    return problem('word-proportion', _raw, { type: 'inverse', w1, t1, w2, t2 }, 'find time', 'ratio.proportion');
  }

  // "if 3 items cost $15, how much for 7 items" (direct proportion)
  const directProp = s.match(/(\d+)\s*(?:item|book|pen|ticket|kg|litre|meter)s?\s+(?:cost|is|are|weigh)s?\s+(?:\$)?(\d+\.?\d*).*?(\d+)\s*(?:item|book|pen|ticket|kg|litre|meter)/);
  if (directProp) {
    const n1 = num(directProp[1]!), v1 = num(directProp[2]!), n2 = num(directProp[3]!);
    const v2 = (v1 / n1) * n2;
    return problem('word-proportion', _raw, { type: 'direct', n1, v1, n2, v2 }, 'find value', 'ratio.proportion');
  }

  return null;
}

// ─── Comparison / simultaneous from words ────────────────────────

function extractComparisonWord(_raw: string, s: string): Problem | null {
  // "John has 3 more than Mary. Together they have 15."
  const moreTotal = s.match(/(\d+)\s+more\s+than.*?together.*?(\d+)/);
  if (moreTotal) {
    const diff = parseInt(moreTotal[1]!), total = parseInt(moreTotal[2]!);
    const smaller = (total - diff) / 2;
    return problem('word-comparison', _raw, { diff, total, smaller, larger: smaller + diff }, 'find values', 'algebra.linear-equations');
  }

  // "Sum of two numbers is 20. Difference is 4."
  const sumDiff = s.match(/sum.*?(\d+).*?difference.*?(\d+)/);
  if (sumDiff) {
    const sum = parseInt(sumDiff[1]!), diff = parseInt(sumDiff[2]!);
    const a = (sum + diff) / 2, b = (sum - diff) / 2;
    return problem('word-comparison', _raw, { sum, diff, a, b }, 'find the numbers', 'algebra.linear-equations');
  }

  // "twice a number plus 5 is 21" → 2x + 5 = 21
  const twiceNum = s.match(/(?:twice|double|two times)\s+(?:a\s+)?number\s+(?:plus|added to|increased by)\s+(\d+)\s+(?:is|equals|=)\s+(\d+)/);
  if (twiceNum) {
    const b = parseInt(twiceNum[1]!), c = parseInt(twiceNum[2]!);
    return problem('linear', _raw, { rawEquation: `2x + ${b} = ${c}` }, 'solve for x', 'algebra.linear-equations', 0.85);
  }

  return null;
}

// ─── Increase / Decrease ─────────────────────────────────────────

function extractIncreaseDecrease(_raw: string, s: string): Problem | null {
  // "increase 80 by 20" (not percentage — just add)
  // Already handled by percentage if % present
  // "what is 80 plus 15%" → percentage
  const plusPct = s.match(/(\d+\.?\d*)\s+plus\s+(\d+\.?\d*)\s*%/);
  if (plusPct) {
    return problem('percentage-of', _raw, { percent: num(plusPct[2]!), value: num(plusPct[1]!), operation: 'increase' }, 'find result', 'fractions.percentages');
  }

  const minusPct = s.match(/(\d+\.?\d*)\s+minus\s+(\d+\.?\d*)\s*%/);
  if (minusPct) {
    return problem('percentage-of', _raw, { percent: num(minusPct[2]!), value: num(minusPct[1]!), operation: 'decrease' }, 'find result', 'fractions.percentages');
  }

  return null;
}

// ─── Geometry from words ─────────────────────────────────────────

function extractGeometryWord(_raw: string, s: string): Problem | null {
  // "find area of a rectangular garden 4m by 6m"
  const rectWord = s.match(/(?:area|perimeter)\s+(?:of\s+)?(?:a\s+)?(?:rectangular|rectangle)\s+\w+\s+(\d+\.?\d*)\s*(?:m|cm|mm|km|ft|in)?\s*(?:by|x|×)\s*(\d+\.?\d*)/);
  if (rectWord) {
    const measure = /area/.test(s) ? 'area' : 'perimeter';
    return problem('geometry', _raw, { measure, shape: 'rectangle', length: num(rectWord[1]!), width: num(rectWord[2]!) }, `find ${measure}`, 'measurement.area');
  }

  // "a circular pool has radius 7m. Find area"
  const circWord = s.match(/(?:circular|circle|round)\s+\w+\s+(?:has\s+)?(?:a\s+)?radius\s+(?:of\s+)?(\d+\.?\d*)/);
  if (circWord && /area|circumference|perimeter/.test(s)) {
    const measure = /area/.test(s) ? 'area' : 'circumference';
    return problem('geometry', _raw, { measure, shape: 'circle', radius: num(circWord[1]!) }, `find ${measure}`, 'measurement.area');
  }

  // "triangle with base 10 and height 6. Find area"
  const triWord = s.match(/triangle.*?base\s+(?:of\s+)?(\d+\.?\d*).*?height\s+(?:of\s+)?(\d+\.?\d*)/);
  if (triWord) {
    return problem('geometry', _raw, { measure: 'area', shape: 'triangle', base: num(triWord[1]!), height: num(triWord[2]!) }, 'find area', 'measurement.area');
  }

  return null;
}

// ─── Simple arithmetic from words ────────────────────────────────

function extractSimpleArithmetic(_raw: string, s: string): Problem | null {
  // "what is 24 + 36" / "calculate 15 × 8"
  const arith = s.match(/(?:what is|calculate|compute|evaluate|find)\s+(\d+\.?\d*)\s*([+\-×÷*/])\s*(\d+\.?\d*)/);
  if (arith) {
    const a = num(arith[1]!), b = num(arith[3]!);
    let op = arith[2]!;
    if (op === '×') op = '*';
    if (op === '÷') op = '/';
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : NaN; break;
      default: return null;
    }
    if (!isFinite(result)) return null;
    return problem('word-arithmetic', _raw, { a, b, op, result }, 'compute', 'number.operations');
  }

  return null;
}
