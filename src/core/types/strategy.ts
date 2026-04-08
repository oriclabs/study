/**
 * Strategic problem-solving types. See docs/strategies.md.
 *
 * A Problem is a classified structural description of whatever the
 * student typed in. A Strategy is a named technique that can solve
 * problems of certain types, with an explicit checklist of
 * preconditions. A subject's `strategies(problem)` enumerates all
 * strategies whose preconditions pass, letting the student compare
 * approaches rather than memorize one procedure per problem type.
 */

import type { Lesson } from './lesson.js';

/** A classified problem — the output of subject.identify(). */
export interface Problem {
  /** Structural type, e.g. 'quadratic', 'linear-system', 'projectile-motion'. */
  type: string;
  subject: string;
  /** The raw text the student entered. Retained so lessons can echo it. */
  rawInput: string;
  /** Numeric coefficients extracted from the input (common for math). */
  coefficients?: Record<string, number>;
  /** Free-form extracted inputs (e.g. {v0: 20, angle: 30} for physics, or {a:'BIRD',b:'FLOCK',c:'FISH'} for verbal). */
  inputs?: Record<string, unknown>;
  /** What the student is trying to find: "solve for x", "find range", etc. */
  goal: string;
  /** 0..1 — how sure the classifier is. Below 0.6 the UI should ask. */
  confidence: number;
  /** Topic ID this problem falls under — used by 'for-me' ranking to look up mastery. */
  topic?: string;
}

/** Student-facing description of a strategy. Pure data — lives in the knowledge bank JSON. */
export interface StrategyMetadata {
  id: string;
  name: string;
  shortDescription: string;
  /** Problem.type values this strategy can handle. */
  appliesTo: string[];
  tradeoffs: StrategyTradeoffs;
  /** IDs of strategies students often compare this one with. */
  relatedStrategies?: string[];
  /** Shared mistake categories this strategy is prone to. */
  commonMistakes?: string[];
  /** Optional lesson ID demonstrating this strategy in a canonical worked example. */
  workedExampleId?: string;
}

export interface StrategyTradeoffs {
  speed: 'fast' | 'medium' | 'slow';
  generality: 'narrow' | 'moderate' | 'universal';
  accuracy: 'approximate' | 'exact';
  /** Concepts this strategy reinforces. Shown in the picker. */
  builds: string[];
  /** Optional human-readable statement of when the strategy fails. */
  failsWhen?: string;
}

/** Result of running a strategy's applicability checklist on a specific problem. */
export interface StrategyCheck {
  applicable: boolean;
  /** Single-sentence summary shown in the UI. */
  reason: string;
  /** Preconditions that evaluated true. */
  passedChecks?: string[];
  /** Preconditions that evaluated false — shown for "nearly works" transparency. */
  failedChecks?: string[];
}

/** A strategy + its check result + a context-specific cost, ready for display. */
export interface StrategyMatch {
  strategy: StrategyMetadata;
  check: StrategyCheck;
  /** 1 (effortless) .. 5 (tedious) — computed per-problem, not static. */
  cost: number;
  /** 1 (mechanical) .. 5 (conceptually deep) — how much this strategy teaches. */
  learningValue: number;
}

/** Executable strategy — code side. Kept separate from metadata so the metadata can live in JSON. */
export interface Strategy {
  metadata: StrategyMetadata;
  /** Run the applicability checklist on a concrete problem. */
  check(problem: Problem): StrategyCheck;
  /** Produce a Lesson that solves the problem using this strategy. */
  solve(problem: Problem): Lesson;
  /** Context-dependent cost (1..5) — may consider the specific numbers. */
  cost(problem: Problem): number;
  /** How much the strategy teaches (1..5) — typically static per strategy. */
  learningValue: number;
}

/** Result of comparing multiple strategies on the same problem. */
export interface ComparisonResult {
  problem: Problem;
  /** Strategy IDs in the order the student picked them. */
  strategyIds: string[];
  /** One lesson per picked strategy, to be played sequentially. */
  lessons: Lesson[];
  /** Summary lesson played at the end, contrasting the approaches. */
  summary: Lesson;
}

/**
 * Ranking mode for `strategies(problem, mode?)`.
 *   - `fastest` — lowest per-problem cost first
 *   - `most-general` — universal > moderate > narrow
 *   - `builds-understanding` — highest learningValue first
 *   - `for-me` — personalized using the learner's mastery of the problem's topic.
 *                Subjects may treat this as a synonym for `builds-understanding`;
 *                the shell performs a second pass using Progress data.
 */
export type RankingMode = 'fastest' | 'most-general' | 'builds-understanding' | 'for-me';
