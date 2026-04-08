import type { StorageAdapter } from '@platform/types.js';

/**
 * Accessibility settings (Phase 12).
 * Applies CSS classes to document root and persists user preferences.
 * Engine is pure data + storage — actual styling lives in shell CSS.
 */

export interface A11ySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderHints: boolean;
}

const DEFAULTS: A11ySettings = {
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReaderHints: false,
};

export class A11yEngine {
  private settings: A11ySettings = { ...DEFAULTS };
  private loaded = false;

  constructor(private storage: StorageAdapter) {}

  async load(): Promise<A11ySettings> {
    if (this.loaded) return this.settings;
    const saved = await this.storage.get<A11ySettings>('a11y.settings');
    if (saved) this.settings = { ...DEFAULTS, ...saved };
    this.loaded = true;
    return this.settings;
  }

  get(): A11ySettings { return { ...this.settings }; }

  async update(patch: Partial<A11ySettings>): Promise<A11ySettings> {
    this.settings = { ...this.settings, ...patch };
    await this.storage.set('a11y.settings', this.settings);
    return this.settings;
  }

  /** Reflect settings onto the document root as CSS classes.
   *  Shells call this after load() and after every update(). */
  applyToDocument(root: HTMLElement = document.documentElement): void {
    const s = this.settings;
    root.classList.toggle('a11y-dyslexia', s.dyslexiaFont);
    root.classList.toggle('a11y-high-contrast', s.highContrast);
    root.classList.toggle('a11y-reduced-motion', s.reducedMotion);
    root.classList.toggle('a11y-large-text', s.largeText);
    root.classList.toggle('a11y-sr-hints', s.screenReaderHints);
  }
}
