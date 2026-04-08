import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, promptLabel } from './helpers.js';

/**
 * Sensory-detail strategy: build scenes using the five senses.
 * The core principle is "show, don't tell".
 *
 * Strongest for descriptive and narrative prompts, but can
 * enhance persuasive writing too (emotional appeals).
 */
export const sensoryDetail: Strategy = {
  metadata: {
    id: 'sensory-detail',
    name: 'Sensory Detail (Show Don\'t Tell)',
    shortDescription: 'Build scenes using the five senses -- sight, sound, smell, touch, taste.',
    appliesTo: ['descriptive', 'narrative', 'planning'],
    tradeoffs: {
      speed: 'slow',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['descriptive language', 'imagery', 'figurative language'],
      failsWhen: 'the prompt is purely analytical or persuasive with no room for description',
    },
    relatedStrategies: ['story-arc', 'argument-structure'],
    commonMistakes: ['telling-not-showing', 'overloaded-description', 'cliche-imagery'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    const t = problem.type;
    if (t === 'descriptive') {
      return {
        applicable: true,
        reason: 'This is a descriptive prompt -- sensory detail is the core technique.',
        passedChecks: [
          'Prompt asks for description or scene-building',
          'All five senses can be deployed',
        ],
      };
    }
    if (t === 'narrative') {
      return {
        applicable: true,
        reason: 'Strong narratives are powered by vivid sensory detail in key scenes.',
        passedChecks: ['Narrative benefits from show-don\'t-tell moments'],
        failedChecks: ['Not every paragraph needs dense imagery -- pick key moments'],
      };
    }
    if (t === 'planning') {
      return {
        applicable: true,
        reason: 'A sensory-detail plan lists which senses to deploy in each paragraph.',
        passedChecks: ['Planning prompt -- sensory inventory works as a plan'],
      };
    }
    return {
      applicable: false,
      reason: 'Persuasive and editing tasks rarely need a five-senses approach.',
      failedChecks: ['Prompt is not descriptive or narrative'],
    };
  },

  cost(_problem: Problem): number {
    // Sensory detail takes effort -- it's a slow-burn technique.
    return 3;
  },

  solve(problem: Problem): Lesson {
    const label = promptLabel(problem.rawInput);

    return buildLesson({
      id: `writing.strategy.sensory-detail.${Date.now()}`,
      topic: problem.topic ?? 'descriptive',
      title: `Sensory detail: ${label}`,
      difficulty: 3,
      objectives: ['sensory language', 'show don\'t tell', 'imagery'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: Five-Senses Detail', 'title'),
           writeOp('"Show, don\'t tell" means using concrete sensory details instead of abstract labels.', 'explain'),
           writeOp('Instead of "She was scared", write "Her hands trembled and the hairs on her arms stood up."', 'explain')],
          'Show the reader instead of telling them.',
          300),
        step('s3', 'explain',
          [writeOp('The five senses checklist:', 'explain'),
           writeOp('   SIGHT  -- colours, shapes, light, shadows, movement'),
           writeOp('   SOUND  -- loud/quiet, sharp/soft, rhythm, silence'),
           writeOp('   SMELL  -- pleasant/unpleasant, strong/faint, triggers memories'),
           writeOp('   TOUCH  -- texture, temperature, pressure, pain'),
           writeOp('   TASTE  -- sweet, sour, bitter, metallic, dry')],
          undefined, 500),
        step('s4', 'explain',
          [writeOp('Power moves:', 'explain'),
           writeOp('   - Combine two senses in one sentence ("the cold wind tasted of salt")'),
           writeOp('   - Use simile or metaphor ("the silence was a heavy blanket")'),
           writeOp('   - Pick unexpected senses -- smell and touch are underused')],
          undefined, 400),
        step('s5', 'checkpoint',
          [writeOp('For your prompt, list one detail for each sense. Then pick the three strongest to use.', 'answer')],
          'List one detail per sense.'),
      ],
    });
  },
};
