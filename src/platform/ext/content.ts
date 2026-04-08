import type { ContentSourceAdapter } from '@platform/types.js';
import type { Lesson, LessonRef } from '@core/types/lesson.js';
import type { TopicGraph } from '@core/types/topic.js';
import type { Curriculum, CurriculumRef } from '@core/types/curriculum.js';

/**
 * Browser extension content source — reads bundled JSON via chrome.runtime.getURL.
 * All content ships inside the extension package for offline-first operation.
 * No external network, no CSP issues.
 */

declare const chrome: {
  runtime: { getURL(path: string): string };
};

interface ContentManifest {
  lessons: LessonRef[];
  curricula: (CurriculumRef & { path: string })[];
  topics: Record<string, string>;
}

export function createExtContent(contentRoot = 'content'): ContentSourceAdapter {
  let manifestCache: ContentManifest | null = null;

  function url(path: string): string {
    return chrome.runtime.getURL(`${contentRoot}/${path}`);
  }

  async function getManifest(): Promise<ContentManifest> {
    if (manifestCache) return manifestCache;
    const res = await fetch(url('manifest.json'));
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
      const path = id.split('.').join('/') + '.json';
      const res = await fetch(url(path));
      if (!res.ok) throw new Error(`Failed to load lesson ${id}: ${res.status}`);
      return res.json() as Promise<Lesson>;
    },
    async loadTopicGraph(subject: string): Promise<TopicGraph> {
      const res = await fetch(url(`_topics/${subject}.json`));
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
      const res = await fetch(url(entry.path));
      if (!res.ok) throw new Error(`Failed to load curriculum ${id}: ${res.status}`);
      return res.json() as Promise<Curriculum>;
    },
    async loadNotes(curriculumId: string, subjectId: string): Promise<unknown> {
      const res = await fetch(url(`notes/${curriculumId}/${subjectId}.json`));
      if (!res.ok) throw new Error(`Failed to load notes ${curriculumId}/${subjectId}: ${res.status}`);
      return res.json();
    },
  };
}
