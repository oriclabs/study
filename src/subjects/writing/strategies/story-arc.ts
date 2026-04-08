import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, promptLabel } from './helpers.js';

/**
 * Story-arc strategy: plan a piece of writing using
 * beginning-middle-end structure with a central conflict.
 *
 * Best suited to narrative prompts, but also works for
 * descriptive pieces that benefit from a sequence of events.
 */
export const storyArc: Strategy = {
  metadata: {
    id: 'story-arc',
    name: 'Story Arc (Beginning-Middle-End)',
    shortDescription: 'Plan using a three-part arc: setup, conflict, resolution.',
    appliesTo: ['narrative', 'descriptive', 'planning'],
    tradeoffs: {
      speed: 'medium',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['narrative structure', 'conflict development', 'pacing'],
      failsWhen: 'the prompt requires a non-narrative form (e.g. pure argument)',
    },
    relatedStrategies: ['sensory-detail', 'argument-structure'],
    commonMistakes: ['weak-opening', 'no-conflict', 'rushed-ending'],
  },

  learningValue: 4,

  check(problem: Problem): StrategyCheck {
    const t = problem.type;
    if (t === 'narrative') {
      return {
        applicable: true,
        reason: 'This is a narrative prompt -- a story arc gives it shape and tension.',
        passedChecks: [
          'Prompt asks for a story or personal experience',
          'Beginning-middle-end maps naturally onto narrative',
        ],
      };
    }
    if (t === 'descriptive') {
      return {
        applicable: true,
        reason: 'Even descriptive writing benefits from a sequence: arrival, discovery, reflection.',
        passedChecks: ['Descriptive prompts can use a loose narrative frame'],
        failedChecks: ['A pure static description might not need conflict'],
      };
    }
    if (t === 'planning') {
      return {
        applicable: true,
        reason: 'The story arc provides a ready-made three-part plan.',
        passedChecks: ['Planning prompt -- the arc is itself a plan'],
      };
    }
    return {
      applicable: false,
      reason: 'This prompt needs an argument structure, not a story arc.',
      failedChecks: ['Prompt is persuasive or editing, not narrative'],
    };
  },

  cost(problem: Problem): number {
    return problem.type === 'narrative' ? 2 : 3;
  },

  solve(problem: Problem): Lesson {
    const label = promptLabel(problem.rawInput);

    return buildLesson({
      id: `writing.strategy.story-arc.${Date.now()}`,
      topic: problem.topic ?? 'narrative',
      title: `Story arc: ${label}`,
      difficulty: 2,
      objectives: ['narrative structure', 'conflict', 'resolution'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: Story Arc', 'title'),
           writeOp('Every strong narrative has three parts: a beginning that hooks, a middle with tension, and an ending that resolves.', 'explain')],
          'Plan with a three-part arc.',
          300),
        step('s3', 'explain',
          [writeOp('1. BEGINNING -- Set the scene', 'explain'),
           writeOp('   Who is the main character? Where and when does the story start?'),
           writeOp('   Tip: Start in the middle of the action (in medias res) to hook the reader.')],
          undefined, 400),
        step('s4', 'explain',
          [writeOp('2. MIDDLE -- Introduce conflict', 'explain'),
           writeOp('   What goes wrong? What challenge or turning point occurs?'),
           writeOp('   This is the heart of the story -- make the reader feel the tension.')],
          undefined, 400),
        step('s5', 'explain',
          [writeOp('3. END -- Resolve and reflect', 'explain'),
           writeOp('   How is the conflict resolved? What did the character learn?'),
           writeOp('   A strong ending echoes the beginning or delivers a surprise.')],
          undefined, 400),
        step('s6', 'checkpoint',
          [writeOp('Now sketch your arc: one sentence for each of the three parts.', 'answer')],
          'Write one sentence per part.'),
      ],
    });
  },
};
