/**
 * Home view — shows available content packs (bundled + imported).
 * Includes import button for adding new packs.
 */

import type { ContentPackManager, PackMeta } from '../components/content-packs.js';
import { showConfirm, showToast, showModal } from '../components/modal.js';
import { navigate } from '../router.js';

/* No hardcoded packs — all content is imported via content packs */

export async function renderHome(
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'home-header';
  header.innerHTML = `
    <h1 class="home-title">Study App</h1>
    <p class="home-subtitle">Choose your exam to get started</p>
  `;
  container.appendChild(header);

  // Action bar
  const actions = document.createElement('div');
  actions.className = 'home-actions';

  const actionBtns = [
    { label: '\u{1F4CA} Progress', route: { view: 'progress' as const }, cls: 'home-manage-btn' },
    { label: '\u{23F1} Speed Drill', route: { view: 'speed-drill' as const }, cls: 'home-manage-btn' },
    { label: '\u{1F4DA} Flashcards', route: { view: 'flashcards' as const }, cls: 'home-manage-btn' },
    { label: '\u{1F50D} Search', route: { view: 'search' as const }, cls: 'home-manage-btn' },
    { label: '\u{1F4DD} Daily Practice', route: { view: 'daily' as const }, cls: 'home-manage-btn' },
    { label: '\u{1F4E6} Manage Packs', route: { view: 'packs' as const }, cls: 'home-manage-btn' },
  ];
  for (const item of actionBtns) {
    const btn = document.createElement('button');
    btn.className = item.cls;
    btn.textContent = item.label;
    btn.addEventListener('click', () => navigate(item.route));
    actions.appendChild(btn);
  }

  const importBtn = document.createElement('button');
  importBtn.className = 'home-import-btn';
  importBtn.textContent = '+ Import Pack';
  importBtn.addEventListener('click', () => handleImport(packManager, container));
  actions.appendChild(importBtn);
  container.appendChild(actions);

  const grid = document.createElement('div');
  grid.className = 'home-grid';

  // Render all imported packs
  const packs = await packManager.listPacks();

  if (packs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'home-empty';
    empty.innerHTML = `
      <div class="home-empty-icon">\u{1F4E6}</div>
      <h3>No content packs yet</h3>
      <p>Import a content pack to get started. Content packs contain study notes, practice questions, and mock exams.</p>
    `;
    grid.appendChild(empty);
  }

  for (const pack of packs) {
    const subjects = pack.subjects.map(s => ({
      id: s.id,
      label: s.label,
      notesKey: s.id,
    }));
    const card = createExamCard(
      `pack:${pack.packId}`,
      pack.exam,
      pack.description || `v${pack.packVersion} — Imported ${new Date(pack.importedAt).toLocaleDateString()}`,
      subjects,
      pack,
    );

    // Delete button for imported packs
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'home-delete-btn';
    deleteBtn.textContent = '\u2715';
    deleteBtn.title = 'Remove this content pack';
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const yes = await showConfirm(`This will delete all content for "${pack.exam}".`, { title: 'Remove Pack?', type: 'error', confirmText: 'Remove' });
      if (yes) {
        await packManager.deletePack(pack.packId);
        showToast(`"${pack.exam}" removed`, { type: 'success' });
        renderHome(packManager, container);
      }
    });
    card.appendChild(deleteBtn);

    grid.appendChild(card);
  }

  // Placeholder for more
  const placeholder = document.createElement('div');
  placeholder.className = 'home-exam-card home-exam-coming';
  placeholder.innerHTML = `
    <h2 class="home-exam-title">More Content</h2>
    <p class="home-exam-desc">Import a JSON content pack to add new exams and subjects</p>
  `;
  grid.appendChild(placeholder);

  container.appendChild(grid);
}

function createExamCard(
  routeId: string,
  name: string,
  description: string,
  subjects: { id: string; label: string; notesKey: string }[],
  packMeta?: PackMeta,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'home-exam-card';
  card.addEventListener('click', () => navigate({ view: 'subjects', exam: routeId }));

  if (packMeta) {
    const badge = document.createElement('span');
    badge.className = 'home-version-badge';
    badge.textContent = `v${packMeta.packVersion}`;
    card.appendChild(badge);
  }

  const title = document.createElement('h2');
  title.className = 'home-exam-title';
  title.textContent = name;
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'home-exam-desc';
  desc.textContent = description;
  card.appendChild(desc);

  const tags = document.createElement('div');
  tags.className = 'home-exam-subjects';
  for (const sub of subjects) {
    const tag = document.createElement('span');
    tag.className = 'home-subject-tag';
    tag.textContent = sub.label;
    tags.appendChild(tag);
  }
  card.appendChild(tags);

  // Content summary for imported packs
  if (packMeta) {
    const totalPractice = packMeta.subjects.reduce((s, sub) => s + sub.practiceCount, 0);
    const totalExams = packMeta.subjects.reduce((s, sub) => s + sub.mockExamCount, 0);
    const hasNotes = packMeta.subjects.some(s => s.hasNotes);
    const parts: string[] = [];
    if (hasNotes) parts.push('Notes');
    if (totalPractice > 0) parts.push(`${totalPractice} questions`);
    if (totalExams > 0) parts.push(`${totalExams} mock exams`);
    if (parts.length > 0) {
      const summary = document.createElement('p');
      summary.className = 'home-pack-summary';
      summary.textContent = parts.join(' \u00B7 ');
      card.appendChild(summary);
    }
  }

  return card;
}

async function handleImport(
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const meta = await packManager.importPack(json);
      showToast(`Imported "${meta.exam}" — ${meta.subjects.length} subject(s)`, { type: 'success' });
      renderHome(packManager, container);
    } catch (e) {
      showModal(`${e instanceof Error ? e.message : String(e)}`, { title: 'Import Failed', type: 'error' });
    }
  });
  input.click();
}
