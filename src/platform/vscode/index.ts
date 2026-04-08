/**
 * VS Code platform adapters — SCAFFOLD ONLY.
 *
 * This file is a placeholder that satisfies the Platform contract at
 * compile time but throws at runtime. Replace each `notImplemented()`
 * with a real implementation when building the VS Code target.
 *
 * Distribution model:
 *   VS Code webview + extension host split. The webview runs the
 *   core app (engines + subjects + this adapter bridge). The extension
 *   host (Node side) owns the real I/O: fs access for content, globalState
 *   for storage, vscode.env for host APIs. All adapter calls cross a
 *   postMessage bridge between the webview and extension host.
 *
 * Build checklist (see src/shells/vscode/README.md for details):
 *   [ ] storage.ts — bridge to context.globalState / workspaceState
 *   [ ] content.ts — bridge to extension host fs reading content/ from extensionUri
 *   [ ] host.ts    — bridge to vscode.env (openExternal, showInformationMessage, language)
 *   [ ] export.ts  — bridge to vscode.window.showSaveDialog + fs.writeFile
 *   [ ] tts.ts     — likely a no-op or subtitle-only; webviews have limited speech
 *   [ ] bridge/    — message protocol between webview and extension host
 */

import type { Platform } from '@platform/types.js';

function notImplemented(name: string): never {
  throw new Error(`[vscode] ${name} adapter not yet implemented. See src/platform/vscode/index.ts`);
}

export function createVscodePlatform(): Platform {
  return {
    storage: {
      async get<T>(_key: string): Promise<T | null> { return notImplemented('storage.get'); },
      async set<T>(_key: string, _value: T): Promise<void> { return notImplemented('storage.set'); },
      async delete(_key: string): Promise<void> { return notImplemented('storage.delete'); },
      async list(_prefix: string): Promise<string[]> { return notImplemented('storage.list'); },
    },
    content: {
      async listLessons() { return notImplemented('content.listLessons'); },
      async loadLesson(_id) { return notImplemented('content.loadLesson'); },
      async loadTopicGraph(_s) { return notImplemented('content.loadTopicGraph'); },
      async listCurricula() { return notImplemented('content.listCurricula'); },
      async loadCurriculum(_id) { return notImplemented('content.loadCurriculum'); },
      async loadNotes(_c, _s) { return notImplemented('content.loadNotes'); },
    },
    host: {
      async openExternal(_url) { return notImplemented('host.openExternal'); },
      async showNotification(_t, _b) { return notImplemented('host.showNotification'); },
      getDisplayMode() { return 'webview' as const; },
      getLocale() { return 'en'; },
    },
    export: {
      async savePNG(_d, _f) { return notImplemented('export.savePNG'); },
      async savePDF(_d, _f) { return notImplemented('export.savePDF'); },
      async saveJSON(_d, _f) { return notImplemented('export.saveJSON'); },
    },
    tts: {
      isSupported: () => false,
      async speak(_t) { /* no-op: VS Code webviews have inconsistent TTS */ },
      cancel() { /* no-op */ },
      async listVoices() { return []; },
    },
  };
}
