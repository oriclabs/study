import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getSentenceAndOptions } from './helpers.js';

/**
 * Head-noun identification: find the grammatical subject (head noun), ignore
 * modifiers like prepositional phrases, and match the verb to its number.
 *
 * Example: "The list of items ___ on the desk."
 *   Head: list (singular). Verb should be singular: "is".
 */

// Common singular indicators in English subjects.
const SINGULAR_HEADS = new Set([
  'LIST', 'BOUQUET', 'GROUP', 'TEAM', 'COMMITTEE', 'FAMILY', 'FLOCK', 'HERD',
  'COLLECTION', 'BUNDLE', 'PACK', 'SET', 'SERIES', 'PAIR', 'NUMBER', 'CLASS',
  'CROWD', 'AUDIENCE', 'MAJORITY', 'HALF', 'PERCENT', 'EACH', 'EVERY', 'NEITHER',
  'EITHER', 'ONE', 'ANYONE', 'SOMEONE', 'EVERYONE', 'NOBODY',
]);

// Known prepositions that typically introduce modifying phrases.
const PREPOSITIONS = new Set(['of', 'in', 'on', 'at', 'with', 'from', 'for', 'to', 'by']);

interface HeadAnalysis {
  head: string;
  headIndex: number;
  isSingular: boolean | null; // null = unknown
  reasoning: string;
}

function analyzeHead(sentence: string): HeadAnalysis | null {
  // Strip leading articles/determiners and trailing blank.
  const words = sentence.replace(/___+|__/g, '___').split(/\s+/);
  const cleanedWords = words.filter(Boolean);
  if (cleanedWords.length < 2) return null;

  // Find the first noun-like word (skip articles The/A/An and determiners).
  let headIdx = 0;
  while (headIdx < cleanedWords.length) {
    const word = cleanedWords[headIdx]!.toLowerCase().replace(/[.,;:]/g, '');
    if (['the', 'a', 'an', 'this', 'that', 'these', 'those'].includes(word)) {
      headIdx++;
      continue;
    }
    break;
  }

  if (headIdx >= cleanedWords.length) return null;
  const headWord = cleanedWords[headIdx]!.toLowerCase().replace(/[.,;:]/g, '');
  const headUpper = headWord.toUpperCase();

  // After the head, check if a prepositional phrase follows (e.g., "of items").
  let reasoning: string;
  if (cleanedWords.length > headIdx + 2 && PREPOSITIONS.has(cleanedWords[headIdx + 1]!.toLowerCase())) {
    const prep = cleanedWords[headIdx + 1]!;
    const object = cleanedWords[headIdx + 2]!.replace(/[.,;:]/g, '');
    reasoning = `Head noun is "${headWord}" — "${prep} ${object}" is a prepositional phrase and does NOT affect the verb.`;
  } else {
    reasoning = `Head noun is "${headWord}".`;
  }

  let isSingular: boolean | null = null;
  if (SINGULAR_HEADS.has(headUpper)) {
    isSingular = true;
  } else if (headWord.endsWith('s') && !headWord.endsWith('ss')) {
    // Crude plural detection.
    isSingular = false;
  } else {
    // Default: assume singular for unknown. Grammar is noisy.
    isSingular = true;
  }

  return { head: headWord, headIndex: headIdx, isSingular, reasoning };
}

function isSingularVerb(verb: string): boolean {
  const v = verb.toLowerCase().trim();
  // Classic singular third-person verbs
  if (v === 'is' || v === 'has' || v === 'was' || v === 'does') return true;
  if (v === 'are' || v === 'have' || v === 'were' || v === 'do') return false;
  // Verbs ending in 's' are typically singular third person ("runs", "walks")
  if (v.endsWith('s') && !v.endsWith('ss')) return true;
  return false;
}

export const headNoun: Strategy = {
  metadata: {
    id: 'grammar-head-noun',
    name: 'Head-noun identification',
    shortDescription: 'Find the real subject of the sentence, ignore prepositional phrases, then match the verb.',
    appliesTo: ['sv-agreement'],
    tradeoffs: {
      speed: 'fast',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['subject identification', 'prepositional phrase awareness', 'grammatical precision'],
      failsWhen: 'the subject is ambiguous or involves rare collective nouns',
    },
    relatedStrategies: ['grammar-collective-noun', 'grammar-ear-test'],
    commonMistakes: ['confused-similar-concept', 'misread-question'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'sv-agreement') return { applicable: false, reason: 'Not a subject-verb agreement problem.' };
    const { sentence, options } = getSentenceAndOptions(problem);
    if (!sentence || options.length < 2) return { applicable: false, reason: 'Missing sentence or options.' };

    const analysis = analyzeHead(sentence);
    if (!analysis) {
      return {
        applicable: false,
        reason: 'Could not identify the head noun of the sentence.',
      };
    }

    return {
      applicable: true,
      reason: `Head-noun identification works on any subject-verb agreement question. ${analysis.reasoning}`,
      passedChecks: [
        'Sentence has an identifiable subject',
        `Subject looks ${analysis.isSingular === false ? 'plural' : 'singular'}`,
        `Options include at least one singular and one plural verb form`,
      ],
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const { sentence, options } = getSentenceAndOptions(problem);
    const analysis = analyzeHead(sentence);

    if (!analysis) {
      return buildLesson({
        id: `grammar.strategy.head-noun.${Date.now()}`,
        topic: 'agreement.subject-verb',
        title: sentence,
        difficulty: 1,
        objectives: ['head-noun identification'],
        steps: [
          step('s1', 'work', [writeOp(sentence)], undefined, 400),
          step('s2', 'explain', [writeOp('Could not automatically identify the head noun — apply the strategy manually.', 'explain')]),
        ],
      });
    }

    // Pick the option that matches the analyzed singular/plural
    const wantSingular = analysis.isSingular ?? true;
    const chosen = options.find(o => isSingularVerb(o) === wantSingular) ?? options[0]!;

    return buildLesson({
      id: `grammar.strategy.head-noun.${Date.now()}`,
      topic: 'agreement.subject-verb',
      title: sentence,
      difficulty: 2,
      objectives: ['head-noun identification', 'subject-verb matching'],
      steps: [
        step('s1', 'work', [writeOp(sentence)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: find the head noun', 'explain')],
          'Head-noun strategy.',
          300),
        step('s3', 'explain',
          [writeOp(analysis.reasoning, 'explain')],
          undefined, 400),
        step('s4', 'explain',
          [writeOp(`"${analysis.head}" is ${wantSingular ? 'singular' : 'plural'} → use a ${wantSingular ? 'singular' : 'plural'} verb.`, 'explain')],
          undefined, 300),
        step('s5', 'work',
          [writeOp(`Options: ${options.join(' / ')}`)],
          undefined, 300),
        step('s6', 'checkpoint',
          [writeOp(chosen, 'answer')],
          `The answer is "${chosen}".`),
      ],
    });
  },
};
