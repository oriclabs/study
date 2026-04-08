import type { SubjectModule } from '@core/types/subject.js';
import type { Problem } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { writingTopics } from './topics.js';
import { analyzeMistake } from './mistakes.js';
import { identify } from './classifier.js';
import { getStrategiesFor, findStrategy, explainChoice, compareStrategies, ALL_STRATEGIES } from './strategies/index.js';

export const writing: SubjectModule = {
  id: 'writing',
  displayName: 'Writing',
  topics: writingTopics,
  analyzeMistake,

  // Strategic capabilities: plan writing using different strategies
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
