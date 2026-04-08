/**
 * Top navigation bar — persistent, context-aware.
 *
 * Layout:
 *   Row 1: [← Back] [Home / Exam / Subject]                          [⚙]
 *   Row 2: [Notes] [Practice] [Exam] [Solve] [Cheatsheet] [Revision]
 *
 * Row 2 (subject tabs) only appears when inside a curriculum + subject.
 * No duplicate links — breadcrumbs handle hierarchy, tabs handle features.
 */

import type { Route } from '../router.js';
import { navigate } from '../router.js';

/** Subjects that have a solver. */
const SOLVABLE_SUBJECTS = new Set(['math', 'numerical', 'quantitative']);

interface NavTab {
  label: string;
  routeFor: (exam: string, subject: string) => Route;
  /** Route views that highlight this tab. */
  matchViews: string[];
  /** Only show for these subjects. Omit = show for all. */
  subjects?: Set<string>;
}

const SUBJECT_TABS: NavTab[] = [
  { label: 'Notes', routeFor: (e, s) => ({ view: 'notes', exam: e, subject: s }), matchViews: ['notes', 'notes-topic'] },
  { label: 'Practice', routeFor: (e, s) => ({ view: 'practice', exam: e, subject: s }), matchViews: ['practice'] },
  { label: 'Exam', routeFor: (e, s) => ({ view: 'exam', exam: e, subject: s }), matchViews: ['exam'] },
  { label: 'Solve', routeFor: (e, s) => ({ view: 'solve', exam: e, subject: s }), matchViews: ['solve'], subjects: SOLVABLE_SUBJECTS },
  { label: 'Cheatsheet', routeFor: (e, s) => ({ view: 'cheatsheet', exam: e, subject: s }), matchViews: ['cheatsheet'] },
  { label: 'Revision', routeFor: (e, s) => ({ view: 'revision', exam: e, subject: s }), matchViews: ['revision'] },
];

export function renderTopbar(route: Route, container: HTMLElement): void {
  const bar = document.createElement('nav');
  bar.className = 'topbar';

  // ─── Back button ──────────────────────────────────────────────
  const crumbs = buildCrumbs(route);

  if (crumbs.length > 1) {
    const backRoute = crumbs[crumbs.length - 2]!.route;
    const backBtn = document.createElement('button');
    backBtn.className = 'topbar-back';
    backBtn.textContent = '\u2190';
    backBtn.title = `Back to ${crumbs[crumbs.length - 2]!.label}`;
    backBtn.addEventListener('click', () => navigate(backRoute));
    bar.appendChild(backBtn);
  }

  // ─── Breadcrumbs ──────────────────────────────────────────────
  const breadcrumbs = document.createElement('div');
  breadcrumbs.className = 'topbar-crumbs';

  for (let i = 0; i < crumbs.length; i++) {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'topbar-sep';
      sep.textContent = ' / ';
      breadcrumbs.appendChild(sep);
    }
    const crumb = crumbs[i]!;
    // Last crumb is current page — show as plain text, UNLESS
    // it's "Home" but we're not actually on the home view (e.g. on Solve/Dictionary)
    const isCurrentPage = i === crumbs.length - 1 && crumb.route.view === route.view;
    if (!isCurrentPage) {
      const a = document.createElement('a');
      a.className = i === crumbs.length - 1 ? 'topbar-current' : 'topbar-link';
      a.href = '#';
      a.textContent = crumb.label;
      a.addEventListener('click', (e) => { e.preventDefault(); navigate(crumb.route); });
      breadcrumbs.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'topbar-current';
      span.textContent = crumb.label;
      breadcrumbs.appendChild(span);
    }
  }

  bar.appendChild(breadcrumbs);

  // ─── Tool links (right side, always visible) ──────────────────
  const toolLinks = document.createElement('div');
  toolLinks.className = 'topbar-right';

  const tools: { label: string; route: Route; matchView: string }[] = [
    { label: 'Solve', route: { view: 'solve' }, matchView: 'solve' },
    { label: 'Dictionary', route: { view: 'dictionary' }, matchView: 'dictionary' },
    { label: 'Grammar', route: { view: 'grammar-check' }, matchView: 'grammar-check' },
  ];

  for (const tool of tools) {
    const a = document.createElement('a');
    a.className = `topbar-nav-link${route.view === tool.matchView ? ' topbar-nav-active' : ''}`;
    a.href = '#';
    a.textContent = tool.label;
    a.addEventListener('click', (e) => { e.preventDefault(); navigate(tool.route); });
    toolLinks.appendChild(a);
  }
  bar.appendChild(toolLinks);

  container.appendChild(bar);

  // ─── Subject tabs (row 2, only when subject context exists) ───
  const exam = 'exam' in route ? (route as { exam: string }).exam : '';
  const subject = 'subject' in route ? (route as { subject: string }).subject : '';

  if (exam && subject) {
    const tabs = document.createElement('div');
    tabs.className = 'topbar-tabs';

    for (const tab of SUBJECT_TABS) {
      if (tab.subjects && !tab.subjects.has(subject)) continue;

      const isActive = tab.matchViews.includes(route.view);
      const btn = document.createElement('a');
      btn.className = `topbar-tab${isActive ? ' topbar-tab-active' : ''}`;
      btn.href = '#';
      btn.textContent = tab.label;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(tab.routeFor(exam, subject));
      });
      tabs.appendChild(btn);
    }

    container.appendChild(tabs);
  }
}

function buildCrumbs(route: Route): { label: string; route: Route }[] {
  const crumbs: { label: string; route: Route }[] = [];
  crumbs.push({ label: 'Home', route: { view: 'home' } });

  const exam = 'exam' in route ? (route as { exam: string }).exam : '';
  if (route.view !== 'home' && exam) {
    crumbs.push({ label: formatExamName(exam), route: { view: 'subjects', exam } });
  }
  if ('subject' in route && (route as { subject: string }).subject) {
    const subject = (route as { subject: string }).subject;
    crumbs.push({
      label: formatSubjectName(subject),
      route: { view: 'notes', exam, subject },
    });
  }
  if (route.view === 'notes-topic') {
    crumbs.push({ label: 'Topic', route: route });
  }

  // Standalone views: add current view name
  const standaloneLabels: Record<string, string> = {
    solve: 'Solve', dictionary: 'Dictionary', 'grammar-check': 'Grammar Check',
    search: 'Search', progress: 'Progress', packs: 'Packs',
    daily: 'Daily Practice', 'speed-drill': 'Speed Drill', flashcards: 'Flashcards',
    bookmarks: 'Bookmarks', 'wrong-answers': 'Wrong Answers',
  };
  if (standaloneLabels[route.view] && crumbs.length === 1) {
    crumbs.push({ label: standaloneLabels[route.view]!, route });
  }

  return crumbs;
}

function formatExamName(exam: string): string {
  return exam.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSubjectName(subject: string): string {
  const names: Record<string, string> = {
    math: 'Mathematics',
    verbal: 'Verbal Reasoning',
    numerical: 'Quantitative Reasoning',
    quantitative: 'Quantitative Reasoning',
    physics: 'Physics',
    reading: 'Reading',
    grammar: 'Grammar',
    writing: 'Writing',
  };
  return names[subject] || subject.replace(/\b\w/g, c => c.toUpperCase());
}
