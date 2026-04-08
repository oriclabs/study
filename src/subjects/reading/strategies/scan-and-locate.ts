import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, getQuestion } from './helpers.js';

/**
 * Scan-and-locate strategy.
 *
 * Best for literal / stated-information questions. The student scans
 * the passage for keywords from the question, then reads the surrounding
 * sentences to find the answer.
 */
export const scanAndLocate: Strategy = {
  metadata: {
    id: 'scan-and-locate',
    name: 'Scan & Locate',
    shortDescription: 'Find keywords from the question in the passage, then read the surrounding context.',
    appliesTo: ['literal', 'vocabulary', 'evidence'],
    tradeoffs: {
      speed: 'fast',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['skimming', 'keyword identification', 'active reading'],
      failsWhen: 'the answer requires synthesis across multiple paragraphs',
    },
    relatedStrategies: ['elimination', 'evidence-first'],
    commonMistakes: ['misread-question', 'incomplete-answer'],
  },

  learningValue: 2,

  check(problem: Problem): StrategyCheck {
    const directTypes = ['literal', 'vocabulary', 'evidence'];
    if (directTypes.includes(problem.type)) {
      return {
        applicable: true,
        reason: `"${problem.type}" questions usually have a locatable answer in the text.`,
        passedChecks: [
          'Question asks for directly stated or findable information',
          'Keywords from the question can guide scanning',
        ],
      };
    }

    if (problem.type === 'inference' || problem.type === 'purpose' || problem.type === 'tone') {
      return {
        applicable: false,
        reason: 'This question requires interpretation beyond what scanning can find.',
        failedChecks: ['Answer is not directly stated — needs deeper analysis'],
      };
    }

    return { applicable: false, reason: 'Not a recognized reading question type.' };
  },

  cost(_problem: Problem): number { return 1; },

  solve(problem: Problem): Lesson {
    const question = getQuestion(problem);

    return buildLesson({
      id: `reading.strategy.scan-and-locate.${Date.now()}`,
      topic: problem.topic ?? 'comprehension.stated-info',
      title: `Scan & Locate: ${question.slice(0, 50)}`,
      difficulty: 2,
      objectives: ['keyword scanning', 'locating textual evidence'],
      steps: [
        step('s1', 'work',
          [writeOp(question)],
          undefined, 400),
        step('s2', 'explain',
          [writeOp('Step 1: Identify keywords', 'explain'),
           writeOp('Underline the key nouns, verbs, or phrases in the question.')],
          'First, find the important words in the question.',
          300),
        step('s3', 'explain',
          [writeOp('Step 2: Scan the passage', 'explain'),
           writeOp('Move your eyes quickly through the passage looking for those keywords or synonyms.')],
          'Now scan the passage for those words.',
          400),
        step('s4', 'explain',
          [writeOp('Step 3: Read the context', 'explain'),
           writeOp('Once you find a keyword match, read the full sentence and the sentences around it.')],
          'Read the sentences around your match.',
          300),
        step('s5', 'checkpoint',
          [writeOp('The answer should be in or near the sentence containing the keyword.', 'answer')],
          'Select the answer supported by that section of text.'),
      ],
    });
  },
};
