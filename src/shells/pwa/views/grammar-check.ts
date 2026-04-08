/**
 * Grammar Check view — standalone grammar checker.
 * Paste text, see errors highlighted with suggestions.
 */

import { checkGrammar, type GrammarError } from '@engines/grammar/index.js';

export function renderGrammarCheck(container: HTMLElement): void {
  const wrap = document.createElement('div');
  wrap.className = 'grammar-view';

  wrap.innerHTML = `
    <div class="grammar-header">
      <h2>Grammar Check</h2>
      <p class="muted">Paste or type text to check spelling, grammar, and punctuation.</p>
    </div>
  `;

  // Input textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'grammar-input';
  textarea.rows = 8;
  textarea.placeholder = 'Type or paste your text here...\n\nExample: "Their going to the libary tommorow. the book was very intresting and I realy enjoyed it."';
  wrap.appendChild(textarea);

  // Button row
  const btnRow = document.createElement('div');
  btnRow.className = 'grammar-btn-row';
  const checkBtn = document.createElement('button');
  checkBtn.className = 'solver-btn solver-solve-btn';
  checkBtn.textContent = 'Check Grammar';
  const clearBtn = document.createElement('button');
  clearBtn.className = 'solver-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    resultArea.innerHTML = '';
  });
  btnRow.appendChild(checkBtn);
  btnRow.appendChild(clearBtn);
  wrap.appendChild(btnRow);

  // Result area
  const resultArea = document.createElement('div');
  resultArea.className = 'grammar-result';
  wrap.appendChild(resultArea);

  checkBtn.addEventListener('click', () => {
    const text = textarea.value;
    if (!text.trim()) return;
    const result = checkGrammar(text);
    renderResults(result.text, result.errors, result.stats, resultArea);
  });

  container.appendChild(wrap);
}

function renderResults(
  text: string,
  errors: GrammarError[],
  stats: { wordCount: number; sentenceCount: number; errorCount: number },
  container: HTMLElement,
): void {
  container.innerHTML = '';

  // Stats bar
  const statsBar = document.createElement('div');
  statsBar.className = 'grammar-stats';
  statsBar.innerHTML = `
    <span>${stats.wordCount} words</span>
    <span>${stats.sentenceCount} sentences</span>
    <span class="${stats.errorCount === 0 ? 'grammar-stats-good' : 'grammar-stats-bad'}">${stats.errorCount} ${stats.errorCount === 1 ? 'issue' : 'issues'} found</span>
  `;
  container.appendChild(statsBar);

  if (errors.length === 0) {
    const good = document.createElement('div');
    good.className = 'grammar-good';
    good.textContent = 'No issues found. Your text looks good!';
    container.appendChild(good);
    return;
  }

  // Highlighted text
  const highlighted = document.createElement('div');
  highlighted.className = 'grammar-highlighted';
  highlighted.innerHTML = buildHighlightedHTML(text, errors);
  container.appendChild(highlighted);

  // Error list
  const errorList = document.createElement('div');
  errorList.className = 'grammar-error-list';

  for (let i = 0; i < errors.length; i++) {
    const err = errors[i]!;
    const card = document.createElement('div');
    card.className = `grammar-error-card grammar-cat-${err.category}`;

    const catLabel = { spelling: 'Spelling', grammar: 'Grammar', punctuation: 'Punctuation', style: 'Style' }[err.category] ?? err.category;

    card.innerHTML = `
      <div class="grammar-error-header">
        <span class="grammar-error-cat">${catLabel}</span>
        <span class="grammar-error-text">"${esc(err.text)}"</span>
      </div>
      <div class="grammar-error-msg">${esc(err.message)}</div>
    `;

    if (err.suggestions.length > 0) {
      const sugRow = document.createElement('div');
      sugRow.className = 'grammar-suggestions';
      sugRow.innerHTML = '<span class="muted" style="font-size:0.75rem">Suggestion: </span>';
      for (const sug of err.suggestions) {
        const btn = document.createElement('button');
        btn.className = 'grammar-suggestion-btn';
        btn.textContent = sug;
        sugRow.appendChild(btn);
      }
      card.appendChild(sugRow);
    }

    errorList.appendChild(card);
  }

  container.appendChild(errorList);
}

function buildHighlightedHTML(text: string, errors: GrammarError[]): string {
  // Sort errors by start position
  const sorted = [...errors].sort((a, b) => a.start - b.start);
  let html = '';
  let lastIdx = 0;

  for (const err of sorted) {
    if (err.start < lastIdx) continue; // skip overlapping
    html += esc(text.slice(lastIdx, err.start));
    const cls = `grammar-highlight grammar-hl-${err.category}`;
    html += `<span class="${cls}" title="${esc(err.message)}">${esc(text.slice(err.start, err.end))}</span>`;
    lastIdx = err.end;
  }
  html += esc(text.slice(lastIdx));

  return html;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
