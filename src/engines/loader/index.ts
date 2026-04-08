import type { Lesson, LessonRef } from '@core/types/lesson.js';
import type { ContentSourceAdapter } from '@platform/types.js';
import type { UserContent } from '@engines/user-content/index.js';

/**
 * Loader engine. Reads lesson JSON via the content source adapter and
 * validates minimally. Full JSON Schema validation runs at build time
 * in tools/validate-content; runtime validation is a shape sanity check.
 *
 * If a UserContent store is configured, user-imported lessons take
 * precedence over built-ins with the same id.
 */
export class Loader {
  constructor(
    private source: ContentSourceAdapter,
    private userContent?: UserContent,
  ) {}

  async listLessons(subject?: string): Promise<LessonRef[]> {
    return this.source.listLessons(subject);
  }

  async loadLesson(id: string): Promise<Lesson> {
    // Check user store first
    if (this.userContent) {
      const userLesson = await this.userContent.getLesson(id);
      if (userLesson) {
        this.sanityCheck(userLesson);
        return userLesson;
      }
    }
    const lesson = await this.source.loadLesson(id);
    this.sanityCheck(lesson);
    return lesson;
  }

  private sanityCheck(lesson: Lesson): void {
    if (lesson.schemaVersion !== 1) {
      throw new Error(`Unsupported schemaVersion: ${lesson.schemaVersion}`);
    }
    if (!lesson.id || !lesson.subject || !lesson.topic) {
      throw new Error(`Lesson missing required fields`);
    }
    if (!Array.isArray(lesson.steps) || lesson.steps.length === 0) {
      throw new Error(`Lesson ${lesson.id} has no steps`);
    }
    for (const step of lesson.steps) {
      if (!step.id || !Array.isArray(step.ops)) {
        throw new Error(`Lesson ${lesson.id}: malformed step`);
      }
    }
  }
}
