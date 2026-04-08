import type { SubjectModule } from '@core/types/subject.js';
import type { Problem } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';
import { grammarTopics } from './topics.js';
import { analyzeMistake } from './mistakes.js';
import { identify } from './classifier.js';
import { getStrategiesFor, findStrategy, explainChoice, compareStrategies, ALL_STRATEGIES } from './strategies/index.js';

export const grammar: SubjectModule = {
  id: 'grammar',
  displayName: 'English Grammar',
  topics: grammarTopics,
  analyzeMistake,

  // Strategic capabilities: pick an approach for subject-verb agreement
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
