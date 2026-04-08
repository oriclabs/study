import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { vEqualsUPlusAt } from './v-equals-u-plus-at.js';
import { sEqualsUtPlus } from './s-equals-ut-plus.js';
import { vSquaredEquals } from './v-squared-equals.js';
import { sEqualsAvgVelocity } from './s-equals-avg-velocity.js';
import { writeOp, step, buildLesson, getGoal } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  vEqualsUPlusAt,
  sEqualsUtPlus,
  vSquaredEquals,
  sEqualsAvgVelocity,
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
  const goal = getGoal(problem);

  return buildLesson({
    id: `physics.explain-choice.${Date.now()}`,
    topic: 'mechanics.kinematics',
    title: `Which kinematic equation to use: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['formula selection', 'kinematics strategy'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`Goal: find ${goal}. ${applicable.length} kinematic equations can give it.`, 'explain')],
        `${applicable.length} kinematic equations apply.`,
        300),
      step('s3', 'explain',
        [writeOp('The right formula matches the inputs you have with the output you need.', 'explain')],
        undefined, 300),
      ...applicable.map((m, i) => step(
        `s${i + 4}`,
        'explain',
        [
          writeOp(`${i + 1}. ${m.strategy.name}`, 'explain'),
          writeOp(`    ${m.strategy.shortDescription}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp('Pick the one matching the inputs you already have.', 'answer')]),
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
    id: `physics.comparison.${Date.now()}`,
    topic: 'mechanics.kinematics',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['formula comparison', 'strategic thinking'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} formulas on the same inputs:`, 'explain')],
        'Comparing formulas.',
        300),
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
        [writeOp('All formulas give the same answer — choose the one using only the inputs you already have.', 'answer')],
        'Same answer, different inputs required.'),
    ],
  });

  return { problem, strategyIds, lessons, summary };
}
