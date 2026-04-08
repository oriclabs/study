import type { Curriculum, CurriculumRef, CurriculumUnit } from '@core/types/curriculum.js';
import type { LessonRef } from '@core/types/lesson.js';
import type { ContentSourceAdapter, StorageAdapter } from '@platform/types.js';
import type { ContentIndex } from '@engines/content-index/index.js';

/**
 * Curriculum engine. Loads, resolves, and filters content through a
 * selected curriculum. Subject-agnostic; a curriculum is a view onto
 * existing topic IDs and lesson refs.
 */

const SELECTED_KEY = 'curriculum.selected';

export class CurriculumEngine {
  private cache = new Map<string, Curriculum>();
  private refs: CurriculumRef[] = [];
  private selectedId: string | null = null;
  private loaded = false;

  constructor(
    private source: ContentSourceAdapter,
    private storage: StorageAdapter,
    private index: ContentIndex,
  ) {}

  async init(): Promise<void> {
    if (this.loaded) return;
    this.refs = await this.source.listCurricula();
    const saved = await this.storage.get<string>(SELECTED_KEY);
    if (saved && this.refs.some(r => r.id === saved)) {
      this.selectedId = saved;
    } else if (this.refs.length > 0) {
      // Default to the first curriculum that declares region "global", else first.
      const global = this.refs.find(r => r.region.toLowerCase() === 'global');
      this.selectedId = (global ?? this.refs[0]!).id;
    }
    this.loaded = true;
  }

  list(subject?: string): CurriculumRef[] {
    return subject ? this.refs.filter(r => r.subject === subject) : this.refs;
  }

  async get(id: string): Promise<Curriculum> {
    const cached = this.cache.get(id);
    if (cached) return cached;
    let curriculum = await this.source.loadCurriculum(id);
    if (curriculum.inheritsFrom) {
      const base = await this.get(curriculum.inheritsFrom);
      curriculum = mergeCurricula(base, curriculum);
    }
    this.cache.set(id, curriculum);
    return curriculum;
  }

  async getSelected(): Promise<Curriculum | null> {
    if (!this.selectedId) return null;
    return this.get(this.selectedId);
  }

  getSelectedId(): string | null { return this.selectedId; }

  async select(id: string): Promise<void> {
    if (!this.refs.some(r => r.id === id)) {
      throw new Error(`Unknown curriculum: ${id}`);
    }
    this.selectedId = id;
    await this.storage.set(SELECTED_KEY, id);
  }

  /** Resolve a curriculum unit to concrete lesson refs. */
  lessonsInUnit(unit: CurriculumUnit): LessonRef[] {
    const out: LessonRef[] = [];
    for (const topic of unit.topics) {
      for (const ref of this.index.all()) {
        if (ref.topic === topic) out.push(ref);
      }
    }
    return out;
  }

  /** All lessons covered by a curriculum, ordered by unit + topic. */
  lessonsInCurriculum(curriculum: Curriculum): { unit: CurriculumUnit; lessons: LessonRef[] }[] {
    return curriculum.units.map(unit => ({ unit, lessons: this.lessonsInUnit(unit) }));
  }

  /** Prereqs for a topic, honoring curriculum-specific overrides. */
  prereqsFor(curriculum: Curriculum, topicId: string, topicGraphPrereqs: string[]): string[] {
    return curriculum.prereqOverrides?.[topicId] ?? topicGraphPrereqs;
  }
}

function mergeCurricula(base: Curriculum, override: Curriculum): Curriculum {
  return {
    ...base,
    ...override,
    units: override.units.length > 0 ? override.units : base.units,
    assessmentStyle: { ...base.assessmentStyle, ...override.assessmentStyle },
    prereqOverrides: { ...base.prereqOverrides, ...override.prereqOverrides },
    gradeBoundaries: override.gradeBoundaries ?? base.gradeBoundaries,
  };
}
