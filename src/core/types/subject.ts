import type { Lesson } from './lesson.js';
import type { Question } from './question.js';
import type { Mistake } from './mistake.js';
import type { TopicGraph } from './topic.js';
import type { Problem, Strategy, StrategyMatch, ComparisonResult, RankingMode } from './strategy.js';

export interface ValidationIssue {
  lessonId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

/**
 * Subject plugin interface.
 *
 * The base capabilities (solve, generate, analyzeMistake, verify) are the
 * minimum shared surface — every subject implements what makes sense.
 *
 * The strategic capabilities (identify, strategies, solveWith, compareStrategies,
 * explainChoice) are an OPTIONAL tier for subjects where problems have
 * structure and multiple solution approaches. Implementing them unlocks
 * the comparative "pick a method" UI. See docs/strategies.md.
 */
export interface SubjectModule {
  id: string;
  displayName: string;
  topics: TopicGraph;

  // Base capabilities
  solve?(input: string): Lesson | null;
  generate?(topicId: string, seed: number): Lesson;
  analyzeMistake?(q: Question, answer: unknown): Mistake | null;
  verify?(lesson: Lesson): ValidationResult;

  // Strategic capabilities (optional)
  /** Classify raw input into a structured Problem. */
  identify?(input: string): Problem | null;
  /** List all strategies applicable to a problem, ranked by the chosen mode. */
  strategies?(problem: Problem, mode?: RankingMode): StrategyMatch[];
  /** Solve a specific problem with a specific strategy. */
  solveWith?(problem: Problem, strategyId: string): Lesson;
  /** A short lesson explaining why multiple methods exist for this problem. */
  explainChoice?(problem: Problem): Lesson;
  /** Compare 2+ strategies on the same problem; returns per-strategy lessons + summary. */
  compareStrategies?(problem: Problem, strategyIds: string[]): ComparisonResult;

  /**
   * Return every strategy this subject knows, regardless of whether a concrete
   * Problem is supplied. Used by StudyNotes to build reference pages.
   */
  allStrategies?(): Strategy[];
}
