/**
 * Sidebar — collapsible left navigation for notes view.
 * Shows category/topic tree. Highlights active topic.
 * Visible by default on desktop, hidden on mobile. Toggle button to show/hide.
 */

import { navigate, routeToHash } from '../router.js';
import type { Route } from '../router.js';

interface CategoryEntry {
  name: string;
  catIdx: number;
  topics: { title: string; topicIdx: number }[];
}

export class Sidebar {
  private el: HTMLElement;
  private toggle: HTMLButtonElement;
  private list: HTMLElement;
  private visible = true;
  private exam = '';
  private subject = '';
  private categories: CategoryEntry[] = [];
  private activeCatIdx = -1;
  private activeTopicIdx = -1;

  constructor() {
    this.el = document.createElement('aside');
    this.el.className = 'sidebar';

    // Toggle button (lives outside sidebar for always-accessible click target)
    this.toggle = document.createElement('button');
    this.toggle.className = 'sidebar-toggle';
    this.toggle.title = 'Toggle navigation';
    this.toggle.textContent = '\u2630';
    this.toggle.addEventListener('click', () => this.setVisible(!this.visible));

    // Category/topic list
    this.list = document.createElement('nav');
    this.list.className = 'sidebar-list';
    this.el.appendChild(this.list);
  }

  getElement(): HTMLElement { return this.el; }
  getToggle(): HTMLButtonElement { return this.toggle; }

  setVisible(v: boolean): void {
    this.visible = v;
    this.el.classList.toggle('sidebar-hidden', !v);
    this.toggle.textContent = v ? '\u2630' : '\u2630';
    this.toggle.classList.toggle('sidebar-toggle-closed', !v);
    // Dispatch event so the layout can adjust
    this.el.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { visible: v } }));
  }

  isVisible(): boolean { return this.visible; }

  /** Build sidebar from snotes JSON data */
  build(data: Record<string, unknown>, exam: string, subject: string): void {
    this.exam = exam;
    this.subject = subject;
    this.categories = [];
    this.list.innerHTML = '';

    const cats = data['categories'] as Array<Record<string, unknown>> | undefined;
    if (!cats) return;

    // "Overview" link at top
    const overviewItem = document.createElement('a');
    overviewItem.className = 'sidebar-item sidebar-overview';
    overviewItem.href = routeToHash({ view: 'notes', exam, subject });
    overviewItem.textContent = 'Overview';
    overviewItem.addEventListener('click', (e) => {
      e.preventDefault();
      navigate({ view: 'notes', exam, subject });
    });
    this.list.appendChild(overviewItem);

    for (let ci = 0; ci < cats.length; ci++) {
      const cat = cats[ci];
      const catName = (cat['category'] as string) || `Category ${ci + 1}`;
      const topics = (cat['topics'] as Array<Record<string, unknown>>) || [];

      const entry: CategoryEntry = { name: catName, catIdx: ci, topics: [] };

      // Category header
      const catEl = document.createElement('div');
      catEl.className = 'sidebar-category';

      const catHeader = document.createElement('button');
      catHeader.className = 'sidebar-cat-header';
      catHeader.innerHTML = `<span class="sidebar-cat-arrow">\u25B8</span> ${esc(catName)}`;
      catHeader.addEventListener('click', () => {
        catEl.classList.toggle('sidebar-cat-open');
      });
      catEl.appendChild(catHeader);

      // Topic list (collapsible)
      const topicList = document.createElement('div');
      topicList.className = 'sidebar-topics';

      for (let ti = 0; ti < topics.length; ti++) {
        const topic = topics[ti];
        const title = (topic['title'] as string) || `Topic ${ti + 1}`;
        entry.topics.push({ title, topicIdx: ti });

        const topicLink = document.createElement('a');
        topicLink.className = 'sidebar-topic';
        topicLink.href = routeToHash({ view: 'notes-topic', exam, subject, categoryIdx: ci, topicIdx: ti });
        topicLink.textContent = title;
        topicLink.dataset.catIdx = String(ci);
        topicLink.dataset.topicIdx = String(ti);
        topicLink.addEventListener('click', (e) => {
          e.preventDefault();
          navigate({ view: 'notes-topic', exam, subject, categoryIdx: ci, topicIdx: ti });
        });
        topicList.appendChild(topicLink);
      }

      catEl.appendChild(topicList);
      this.list.appendChild(catEl);
      this.categories.push(entry);
    }

    // Extra sections at bottom
    const extras: { key: string; label: string }[] = [
      { key: 'exam_strategy', label: 'Exam Strategy' },
      { key: 'quick_reference', label: 'Quick Reference' },
    ];
    for (const ex of extras) {
      if (data[ex.key]) {
        const item = document.createElement('a');
        item.className = 'sidebar-item sidebar-extra';
        item.href = '#';
        item.textContent = ex.label;
        item.addEventListener('click', (e) => {
          e.preventDefault();
          // Scroll to the section in overview
          navigate({ view: 'notes', exam, subject });
          setTimeout(() => {
            const section = document.querySelector(`.snotes-${ex.key.replace('_', '')},.snotes-${ex.key.replace(/_/g, '')}`);
            section?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
        this.list.appendChild(item);
      }
    }
  }

  /** Highlight the active topic in the sidebar */
  setActive(route: Route): void {
    // Remove all active states
    this.list.querySelectorAll('.sidebar-active').forEach(el => el.classList.remove('sidebar-active'));
    this.list.querySelectorAll('.sidebar-cat-open').forEach(el => el.classList.remove('sidebar-cat-open'));

    if (route.view === 'notes') {
      // Overview is active
      const overview = this.list.querySelector('.sidebar-overview');
      overview?.classList.add('sidebar-active');
      this.activeCatIdx = -1;
      this.activeTopicIdx = -1;
      return;
    }

    if (route.view === 'notes-topic') {
      this.activeCatIdx = route.categoryIdx;
      this.activeTopicIdx = route.topicIdx;

      // Open the parent category
      const categories = this.list.querySelectorAll('.sidebar-category');
      if (categories[route.categoryIdx]) {
        categories[route.categoryIdx].classList.add('sidebar-cat-open');
      }

      // Highlight the topic
      const topics = this.list.querySelectorAll('.sidebar-topic');
      for (const t of topics) {
        const el = t as HTMLElement;
        if (el.dataset.catIdx === String(route.categoryIdx) && el.dataset.topicIdx === String(route.topicIdx)) {
          el.classList.add('sidebar-active');
          // Scroll into view within sidebar
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          break;
        }
      }
    }
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
