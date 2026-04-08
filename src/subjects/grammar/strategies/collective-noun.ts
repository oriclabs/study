import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getSentenceAndOptions } from './helpers.js';

/**
 * Collective-noun rule: collective nouns take a singular verb in US English
 * when treated as a unit, plural in UK English when treated as members.
 */

const COLLECTIVE_NOUNS = new Set([
  'TEAM', 'FAMILY', 'COMMITTEE', 'JURY', 'STAFF', 'AUDIENCE', 'CROWD',
  'GROUP', 'CLASS', 'BAND', 'CHOIR', 'ORCHESTRA', 'COMPANY', 'DEPARTMENT',
  'GOVERNMENT', 'MAJORITY', 'PUBLIC', 'COUPLE',
]);

export const collectiveNoun: Strategy = {
  metadata: {
    id: 'grammar-collective-noun',
    name: 'Collective-noun rule',
    shortDescription: 'Collective nouns (team, family, committee) take singular verbs in US English.',
    appliesTo: ['sv-agreement'],
    tradeoffs: {
      speed: 'fast',
      generality: 'narrow',
      accuracy: 'exact',
      builds: ['collective noun recognition', 'US vs UK usage awareness'],
      failsWhen: 'the sentence doesn\'t contain a collective noun',
    },
    relatedStrategies: ['grammar-head-noun', 'grammar-ear-test'],
    commonMistakes: ['confused-similar-concept'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'sv-agreement') return { applicable: false, reason: 'Not a subject-verb agreement problem.' };
    const { sentence } = getSentenceAndOptions(problem);
    const words = sentence.toUpperCase().split(/\s+/).map(w => w.replace(/[.,;:]/g, ''));
    const foundCollective = words.find(w => COLLECTIVE_NOUNS.has(w));

    if (foundCollective) {
      return {
        applicable: true,
        reason: `"${foundCollective.toLowerCase()}" is a collective noun. In US English it takes a singular verb.`,
        passedChecks: [
          `Sentence contains "${foundCollective.toLowerCase()}"`,
          'Collective nouns take singular verbs in US English',
        ],
      };
    }

    return {
      applicable: false,
      reason: 'No collective noun found in the sentence. Use head-noun identification instead.',
      failedChecks: ['No known collective noun (team, family, committee, etc.) in sentence'],
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const { sentence, options } = getSentenceAndOptions(problem);
    const words = sentence.toUpperCase().split(/\s+/).map(w => w.replace(/[.,;:]/g, ''));
    const foundCollective = words.find(w => COLLECTIVE_NOUNS.has(w)) ?? '';

    // Pick singular option
    const chosen = options.find(o => {
      const v = o.toLowerCase().trim();
      return v === 'is' || v === 'has' || v === 'was' || v === 'does' || (v.endsWith('s') && !v.endsWith('ss'));
    }) ?? options[0]!;

    return buildLesson({
      id: `grammar.strategy.collective-noun.${Date.now()}`,
      topic: 'agreement.subject-verb',
      title: sentence,
      difficulty: 2,
      objectives: ['collective noun recognition', 'US English rule'],
      steps: [
        step('s1', 'work', [writeOp(sentence)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: collective-noun rule', 'explain')],
          undefined, 300),
        step('s3', 'explain',
          [writeOp(`"${foundCollective.toLowerCase()}" is a collective noun.`, 'explain')],
          undefined, 300),
        step('s4', 'explain',
          [writeOp('In US English, collective nouns take a singular verb.', 'explain')],
          undefined, 300),
        step('s5', 'checkpoint',
          [writeOp(chosen, 'answer')]),
      ],
    });
  },
};
