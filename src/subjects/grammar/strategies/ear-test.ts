import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getSentenceAndOptions } from './helpers.js';

/**
 * Ear-test fallback: say the sentence out loud with each option and pick
 * the one that "sounds right". Flagged as low-confidence because native
 * speakers can still be wrong on constructions with intervening phrases.
 */
export const earTest: Strategy = {
  metadata: {
    id: 'grammar-ear-test',
    name: 'Ear test',
    shortDescription: 'Say it aloud, pick the form that sounds right. Quick but unreliable for tricky constructions.',
    appliesTo: ['sv-agreement'],
    tradeoffs: {
      speed: 'fast',
      generality: 'universal',
      accuracy: 'approximate',
      builds: ['intuitive language sense'],
      failsWhen: 'the construction is a known trap (intervening prepositional phrases, rare collectives)',
    },
    relatedStrategies: ['grammar-head-noun', 'grammar-collective-noun'],
    commonMistakes: ['confused-similar-concept', 'misread-question'],
  },

  learningValue: 1,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'sv-agreement') return { applicable: false, reason: 'Not a subject-verb agreement problem.' };
    return {
      applicable: true,
      reason: 'Ear test works for simple cases but is unreliable for tricky constructions. Use as a last resort.',
      passedChecks: ['Any sentence can be read aloud'],
      failedChecks: [
        'Native intuition can fail on intervening prepositional phrases',
        'Native intuition can fail on rare collective nouns',
      ],
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const { sentence, options } = getSentenceAndOptions(problem);

    return buildLesson({
      id: `grammar.strategy.ear-test.${Date.now()}`,
      topic: 'agreement.subject-verb',
      title: sentence,
      difficulty: 1,
      objectives: ['intuitive usage'],
      steps: [
        step('s1', 'work', [writeOp(sentence)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: ear test', 'explain'),
           writeOp('Say the sentence aloud with each option. Pick the one that sounds natural.', 'explain')],
          'The ear test.',
          300),
        ...options.map((opt, i) => step(
          `s${i + 3}`,
          'work',
          [writeOp(`"${sentence.replace(/___+/g, opt)}"`)],
          undefined,
          300,
        )),
        step('sFinal', 'explain',
          [writeOp('⚠️ If the sentence has "of [something]" between subject and verb, do NOT trust the ear test — use head-noun identification instead.', 'explain')],
          'Ear-test warning.'),
      ],
    });
  },
};
