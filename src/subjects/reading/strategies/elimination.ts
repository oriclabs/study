import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getQuestion } from './helpers.js';

/**
 * Elimination strategy.
 *
 * Works on any multiple-choice reading question. Read every option,
 * cross out the ones that are clearly wrong (contradicted by the text,
 * too extreme, or off-topic), then choose from what remains.
 */
export const elimination: Strategy = {
  metadata: {
    id: 'elimination',
    name: 'Process of Elimination',
    shortDescription: 'Read all options, cross out obviously wrong ones, then pick from the survivors.',
    appliesTo: ['literal', 'inference', 'vocabulary', 'purpose', 'tone', 'evidence'],
    tradeoffs: {
      speed: 'medium',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['critical reading', 'option analysis', 'test-taking skill'],
      failsWhen: 'two remaining options are very close and you lack evidence to distinguish them',
    },
    relatedStrategies: ['scan-and-locate', 'evidence-first'],
    commonMistakes: ['misread-question'],
  },

  learningValue: 3,

  check(problem: Problem): StrategyCheck {
    const allTypes = ['literal', 'inference', 'vocabulary', 'purpose', 'tone', 'evidence'];
    if (allTypes.includes(problem.type)) {
      return {
        applicable: true,
        reason: 'Elimination works on any multiple-choice reading question.',
        passedChecks: [
          'Question is a reading comprehension type',
          'Strategy is universal for MCQ formats',
        ],
      };
    }
    return { applicable: false, reason: 'Not a recognized reading question type.' };
  },

  cost(_problem: Problem): number { return 2; },

  solve(problem: Problem): Lesson {
    const question = getQuestion(problem);

    return buildLesson({
      id: `reading.strategy.elimination.${Date.now()}`,
      topic: problem.topic ?? 'evaluation.strategy',
      title: `Elimination: ${question.slice(0, 50)}`,
      difficulty: 2,
      objectives: ['process of elimination', 'distractor analysis'],
      steps: [
        step('s1', 'work',
          [writeOp(question)],
          undefined, 400),
        step('s2', 'explain',
          [writeOp('Step 1: Read the question carefully', 'explain'),
           writeOp('Make sure you know exactly what is being asked before looking at the options.')],
          'Understand the question first.',
          300),
        step('s3', 'explain',
          [writeOp('Step 2: Read every option', 'explain'),
           writeOp('Do not stop at the first plausible answer. Read all choices.')],
          'Read all the answer choices.',
          300),
        step('s4', 'explain',
          [writeOp('Step 3: Eliminate wrong answers', 'explain'),
           writeOp('Cross out options that are:'),
           writeOp('  - Contradicted by the passage'),
           writeOp('  - Too extreme (always, never, all, none)'),
           writeOp('  - Off-topic or about something not discussed'),
           writeOp('  - True in general but not supported by this passage')],
          'Eliminate the clearly wrong choices.',
          500),
        step('s5', 'explain',
          [writeOp('Step 4: Compare remaining options', 'explain'),
           writeOp('If two options remain, look for the one with stronger textual support.')],
          'Compare the survivors.',
          300),
        step('s6', 'checkpoint',
          [writeOp('Pick the answer with the best evidence in the passage.', 'answer')],
          'Choose the best-supported answer.'),
      ],
    });
  },
};
