import type { Problem } from '@core/types/strategy.js';

/**
 * Grammar classifier — currently handles subject-verb agreement.
 *
 * Accepts input in these forms:
 *   "The list of items ___ on the desk. (is/are)"
 *   "Each of the boys ___ his homework. (finished, finishes)"
 *   "The committee ___ made its decision. (has, have)"
 *
 * Extracts: the sentence, the blank position, the candidate options.
 * Produces a Problem of type 'sv-agreement' with inputs { sentence, options }.
 */
export function identify(input: string): Problem | null {
  const cleaned = input.trim();
  if (!cleaned) return null;

  // Match "sentence... ___ ... (opt1/opt2)" or with comma-separated options
  const match = cleaned.match(/^(.+?)\s*\((.+?)\)\s*\.?\s*$/);
  if (!match) return null;
  const [, sentencePart, optionsPart] = match;
  if (!sentencePart || !optionsPart) return null;
  if (!sentencePart.includes('___') && !sentencePart.includes('_')) return null;

  const options = optionsPart
    .split(/[,/]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (options.length < 2) return null;

  return {
    type: 'sv-agreement',
    subject: 'grammar',
    rawInput: cleaned,
    inputs: {
      sentence: sentencePart.trim(),
      options,
    },
    goal: 'choose correct verb form',
    confidence: 0.9,
    topic: 'agreement.subject-verb',
  };
}
