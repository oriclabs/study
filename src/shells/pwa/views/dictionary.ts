/**
 * Dictionary view — standalone synonym/antonym lookup.
 * Also embeddable as a widget in verbal/reading views.
 */

import { lookup, search, fuzzySearch, getRandomWord, wordCount, type DictResult } from '@engines/dictionary/index.js';

export function renderDictionary(container: HTMLElement): void {
  const wrap = document.createElement('div');
  wrap.className = 'dict-view';

  // Header
  const header = document.createElement('div');
  header.className = 'dict-header';
  header.innerHTML = `
    <h2>Dictionary</h2>
    <p class="muted">${wordCount()} curated exam words — synonyms, antonyms, definitions</p>
  `;
  wrap.appendChild(header);

  // Search input
  const searchRow = document.createElement('div');
  searchRow.className = 'dict-search-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'dict-input';
  input.placeholder = 'Type a word to look up...';
  input.spellcheck = false;

  const randomBtn = document.createElement('button');
  randomBtn.className = 'solver-btn';
  randomBtn.textContent = 'Random';
  randomBtn.addEventListener('click', () => {
    input.value = getRandomWord();
    doLookup();
  });

  searchRow.appendChild(input);
  searchRow.appendChild(randomBtn);
  wrap.appendChild(searchRow);

  // Suggestions dropdown
  const suggestions = document.createElement('div');
  suggestions.className = 'dict-suggestions';
  wrap.appendChild(suggestions);

  // Result area
  const resultArea = document.createElement('div');
  resultArea.className = 'dict-result';
  wrap.appendChild(resultArea);

  container.appendChild(wrap);

  // Level filter buttons
  const levelRow = document.createElement('div');
  levelRow.className = 'dict-levels';
  levelRow.innerHTML = `
    <span class="muted" style="font-size:0.8rem">Browse by level:</span>
  `;
  for (const [lvl, label] of [[1, 'Foundation'], [2, 'Intermediate'], [3, 'Advanced']] as const) {
    const btn = document.createElement('button');
    btn.className = 'solver-history-item';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      import('@engines/dictionary/index.js').then(dict => {
        const words = dict.getByLevel(lvl);
        resultArea.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'dict-word-grid';
        for (const w of words) {
          const tag = document.createElement('button');
          tag.className = 'dict-word-tag';
          tag.textContent = w;
          tag.addEventListener('click', () => { input.value = w; doLookup(); });
          grid.appendChild(tag);
        }
        resultArea.appendChild(grid);
      });
    });
    levelRow.appendChild(btn);
  }
  wrap.insertBefore(levelRow, resultArea);

  // Search-as-you-type
  let debounce: ReturnType<typeof setTimeout>;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const val = input.value.trim();
      if (val.length < 2) { suggestions.innerHTML = ''; return; }
      const matches = search(val, 8);
      if (matches.length === 0) {
        const fuzzy = fuzzySearch(val, 5);
        renderSuggestions(fuzzy, 'Did you mean:');
      } else {
        renderSuggestions(matches);
      }
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { suggestions.innerHTML = ''; doLookup(); }
  });

  function renderSuggestions(words: string[], prefix = '') {
    suggestions.innerHTML = '';
    if (words.length === 0) return;
    if (prefix) {
      const label = document.createElement('span');
      label.className = 'muted';
      label.style.fontSize = '0.8rem';
      label.textContent = prefix + ' ';
      suggestions.appendChild(label);
    }
    for (const w of words) {
      const btn = document.createElement('button');
      btn.className = 'dict-suggest-btn';
      btn.textContent = w;
      btn.addEventListener('click', () => { input.value = w; suggestions.innerHTML = ''; doLookup(); });
      suggestions.appendChild(btn);
    }
  }

  function doLookup() {
    const word = input.value.trim().toLowerCase();
    if (!word) return;
    suggestions.innerHTML = '';
    const result = lookup(word);
    if (result) {
      renderResult(result, resultArea);
    } else {
      const fuzzy = fuzzySearch(word, 5);
      resultArea.innerHTML = '';
      const msg = document.createElement('div');
      msg.className = 'dict-not-found';
      msg.innerHTML = `<p>"<strong>${esc(word)}</strong>" not found in dictionary.</p>`;
      if (fuzzy.length > 0) {
        msg.innerHTML += '<p class="muted">Did you mean:</p>';
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '6px';
        row.style.flexWrap = 'wrap';
        for (const w of fuzzy) {
          const btn = document.createElement('button');
          btn.className = 'dict-suggest-btn';
          btn.textContent = w;
          btn.addEventListener('click', () => { input.value = w; doLookup(); });
          row.appendChild(btn);
        }
        msg.appendChild(row);
      }
      resultArea.appendChild(msg);
    }
  }
}

function renderResult(result: DictResult, container: HTMLElement) {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'dict-card';

  // Word + POS + level
  const header = document.createElement('div');
  header.className = 'dict-card-header';
  const entry = result.entries[0]!;
  header.innerHTML = `
    <span class="dict-word">${esc(result.word)}</span>
    <span class="dict-pos">${esc(entry.pos)}</span>
    <span class="dict-level dict-level-${entry.level}">Level ${entry.level}</span>
  `;
  card.appendChild(header);

  // Definition
  if (entry.definition) {
    const def = document.createElement('div');
    def.className = 'dict-definition';
    def.textContent = entry.definition;
    card.appendChild(def);
  }

  // Example
  if (entry.example) {
    const ex = document.createElement('div');
    ex.className = 'dict-example';
    ex.innerHTML = `<em>"${esc(entry.example)}"</em>`;
    card.appendChild(ex);
  }

  // Synonyms
  if (entry.synonyms.length > 0) {
    const section = document.createElement('div');
    section.className = 'dict-section';
    section.innerHTML = '<span class="dict-section-label">Synonyms</span>';
    const tags = document.createElement('div');
    tags.className = 'dict-tags';
    for (const syn of entry.synonyms) {
      const tag = document.createElement('button');
      tag.className = 'dict-tag dict-tag-syn';
      tag.textContent = syn;
      tag.addEventListener('click', () => {
        const input = container.closest('.dict-view')?.querySelector('.dict-input') as HTMLInputElement | null;
        if (input) { input.value = syn; input.dispatchEvent(new Event('input')); }
        const r = lookup(syn);
        if (r) renderResult(r, container);
      });
      tags.appendChild(tag);
    }
    section.appendChild(tags);
    card.appendChild(section);
  }

  // Antonyms
  if (entry.antonyms.length > 0) {
    const section = document.createElement('div');
    section.className = 'dict-section';
    section.innerHTML = '<span class="dict-section-label">Antonyms</span>';
    const tags = document.createElement('div');
    tags.className = 'dict-tags';
    for (const ant of entry.antonyms) {
      const tag = document.createElement('button');
      tag.className = 'dict-tag dict-tag-ant';
      tag.textContent = ant;
      tag.addEventListener('click', () => {
        const input = container.closest('.dict-view')?.querySelector('.dict-input') as HTMLInputElement | null;
        if (input) { input.value = ant; input.dispatchEvent(new Event('input')); }
        const r = lookup(ant);
        if (r) renderResult(r, container);
      });
      tags.appendChild(tag);
    }
    section.appendChild(tags);
    card.appendChild(section);
  }

  // Related words
  if (result.relatedTo.length > 0) {
    const section = document.createElement('div');
    section.className = 'dict-section';
    section.innerHTML = `<span class="dict-section-label">Also related to</span>`;
    const tags = document.createElement('div');
    tags.className = 'dict-tags';
    for (const w of result.relatedTo.slice(0, 10)) {
      const tag = document.createElement('button');
      tag.className = 'dict-tag dict-tag-rel';
      tag.textContent = w;
      tag.addEventListener('click', () => {
        const r = lookup(w);
        if (r) renderResult(r, container);
      });
      tags.appendChild(tag);
    }
    section.appendChild(tags);
    card.appendChild(section);
  }

  container.appendChild(card);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
