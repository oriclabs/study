import type { LessonRef } from '@core/types/lesson.js';
import type { ContentSourceAdapter } from '@platform/types.js';
import type { UserContent } from '@engines/user-content/index.js';

/**
 * Builds an in-memory index of all available lessons across subjects.
 * Used by UI pickers, search, and the revision engine.
 *
 * Merges two sources:
 *   - Built-in content (bundled JSON, served via ContentSourceAdapter)
 *   - User content (runtime-imported, stored in UserContent store)
 *
 * User entries override built-ins by id — this lets the student
 * replace a built-in lesson with a customized version.
 */
export class ContentIndex {
  private byId = new Map<string, LessonRef>();
  private bySubject = new Map<string, LessonRef[]>();
  private byTopic = new Map<string, LessonRef[]>();
  private userIds = new Set<string>();

  constructor(
    private source: ContentSourceAdapter,
    private userContent?: UserContent,
  ) {}

  async build(): Promise<void> {
    const builtin = await this.source.listLessons();
    const user = this.userContent ? await this.userContent.listRefs() : [];

    this.byId.clear();
    this.bySubject.clear();
    this.byTopic.clear();
    this.userIds.clear();

    // Built-in first, then user — user overrides by id.
    const merged = new Map<string, LessonRef>();
    for (const ref of builtin) merged.set(ref.id, ref);
    for (const ref of user) {
      merged.set(ref.id, ref);
      this.userIds.add(ref.id);
    }

    for (const ref of merged.values()) {
      this.byId.set(ref.id, ref);
      let subj = this.bySubject.get(ref.subject);
      if (!subj) { subj = []; this.bySubject.set(ref.subject, subj); }
      subj.push(ref);
      let top = this.byTopic.get(ref.topic);
      if (!top) { top = []; this.byTopic.set(ref.topic, top); }
      top.push(ref);
    }
  }

  get(id: string): LessonRef | undefined { return this.byId.get(id); }
  all(): LessonRef[] { return [...this.byId.values()]; }
  bySubjectKey(subject: string): LessonRef[] { return this.bySubject.get(subject) ?? []; }
  subjects(): string[] { return [...this.bySubject.keys()]; }
  topics(subject: string): string[] {
    const seen = new Set<string>();
    for (const r of this.bySubjectKey(subject)) seen.add(r.topic);
    return [...seen];
  }
  /** Returns true if the lesson with this id came from the user store. */
  isUserLesson(id: string): boolean { return this.userIds.has(id); }
}
