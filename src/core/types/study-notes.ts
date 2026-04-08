/**
 * Study notes — aggregated per-subject or per-topic reference material
 * for pre-exam revision. Not a lesson (no animation); a static document
 * that collects formulas, strategies, common mistakes, and related
 * lessons for a topic or subject.
 *
 * All data is derived at runtime from already-existing sources:
 *   - Subject topic graph
 *   - Strategy metadata (via SubjectModule.allStrategies)
 *   - Lesson refs (via ContentIndex)
 *   - Shared mistake taxonomy
 *
 * No new content authoring required — notes are assembled on demand.
 */

export type NotesSectionKind =
  | 'topic-outline'
  | 'formulas'
  | 'strategies'
  | 'mistakes'
  | 'lessons'
  | 'prereqs'
  | 'key-concepts';

export interface NotesItem {
  title: string;
  body?: string;
  formula?: string;
  whenToUse?: string;
  tradeoffs?: string[];
  preconditions?: string[];
  mistakeCategory?: string;
  lessonRef?: string;
}

export interface NotesSection {
  kind: NotesSectionKind;
  heading: string;
  items: NotesItem[];
}

export interface StudyNotes {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  sections: NotesSection[];
  generatedAt: number;
}
