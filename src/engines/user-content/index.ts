import type { Lesson, LessonRef } from '@core/types/lesson.js';
import type { StorageAdapter } from '@platform/types.js';

/**
 * User content engine — runtime-managed lessons.
 *
 * Lets the user import lessons at runtime (from clipboard, file upload, or the
 * LLM generation pipeline's staged output) without a rebuild. Lessons are stored
 * in the platform storage adapter (IndexedDB for PWA, chrome.storage for ext).
 *
 * Layout in storage:
 *   user.lessonref.<id>   — lightweight LessonRef for fast listing
 *   user.lesson.<id>      — full Lesson JSON
 *
 * User lessons MERGE with built-in content:
 *   - ContentIndex.build() concatenates builtin + user refs (user overrides by id)
 *   - Loader.loadLesson(id) checks user store first, falls back to built-in
 *   - Pickers automatically show user lessons alongside built-in ones
 */

export type UserContentSource = 'import' | 'llm' | 'manual' | 'url';

export interface UserLessonRecord {
  ref: LessonRef;
  addedAt: number;
  source: UserContentSource;
  /** Optional note the user can attach on import (e.g. "SAT practice 2024"). */
  note?: string;
}

export class UserContent {
  constructor(private storage: StorageAdapter) {}

  /**
   * Add a lesson to the user store. Validates schema and rejects malformed input.
   * Returns the LessonRef so the caller can update UI immediately.
   */
  async addLesson(
    raw: unknown,
    opts: { source?: UserContentSource; note?: string; overwrite?: boolean } = {},
  ): Promise<LessonRef> {
    const lesson = this.validate(raw);

    if (!opts.overwrite) {
      const existing = await this.storage.get(`user.lessonref.${lesson.id}`);
      if (existing) {
        throw new Error(
          `Lesson with id "${lesson.id}" already exists. Use overwrite=true to replace.`,
        );
      }
    }

    const ref: LessonRef = {
      id: lesson.id,
      subject: lesson.subject,
      topic: lesson.topic,
      title: lesson.title,
      difficulty: lesson.meta.difficulty,
      objectives: lesson.meta.objectives ?? [],
      hasAssessment: !!(lesson.assessment && lesson.assessment.questions.length > 0),
    };

    const record: UserLessonRecord = {
      ref,
      addedAt: Date.now(),
      source: opts.source ?? 'import',
      ...(opts.note ? { note: opts.note } : {}),
    };

    await this.storage.set(`user.lesson.${lesson.id}`, lesson);
    await this.storage.set(`user.lessonref.${lesson.id}`, record);
    return ref;
  }

  /** Bulk-add multiple lessons. Returns { added, errors } for reporting. */
  async addMany(
    lessons: unknown[],
    opts: { source?: UserContentSource; overwrite?: boolean } = {},
  ): Promise<{ added: LessonRef[]; errors: { index: number; message: string }[] }> {
    const added: LessonRef[] = [];
    const errors: { index: number; message: string }[] = [];
    for (let i = 0; i < lessons.length; i++) {
      try {
        const ref = await this.addLesson(lessons[i], opts);
        added.push(ref);
      } catch (e) {
        errors.push({ index: i, message: (e as Error).message });
      }
    }
    return { added, errors };
  }

  async removeLesson(id: string): Promise<boolean> {
    const existed = await this.storage.get(`user.lessonref.${id}`);
    if (!existed) return false;
    await this.storage.delete(`user.lesson.${id}`);
    await this.storage.delete(`user.lessonref.${id}`);
    return true;
  }

  async clearAll(): Promise<number> {
    const keys = await this.storage.list('user.lessonref.');
    let removed = 0;
    for (const key of keys) {
      const id = key.replace('user.lessonref.', '');
      if (await this.removeLesson(id)) removed++;
    }
    return removed;
  }

  async listRecords(): Promise<UserLessonRecord[]> {
    const keys = await this.storage.list('user.lessonref.');
    const records: UserLessonRecord[] = [];
    for (const key of keys) {
      const rec = await this.storage.get<UserLessonRecord>(key);
      if (rec) records.push(rec);
    }
    return records.sort((a, b) => b.addedAt - a.addedAt);
  }

  async listRefs(): Promise<LessonRef[]> {
    const records = await this.listRecords();
    return records.map(r => r.ref);
  }

  async getLesson(id: string): Promise<Lesson | null> {
    return this.storage.get<Lesson>(`user.lesson.${id}`);
  }

  async hasLesson(id: string): Promise<boolean> {
    return (await this.storage.get(`user.lessonref.${id}`)) !== null;
  }

  /**
   * Export all user content as a JSON array suitable for re-import.
   * Also useful for backup and sharing.
   */
  async exportAll(): Promise<Lesson[]> {
    const records = await this.listRecords();
    const lessons: Lesson[] = [];
    for (const rec of records) {
      const lesson = await this.getLesson(rec.ref.id);
      if (lesson) lessons.push(lesson);
    }
    return lessons;
  }

  /**
   * Sanity-check validation of imported lesson JSON.
   * Full JSON Schema validation happens only at build time; this is the
   * runtime guard that prevents obviously-malformed data from poisoning storage.
   */
  private validate(raw: unknown): Lesson {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('Input is not a JSON object.');
    }
    const l = raw as Partial<Lesson>;
    if (l.schemaVersion !== 1) throw new Error(`schemaVersion must be 1 (got ${l.schemaVersion}).`);
    if (typeof l.id !== 'string' || !l.id) throw new Error('Missing or invalid "id".');
    if (!/^[_a-z0-9][_a-z0-9.-]*$/.test(l.id)) {
      throw new Error(`Invalid id format: "${l.id}". Must match ^[_a-z0-9][_a-z0-9.-]*$`);
    }
    if (typeof l.subject !== 'string' || !l.subject) throw new Error('Missing or invalid "subject".');
    if (typeof l.topic !== 'string' || !l.topic) throw new Error('Missing or invalid "topic".');
    if (typeof l.title !== 'string' || !l.title) throw new Error('Missing or invalid "title".');
    if (!l.meta || typeof l.meta !== 'object') throw new Error('Missing "meta".');
    if (typeof l.meta.difficulty !== 'number') throw new Error('Missing "meta.difficulty".');
    if (typeof l.meta.source !== 'string') throw new Error('Missing "meta.source".');
    if (!Array.isArray(l.steps) || l.steps.length === 0) throw new Error('Missing or empty "steps".');
    for (let i = 0; i < l.steps.length; i++) {
      const step = l.steps[i];
      if (!step || typeof step !== 'object') throw new Error(`Step ${i} is not an object.`);
      if (typeof step.id !== 'string') throw new Error(`Step ${i} missing "id".`);
      if (typeof step.kind !== 'string') throw new Error(`Step ${i} missing "kind".`);
      if (!Array.isArray(step.ops)) throw new Error(`Step ${i} missing "ops" array.`);
    }
    return l as Lesson;
  }
}
