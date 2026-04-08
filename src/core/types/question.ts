export type QuestionType =
  | 'solve' | 'mcq' | 'fill' | 'truefalse' | 'order' | 'match' | 'diagram' | 'short';

export type Answer =
  | { kind: 'numeric'; value: number; tolerance?: number }
  | { kind: 'expression'; value: string }
  | { kind: 'choiceIndex'; value: number }
  | { kind: 'strings'; value: string[] }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'order'; value: string[] }
  | { kind: 'pairs'; value: [string, string][] };

export interface MistakeHook {
  pattern: string;
  whenAnswer?: unknown;
  explain: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  answer: Answer;
  choices?: string[];
  hints?: string[];
  solutionLessonId?: string;
  mistakes?: MistakeHook[];
}
