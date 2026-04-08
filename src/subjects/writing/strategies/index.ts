import type { Strategy, Problem, StrategyMatch, ComparisonResult, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

import { storyArc } from './story-arc.js';
import { sensoryDetail } from './sensory-detail.js';
import { argumentStructure } from './argument-structure.js';
import { writeOp, step, buildLesson } from './helpers.js';

export const ALL_STRATEGIES: Strategy[] = [
  storyArc,
  sensoryDetail,
  argumentStructure,
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
    id: `writing.explain-choice.${Date.now()}`,
    topic: problem.topic ?? 'structure',
    title: `Ways to approach: ${problem.rawInput}`,
    difficulty: 2,
    objectives: ['writing strategy', 'method comparison'],
    steps: [
      step('s1', 'work', [writeOp(problem.rawInput)], undefined, 400),
      step('s2', 'explain',
        [writeOp(`${applicable.length} writing strategies can help with this prompt.`, 'explain'),
         writeOp('Each strategy gives you a different planning lens.', 'explain')],
        undefined, 300),
      ...(applicable.length === 0
        ? [step('s3', 'explain',
            [writeOp('No strategies matched -- try rephrasing the prompt or planning freely.', 'explain')])]
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
        [writeOp('Pick one strategy and use it to plan before you write.', 'answer')]),
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
    id: `writing.comparison.${Date.now()}`,
    topic: problem.topic ?? 'structure',
    title: `Comparison: ${strategies.map(s => s.metadata.name).join(' vs ')}`,
    difficulty: 2,
    objectives: ['strategy comparison', 'writing approach'],
    steps: [
      step('s1', 'explain',
        [writeOp(`Comparing ${strategies.length} strategies on the same prompt:`, 'explain')],
        undefined, 300),
      ...strategies.map((s, i) => step(
        `s${i + 2}`,
        'explain',
        [
          writeOp(`${s.metadata.name}`, 'explain'),
          writeOp(`    ${s.metadata.shortDescription}`),
          writeOp(`    Builds: ${s.metadata.tradeoffs.builds.join(', ')}`),
        ],
        undefined,
        300,
      )),
      step('sFinal', 'checkpoint',
        [writeOp(buildTakeaway(strategies), 'answer')],
        'Choose the strategy that fits the prompt.'),
    ],
  });

  return { problem, strategyIds, lessons, summary };
}

function buildTakeaway(strategies: Strategy[]): string {
  const ids = strategies.map(s => s.metadata.id);
  if (ids.includes('story-arc') && ids.includes('argument-structure')) {
    return 'Story arc works for narratives; argument structure works for persuasive pieces. Match strategy to genre.';
  }
  if (ids.includes('sensory-detail') && ids.includes('story-arc')) {
    return 'Use the story arc for structure, then layer in sensory detail at the key scenes.';
  }
  if (ids.includes('sensory-detail') && ids.includes('argument-structure')) {
    return 'Sensory detail can power emotional appeals within an argument structure.';
  }
  return 'Different strategies highlight different strengths -- try combining them.';
}
