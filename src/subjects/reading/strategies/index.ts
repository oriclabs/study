import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { scanAndLocate } from './scan-and-locate.js';
import { elimination } from './elimination.js';
import { evidenceFirst } from './evidence-first.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  scanAndLocate,
  elimination,
  evidenceFirst,
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
    id: `reading.explain-choice.${Date.now()}`,
    topic: problem.topic ?? 'evaluation.strategy',
    title: `Ways to approach: ${problem.rawInput.slice(0, 60)}`,
    difficulty: 2,
    objectives: ['reading strategy awareness', 'method comparison'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`${applicable.length} strategies can help with this type of question.`, 'explain'),
         writeOp('Each approach emphasises a different skill — try more than one to build flexibility.', 'explain')],
        undefined, 300),
      ...(applicable.length === 0
        ? [step('s3', 'explain',
            [writeOp('None of our known strategies match this question type — use general close-reading.', 'explain')])]
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
        [writeOp('Pick one strategy and follow its steps. Come back to compare.', 'answer')]),
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
    id: `reading.comparison.${Date.now()}`,
    topic: problem.topic ?? 'evaluation.strategy',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['strategy comparison', 'metacognitive reading'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} strategies on the same question:`, 'explain')],
        undefined, 300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}`, 'explain'),
          writeOp(`    ${s.metadata.shortDescription}`),
          writeOp(`    speed=${s.metadata.tradeoffs.speed}, generality=${s.metadata.tradeoffs.generality}`),
          writeOp(`    builds: ${s.metadata.tradeoffs.builds.join(', ')}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp(buildTakeaway(strategies), 'answer')],
        'Takeaway.'),
    ],
  });

  return { problem, strategyIds, lessons, summary };
}

function buildTakeaway(strategies: Strategy[]): string {
  const ids = strategies.map(s => s.metadata.id);
  if (ids.includes('scan-and-locate') && ids.includes('evidence-first')) {
    return 'Scan-and-locate is faster for fact-finding; evidence-first is safer for analysis questions.';
  }
  if (ids.includes('elimination')) {
    return 'Elimination is a reliable fallback — combine it with another strategy for best results.';
  }
  return 'Different strategies build different skills. Use the one that matches the question type.';
}
