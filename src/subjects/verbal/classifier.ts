import type { Problem } from '@core/types/strategy.js';

/**
 * Verbal reasoning classifier — currently handles analogies.
 *
 * Accepts input in several flexible forms:
 *   "BIRD : FLOCK :: FISH : ?"
 *   "bird:flock::fish:?"
 *   "hand is to finger as foot is to ?"
 *
 * Produces a Problem of type 'analogy' with inputs { a, b, c } where
 * the student is finding d such that c : d :: a : b.
 */
export function identify(input: string): Problem | null {
  const cleaned = input.trim();
  if (!cleaned) return null;

  // Try the compact form: A : B :: C : ?
  const compact = cleaned.match(/^(.+?)\s*:\s*(.+?)\s*::\s*(.+?)\s*:\s*\??\s*$/);
  if (compact) {
    const [, a, b, c] = compact;
    return buildAnalogyProblem(cleaned, a!, b!, c!);
  }

  // Try the sentence form: "X is to Y as Z is to ?"
  const sentence = cleaned.match(/^(.+?)\s+is\s+to\s+(.+?)\s+as\s+(.+?)\s+is\s+to\s+\??\s*$/i);
  if (sentence) {
    const [, a, b, c] = sentence;
    return buildAnalogyProblem(cleaned, a!, b!, c!);
  }

  return null;
}

function buildAnalogyProblem(raw: string, a: string, b: string, c: string): Problem {
  return {
    type: 'analogy',
    subject: 'verbal',
    rawInput: raw,
    inputs: {
      a: a.trim().toUpperCase(),
      b: b.trim().toUpperCase(),
      c: c.trim().toUpperCase(),
    },
    goal: 'find d',
    confidence: 0.9,
    topic: 'analogies',
  };
}
