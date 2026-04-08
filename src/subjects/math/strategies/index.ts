import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { factoring } from './factoring.js';
import { quadraticFormula } from './quadratic-formula.js';
import { completingSquare } from './completing-square.js';
import { graphing } from './graphing.js';
import { linearInverseOps } from './linear-inverse-ops.js';
import { linearGraphical } from './linear-graphical.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  factoring,
  quadraticFormula,
  completingSquare,
  graphing,
  linearInverseOps,
  linearGraphical,
];

/**
 * Return every strategy applicable to this problem, ranked by mode.
 * Applicable strategies always appear before inapplicable ones regardless of mode.
 *
 * Modes:
 *   - 'fastest'              — lowest per-problem cost first
 *   - 'most-general'         — universal > moderate > narrow
 *   - 'builds-understanding' — highest learningValue first
 */
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
        // Subject-level default: highest learningValue first. The shell re-sorts
        // for `for-me` using Progress data (see rerenderStrategies in main.ts).
        return b.learningValue - a.learningValue;
    }
  });
}

export function findStrategy(id: string): Strategy | undefined {
  return ALL_STRATEGIES.find(s => s.metadata.id === id);
}

/**
 * A short "why multiple methods exist" lesson, played before the student picks.
 * Explains the core idea: same problem, different angles of attack.
 */
export function explainChoice(problem: Problem): Lesson {
  const matches = getStrategiesFor(problem);
  const applicable = matches.filter(m => m.check.applicable);
  const count = applicable.length;

  return buildLesson({
    id: `math.explain-choice.${Date.now()}`,
    topic: 'algebra.quadratics',
    title: `Ways to solve: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['strategy awareness', 'method comparison'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`This equation can be solved in ${count} different ways.`, 'explain')],
        `There are ${count} methods that work for this equation.`,
        300),
      ...applicable.map((m, i) => step(
        `s${i + 3}`,
        'explain',
        [
          writeOp(`${i + 1}. ${m.strategy.name}`, 'explain'),
          writeOp(`    ${m.strategy.shortDescription}`),
        ],
        m.strategy.name,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp('Pick one to master — or pick two to compare.', 'answer')]),
    ],
  });
}

/** Compare multiple strategies on the same problem. Returns per-strategy lessons + a summary. */
export function compareStrategies(problem: Problem, strategyIds: string[]): ComparisonResult {
  const strategies = strategyIds
    .map(id => findStrategy(id))
    .filter((s): s is Strategy => Boolean(s));

  if (strategies.length === 0) {
    throw new Error('No valid strategies to compare');
  }

  const lessons = strategies.map(s => s.solve(problem));
  const summary = buildComparisonSummary(problem, strategies, lessons);

  return { problem, strategyIds, lessons, summary };
}

function buildComparisonSummary(problem: Problem, strategies: Strategy[], lessons: Lesson[]): Lesson {
  const stepCounts = lessons.map(l => l.steps.length);

  return buildLesson({
    id: `math.comparison.${Date.now()}`,
    topic: 'algebra.quadratics',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['method comparison', 'strategic thinking'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} methods on: ${problem.rawInput}`, 'explain')],
        'Comparing methods.',
        300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}: ${stepCounts[i]} steps`, 'explain'),
          writeOp(`    speed=${s.metadata.tradeoffs.speed}, generality=${s.metadata.tradeoffs.generality}`),
          writeOp(`    builds: ${s.metadata.tradeoffs.builds.join(', ')}`),
        ],
        undefined,
        400,
      )),
      step('sFinal', 'checkpoint',
        [writeOp(buildTakeaway(strategies), 'answer')],
        'Takeaway.'),
    ],
  });
}

function buildTakeaway(strategies: Strategy[]): string {
  const ids = strategies.map(s => s.metadata.id);
  if (ids.includes('factoring') && ids.includes('quadratic-formula')) {
    return 'Factoring is faster when roots are rational; the quadratic formula always works.';
  }
  if (ids.includes('completing-square')) {
    return 'Completing the square is slower but reveals the vertex — essential for graphing.';
  }
  if (ids.includes('graphing')) {
    return 'Graphing gives visual intuition; use algebra for exact answers.';
  }
  return 'Different methods illuminate different aspects of the same problem.';
}
