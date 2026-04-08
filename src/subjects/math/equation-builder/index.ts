/**
 * Word problem equation builder.
 *
 * Two-layer pre-processor that converts natural language math problems
 * into structured Problem objects the solver can handle:
 *
 *   Layer 1: Pattern matching — regex for common formats (~40-50% coverage)
 *   Layer 2: TF-IDF keyword classifier — weighted keyword scoring (~55-60%)
 *
 * Returns null if neither layer can identify the problem.
 * Designed to be extended with Layer 3 (tiny ML model or cloud API).
 */

import type { Problem } from '@core/types/strategy.js';
import { matchPattern } from './patterns.js';
import { classifyByKeywords } from './tfidf.js';

/**
 * Try to convert a word problem into a structured Problem.
 * Layer 1 (patterns) runs first for precision, Layer 2 (TF-IDF) for recall.
 */
export function buildEquation(input: string): Problem | null {
  // Layer 1: exact pattern matching (high precision)
  const patternResult = matchPattern(input);
  if (patternResult) return patternResult;

  // Layer 2: keyword classification (broader coverage)
  const keywordResult = classifyByKeywords(input);
  if (keywordResult) return keywordResult;

  return null;
}
