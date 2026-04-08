import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { headNoun } from './head-noun.js';
import { collectiveNoun } from './collective-noun.js';
import { earTest } from './ear-test.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  headNoun,
  collectiveNoun,
  earTest,
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
    id: `grammar.explain-choice.${Date.now()}`,
    topic: 'agreement.subject-verb',
    title: `Ways to decide: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['subject-verb agreement', 'strategy awareness'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`${applicable.length} approaches can decide this question.`, 'explain'),
         writeOp('Each has different reliability on tricky sentences.', 'explain')],
        undefined, 300),
      ...applicable.map((m, i) => step(
        `s${i + 3}`,
        'explain',
        [
          writeOp(`${i + 1}. ${m.strategy.name}`, 'explain'),
          writeOp(`    ${m.strategy.shortDescription}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp('Head-noun identification is the most reliable. Ear test is fastest but fails on traps.', 'answer')]),
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
    id: `grammar.comparison.${Date.now()}`,
    topic: 'agreement.subject-verb',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['comparing grammar strategies'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} strategies on the same sentence:`, 'explain')],
        undefined, 300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}`, 'explain'),
          writeOp(`    ${s.metadata.shortDescription}`),
          writeOp(`    Reliability: ${s.metadata.tradeoffs.accuracy}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp('Head-noun beats ear test when the sentence has intervening phrases.', 'answer')]),
    ],
  });

  return { problem, strategyIds, lessons, summary };
}
