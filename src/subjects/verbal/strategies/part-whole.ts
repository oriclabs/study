import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getPair } from './helpers.js';

/**
 * Part-to-whole relationship.
 * Example: FINGER : HAND :: TOE : FOOT
 */

// Small seed lexicon of part → whole.
const PART_TO_WHOLE: Record<string, string> = {
  FINGER: 'HAND',
  TOE: 'FOOT',
  LEAF: 'TREE',
  PETAL: 'FLOWER',
  ROOT: 'TREE',
  BRANCH: 'TREE',
  PAGE: 'BOOK',
  CHAPTER: 'BOOK',
  WHEEL: 'CAR',
  ENGINE: 'CAR',
  TIRE: 'CAR',
  KEY: 'KEYBOARD',
  STRING: 'GUITAR',
  NOTE: 'MELODY',
  LETTER: 'WORD',
  WORD: 'SENTENCE',
  SENTENCE: 'PARAGRAPH',
  PARAGRAPH: 'ESSAY',
  ROOM: 'HOUSE',
  HOUSE: 'NEIGHBORHOOD',
  NEIGHBORHOOD: 'CITY',
  CITY: 'COUNTRY',
  PLAYER: 'TEAM',
  TEAM: 'LEAGUE',
  ISLAND: 'ARCHIPELAGO',
  STAR: 'GALAXY',
  PLANET: 'SOLAR_SYSTEM',
  NOSE: 'FACE',
  EYE: 'FACE',
  WING: 'BIRD',
  FIN: 'FISH',
};

export const partWhole: Strategy = {
  metadata: {
    id: 'analogy-part-whole',
    name: 'Part → Whole',
    shortDescription: 'Pair 1 is a component; pair 2 is the object it belongs to (e.g. FINGER → HAND).',
    appliesTo: ['analogy'],
    tradeoffs: {
      speed: 'fast',
      generality: 'narrow',
      accuracy: 'exact',
      builds: ['part-whole reasoning', 'structural vocabulary'],
      failsWhen: 'the pair is not a physical or structural part-whole',
    },
    relatedStrategies: ['analogy-individual-collective', 'analogy-function'],
    commonMistakes: ['confused-similar-concept'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'analogy') return { applicable: false, reason: 'Not an analogy.' };
    const { a, b, c } = getPair(problem);

    const knownWholeForA = PART_TO_WHOLE[a];
    const passed: string[] = [];
    const failed: string[] = [];

    if (knownWholeForA && knownWholeForA === b) {
      passed.push(`${a} is a known part of ${b}`);
      const knownForC = PART_TO_WHOLE[c];
      if (knownForC) {
        passed.push(`${c} is in our part-whole lexicon`);
        return {
          applicable: true,
          reason: `${a} is a part of ${b}. Same structure applies to ${c}.`,
          passedChecks: passed,
        };
      }
      failed.push(`${c} is not in our lexicon — recall what ${c.toLowerCase()} is a part of`);
      return {
        applicable: true,
        reason: `${a} is a part of ${b}. For ${c}, recall what it's a part of.`,
        passedChecks: passed,
        failedChecks: failed,
      };
    }

    if (knownWholeForA) {
      failed.push(`${a} is known to be a part of ${knownWholeForA}, not ${b}`);
    } else {
      failed.push(`${a} is not in our part-whole lexicon`);
    }

    return {
      applicable: false,
      reason: 'This pair does not look like a part-to-whole relationship.',
      failedChecks: failed,
    };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const { a, b, c } = getPair(problem);
    const answerForC = PART_TO_WHOLE[c];

    return buildLesson({
      id: `verbal.strategy.part-whole.${Date.now()}`,
      topic: 'analogies',
      title: `${a} : ${b} :: ${c} : ?`,
      difficulty: 2,
      objectives: ['part-whole analogies', 'structural reasoning'],
      steps: [
        step('s1', 'work', [writeOp(`${a} : ${b} :: ${c} : ?`)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: part → whole', 'explain'),
           writeOp(`${a} is a part of ${b}.`, 'explain')],
          undefined, 300),
        step('s3', 'explain',
          [writeOp(`Apply the same relationship to ${c}:`, 'explain'),
           writeOp(`${c} is a part of...`)],
          undefined, 400),
        ...(answerForC
          ? [step('s4', 'checkpoint', [writeOp(answerForC, 'answer')])]
          : [step('s4', 'checkpoint',
              [writeOp(`Recall: what is ${c} a part of?`, 'answer')],
              'Try to recall the whole.')]),
      ],
    });
  },
};
