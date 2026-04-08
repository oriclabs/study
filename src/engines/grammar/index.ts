/**
 * Grammar checker engine — rule-based, offline, CSP-safe.
 * Checks: spelling, confused words, punctuation, subject-verb agreement, style.
 */

import type { GrammarResult } from './types.js';
import { ALL_RULES } from './rules.js';

export type { GrammarError, GrammarResult } from './types.js';

export function checkGrammar(text: string): GrammarResult {
  if (!text.trim()) {
    return { text, errors: [], stats: { wordCount: 0, sentenceCount: 0, errorCount: 0 } };
  }

  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  const allErrors = ALL_RULES.flatMap(rule => rule(text, words, sentences));

  // Deduplicate overlapping errors (keep the more specific one)
  const errors = allErrors
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((err, i, arr) => {
      if (i === 0) return true;
      const prev = arr[i - 1]!;
      // Skip if completely overlapped by previous
      return !(err.start >= prev.start && err.end <= prev.end);
    });

  return {
    text,
    errors,
    stats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      errorCount: errors.length,
    },
  };
}
