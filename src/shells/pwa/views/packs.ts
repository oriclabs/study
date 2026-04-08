/**
 * Packs view — content management dashboard.
 * Shows all packs (builtin + imported) with full details,
 * import/export/delete actions.
 */

import type { ContentPackManager, PackMeta } from '../components/content-packs.js';
import { showModal, showConfirm, showToast } from '../components/modal.js';
import { navigate } from '../router.js';

import type { VersionLogEntry } from '../components/content-packs.js';

/* No hardcoded packs — all content is imported */

export async function renderPacks(
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'packs-header';
  header.innerHTML = `<h2 class="packs-title">Content Packs</h2>
    <p class="packs-subtitle">Manage your study content — import new packs, export, or remove</p>`;
  container.appendChild(header);

  // Actions bar
  const actions = document.createElement('div');
  actions.className = 'packs-actions';

  const importBtn = document.createElement('button');
  importBtn.className = 'packs-import-btn';
  importBtn.textContent = '+ Import Pack';
  importBtn.addEventListener('click', () => handleImport(packManager, container));

  actions.appendChild(importBtn);
  container.appendChild(actions);

  // Stats summary
  const allPacks = await packManager.listPacks();

  const stats = document.createElement('div');
  stats.className = 'packs-stats';
  const totalSubjects = allPacks.reduce((s, p) => s + p.subjects.length, 0);
  const totalPractice = allPacks.reduce((s, p) => s + p.subjects.reduce((s2, sub) => s2 + sub.practiceCount, 0), 0);
  const totalExams = allPacks.reduce((s, p) => s + p.subjects.reduce((s2, sub) => s2 + sub.mockExamCount, 0), 0);
  stats.innerHTML = `
    <div class="packs-stat"><span class="packs-stat-num">${allPacks.length}</span><span class="packs-stat-label">Packs</span></div>
    <div class="packs-stat"><span class="packs-stat-num">${totalSubjects}</span><span class="packs-stat-label">Subjects</span></div>
    <div class="packs-stat"><span class="packs-stat-num">${totalPractice}</span><span class="packs-stat-label">Questions</span></div>
    <div class="packs-stat"><span class="packs-stat-num">${totalExams}</span><span class="packs-stat-label">Mock Exams</span></div>
  `;
  container.appendChild(stats);

  // Pack list
  const list = document.createElement('div');
  list.className = 'packs-list';

  if (allPacks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'packs-empty';
    empty.innerHTML = '<p>No packs imported yet. Click "Import Pack" to add study content.</p>';
    list.appendChild(empty);
  }

  for (const pack of allPacks) {
    list.appendChild(createPackCard(pack, packManager, container));
  }

  container.appendChild(list);
}

function createPackCard(
  pack: PackMeta,
  packManager: ContentPackManager,
  pageContainer: HTMLElement,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'packs-card';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'packs-card-header';

  const title = document.createElement('h3');
  title.className = 'packs-card-title';
  title.textContent = pack.exam;
  headerRow.appendChild(title);

  const vBadge = document.createElement('span');
  vBadge.className = 'packs-type-badge packs-type-imported';
  vBadge.textContent = `v${pack.packVersion}`;
  headerRow.appendChild(vBadge);

  card.appendChild(headerRow);

  // Info rows
  const info = document.createElement('div');
  info.className = 'packs-card-info';

  addInfoRow(info, 'Pack ID', pack.packId);
  addInfoRow(info, 'Version', pack.packVersion);
  if (pack.description) addInfoRow(info, 'Description', pack.description);
  if (pack.importedAt > 0) {
    addInfoRow(info, 'Imported', new Date(pack.importedAt).toLocaleString());
  }
  card.appendChild(info);

  // Subjects table
  const subjSection = document.createElement('div');
  subjSection.className = 'packs-card-subjects';
  const subjTitle = document.createElement('h4');
  subjTitle.textContent = `Subjects (${pack.subjects.length})`;
  subjSection.appendChild(subjTitle);

  const table = document.createElement('table');
  table.className = 'packs-subj-table';
  table.innerHTML = `<thead><tr><th>Subject</th><th>Notes</th><th>Practice</th><th>Mock Exams</th></tr></thead>`;
  const tbody = document.createElement('tbody');

  for (const sub of pack.subjects) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${esc(sub.label)}</td>
      <td>${sub.hasNotes ? '<span class="packs-yes">Yes</span>' : '<span class="packs-no">—</span>'}</td>
      <td>${sub.practiceCount > 0 ? `<span class="packs-yes">${sub.practiceCount}</span>` : '<span class="packs-no">—</span>'}</td>
      <td>${sub.mockExamCount > 0 ? `<span class="packs-yes">${sub.mockExamCount}</span>` : '<span class="packs-no">—</span>'}</td>
    `;
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  subjSection.appendChild(table);
  card.appendChild(subjSection);

  // Version history
  if (pack.versionLog && pack.versionLog.length > 0) {
    const versionSection = document.createElement('div');
    versionSection.className = 'packs-version-log';
    const vTitle = document.createElement('h4');
    vTitle.textContent = `Version History (${pack.versionLog.length})`;
    versionSection.appendChild(vTitle);

    const vList = document.createElement('div');
    vList.className = 'packs-version-list';
    for (const entry of pack.versionLog.slice(0, 5)) { // Show last 5
      const row = document.createElement('div');
      row.className = 'packs-version-entry';
      row.innerHTML = `
        <span class="packs-version-num">v${esc(entry.version)}</span>
        <span class="packs-version-date">${new Date(entry.importedAt).toLocaleDateString()}</span>
        ${entry.changes ? `<span class="packs-version-changes">${esc(entry.changes)}</span>` : ''}
      `;
      vList.appendChild(row);
    }
    versionSection.appendChild(vList);
    card.appendChild(versionSection);
  }

  // Action buttons
  const cardActions = document.createElement('div');
  cardActions.className = 'packs-card-actions';

  const openBtn = document.createElement('button');
  openBtn.className = 'packs-action-btn packs-action-open';
  openBtn.textContent = 'Open';
  openBtn.addEventListener('click', () => {
    navigate({ view: 'subjects', exam: `pack:${pack.packId}` });
  });
  cardActions.appendChild(openBtn);

  const generateBtn = document.createElement('button');
  generateBtn.className = 'packs-action-btn packs-action-generate';
  generateBtn.textContent = '\u{26A1} Generate Questions';
  generateBtn.addEventListener('click', () => {
    navigate({ view: 'generate', packId: pack.packId });
  });
  cardActions.appendChild(generateBtn);

  const exportBtn = document.createElement('button');
  exportBtn.className = 'packs-action-btn';
  exportBtn.textContent = 'Export JSON';
  exportBtn.addEventListener('click', async () => {
    const data = await packManager.exportPack(pack.packId);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.packId}-v${pack.packVersion}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  cardActions.appendChild(exportBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'packs-action-btn packs-action-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    const yes = await showConfirm(`All content for "${pack.exam}" will be removed.`, { title: 'Delete Pack?', type: 'error', confirmText: 'Delete' });
    if (yes) {
      await packManager.deletePack(pack.packId);
      showToast(`"${pack.exam}" deleted`, { type: 'success' });
      renderPacks(packManager, pageContainer);
    }
  });
  cardActions.appendChild(deleteBtn);

  card.appendChild(cardActions);
  return card;
}

function addInfoRow(parent: HTMLElement, label: string, value: string): void {
  const row = document.createElement('div');
  row.className = 'packs-info-row';
  row.innerHTML = `<span class="packs-info-label">${esc(label)}</span><span class="packs-info-value">${esc(value)}</span>`;
  parent.appendChild(row);
}

async function handleImport(
  packManager: ContentPackManager,
  pageContainer: HTMLElement,
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
      renderPacks(packManager, pageContainer);
    } catch (e) {
      showModal(`${e instanceof Error ? e.message : String(e)}`, { title: 'Import Failed', type: 'error' });
    }
  });
  input.click();
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
