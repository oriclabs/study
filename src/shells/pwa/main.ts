/**
 * PWA shell entry point.
 * Slim composition root: init App, mount router, wire views.
 */

import '../../../pwa/style.css';
import { createPwaPlatform } from '@platform/pwa/index.js';

// Import subject modules
import { math } from '@subjects/math/index.js';
import { verbal } from '@subjects/verbal/index.js';
import { numerical } from '@subjects/numerical/index.js';
import { physics } from '@subjects/physics/index.js';
import { reading } from '@subjects/reading/index.js';
import { grammar } from '@subjects/grammar/index.js';
import { writing } from '@subjects/writing/index.js';

import { App } from '@engines/app/index.js';
import { Router } from './router.js';
import type { Route } from './router.js';
import { renderTopbar } from './components/topbar.js';
import { SolverPanel } from './components/solver-panel.js';
import { SolverStrip } from './components/solver-strip.js';
import { Sidebar } from './components/sidebar.js';
import { SettingsPanel, type AppSettings } from './components/settings-panel.js';
import { PenCursor } from './components/pen-cursor.js';
import { ContentPackManager } from './components/content-packs.js';
import { BottomNav } from './components/bottom-nav.js';
import { StudyProgress } from './components/study-progress.js';
import { StrategyPicker } from './components/strategy-picker.js';
import type { ThemeName } from '@engines/renderer/theme.js';

// Views
import { renderHome } from './views/home.js';
import { renderSubjects } from './views/subjects.js';
import { renderNotes, renderNotesTopic } from './views/notes.js';
import { renderPacks } from './views/packs.js';
import { renderRevision } from './views/revision.js';
import { renderCheatSheet, renderMasterSheet } from './views/cheatsheet.js';
import { renderPractice } from './views/practice.js';
import { renderSearch } from './views/search.js';
import { renderProgress } from './views/progress-dashboard.js';
import { renderWrongAnswers } from './views/wrong-answers.js';
import { renderBookmarks } from './views/bookmarks.js';
import { renderDaily } from './views/daily.js';
import { renderGenerator } from './views/generate.js';
import { renderSpeedDrill } from './views/speed-drill.js';
import { renderFlashcards } from './views/flashcards.js';
import { renderExam } from './views/exam.js';
import { renderDictionary } from './views/dictionary.js';
import { renderGrammarCheck } from './views/grammar-check.js';

async function main() {
  const appEl = document.getElementById('app');
  if (!appEl) throw new Error('Missing #app element');

  // Create a hidden canvas for the main App renderer (required by App constructor)
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = 900;
  mainCanvas.height = 560;
  mainCanvas.style.display = 'none';
  document.body.appendChild(mainCanvas);

  // Initialize platform + app
  const platform = createPwaPlatform(`${import.meta.env.BASE_URL}content`);
  const app = new App({
    platform,
    subjects: [math, verbal, numerical, physics, reading, grammar, writing],
    canvas: mainCanvas,
  });

  try {
    await app.init();
  } catch (e) {
    console.warn('App init warning:', e);
  }

  // Content pack manager + progress tracker (IndexedDB-backed)
  const packManager = new ContentPackManager(platform.storage);
  await packManager.preloadDefaults();
  const studyProgress = new StudyProgress(platform.storage);

  // Pen cursor (shared across all solver instances)
  const penCursor = new PenCursor();

  // Settings
  function applySettings(s: AppSettings): void {
    // App theme
    document.documentElement.setAttribute('data-theme', s.appTheme);
    // Font size
    document.documentElement.style.setProperty('--notes-font-scale', String(s.fontSize));
    // Pen cursor style + visibility
    penCursor.setStyle(s.penStyle);
    penCursor.setEnabled(s.showPenCursor);
    // Apply solver theme to all renderers
    solverStrip.setTheme(s.solverTheme as ThemeName);
    solverPanel.setTheme(s.solverTheme as ThemeName);
  }

  const settingsPanel = new SettingsPanel(applySettings);

  // Create shared components
  const solverPanel = new SolverPanel(app, penCursor);
  const solverStrip = new SolverStrip(app, penCursor);
  const sidebar = new Sidebar();

  // Strategy picker — mounted inside the solver panel
  const strategyPicker = new StrategyPicker(app);
  solverPanel.setStrategyPicker(strategyPicker);

  // Apply initial settings
  applySettings(settingsPanel.getSettings());

  // Persistent layout wrapper: [sidebar] [main-area]
  const layoutWrap = document.createElement('div');
  layoutWrap.className = 'layout';
  appEl.appendChild(layoutWrap);

  // Sidebar element
  const sidebarEl = sidebar.getElement();
  layoutWrap.appendChild(sidebarEl);

  // Main area
  const mainArea = document.createElement('div');
  mainArea.className = 'layout-main';
  layoutWrap.appendChild(mainArea);

  // Settings panel (appended to body, overlays)
  appEl.appendChild(settingsPanel.getElement());

  // Bottom navigation bar
  const bottomNav = new BottomNav();
  document.body.appendChild(bottomNav.getElement());

  const sidebarToggle = sidebar.getToggle();
  const isNotesRoute = (r: Route) => r.view === 'notes' || r.view === 'notes-topic';

  // View renderer
  async function renderView(route: Route, _container: HTMLElement) {
    solverPanel.close();
    solverStrip.collapse();
    strategyPicker.close();
    penCursor.hide();

    mainArea.innerHTML = '';

    const showSidebar = isNotesRoute(route);
    sidebarEl.style.display = showSidebar ? '' : 'none';
    layoutWrap.classList.toggle('layout-with-sidebar', showSidebar && sidebar.isVisible());

    // Topbar
    if (route.view !== 'home') {
      const topbarRow = document.createElement('div');
      topbarRow.className = 'topbar-row';
      if (showSidebar) {
        topbarRow.appendChild(sidebarToggle);
      }
      renderTopbar(route, topbarRow);

      // Settings gear button
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'topbar-settings';
      settingsBtn.textContent = '\u2699';
      settingsBtn.title = 'Settings';
      settingsBtn.addEventListener('click', () => settingsPanel.toggle());
      topbarRow.appendChild(settingsBtn);

      mainArea.appendChild(topbarRow);
    }

    // Main content area
    const content = document.createElement('div');
    content.className = 'view-content';
    mainArea.appendChild(content);

    switch (route.view) {
      case 'home':
        await renderHome(packManager, content);
        break;

      case 'packs':
        await renderPacks(packManager, content);
        break;

      case 'subjects':
        await renderSubjects(route.exam, packManager, content);
        break;

      case 'notes': {
        const hasSolver = ['math', 'numerical', 'quantitative'].includes(route.subject);
        await renderNotes(route.exam, route.subject, platform.content, packManager, solverPanel, hasSolver ? solverStrip : null, sidebar, platform.tts, penCursor, content);
        break;
      }

      case 'notes-topic': {
        const hasSolver = ['math', 'numerical', 'quantitative'].includes(route.subject);
        await renderNotesTopic(
          route.exam, route.subject,
          route.categoryIdx, route.topicIdx,
          platform.content, packManager, solverPanel, hasSolver ? solverStrip : null, sidebar, platform.tts, penCursor, content,
        );
        break;
      }

      case 'revision':
        await renderRevision(route.exam, route.subject, platform.content, packManager, content);
        break;

      case 'cheatsheet':
        await renderCheatSheet(route.exam, route.subject, platform.content, packManager, content);
        break;

      case 'master-sheet':
        await renderMasterSheet(route.exam, platform.content, packManager, content);
        break;

      case 'practice':
        await renderPractice(route.exam, route.subject, platform.content, packManager, studyProgress, content);
        break;

      case 'exam':
        await renderExam(route.exam, route.subject, platform.content, packManager, studyProgress, content);
        break;

      case 'search':
        await renderSearch(packManager, content);
        break;

      case 'progress':
        await renderProgress(studyProgress, packManager, content);
        break;

      case 'wrong-answers':
        await renderWrongAnswers(studyProgress, content);
        break;

      case 'bookmarks':
        await renderBookmarks(studyProgress, content);
        break;

      case 'daily':
        await renderDaily(studyProgress, packManager, platform.content, content);
        break;

      case 'generate':
        await renderGenerator(packManager, route.packId, content);
        break;

      case 'speed-drill':
        await renderSpeedDrill(studyProgress, packManager, platform.content, content);
        break;

      case 'flashcards':
        await renderFlashcards(packManager, platform.storage, content);
        break;

      case 'solve':
        renderSolveView(content, solverPanel, route.subject ?? 'math');
        break;

      case 'dictionary':
        renderDictionary(content);
        break;

      case 'grammar-check':
        renderGrammarCheck(content);
        break;
    }

    window.scrollTo(0, 0);
    bottomNav.setActive(route);
  }

  sidebarEl.addEventListener('sidebar-toggle', () => {
    const route = routerRef?.getCurrent();
    if (route && isNotesRoute(route)) {
      layoutWrap.classList.toggle('layout-with-sidebar', sidebar.isVisible());
    }
  });

  const router = new Router(appEl, renderView);
  const routerRef: Router = router;
  router.start();

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* ignore in dev */ });
  }
}

function renderSolveView(container: HTMLElement, solverPanel: SolverPanel, subjectHint: string): void {
  const wrap = document.createElement('div');
  wrap.className = 'solve-view';

  const header = document.createElement('h2');
  header.textContent = 'Solve';
  header.className = 'solve-title';
  wrap.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'muted';
  desc.textContent = 'Type any equation and watch it solved step by step.';
  wrap.appendChild(desc);

  // Mount the solver panel inline
  const slot = document.createElement('div');
  slot.className = 'solve-slot';
  wrap.appendChild(slot);
  container.appendChild(wrap);

  solverPanel.setSubjectHint(subjectHint);
  solverPanel.openAt(slot, '', subjectHint);
}

main().catch(console.error);
