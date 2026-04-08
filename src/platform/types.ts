/**
 * Layer 0 — Platform adapter contracts. See docs/targets.md.
 * Every target (PWA, extension, VS Code, desktop) implements these.
 * Engines import only these interfaces, never concrete implementations.
 */

import type { Lesson, LessonRef, TopicGraph, Curriculum, CurriculumRef } from '@core/index.js';

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
  exportAll?(): Promise<Record<string, unknown>>;
  importAll?(data: Record<string, unknown>): Promise<void>;
}

export interface ContentSourceAdapter {
  listLessons(subject?: string): Promise<LessonRef[]>;
  loadLesson(id: string): Promise<Lesson>;
  loadTopicGraph(subject: string): Promise<TopicGraph>;
  listCurricula(subject?: string): Promise<CurriculumRef[]>;
  loadCurriculum(id: string): Promise<Curriculum>;
  loadNotes(curriculumId: string, subjectId: string): Promise<unknown>;
}

export type DisplayMode = 'popup' | 'sidepanel' | 'tab' | 'window' | 'webview';

export interface HostAdapter {
  openExternal(url: string): Promise<void>;
  showNotification(title: string, body: string): Promise<void>;
  getDisplayMode(): DisplayMode;
  getLocale(): string;
}

export interface ExportAdapter {
  savePNG(data: Blob, filename: string): Promise<void>;
  savePDF(data: Blob, filename: string): Promise<void>;
  saveJSON(data: unknown, filename: string): Promise<void>;
  copyToClipboard?(text: string): Promise<void>;
}

export interface Voice {
  id: string;
  name: string;
  lang: string;
}

export interface TTSAdapter {
  speak(text: string, opts?: { rate?: number; voice?: string }): Promise<void>;
  cancel(): void;
  listVoices(): Promise<Voice[]>;
  isSupported(): boolean;
}

export interface Platform {
  storage: StorageAdapter;
  content: ContentSourceAdapter;
  host: HostAdapter;
  export: ExportAdapter;
  tts: TTSAdapter;
}
