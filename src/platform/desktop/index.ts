/**
 * Desktop (Tauri) platform adapters — SCAFFOLD ONLY.
 *
 * This file is a placeholder that satisfies the Platform contract at
 * compile time but throws at runtime. Replace each `notImplemented()`
 * with a real implementation when building the Windows/Mac/Linux target.
 *
 * Distribution model:
 *   Tauri wraps the PWA code in a native window. Rust backend owns the
 *   filesystem, system tray, native dialogs. Frontend calls backend via
 *   `@tauri-apps/api`. If Tauri compatibility is problematic (e.g., WebView2
 *   availability), Electron is the fallback with a thicker shell.
 *
 * Build checklist (see src/shells/desktop/README.md for details):
 *   [ ] storage.ts — SQLite via tauri command OR flat JSON files under %APPDATA%/study/
 *   [ ] content.ts — Tauri resource reader; content ships bundled in src-tauri/resources/
 *   [ ] host.ts    — Tauri shell.open, notification, os.locale
 *   [ ] export.ts  — Tauri dialog.save + fs.writeBinaryFile
 *   [ ] tts.ts     — Web Speech API works in Tauri's WebView2 on Windows
 *   [ ] src-tauri/ — Rust backend, tauri.conf.json, build config
 */

import type { Platform } from '@platform/types.js';

function notImplemented(name: string): never {
  throw new Error(`[desktop] ${name} adapter not yet implemented. See src/platform/desktop/index.ts`);
}

export function createDesktopPlatform(): Platform {
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
      getDisplayMode() { return 'window' as const; },
      getLocale() { return 'en'; },
    },
    export: {
      async savePNG(_d, _f) { return notImplemented('export.savePNG'); },
      async savePDF(_d, _f) { return notImplemented('export.savePDF'); },
      async saveJSON(_d, _f) { return notImplemented('export.saveJSON'); },
    },
    tts: {
      isSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
      async speak(text) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        // Tauri's WebView2 supports Web Speech — reuse the PWA implementation.
        return new Promise<void>(resolve => {
          const utt = new SpeechSynthesisUtterance(text);
          utt.onend = () => resolve();
          utt.onerror = () => resolve();
          speechSynthesis.speak(utt);
        });
      },
      cancel() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.cancel();
      },
      async listVoices() {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
        return speechSynthesis.getVoices().map(v => ({ id: v.voiceURI, name: v.name, lang: v.lang }));
      },
    },
  };
}
