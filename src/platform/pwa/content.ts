import type { ContentSourceAdapter } from '@platform/types.js';
import type { Lesson, LessonRef } from '@core/types/lesson.js';
import type { TopicGraph } from '@core/types/topic.js';
import type { Curriculum, CurriculumRef } from '@core/types/curriculum.js';

/**
 * PWA content source: fetches JSON from /content/.
 * Uses a manifest.json at the root of content/ to enumerate lessons + curricula
 * (avoids the need for directory listing over HTTP).
 */

interface ContentManifest {
  lessons: LessonRef[];
  curricula: (CurriculumRef & { path: string })[];
  topics: Record<string, string>;
}

export function createPwaContent(basePath = '/content'): ContentSourceAdapter {
  let manifestCache: ContentManifest | null = null;

  async function getManifest(): Promise<ContentManifest> {
    if (manifestCache) return manifestCache;
    const res = await fetch(`${basePath}/manifest.json`);
    if (!res.ok) throw new Error(`Failed to load content manifest: ${res.status}`);
    manifestCache = await res.json() as ContentManifest;
    return manifestCache;
  }

  return {
    async listLessons(subject?: string): Promise<LessonRef[]> {
      const m = await getManifest();
      return subject ? m.lessons.filter(l => l.subject === subject) : m.lessons;
    },
    async loadLesson(id: string): Promise<Lesson> {
      const path = idToPath(id);
      const res = await fetch(`${basePath}/${path}`);
      if (!res.ok) throw new Error(`Failed to load lesson ${id}: ${res.status}`);
      return res.json() as Promise<Lesson>;
    },
    async loadTopicGraph(subject: string): Promise<TopicGraph> {
      const res = await fetch(`${basePath}/_topics/${subject}.json`);
      if (!res.ok) throw new Error(`Failed to load topic graph for ${subject}`);
      return res.json() as Promise<TopicGraph>;
    },
    async listCurricula(subject?: string): Promise<CurriculumRef[]> {
      const m = await getManifest();
      const all: CurriculumRef[] = (m.curricula ?? []).map(({ path: _p, ...ref }) => ref);
      return subject ? all.filter(r => r.subject === subject) : all;
    },
    async loadCurriculum(id: string): Promise<Curriculum> {
      const m = await getManifest();
      const entry = (m.curricula ?? []).find(c => c.id === id);
      if (!entry) throw new Error(`Unknown curriculum: ${id}`);
      const res = await fetch(`${basePath}/${entry.path}`);
      if (!res.ok) throw new Error(`Failed to load curriculum ${id}: ${res.status}`);
      return res.json() as Promise<Curriculum>;
    },
    async loadNotes(curriculumId: string, subjectId: string): Promise<unknown> {
      const res = await fetch(`${basePath}/notes/${curriculumId}/${subjectId}.json`);
      if (!res.ok) throw new Error(`Failed to load notes ${curriculumId}/${subjectId}: ${res.status}`);
      return res.json();
    },
  };
}

/** Convert a lesson id like `math.algebra.linear-equations.linear-01`
 *  to a path `math/algebra/linear-equations/linear-01.json`. */
function idToPath(id: string): string {
  const parts = id.split('.');
  return `${parts.join('/')}.json`;
}
