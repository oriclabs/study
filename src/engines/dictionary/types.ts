/**
 * Dictionary types — curated synonym/antonym dictionary for exam vocabulary.
 */

export interface DictEntry {
  /** Part of speech: noun, verb, adjective, adverb */
  pos: string;
  /** Synonym words */
  synonyms: string[];
  /** Antonym words */
  antonyms: string[];
  /** Difficulty: 1=basic, 2=intermediate, 3=advanced */
  level: number;
  /** Optional brief definition */
  definition?: string;
  /** Optional example sentence */
  example?: string;
}

export interface DictResult {
  word: string;
  entries: DictEntry[];
  /** Related words (words that list this word as synonym/antonym) */
  relatedTo: string[];
}
