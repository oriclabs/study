/**
 * Search view — global search across all imported pack notes.
 * Searches topics, examples, formulas, tips. Pack-agnostic.
 */

import type { ContentPackManager, PackMeta } from '../components/content-packs.js';
import { navigate } from '../router.js';

interface SearchResult {
  packId: string;
  exam: string;
  subject: string;
  subjectLabel: string;
  categoryIdx: number;
  topicIdx: number;
  topicTitle: string;
  matchField: string;
  matchText: string;
  score: number;
}

export async function renderSearch(
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'search-header';
  header.innerHTML = '<h2 class="search-title">\u{1F50D} Search</h2>';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'Search topics, formulas, examples, tips...';
  input.autofocus = true;
  header.appendChild(input);
  container.appendChild(header);

  const resultsEl = document.createElement('div');
  resultsEl.className = 'search-results';
  container.appendChild(resultsEl);

  // Load all pack data for searching
  const packs = await packManager.listPacks();
  const packData: { meta: PackMeta; subjects: { id: string; label: string; notes: Record<string, unknown> | null }[] }[] = [];

  for (const meta of packs) {
    const subjects: { id: string; label: string; notes: Record<string, unknown> | null }[] = [];
    for (const sm of meta.subjects) {
      const notes = sm.hasNotes ? await packManager.loadNotes(meta.packId, sm.id) : null;
      subjects.push({ id: sm.id, label: sm.label, notes });
    }
    packData.push({ meta, subjects });
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  input.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(input.value.trim()), 200);
  });

  function doSearch(query: string) {
    resultsEl.innerHTML = '';
    if (query.length < 2) {
      resultsEl.innerHTML = '<p class="search-hint">Type at least 2 characters to search</p>';
      return;
    }

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const { meta, subjects } of packData) {
      for (const subj of subjects) {
        if (!subj.notes) continue;
        const categories = subj.notes['categories'] as Array<Record<string, unknown>> | undefined;
        if (!categories) continue;

        for (let ci = 0; ci < categories.length; ci++) {
          const cat = categories[ci]!;
          const topics = (cat['topics'] as Array<Record<string, unknown>>) || [];

          for (let ti = 0; ti < topics.length; ti++) {
            const topic = topics[ti]!;
            const topicTitle = (topic['title'] as string) || '';

            // Search across all string fields
            searchFields(topic, q, topicTitle).forEach(match => {
              results.push({
                packId: meta.packId,
                exam: meta.exam,
                subject: subj.id,
                subjectLabel: subj.label,
                categoryIdx: ci,
                topicIdx: ti,
                topicTitle,
                matchField: match.field,
                matchText: match.text,
                score: match.score,
              });
            });
          }
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.score - a.score);
    const shown = results.slice(0, 50);

    if (shown.length === 0) {
      resultsEl.innerHTML = `<p class="search-empty">No results for "${esc(query)}"</p>`;
      return;
    }

    const countEl = document.createElement('p');
    countEl.className = 'search-count';
    countEl.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
    resultsEl.appendChild(countEl);

    for (const r of shown) {
      const card = document.createElement('div');
      card.className = 'search-result-card';
      card.innerHTML = `
        <div class="search-result-header">
          <span class="search-result-topic">${esc(r.topicTitle)}</span>
          <span class="search-result-meta">${esc(r.subjectLabel)} \u00B7 ${esc(r.exam)}</span>
        </div>
        <div class="search-result-match">
          <span class="search-result-field">${esc(r.matchField)}</span>
          <span class="search-result-text">${highlightMatch(r.matchText, query)}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        navigate({
          view: 'notes-topic',
          exam: `pack:${r.packId}`,
          subject: r.subject,
          categoryIdx: r.categoryIdx,
          topicIdx: r.topicIdx,
        });
      });
      resultsEl.appendChild(card);
    }
  }
}

function searchFields(topic: Record<string, unknown>, query: string, topicTitle: string): { field: string; text: string; score: number }[] {
  const matches: { field: string; text: string; score: number }[] = [];

  // Title match (highest score)
  if (topicTitle.toLowerCase().includes(query)) {
    matches.push({ field: 'Title', text: topicTitle, score: 10 });
  }

  function walk(obj: unknown, fieldPath: string, depth: number) {
    if (depth > 4) return;
    if (typeof obj === 'string' && obj.toLowerCase().includes(query)) {
      const score = fieldPath.includes('formula') ? 8 :
                    fieldPath.includes('tip') ? 7 :
                    fieldPath.includes('example') ? 6 :
                    fieldPath.includes('key') ? 7 : 5;
      matches.push({ field: humanize(fieldPath), text: obj.slice(0, 150), score });
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, fieldPath, depth + 1));
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (k === 'id') continue;
        walk(v, k, depth + 1);
      }
    }
  }

  for (const [key, value] of Object.entries(topic)) {
    if (key === 'id' || key === 'title') continue;
    walk(value, key, 0);
  }

  return matches;
}

function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function highlightMatch(text: string, query: string): string {
  const escaped = esc(text);
  const re = new RegExp(`(${escRegex(query)})`, 'gi');
  return escaped.replace(re, '<mark>$1</mark>');
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function escRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
