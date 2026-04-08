/**
 * Bottom navigation bar — persistent, always visible.
 * Quick access to: Home, Search, Daily Practice, Progress, Settings.
 */

import { navigate } from '../router.js';
import type { Route } from '../router.js';

interface NavItem {
  icon: string;
  label: string;
  route: Route;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: '\u{1F3E0}', label: 'Home', route: { view: 'home' }, id: 'home' },
  { icon: '\u{1F50D}', label: 'Search', route: { view: 'search' }, id: 'search' },
  { icon: '\u{1F4DD}', label: 'Daily', route: { view: 'daily' }, id: 'daily' },
  { icon: '\u{1F4CA}', label: 'Progress', route: { view: 'progress' }, id: 'progress' },
  { icon: '\u{1F4E6}', label: 'Packs', route: { view: 'packs' }, id: 'packs' },
];

export class BottomNav {
  private el: HTMLElement;
  private buttons: Map<string, HTMLButtonElement> = new Map();

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'bottom-nav';

    for (const item of NAV_ITEMS) {
      const btn = document.createElement('button');
      btn.className = 'bottom-nav-btn';
      btn.innerHTML = `<span class="bottom-nav-icon">${item.icon}</span><span class="bottom-nav-label">${item.label}</span>`;
      btn.addEventListener('click', () => navigate(item.route));
      this.el.appendChild(btn);
      this.buttons.set(item.id, btn);
    }
  }

  getElement(): HTMLElement { return this.el; }

  setActive(route: Route): void {
    const activeId = route.view === 'subjects' || route.view === 'notes' || route.view === 'notes-topic'
        || route.view === 'revision' || route.view === 'practice' || route.view === 'exam'
      ? 'home' // Curriculum views highlight Home
      : route.view === 'wrong-answers' || route.view === 'bookmarks'
      ? 'progress'
      : route.view;

    for (const [id, btn] of this.buttons) {
      btn.classList.toggle('bottom-nav-active', id === activeId);
    }
  }
}
