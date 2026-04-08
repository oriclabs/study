/**
 * Settings panel — theme switcher, font size, pen style, app appearance.
 * Persists to localStorage.
 */

import type { ThemeName } from '@engines/renderer/theme.js';
import type { PenStyle } from './pen-cursor.js';

export interface AppSettings {
  /** Canvas solver theme */
  solverTheme: ThemeName;
  /** Pen cursor style */
  penStyle: PenStyle;
  /** Show pen cursor on solver */
  showPenCursor: boolean;
  /** App UI theme (affects notes, not canvas) */
  appTheme: 'dark' | 'light';
  /** Notes font size multiplier */
  fontSize: number;
}

const DEFAULTS: AppSettings = {
  solverTheme: 'chalkboard',
  penStyle: 'chalk',
  showPenCursor: true,
  appTheme: 'dark',
  fontSize: 1,
};

const STORAGE_KEY = 'study-app-settings';

export class SettingsPanel {
  private settings: AppSettings;
  private container: HTMLElement;
  private visible = false;
  private onChange: (settings: AppSettings) => void;

  constructor(onChange: (settings: AppSettings) => void) {
    this.onChange = onChange;
    this.settings = this.load();
    this.container = document.createElement('div');
    this.container.className = 'settings-panel';
    this.container.style.display = 'none';
    this.build();
  }

  getElement(): HTMLElement { return this.container; }
  getSettings(): AppSettings { return { ...this.settings }; }

  toggle(): void {
    this.visible = !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULTS };
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    this.onChange(this.settings);
  }

  private build(): void {
    this.container.innerHTML = '';

    const title = document.createElement('h3');
    title.className = 'settings-title';
    title.textContent = 'Settings';
    this.container.appendChild(title);

    // Solver theme (canvas background + pen colors)
    this.addSelect('Canvas Style', 'solverTheme', [
      { value: 'chalkboard', label: 'Chalkboard (green)' },
      { value: 'blackboard', label: 'Blackboard (dark blue)' },
      { value: 'whiteboard', label: 'Whiteboard (cream)' },
      { value: 'notebook', label: 'Notebook (warm white)' },
    ]);

    // Pen cursor style
    this.addSelect('Pen Cursor', 'penStyle', [
      { value: 'pencil', label: 'Pencil' },
      { value: 'chalk', label: 'Chalk' },
      { value: 'marker', label: 'Marker' },
    ]);

    // Show pen cursor toggle
    this.addToggle('Show Pen Cursor', 'showPenCursor');

    // App theme
    this.addSelect('App Theme', 'appTheme', [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ]);

    // Font size
    this.addRange('Notes Font Size', 'fontSize', 0.8, 1.4, 0.05);
  }

  private addSelect(label: string, key: keyof AppSettings, options: { value: string; label: string }[]): void {
    const row = document.createElement('div');
    row.className = 'settings-row';

    const lbl = document.createElement('label');
    lbl.className = 'settings-label';
    lbl.textContent = label;

    const select = document.createElement('select');
    select.className = 'settings-select';
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === String(this.settings[key])) o.selected = true;
      select.appendChild(o);
    }
    select.addEventListener('change', () => {
      (this.settings as unknown as Record<string, unknown>)[key] = select.value;
      this.save();
    });

    row.appendChild(lbl);
    row.appendChild(select);
    this.container.appendChild(row);
  }

  private addToggle(label: string, key: keyof AppSettings): void {
    const row = document.createElement('div');
    row.className = 'settings-row';

    const lbl = document.createElement('label');
    lbl.className = 'settings-label';
    lbl.textContent = label;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'settings-toggle';
    toggle.checked = this.settings[key] as boolean;
    toggle.addEventListener('change', () => {
      (this.settings as unknown as Record<string, unknown>)[key] = toggle.checked;
      this.save();
    });

    row.appendChild(lbl);
    row.appendChild(toggle);
    this.container.appendChild(row);
  }

  private addRange(label: string, key: keyof AppSettings, min: number, max: number, step: number): void {
    const row = document.createElement('div');
    row.className = 'settings-row';

    const lbl = document.createElement('label');
    lbl.className = 'settings-label';
    lbl.textContent = label;

    const valDisplay = document.createElement('span');
    valDisplay.className = 'settings-val';
    valDisplay.textContent = `${Math.round((this.settings[key] as number) * 100)}%`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'settings-range';
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(this.settings[key]);
    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      (this.settings as unknown as Record<string, unknown>)[key] = val;
      valDisplay.textContent = `${Math.round(val * 100)}%`;
      this.save();
    });

    row.appendChild(lbl);
    row.appendChild(slider);
    row.appendChild(valDisplay);
    this.container.appendChild(row);
  }
}
