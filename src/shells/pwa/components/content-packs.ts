/**
 * Content pack manager — import/export/delete study content packs.
 * One pack = one curriculum (unique packId).
 *
 * Pack format (single JSON file):
 * {
 *   "packId": "vic-selective",
 *   "packVersion": "1",
 *   "exam": "VIC Selective Entry Exam",
 *   "subjects": [
 *     {
 *       "id": "math",
 *       "label": "Mathematics",
 *       "notes": { ... snotes JSON ... },
 *       "practice": [ ... questions ... ],
 *       "mockExams": [ ... exam configs ... ]
 *     }
 *   ]
 * }
 *
 * Storage layout in IndexedDB:
 *   pack.meta.<packId>                     — PackMeta (lightweight index)
 *   pack.notes.<packId>.<subjectId>        — raw notes JSON
 *   pack.practice.<packId>.<subjectId>     — practice questions array
 *   pack.exams.<packId>.<subjectId>        — mock exam configs array
 *
 * Reimporting the same packId overwrites all data for that pack.
 */

import type { StorageAdapter } from '@platform/types.js';

/* ============ Pack types ============ */

export interface TestStyle {
  id: string;
  label: string;
  optionCount: number;
  secsPerQuestion: number;
}

export interface PracticeQuestion {
  id: string;
  topic?: string;
  question: string;
  /** Passage/context that precedes the question (for reading comprehension) */
  passage?: string;
  options?: string[];
  answer: string;
  explanation?: string;
  solutionSteps?: string[];
  difficulty?: number;
  /** Test style tag — matches TestStyle.id, or "both" for style-agnostic */
  style?: string;
  /** Source attribution (e.g., "ACER Sample 2023") */
  source?: string;
  /** Canonical topic ID for progress tracking (e.g., "algebra.linear-equations") */
  topic_id?: string;
}

export interface MockExamConfig {
  id: string;
  title: string;
  timeMinutes: number;
  questionCount: number;
  /** Test style this exam targets */
  style?: string;
  /** Topic IDs to draw from, or empty = all topics */
  topics?: string[];
  /** Direct question IDs, or empty = random from topics */
  questionIds?: string[];
}

export interface PackSubject {
  id: string;
  label: string;
  notes?: Record<string, unknown>;
  practice?: PracticeQuestion[];
  mockExams?: MockExamConfig[];
}

export interface ContentPack {
  packId: string;
  packVersion?: string;
  exam: string;
  description?: string;
  changelog?: string;
  /** Test styles available for this curriculum (e.g., ACER, Edutest). If absent, no style filter shown. */
  testStyles?: TestStyle[];
  subjects: PackSubject[];
}

/* ============ Stored metadata ============ */

export interface PackSubjectMeta {
  id: string;
  label: string;
  hasNotes: boolean;
  practiceCount: number;
  mockExamCount: number;
}

export interface VersionLogEntry {
  version: string;
  importedAt: number;
  changes?: string;
}

export interface PackMeta {
  packId: string;
  packVersion: string;
  exam: string;
  description: string;
  subjects: PackSubjectMeta[];
  testStyles?: TestStyle[];
  importedAt: number;
  /** Version history — newest first */
  versionLog: VersionLogEntry[];
}

/* ============ Manager ============ */

/** Default packs to preload on first launch or when pack version changes. */
const DEFAULT_PACKS = [
  '/packs/vic-selective-exam.json',
  '/packs/vic-curriculum.json',
];

export class ContentPackManager {
  constructor(private storage: StorageAdapter) {}

  /** Preload default packs if not already imported or if version is newer. */
  async preloadDefaults(): Promise<void> {
    for (const url of DEFAULT_PACKS) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const packId = data.packId;
        const newVersion = data.packVersion;

        // Check if already imported with same or newer version
        const existing = await this.storage.get<PackMeta>(`pack.meta.${packId}`);
        if (existing && existing.packVersion >= newVersion) continue;

        await this.importPack(data);
        console.log(`Preloaded pack: ${packId} v${newVersion}`);
      } catch (e) {
        console.warn(`Failed to preload ${url}:`, e);
      }
    }
  }

  /** Import a content pack. Overwrites if same packId exists, preserves version log. */
  async importPack(raw: unknown): Promise<PackMeta> {
    const pack = this.validate(raw);
    const newVersion = pack.packVersion ?? '1';

    // Load existing meta to preserve version log
    const existing = await this.storage.get<PackMeta>(`pack.meta.${pack.packId}`);
    const versionLog: VersionLogEntry[] = existing?.versionLog ?? [];

    // Add new entry to version log
    versionLog.unshift({
      version: newVersion,
      importedAt: Date.now(),
      changes: pack.changelog,
    });

    // Build metadata
    const subjectsMeta: PackSubjectMeta[] = pack.subjects.map(s => ({
      id: s.id,
      label: s.label,
      hasNotes: !!s.notes,
      practiceCount: s.practice?.length ?? 0,
      mockExamCount: s.mockExams?.length ?? 0,
    }));

    const meta: PackMeta = {
      packId: pack.packId,
      packVersion: newVersion,
      exam: pack.exam,
      description: pack.description ?? '',
      subjects: subjectsMeta,
      testStyles: pack.testStyles,
      importedAt: Date.now(),
      versionLog,
    };

    // Delete old data if reimporting
    if (existing) await this.deletePackData(pack.packId, existing);

    // Store metadata
    await this.storage.set(`pack.meta.${pack.packId}`, meta);

    // Store each subject's content
    for (const subj of pack.subjects) {
      if (subj.notes) {
        await this.storage.set(`pack.notes.${pack.packId}.${subj.id}`, subj.notes);
      }
      if (subj.practice && subj.practice.length > 0) {
        await this.storage.set(`pack.practice.${pack.packId}.${subj.id}`, subj.practice);
      }
      if (subj.mockExams && subj.mockExams.length > 0) {
        await this.storage.set(`pack.exams.${pack.packId}.${subj.id}`, subj.mockExams);
      }
    }

    return meta;
  }

  /** List all imported packs */
  async listPacks(): Promise<PackMeta[]> {
    const keys = await this.storage.list('pack.meta.');
    const metas: PackMeta[] = [];
    for (const key of keys) {
      const meta = await this.storage.get<PackMeta>(key);
      if (meta) metas.push(meta);
    }
    return metas.sort((a, b) => b.importedAt - a.importedAt);
  }

  /** Get a pack's metadata */
  async getPack(packId: string): Promise<PackMeta | null> {
    return this.storage.get<PackMeta>(`pack.meta.${packId}`);
  }

  /** Load notes for a specific subject in a pack */
  async loadNotes(packId: string, subjectId: string): Promise<Record<string, unknown> | null> {
    return this.storage.get<Record<string, unknown>>(`pack.notes.${packId}.${subjectId}`);
  }

  /** Load the full pack data (all subjects) for cross-subject views like master cheat sheet */
  async loadPack(packId: string): Promise<Record<string, unknown>> {
    const meta = await this.storage.get<Record<string, unknown>>(`pack.${packId}`);
    if (!meta) throw new Error(`Pack "${packId}" not found`);
    // Reconstruct full pack with notes per subject
    const subjectIds = (meta['subjectIds'] as string[]) || [];
    const subjects: Record<string, unknown>[] = [];
    for (const sid of subjectIds) {
      const notes = await this.loadNotes(packId, sid);
      subjects.push({ id: sid, notes: notes || {} });
    }
    return { ...meta, subjects };
  }

  /** Load practice questions for a subject */
  async loadPractice(packId: string, subjectId: string): Promise<PracticeQuestion[]> {
    return await this.storage.get<PracticeQuestion[]>(`pack.practice.${packId}.${subjectId}`) ?? [];
  }

  /** Load practice questions filtered by topic and/or style */
  async loadPracticeFiltered(packId: string, subjectId: string, opts?: { topic?: string; style?: string }): Promise<PracticeQuestion[]> {
    const all = await this.loadPractice(packId, subjectId);
    return all.filter(q =>
      (!opts?.topic || q.topic === opts.topic) &&
      (!opts?.style || q.style === opts.style || q.style === 'both' || !q.style)
    );
  }

  /** Load mock exam configs for a subject */
  async loadMockExams(packId: string, subjectId: string): Promise<MockExamConfig[]> {
    return await this.storage.get<MockExamConfig[]>(`pack.exams.${packId}.${subjectId}`) ?? [];
  }

  /** Delete a pack and all its data */
  async deletePack(packId: string): Promise<boolean> {
    const meta = await this.storage.get<PackMeta>(`pack.meta.${packId}`);
    if (!meta) return false;
    await this.deletePackData(packId, meta);
    await this.storage.delete(`pack.meta.${packId}`);
    return true;
  }

  /** Export a pack as a downloadable JSON object */
  async exportPack(packId: string): Promise<ContentPack | null> {
    const meta = await this.storage.get<PackMeta>(`pack.meta.${packId}`);
    if (!meta) return null;

    const subjects: PackSubject[] = [];
    for (const sm of meta.subjects) {
      const subj: PackSubject = { id: sm.id, label: sm.label };
      const notes = await this.storage.get<Record<string, unknown>>(`pack.notes.${packId}.${sm.id}`);
      if (notes) subj.notes = notes;
      const practice = await this.storage.get<PracticeQuestion[]>(`pack.practice.${packId}.${sm.id}`);
      if (practice && practice.length > 0) subj.practice = practice;
      const exams = await this.storage.get<MockExamConfig[]>(`pack.exams.${packId}.${sm.id}`);
      if (exams && exams.length > 0) subj.mockExams = exams;
      subjects.push(subj);
    }

    return {
      packId: meta.packId,
      packVersion: meta.packVersion,
      exam: meta.exam,
      description: meta.description,
      subjects,
    };
  }

  private async deletePackData(packId: string, meta: PackMeta): Promise<void> {
    for (const sm of meta.subjects) {
      await this.storage.delete(`pack.notes.${packId}.${sm.id}`);
      await this.storage.delete(`pack.practice.${packId}.${sm.id}`);
      await this.storage.delete(`pack.exams.${packId}.${sm.id}`);
    }
  }

  private validate(raw: unknown): ContentPack {
    if (typeof raw !== 'object' || raw === null) throw new Error('Not a JSON object.');
    const p = raw as Record<string, unknown>;
    if (typeof p['packId'] !== 'string' || !p['packId']) throw new Error('Missing "packId".');
    if (typeof p['exam'] !== 'string' || !p['exam']) throw new Error('Missing "exam" name.');
    if (!Array.isArray(p['subjects']) || p['subjects'].length === 0) throw new Error('Missing or empty "subjects".');

    for (let i = 0; i < (p['subjects'] as unknown[]).length; i++) {
      const s = (p['subjects'] as unknown[])[i] as Record<string, unknown>;
      if (typeof s['id'] !== 'string') throw new Error(`Subject ${i}: missing "id".`);
      if (typeof s['label'] !== 'string') throw new Error(`Subject ${i}: missing "label".`);
      // At least one content type must be present
      const hasNotes = typeof s['notes'] === 'object' && s['notes'] !== null;
      const hasPractice = Array.isArray(s['practice']) && (s['practice'] as unknown[]).length > 0;
      const hasExams = Array.isArray(s['mockExams']) && (s['mockExams'] as unknown[]).length > 0;
      if (!hasNotes && !hasPractice && !hasExams) {
        throw new Error(`Subject ${i} ("${s['id']}"): must have at least one of "notes", "practice", or "mockExams".`);
      }
    }

    return p as unknown as ContentPack;
  }
}
