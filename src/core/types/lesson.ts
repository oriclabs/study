import type { Op } from './op.js';
import type { Question } from './question.js';

export type StepKind = 'explain' | 'work' | 'visual' | 'interact' | 'checkpoint';

export interface Step {
  id: string;
  kind: StepKind;
  narration?: string;
  ops: Op[];
  waitAfterMs?: number;
  skippable?: boolean;
  tags?: string[];
}

export interface LessonMeta {
  difficulty: number;
  estimatedSeconds?: number;
  prereqs?: string[];
  objectives?: string[];
  tags?: string[];
  exam?: string[];
  source: 'authored' | 'generated' | 'llm';
  generatorSeed?: number | null;
}

export interface Lesson {
  schemaVersion: 1;
  id: string;
  subject: string;
  topic: string;
  title: string;
  meta: LessonMeta;
  steps: Step[];
  assessment?: { questions: Question[] };
}

export interface LessonRef {
  id: string;
  subject: string;
  topic: string;
  title: string;
  difficulty: number;
  objectives: string[];
  hasAssessment: boolean;
}
