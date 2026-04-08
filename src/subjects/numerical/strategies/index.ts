import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { patternRecognition } from './pattern-recognition.js';
import { formulaMethod } from './formula-method.js';
import { workBackwards } from './work-backwards.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  patternRecognition,
  formulaMethod,
  workBackwards,
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
    id: `numerical.explain-choice.${Date.now()}`,
    topic: problem.topic ?? 'sequences',
    title: `Ways to solve: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['strategy awareness', 'method comparison'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`${applicable.length} strategies can tackle this problem.`, 'explain'),
         writeOp('Each approaches the problem from a different angle.', 'explain')],
        undefined, 300),
      ...(applicable.length === 0
        ? [step('s3', 'explain',
            [writeOp('No known strategies match — try reasoning from first principles.', 'explain')])]
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
        [writeOp('Pick the approach that feels most natural, or try two and compare.', 'answer')]),
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
    id: `numerical.comparison.${Date.now()}`,
    topic: problem.topic ?? 'sequences',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['method comparison', 'strategic thinking'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} approaches on: ${problem.rawInput}`, 'explain')],
        undefined, 300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}`, 'explain'),
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
  if (ids.includes('pattern-recognition') && ids.includes('formula-method')) {
    return 'Pattern recognition is flexible and visual; the formula method is faster once you know which formula applies.';
  }
  if (ids.includes('work-backwards')) {
    return 'Working backwards is a safety net — use it to verify or when the forward path is unclear.';
  }
  return 'Different strategies suit different problem shapes. The best approach depends on what you recognise first.';
}
