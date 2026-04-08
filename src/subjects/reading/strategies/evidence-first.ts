import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getQuestion } from './helpers.js';

/**
 * Evidence-first strategy.
 *
 * Before looking at answer options, find the relevant evidence in the
 * passage. Form your own answer, then match it to the closest option.
 * Particularly effective for inference, purpose, and evidence questions
 * where distractors are designed to mislead.
 */
export const evidenceFirst: Strategy = {
  metadata: {
    id: 'evidence-first',
    name: 'Evidence First',
    shortDescription: 'Find the text evidence before looking at options — form your own answer, then match.',
    appliesTo: ['inference', 'purpose', 'tone', 'evidence', 'literal'],
    tradeoffs: {
      speed: 'slow',
      generality: 'universal',
      accuracy: 'exact',
      builds: ['evidence-based reasoning', 'independent thinking', 'passage analysis'],
      failsWhen: 'the passage is very short and all information is obvious',
    },
    relatedStrategies: ['scan-and-locate', 'elimination'],
    commonMistakes: ['incomplete-answer', 'confused-similar-concept'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    const deepTypes = ['inference', 'purpose', 'tone', 'evidence'];
    const passed: string[] = [];
    const failed: string[] = [];

    if (deepTypes.includes(problem.type)) {
      passed.push('Question requires interpretation or analysis');
      passed.push('Evidence-first prevents distractor bias');
      return {
        applicable: true,
        reason: `"${problem.type}" questions benefit most from finding evidence before reading options.`,
        passedChecks: passed,
      };
    }

    if (problem.type === 'literal') {
      passed.push('Strategy is usable for literal questions');
      failed.push('Scan-and-locate is usually faster for stated-information questions');
      return {
        applicable: true,
        reason: 'Works for literal questions, though scan-and-locate is faster.',
        passedChecks: passed,
        failedChecks: failed,
      };
    }

    if (problem.type === 'vocabulary') {
      failed.push('Vocabulary questions are better served by context-clue scanning');
      return {
        applicable: false,
        reason: 'Vocabulary-in-context questions don\'t benefit much from evidence-first.',
        failedChecks: failed,
      };
    }

    return { applicable: false, reason: 'Not a recognized reading question type.' };
  },

  cost(_problem: Problem): number { return 3; },

  solve(problem: Problem): Lesson {
    const question = getQuestion(problem);

    return buildLesson({
      id: `reading.strategy.evidence-first.${Date.now()}`,
      topic: problem.topic ?? 'analysis.evidence',
      title: `Evidence First: ${question.slice(0, 50)}`,
      difficulty: 3,
      objectives: ['evidence gathering', 'pre-answer formulation', 'independent reasoning'],
      steps: [
        step('s1', 'work',
          [writeOp(question)],
          undefined, 400),
        step('s2', 'explain',
          [writeOp('Step 1: Read the question — then STOP', 'explain'),
           writeOp('Do NOT read the answer choices yet. Cover them if you can.')],
          'Read the question but ignore the options.',
          300),
        step('s3', 'explain',
          [writeOp('Step 2: Go to the passage', 'explain'),
           writeOp('Find the relevant section. Read it carefully and note key details.')],
          'Locate and read the relevant part of the passage.',
          400),
        step('s4', 'explain',
          [writeOp('Step 3: Form your own answer', 'explain'),
           writeOp('Based only on the text, write a mental or brief answer in your own words.')],
          'Answer the question in your own words before looking at choices.',
          400),
        step('s5', 'explain',
          [writeOp('Step 4: Match to the options', 'explain'),
           writeOp('Now read the choices. Pick the one closest to your pre-formed answer.'),
           writeOp('If none match, re-read the passage — you may have missed something.')],
          'Find the option that matches your evidence-based answer.',
          300),
        step('s6', 'checkpoint',
          [writeOp('Your answer should be anchored in specific text evidence, not a gut feeling.', 'answer')],
          'Choose the option backed by the passage.'),
      ],
    });
  },
};
