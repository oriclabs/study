/**
 * Dictionary engine — lookup synonyms, antonyms, definitions.
 * Supports: exact match, prefix search, reverse lookup (find words that list X as synonym).
 */

import type { DictEntry, DictResult } from './types.js';
import { DICTIONARY } from './data.js';

export type { DictEntry, DictResult };

/** Exact word lookup. */
export function lookup(word: string): DictResult | null {
  const key = word.toLowerCase().trim();
  const entry = DICTIONARY[key];
  if (!entry) return null;

  return {
    word: key,
    entries: [entry],
    relatedTo: findRelated(key),
  };
}

/** Prefix search — find words starting with the given prefix. */
export function search(prefix: string, limit = 20): string[] {
  const p = prefix.toLowerCase().trim();
  if (!p) return [];
  return Object.keys(DICTIONARY)
    .filter(w => w.startsWith(p))
    .sort()
    .slice(0, limit);
}

/** Fuzzy search — find closest matches for a misspelled word. */
export function fuzzySearch(query: string, limit = 10): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Exact match first
  if (DICTIONARY[q]) return [q];

  // Prefix match
  const prefixMatches = search(q, limit);
  if (prefixMatches.length > 0) return prefixMatches;

  // Levenshtein-based fuzzy (only for short queries to avoid perf issues)
  if (q.length > 2 && q.length < 15) {
    const scored = Object.keys(DICTIONARY)
      .map(w => ({ word: w, dist: levenshtein(q, w) }))
      .filter(({ dist }) => dist <= 2)
      .sort((a, b) => a.dist - b.dist);
    return scored.slice(0, limit).map(s => s.word);
  }

  return [];
}

/** Find all synonyms of a word (direct + transitive one level). */
export function getSynonyms(word: string): string[] {
  const entry = DICTIONARY[word.toLowerCase()];
  if (!entry) return [];
  return [...new Set(entry.synonyms)];
}

/** Find all antonyms of a word. */
export function getAntonyms(word: string): string[] {
  const entry = DICTIONARY[word.toLowerCase()];
  if (!entry) return [];
  return [...new Set(entry.antonyms)];
}

/** Find words that list the given word as a synonym or antonym. */
function findRelated(word: string): string[] {
  const related: string[] = [];
  for (const [w, entry] of Object.entries(DICTIONARY)) {
    if (w === word) continue;
    if (entry.synonyms.includes(word) || entry.antonyms.includes(word)) {
      related.push(w);
    }
  }
  return related;
}

/** Get all words at a given difficulty level. */
export function getByLevel(level: number): string[] {
  return Object.entries(DICTIONARY)
    .filter(([, e]) => e.level === level)
    .map(([w]) => w)
    .sort();
}

/** Get all words. */
export function getAllWords(): string[] {
  return Object.keys(DICTIONARY).sort();
}

/** Get a random word, optionally filtered by level. */
export function getRandomWord(level?: number): string {
  const words = level ? getByLevel(level) : getAllWords();
  return words[Math.floor(Math.random() * words.length)] ?? 'happy';
}

/** Total word count. */
export function wordCount(): number {
  return Object.keys(DICTIONARY).length;
}

/** Simple Levenshtein distance for fuzzy matching. */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]!
        : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}
