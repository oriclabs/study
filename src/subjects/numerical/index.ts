import type { SubjectModule } from '@core/types/subject.js';
import type { Problem } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { numericalTopics } from './topics.js';
import { analyzeMistake } from './mistakes.js';
import { identify } from './classifier.js';
import { getStrategiesFor, findStrategy, explainChoice, compareStrategies, ALL_STRATEGIES } from './strategies/index.js';

export const numerical: SubjectModule = {
  id: 'numerical',
  displayName: 'Numerical Reasoning',
  topics: numericalTopics,
  analyzeMistake,

  // Strategic capabilities: multiple approaches to numerical reasoning problems
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
