/**
 * Grammar checker types.
 */

export interface GrammarError {
  /** Start index in the original text. */
  start: number;
  /** End index in the original text. */
  end: number;
  /** The problematic text. */
  text: string;
  /** Error category. */
  category: 'spelling' | 'grammar' | 'punctuation' | 'style';
  /** Human-readable explanation. */
  message: string;
  /** Suggested corrections. */
  suggestions: string[];
  /** Rule ID for reference. */
  ruleId: string;
}

export interface GrammarResult {
  /** Original input text. */
  text: string;
  /** Detected errors. */
  errors: GrammarError[];
  /** Summary stats. */
  stats: {
    wordCount: number;
    sentenceCount: number;
    errorCount: number;
  };
}
