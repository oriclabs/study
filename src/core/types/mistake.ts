/**
 * Shared mistake taxonomy. See docs/assessment.md.
 * All subjects produce mistakes using these categories.
 */
export type MistakeCategory =
  | 'sign-error'
  | 'arithmetic-slip'
  | 'wrong-formula'
  | 'misread-question'
  | 'confused-similar-concept'
  | 'incomplete-answer'
  | 'unit-error'
  | 'off-by-one'
  | 'procedural-skip'
  | 'notation-error';

export interface Mistake {
  category: MistakeCategory;
  subjectHint?: string;
  detail?: string;
}
