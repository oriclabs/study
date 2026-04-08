/**
 * Curriculum types — the jurisdiction layer on top of universal content.
 *
 * A Curriculum is a view onto existing topics: it selects which topics
 * apply, groups them into units, and declares regional assessment rules.
 * Curricula never own content. One lesson file serves many curricula.
 *
 * See docs/curriculum.md.
 */

export type CalculatorPolicy = 'none' | 'partial' | 'full';

export interface AssessmentStyle {
  defaultQuestionType: 'solve' | 'mcq' | 'fill' | 'short';
  calculatorPolicy: CalculatorPolicy;
  timeMinutes?: number;
  marksPerQuestion?: number;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  term?: number;       // 1-based term within the year
  topics: string[];    // topic IDs in the subject's topic graph
  optional?: boolean;
}

export interface GradeBoundaries {
  [grade: string]: number; // grade -> minimum % for that grade
}

export interface Curriculum {
  id: string;
  version: string;             // syllabus year, e.g. "2024"
  region: string;              // ISO-like: "AU-VIC", "UK", "US", "SAT"
  subject: string;             // 'math', 'physics', ...
  displayName: string;
  year?: number;               // school year this covers, if year-specific
  exam?: string;               // exam board: "VCAA", "AQA", "CollegeBoard"
  locale: string;              // "en-AU", "en-GB", "en-US"

  units: CurriculumUnit[];

  assessmentStyle: AssessmentStyle;

  /** Escape hatch: override the topic graph's prereqs for this curriculum. Rare. */
  prereqOverrides?: Record<string, string[]>;

  gradeBoundaries?: GradeBoundaries;

  /** Optional inheritance — a custom curriculum can extend a standard one. */
  inheritsFrom?: string;

  description?: string;
}

export interface CurriculumRef {
  id: string;
  version: string;
  region: string;
  subject: string;
  displayName: string;
  year?: number;
  exam?: string;
  locale: string;
}
