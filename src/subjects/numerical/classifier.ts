import type { Problem } from '@core/types/strategy.js';

/**
 * Numerical reasoning classifier.
 *
 * Accepts raw problem text and classifies it into one of:
 *   - 'sequence'      — number sequences (find next term, missing term)
 *   - 'pattern'       — visual/grid/matrix patterns
 *   - 'word-problem'  — age, work-rate, distance-time, mixtures
 *   - 'data'          — data interpretation (tables, graphs, charts)
 *   - 'proportion'    — ratio and proportion reasoning
 *
 * Returns null if the input cannot be confidently classified.
 */
export function identify(input: string): Problem | null {
  const cleaned = input.trim();
  if (!cleaned) return null;

  // Try sequence detection first — comma-separated numbers with a "?" or "next"
  const seqResult = trySequence(cleaned);
  if (seqResult) return seqResult;

  // Try proportion/ratio
  const propResult = tryProportion(cleaned);
  if (propResult) return propResult;

  // Try word problem (distance/speed/time, age, work/rate, mixture)
  const wordResult = tryWordProblem(cleaned);
  if (wordResult) return wordResult;

  // Try data interpretation
  const dataResult = tryData(cleaned);
  if (dataResult) return dataResult;

  // Try pattern (grid, matrix, odd-one-out)
  const patternResult = tryPattern(cleaned);
  if (patternResult) return patternResult;

  return null;
}

// ---------------------------------------------------------------------------
// Sequence: "2, 4, 8, 16, ?" or "What is the next term in 3, 6, 9, 12"
// ---------------------------------------------------------------------------
function trySequence(text: string): Problem | null {
  // Match comma-separated numbers ending in ? or "next" keyword
  const commaNumbers = text.match(
    /(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?))*\s*,\s*\??/,
  );
  const hasNextKeyword = /\bnext\s+(?:term|number|value)\b/i.test(text);
  const hasQuestionMark = text.includes('?');

  if (commaNumbers || (hasNextKeyword && /\d+\s*,\s*\d+/.test(text))) {
    const numbers = extractNumbers(text);
    if (numbers.length >= 3) {
      return {
        type: 'sequence',
        subject: 'numerical',
        rawInput: text,
        inputs: { terms: numbers },
        goal: 'find next term',
        confidence: 0.9,
        topic: 'sequences',
      };
    }
  }

  // "Find the missing number: 5, __, 15, 20"
  if (/missing\s+(?:number|term|value)/i.test(text) && /\d+\s*,/.test(text)) {
    const numbers = extractNumbers(text);
    return {
      type: 'sequence',
      subject: 'numerical',
      rawInput: text,
      inputs: { terms: numbers },
      goal: 'find missing term',
      confidence: 0.85,
      topic: 'sequences',
    };
  }

  // Bare sequence ending in ?
  if (hasQuestionMark) {
    const numbers = extractNumbers(text);
    if (numbers.length >= 3) {
      return {
        type: 'sequence',
        subject: 'numerical',
        rawInput: text,
        inputs: { terms: numbers },
        goal: 'find next term',
        confidence: 0.75,
        topic: 'sequences',
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Proportion / Ratio: "ratio", "proportion", "share", "x:y"
// ---------------------------------------------------------------------------
function tryProportion(text: string): Problem | null {
  const lower = text.toLowerCase();

  if (/\bratio\b|\bproportion\b|\bshare[sd]?\s+(?:equally|in\s+the\s+ratio)\b/i.test(text)) {
    const numbers = extractNumbers(text);
    return {
      type: 'proportion',
      subject: 'numerical',
      rawInput: text,
      inputs: { values: numbers },
      goal: 'solve proportion',
      confidence: 0.85,
      topic: 'proportion',
    };
  }

  // Explicit ratio notation: "3:5" outside of time context
  if (/\d+\s*:\s*\d+/.test(text) && !/\d+:\d{2}\s*(am|pm|hrs)/i.test(text)) {
    const numbers = extractNumbers(text);
    return {
      type: 'proportion',
      subject: 'numerical',
      rawInput: text,
      inputs: { values: numbers },
      goal: 'solve proportion',
      confidence: 0.7,
      topic: 'proportion',
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Word problem: distance/speed/time, age, work/rate, mixture
// ---------------------------------------------------------------------------
function tryWordProblem(text: string): Problem | null {
  const lower = text.toLowerCase();

  const distanceKeywords = /\b(speed|distance|time|km\/h|mph|km|miles|travel|fast|slow)\b/i;
  const ageKeywords = /\b(age[sd]?|years?\s+old|older|younger|born|twice\s+as\s+old)\b/i;
  const workKeywords = /\b(work|job|days?\s+to\s+complete|together|alone|rate|pipe|fill|empty|tap)\b/i;
  const mixtureKeywords = /\b(mix|mixture|solution|concentration|percent|alloy|blend|combine)\b/i;

  let subtype: string | undefined;
  let topic = 'word-problems';

  if (distanceKeywords.test(text)) {
    subtype = 'distance-time';
    topic = 'word-problems.distance-time';
  } else if (ageKeywords.test(text)) {
    subtype = 'age';
    topic = 'word-problems.age';
  } else if (workKeywords.test(text)) {
    subtype = 'work-rate';
    topic = 'word-problems.work-rate';
  } else if (mixtureKeywords.test(text)) {
    subtype = 'mixtures';
    topic = 'word-problems.mixtures';
  }

  if (subtype) {
    const numbers = extractNumbers(text);
    return {
      type: 'word-problem',
      subject: 'numerical',
      rawInput: text,
      inputs: { subtype, values: numbers },
      goal: 'solve word problem',
      confidence: 0.8,
      topic,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Data interpretation
// ---------------------------------------------------------------------------
function tryData(text: string): Problem | null {
  if (/\b(table|graph|chart|bar\s+graph|pie\s+chart|data|interpret|read\s+off)\b/i.test(text)) {
    const numbers = extractNumbers(text);
    return {
      type: 'data',
      subject: 'numerical',
      rawInput: text,
      inputs: { values: numbers },
      goal: 'interpret data',
      confidence: 0.75,
      topic: 'data-interpretation',
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Pattern (grid, matrix, odd-one-out)
// ---------------------------------------------------------------------------
function tryPattern(text: string): Problem | null {
  if (/\b(pattern|grid|matrix|odd\s+one\s+out|which\s+.*doesn.?t\s+belong)\b/i.test(text)) {
    const numbers = extractNumbers(text);
    return {
      type: 'pattern',
      subject: 'numerical',
      rawInput: text,
      inputs: { values: numbers },
      goal: 'find pattern',
      confidence: 0.7,
      topic: 'patterns',
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}
