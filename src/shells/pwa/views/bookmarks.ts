/**
 * Bookmarks view — shows all bookmarked topics, examples, formulas.
 * Pack-agnostic.
 */

import type { StudyProgress, Bookmark } from '../components/study-progress.js';

export async function renderBookmarks(
  progress: StudyProgress,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  const bookmarks = await progress.getBookmarks();

  const header = document.createElement('div');
  header.className = 'bm-header';
  header.innerHTML = `
    <h2 class="bm-title">\u2B50 Bookmarks</h2>
    <p class="bm-subtitle">${bookmarks.length} saved items</p>
  `;
  container.appendChild(header);

  if (bookmarks.length === 0) {
    container.innerHTML += '<div class="dash-empty"><p>No bookmarks yet. Bookmark topics, formulas, or examples from study notes.</p></div>';
    return;
  }

  // Group by type
  const byType = new Map<string, Bookmark[]>();
  for (const bm of bookmarks) {
    if (!byType.has(bm.type)) byType.set(bm.type, []);
    byType.get(bm.type)!.push(bm);
  }

  const typeLabels: Record<string, string> = { topic: '\u{1F4D6} Topics', formula: '\u{1F4D0} Formulas', example: '\u{270D}\uFE0F Examples' };

  for (const [type, items] of byType) {
    const section = document.createElement('div');
    section.className = 'bm-section';

    const heading = document.createElement('h3');
    heading.className = 'bm-section-title';
    heading.textContent = `${typeLabels[type] ?? type} (${items.length})`;
    section.appendChild(heading);

    for (const bm of items) {
      const card = document.createElement('div');
      card.className = 'bm-card';
      card.innerHTML = `
        <div class="bm-card-title">${esc(bm.title)}</div>
        <div class="bm-card-content">${esc(bm.content.slice(0, 200))}${bm.content.length > 200 ? '...' : ''}</div>
        <div class="bm-card-meta">${esc(bm.subject)} \u00B7 ${new Date(bm.addedAt).toLocaleDateString()}</div>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'bm-remove-btn';
      removeBtn.textContent = '\u2715';
      removeBtn.title = 'Remove bookmark';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await progress.removeBookmark(bm.id);
        renderBookmarks(progress, container);
      });
      card.appendChild(removeBtn);

      section.appendChild(card);
    }

    container.appendChild(section);
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
