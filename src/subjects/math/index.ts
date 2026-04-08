import type { SubjectModule } from '@core/types/subject.js';
import type { Problem } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { mathTopics } from './topics.js';
import { solve } from './solver.js';
import { analyzeMistake } from './mistakes.js';
import { identify } from './classifier.js';
import { getStrategiesFor, findStrategy, explainChoice, compareStrategies, ALL_STRATEGIES } from './strategies/index.js';

export const math: SubjectModule = {
  id: 'math',
  displayName: 'Mathematics',
  topics: mathTopics,

  solve,
  analyzeMistake,

  // Strategic capabilities — Phase 9+ enhancement
  identify,
  strategies: getStrategiesFor,
  explainChoice,
  solveWith(problem: Problem, strategyId: string): Lesson {
    const strategy = findStrategy(strategyId);
    if (!strategy) throw new Error(`Unknown strategy: ${strategyId}`);
    return strategy.solve(problem);
  },
  compareStrategies,
  allStrategies: () => ALL_STRATEGIES,
};
