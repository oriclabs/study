import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getPair } from './helpers.js';

/**
 * Individual-to-collective-noun relationship.
 * Example: BIRD : FLOCK :: FISH : SCHOOL
 *
 * The check() attempts to verify that B is a known collective noun for A.
 * If yes, the strategy confidently applies. If unknown, it still applies
 * as a hypothesis — the student can verify externally.
 */

// Small seed lexicon — extended via the knowledge bank JSON in real deployments.
const COLLECTIVE_NOUNS: Record<string, string> = {
  BIRD: 'FLOCK',
  FISH: 'SCHOOL',
  SHARK: 'SCHOOL',
  WOLF: 'PACK',
  DOG: 'PACK',
  LION: 'PRIDE',
  SHEEP: 'FLOCK',
  COW: 'HERD',
  CATTLE: 'HERD',
  ELEPHANT: 'HERD',
  BEE: 'SWARM',
  ANT: 'COLONY',
  PENGUIN: 'COLONY',
  WHALE: 'POD',
  DOLPHIN: 'POD',
  CROW: 'MURDER',
  LOCUST: 'SWARM',
  DUCK: 'FLOCK',
  GOOSE: 'GAGGLE',
  HORSE: 'HERD',
  FLOWER: 'BOUQUET',
  STAR: 'CONSTELLATION',
  TREE: 'FOREST',
  BOOK: 'LIBRARY',
  MUSICIAN: 'BAND',
  SOLDIER: 'ARMY',
  SHIP: 'FLEET',
};

export const individualCollective: Strategy = {
  metadata: {
    id: 'analogy-individual-collective',
    name: 'Individual → Collective noun',
    shortDescription: 'Pair 1 is an individual, pair 2 is the group it belongs to (e.g. BIRD → FLOCK).',
    appliesTo: ['analogy'],
    tradeoffs: {
      speed: 'fast',
      generality: 'narrow',
      accuracy: 'exact',
      builds: ['collective nouns', 'relationship vocabulary'],
      failsWhen: 'the pair is not individual-to-group',
    },
    relatedStrategies: ['analogy-part-whole', 'analogy-function'],
    commonMistakes: ['confused-similar-concept', 'misread-question'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'analogy') return { applicable: false, reason: 'Not an analogy.' };
    const { a, b, c } = getPair(problem);

    const knownCollectiveForA = COLLECTIVE_NOUNS[a];
    const passed: string[] = [];
    const failed: string[] = [];

    if (knownCollectiveForA && knownCollectiveForA === b) {
      passed.push(`${b} is the known collective noun for ${a}`);
      const knownForC = COLLECTIVE_NOUNS[c];
      if (knownForC) {
        passed.push(`${c} is in our collective-noun lexicon too`);
        return {
          applicable: true,
          reason: `${b} is the collective noun for ${a}. This relationship gives a confident answer for ${c}.`,
          passedChecks: passed,
        };
      } else {
        failed.push(`${c} is not in our lexicon — you'll need to recall its collective noun yourself`);
        return {
          applicable: true,
          reason: `${b} is the collective noun for ${a}. For ${c}, try to recall what a group of ${c.toLowerCase()}s is called.`,
          passedChecks: passed,
          failedChecks: failed,
        };
      }
    }

    if (knownCollectiveForA) {
      failed.push(`The known collective noun for ${a} is ${knownCollectiveForA}, not ${b}`);
    } else {
      failed.push(`${b} may or may not be a collective noun for ${a} — not in our lexicon`);
    }

    return {
      applicable: false,
      reason: 'This pair does not look like an individual-to-collective-noun relationship.',
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const { a, b, c } = getPair(problem);
    const answerForC = COLLECTIVE_NOUNS[c];

    return buildLesson({
      id: `verbal.strategy.individual-collective.${Date.now()}`,
      topic: 'analogies',
      title: `${a} : ${b} :: ${c} : ?`,
      difficulty: 2,
      objectives: ['collective nouns', 'analogy relationships'],
      steps: [
        step('s1', 'work', [writeOp(`${a} : ${b} :: ${c} : ?`)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: individual → collective noun', 'explain'),
           writeOp(`${b} is the collective noun for ${a}.`, 'explain')],
          undefined, 300),
        step('s3', 'explain',
          [writeOp(`Apply the same relationship to ${c}:`, 'explain'),
           writeOp(`A group of ${c.toLowerCase()}s is called...`)],
          undefined, 400),
        ...(answerForC
          ? [step('s4', 'checkpoint', [writeOp(answerForC, 'answer')])]
          : [step('s4', 'checkpoint',
              [writeOp(`Recall: what's the collective noun for ${c}?`, 'answer')],
              'Try to recall the collective noun.')]),
      ],
    });
  },
};
