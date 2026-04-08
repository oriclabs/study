import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getPair } from './helpers.js';

/**
 * Function / workplace / tool-and-outcome relationship.
 * Example: SCIENTIST : LABORATORY :: CHEF : KITCHEN
 *          PEN : WRITE :: KNIFE : CUT
 */

const WORKPLACE: Record<string, string> = {
  SCIENTIST: 'LABORATORY',
  CHEF: 'KITCHEN',
  DOCTOR: 'HOSPITAL',
  TEACHER: 'CLASSROOM',
  JUDGE: 'COURTROOM',
  ACTOR: 'STAGE',
  PILOT: 'COCKPIT',
  FARMER: 'FIELD',
  LIBRARIAN: 'LIBRARY',
  ARTIST: 'STUDIO',
  BAKER: 'BAKERY',
  SAILOR: 'SHIP',
  ASTRONAUT: 'SPACECRAFT',
};

const TOOL_FUNCTION: Record<string, string> = {
  PEN: 'WRITE',
  PENCIL: 'WRITE',
  KNIFE: 'CUT',
  SCISSORS: 'CUT',
  HAMMER: 'POUND',
  BROOM: 'SWEEP',
  KEY: 'OPEN',
  MICROSCOPE: 'MAGNIFY',
  TELESCOPE: 'MAGNIFY',
  COMPASS: 'NAVIGATE',
  CLOCK: 'MEASURE_TIME',
  RULER: 'MEASURE',
};

export const functionRelation: Strategy = {
  metadata: {
    id: 'analogy-function',
    name: 'Function / Workplace',
    shortDescription: 'Pair 1 is a person/tool; pair 2 is where they work / what they do.',
    appliesTo: ['analogy'],
    tradeoffs: {
      speed: 'fast',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['functional reasoning', 'semantic relationships'],
      failsWhen: 'the pair is not a doer-action or worker-workplace',
    },
    relatedStrategies: ['analogy-individual-collective', 'analogy-part-whole'],
    commonMistakes: ['confused-similar-concept', 'misread-question'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    if (problem.type !== 'analogy') return { applicable: false, reason: 'Not an analogy.' };
    const { a, b, c } = getPair(problem);

    // Check workplace
    if (WORKPLACE[a] === b) {
      const forC = WORKPLACE[c];
      return {
        applicable: true,
        reason: `${b} is the workplace of a ${a.toLowerCase()}. Same structure for ${c}.`,
        passedChecks: [
          `${a} → ${b}: worker-workplace ✓`,
          ...(forC ? [`${c} → ${forC}: also in lexicon`] : [`${c}: not in lexicon — recall manually`]),
        ],
      };
    }

    // Check tool-function
    if (TOOL_FUNCTION[a] === b) {
      const forC = TOOL_FUNCTION[c];
      return {
        applicable: true,
        reason: `${b} is what you do with a ${a.toLowerCase()}. Same pattern for ${c}.`,
        passedChecks: [
          `${a} → ${b}: tool-function ✓`,
          ...(forC ? [`${c} → ${forC}: also in lexicon`] : [`${c}: not in lexicon — recall manually`]),
        ],
      };
    }

    return {
      applicable: false,
      reason: 'Not a recognized worker-workplace or tool-function pairing in our lexicon.',
    };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const { a, b, c } = getPair(problem);
    const answerForC = WORKPLACE[c] ?? TOOL_FUNCTION[c];
    const isWorkplace = WORKPLACE[a] === b;

    return buildLesson({
      id: `verbal.strategy.function.${Date.now()}`,
      topic: 'analogies',
      title: `${a} : ${b} :: ${c} : ?`,
      difficulty: 2,
      objectives: ['function relationships', 'semantic analogies'],
      steps: [
        step('s1', 'work', [writeOp(`${a} : ${b} :: ${c} : ?`)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: function / workplace', 'explain'),
           writeOp(isWorkplace
             ? `${b} is where a ${a.toLowerCase()} works.`
             : `${b} is what you do with a ${a.toLowerCase()}.`, 'explain')],
          undefined, 300),
        step('s3', 'explain',
          [writeOp(`Apply the same relationship to ${c}:`, 'explain')],
          undefined, 400),
        ...(answerForC
          ? [step('s4', 'checkpoint', [writeOp(answerForC, 'answer')])]
          : [step('s4', 'checkpoint',
              [writeOp(`Recall: what's associated with ${c}?`, 'answer')],
              'Try to recall the match.')]),
      ],
    });
  },
};
