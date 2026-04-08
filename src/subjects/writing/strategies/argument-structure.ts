import type { Strategy, Problem, StrategyCheck } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writeOp, step, buildLesson, promptLabel } from './helpers.js';

/**
 * Argument-structure strategy: plan persuasive writing using
 * thesis -> evidence -> counterargument -> conclusion.
 *
 * Primary fit for persuasive prompts, but also useful for
 * planning tasks and editing argumentative essays.
 */
export const argumentStructure: Strategy = {
  metadata: {
    id: 'argument-structure',
    name: 'Argument Structure (Thesis-Evidence-Counter)',
    shortDescription: 'Plan: thesis statement, supporting evidence, counterargument, conclusion.',
    appliesTo: ['persuasive', 'planning', 'editing'],
    tradeoffs: {
      speed: 'medium',
      generality: 'moderate',
      accuracy: 'exact',
      builds: ['thesis statements', 'evidence evaluation', 'counterargument', 'logical structure'],
      failsWhen: 'the prompt is purely creative/narrative with no argument to make',
    },
    relatedStrategies: ['story-arc', 'sensory-detail'],
    commonMistakes: ['weak-thesis', 'no-counterargument', 'opinion-without-evidence'],
  },

  learningValue: 5,

  check(problem: Problem): StrategyCheck {
    const t = problem.type;
    if (t === 'persuasive') {
      return {
        applicable: true,
        reason: 'This is a persuasive prompt -- argument structure is essential.',
        passedChecks: [
          'Prompt asks for an opinion, argument, or debate',
          'Thesis-evidence-counter maps directly onto persuasive writing',
        ],
      };
    }
    if (t === 'planning') {
      return {
        applicable: true,
        reason: 'The argument framework provides a ready-made essay plan.',
        passedChecks: ['Planning prompt -- the argument skeleton is itself a plan'],
      };
    }
    if (t === 'editing') {
      return {
        applicable: true,
        reason: 'When editing, check that the argument has all four parts: thesis, evidence, counter, conclusion.',
        passedChecks: ['Editing benefits from verifying argument completeness'],
      };
    }
    return {
      applicable: false,
      reason: 'Narrative and descriptive prompts need story structure, not argument structure.',
      failedChecks: ['Prompt is narrative or descriptive, not argumentative'],
    };
  },

  cost(problem: Problem): number {
    return problem.type === 'persuasive' ? 2 : 3;
  },

  solve(problem: Problem): Lesson {
    const label = promptLabel(problem.rawInput);

    return buildLesson({
      id: `writing.strategy.argument-structure.${Date.now()}`,
      topic: problem.topic ?? 'persuasive',
      title: `Argument plan: ${label}`,
      difficulty: 3,
      objectives: ['thesis statements', 'evidence', 'counterargument', 'persuasive structure'],
      steps: [
        step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
        step('s2', 'explain',
          [writeOp('Strategy: Argument Structure', 'title'),
           writeOp('Strong persuasive writing follows a clear four-part skeleton.', 'explain')],
          'Build your argument in four parts.',
          300),
        step('s3', 'explain',
          [writeOp('1. THESIS -- State your position', 'explain'),
           writeOp('   Write one clear sentence: "I believe that ... because ..."'),
           writeOp('   A strong thesis is specific and debatable -- not just a fact.')],
          undefined, 400),
        step('s4', 'explain',
          [writeOp('2. EVIDENCE -- Support your claim', 'explain'),
           writeOp('   List 2-3 reasons, each backed by a fact, example, or statistic.'),
           writeOp('   Use PEEL paragraphs: Point, Evidence, Explain, Link back to thesis.')],
          undefined, 400),
        step('s5', 'explain',
          [writeOp('3. COUNTERARGUMENT -- Address the other side', 'explain'),
           writeOp('   "Some people argue that ..." then explain why that view is limited.'),
           writeOp('   This shows you\'ve considered both sides and strengthens your position.')],
          undefined, 400),
        step('s6', 'explain',
          [writeOp('4. CONCLUSION -- Clinch your argument', 'explain'),
           writeOp('   Restate your thesis in new words, summarise key evidence.'),
           writeOp('   End with a call to action or a thought-provoking final sentence.')],
          undefined, 400),
        step('s7', 'checkpoint',
          [writeOp('Draft your thesis statement now. Then list your two strongest pieces of evidence.', 'answer')],
          'Start with the thesis.'),
      ],
    });
  },
};
