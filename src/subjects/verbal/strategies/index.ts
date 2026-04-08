import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { individualCollective } from './individual-collective.js';
import { partWhole } from './part-whole.js';
import { functionRelation } from './function.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  individualCollective,
  partWhole,
  functionRelation,
];

export function getStrategiesFor(problem: Problem, mode: RankingMode = 'fastest'): StrategyMatch[] {
  const candidates = ALL_STRATEGIES
    .filter(s => s.metadata.appliesTo.includes(problem.type))
    .map(s => ({
      strategy: s.metadata,
      check: s.check(problem),
      cost: s.cost(problem),
      learningValue: s.learningValue,
    }));

  return candidates.sort((a, b) => {
    if (a.check.applicable !== b.check.applicable) return a.check.applicable ? -1 : 1;
    switch (mode) {
      case 'fastest':
        return a.cost - b.cost;
      case 'most-general': {
        const order = { universal: 0, moderate: 1, narrow: 2 } as const;
        return order[a.strategy.tradeoffs.generality] - order[b.strategy.tradeoffs.generality];
      }
      case 'builds-understanding':
      case 'for-me':
        return b.learningValue - a.learningValue;
    }
  });
}

export function findStrategy(id: string): Strategy | undefined {
  return ALL_STRATEGIES.find(s => s.metadata.id === id);
}

export function explainChoice(problem: Problem): Lesson {
  const applicable = getStrategiesFor(problem).filter(m => m.check.applicable);

  return buildLesson({
    id: `verbal.explain-choice.${Date.now()}`,
    topic: 'analogies',
    title: `Ways to think about: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['analogy reasoning', 'relationship types'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`${applicable.length} relationship types might fit this analogy.`, 'explain'),
         writeOp('The expert move is to try each one and see which gives a consistent answer.', 'explain')],
        undefined, 300),
      ...(applicable.length === 0
        ? [step('s3', 'explain',
            [writeOp('None of our known relationships match — think about the pair yourself.', 'explain')])]
        : applicable.map((m, i) => step(
            `s${i + 3}`,
            'explain',
            [
              writeOp(`${i + 1}. ${m.strategy.name}`, 'explain'),
              writeOp(`    ${m.strategy.shortDescription}`),
            ],
            undefined,
            300,
          ))),
      step('sFinal', 'checkpoint',
        [writeOp('Pick the relationship that fits both pairs, then apply it.', 'answer')]),
    ],
  });
}

export function compareStrategies(problem: Problem, strategyIds: string[]): ComparisonResult {
  const strategies = strategyIds
    .map(id => findStrategy(id))
    .filter((s): s is Strategy => Boolean(s));

  if (strategies.length === 0) throw new Error('No valid strategies to compare');

  const lessons = strategies.map(s => s.solve(problem));

  const summary = buildLesson({
    id: `verbal.comparison.${Date.now()}`,
    topic: 'analogies',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['relationship comparison', 'analogy strategy'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} relationship types on the same pair:`, 'explain')],
        undefined, 300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}`, 'explain'),
          writeOp(`    ${s.metadata.shortDescription}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp('The correct relationship is the one that holds for both pairs.', 'answer')],
        'The matching relationship is the answer.'),
    ],
  });

  return { problem, strategyIds, lessons, summary };
}
