import type { TTSAdapter } from '@platform/types.js';

/** Thin wrapper that narrates a step's text via the platform TTS adapter. */
export class TTS {
  constructor(private adapter: TTSAdapter) {}
  speak(text: string, rate = 1): Promise<void> {
    if (!this.adapter.isSupported()) return Promise.resolve();
    return this.adapter.speak(text, { rate });
  }
  cancel(): void { this.adapter.cancel(); }
  isSupported(): boolean { return this.adapter.isSupported(); }
}
