/**
 * Cheat Sheet view — auto-generated compact reference sheets.
 *
 * Two modes:
 * 1. Category-level — one section per category with key formulas, rules, traps
 * 2. Master exam-day — top items across ALL subjects on one page
 *
 * Both are printable with optimized print CSS.
 */

import type { ContentSourceAdapter } from '@platform/types.js';
import type { ContentPackManager } from '../components/content-packs.js';
import { Renderer } from '@engines/renderer/index.js';
import { getAllVisualConcepts } from '@subjects/math/visual-concepts.js';

interface CheatItem {
  text: string;
  type: 'formula' | 'rule' | 'trap' | 'tip';
}

interface CategorySheet {
  name: string;
  formulas: string[];
  rules: string[];
  traps: string[];
  tips: string[];
}

// ============ CATEGORY CHEAT SHEETS ============

export async function renderCheatSheet(
  exam: string,
  subject: string,
  _content: ContentSourceAdapter,
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Generating cheat sheet...</div>';

  let data: Record<string, unknown>;
  try {
    const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
    const notes = await packManager.loadNotes(packId, subject);
    if (!notes) throw new Error('Notes not found');
    data = notes;
  } catch (e) {
    container.innerHTML = `<div class="notes-error">Failed to load: ${e instanceof Error ? e.message : String(e)}</div>`;
    return;
  }

  container.innerHTML = '';

  const examInfo = data['exam'] as Record<string, unknown> | undefined;
  const subjectName = (examInfo?.['subject'] as string) || subject;
  const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
  if (!categories) { container.textContent = 'No content found.'; return; }

  // Extract per-category
  const sheets: CategorySheet[] = [];
  for (const cat of categories) {
    const catName = (cat['category'] as string) || 'General';
    const topics = (cat['topics'] as Array<Record<string, unknown>>) || [];
    const sheet: CategorySheet = { name: catName, formulas: [], rules: [], traps: [], tips: [] };

    for (const topic of topics) {
      const topicTitle = (topic['title'] as string) || '';
      const prefix = topicTitle ? `${topicTitle}: ` : '';

      // Formulas
      extractFlat(topic['key_formulas'], sheet.formulas);
      extractFlat(topic['formulas'], sheet.formulas);

      // Rules
      extractFlat(topic['key_rules'], sheet.rules);
      extractFlat(topic['golden_rules'], sheet.rules);

      // Traps
      extractFlat(topic['common_mistakes'], sheet.traps, prefix);

      // Tips (extract just the tip text from enhanced format)
      const tips = topic['tips_and_tricks'];
      if (Array.isArray(tips)) {
        for (const t of tips) {
          if (typeof t === 'string') sheet.tips.push(t);
          else if (typeof t === 'object' && t !== null) {
            const obj = t as Record<string, unknown>;
            if (typeof obj['tip'] === 'string') sheet.tips.push(obj['tip'] as string);
          }
        }
      }
    }

    if (sheet.formulas.length + sheet.rules.length + sheet.traps.length + sheet.tips.length > 0) {
      sheets.push(sheet);
    }
  }

  // Render
  const wrapper = document.createElement('div');
  wrapper.className = 'cheat-wrapper';

  // Header
  const header = document.createElement('div');
  header.className = 'cheat-header';
  header.innerHTML = `
    <h2 class="cheat-title">\u{1F4CB} Cheat Sheet — ${esc(subjectName)}</h2>
    <p class="cheat-subtitle">${sheets.length} categories \u00B7 ${sheets.reduce((s, c) => s + c.formulas.length, 0)} formulas \u00B7 ${sheets.reduce((s, c) => s + c.rules.length, 0)} rules \u00B7 ${sheets.reduce((s, c) => s + c.traps.length, 0)} traps</p>
  `;
  const btnRow = document.createElement('div');
  btnRow.className = 'cheat-actions';
  const printBtn = document.createElement('button');
  printBtn.className = 'cheat-print-btn';
  printBtn.textContent = '\u{1F5A8} Print Cheat Sheet';
  printBtn.addEventListener('click', () => window.print());
  btnRow.appendChild(printBtn);
  header.appendChild(btnRow);
  wrapper.appendChild(header);

  // Category cards
  const grid = document.createElement('div');
  grid.className = 'cheat-grid';

  for (const sheet of sheets) {
    const card = document.createElement('div');
    card.className = 'cheat-card';

    const catTitle = document.createElement('h3');
    catTitle.className = 'cheat-card-title';
    catTitle.textContent = sheet.name;
    card.appendChild(catTitle);

    if (sheet.formulas.length > 0) {
      card.appendChild(buildSection('\u{1F4D0} Formulas', 'cheat-formulas', sheet.formulas));
    }
    if (sheet.rules.length > 0) {
      card.appendChild(buildSection('\u2705 Key Rules', 'cheat-rules', sheet.rules));
    }
    if (sheet.traps.length > 0) {
      card.appendChild(buildSection('\u26A0\uFE0F Common Traps', 'cheat-traps', sheet.traps.slice(0, 5)));
    }
    if (sheet.tips.length > 0) {
      card.appendChild(buildSection('\u{1F4A1} Tips', 'cheat-tips', sheet.tips.slice(0, 5)));
    }

    grid.appendChild(card);
  }

  wrapper.appendChild(grid);

  // Visual formula diagrams (math/quantitative only)
  if (subject === 'math' || subject === 'quantitative') {
    const diagSection = document.createElement('div');
    diagSection.className = 'cheat-diagrams';

    const diagTitle = document.createElement('h3');
    diagTitle.className = 'cheat-diagrams-title';
    diagTitle.textContent = '\u{1F4D0} Visual Formula Reference';
    diagSection.appendChild(diagTitle);

    const diagGrid = document.createElement('div');
    diagGrid.className = 'cheat-diagrams-grid';

    const concepts = getAllVisualConcepts();
    const noopTts = { isSupported: () => false, speak: async () => {}, cancel: () => {} };

    for (const concept of concepts) {
      const lesson = concept.generator();

      // Create offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 400;

      const renderer = new Renderer({ canvas, tts: noopTts as any, speed: 100 });

      // Render instantly (high speed) then convert to image
      const card = document.createElement('div');
      card.className = 'cheat-diagram-card';

      const cardTitle = document.createElement('div');
      cardTitle.className = 'cheat-diagram-label';
      cardTitle.textContent = concept.title;
      card.appendChild(cardTitle);

      const imgEl = document.createElement('img');
      imgEl.className = 'cheat-diagram-img';
      imgEl.alt = concept.title;
      card.appendChild(imgEl);

      diagGrid.appendChild(card);

      // Render async, then snapshot
      renderer.play(lesson).then(() => {
        imgEl.src = canvas.toDataURL('image/png');
      }).catch(() => {
        imgEl.alt = 'Failed to render';
      });
    }

    diagSection.appendChild(diagGrid);
    wrapper.appendChild(diagSection);
  }

  container.appendChild(wrapper);
}

// ============ MASTER EXAM-DAY SHEET ============

export async function renderMasterSheet(
  exam: string,
  _content: ContentSourceAdapter,
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Generating master cheat sheet...</div>';

  const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
  let pack: Record<string, unknown>;
  try {
    pack = await packManager.loadPack(packId);
  } catch (e) {
    container.innerHTML = `<div class="notes-error">Failed to load: ${e instanceof Error ? e.message : String(e)}</div>`;
    return;
  }

  container.innerHTML = '';

  const subjects = (pack['subjects'] as Array<Record<string, unknown>>) || [];
  const allFormulas: { text: string; subject: string }[] = [];
  const allRules: { text: string; subject: string }[] = [];
  const allTraps: { text: string; subject: string }[] = [];

  for (const subj of subjects) {
    const subjId = (subj['id'] as string) || '';
    const subjName = (subj['displayName'] as string) || subjId;
    const notes = subj['notes'] as Record<string, unknown> | undefined;
    if (!notes) continue;

    const categories = (notes['categories'] as Array<Record<string, unknown>>) || [];
    for (const cat of categories) {
      for (const topic of ((cat['topics'] as Array<Record<string, unknown>>) || [])) {
        extractFlatTagged(topic['key_formulas'], subjName, allFormulas);
        extractFlatTagged(topic['golden_rules'], subjName, allRules);
        extractFlatTagged(topic['key_rules'], subjName, allRules);
        extractFlatTagged(topic['common_mistakes'], subjName, allTraps);
      }
    }
  }

  // Deduplicate
  const dedup = (arr: { text: string; subject: string }[]) => {
    const seen = new Set<string>();
    return arr.filter(item => {
      const key = item.text.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const formulas = dedup(allFormulas).slice(0, 30);
  const rules = dedup(allRules).slice(0, 15);
  const traps = dedup(allTraps).slice(0, 15);

  // Render
  const wrapper = document.createElement('div');
  wrapper.className = 'cheat-wrapper cheat-master';

  const header = document.createElement('div');
  header.className = 'cheat-header';
  const examName = (pack['name'] as string) || exam;
  header.innerHTML = `
    <h2 class="cheat-title">\u{1F3AF} Exam Day Master Sheet</h2>
    <p class="cheat-subtitle">${esc(examName)} \u00B7 ${formulas.length} formulas \u00B7 ${rules.length} rules \u00B7 ${traps.length} traps</p>
    <p class="cheat-tagline">The last thing to review before you walk in.</p>
  `;
  const printBtn = document.createElement('button');
  printBtn.className = 'cheat-print-btn';
  printBtn.textContent = '\u{1F5A8} Print Master Sheet';
  printBtn.addEventListener('click', () => window.print());
  header.appendChild(printBtn);
  wrapper.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'cheat-master-grid';

  // Formulas column
  const formulaCol = document.createElement('div');
  formulaCol.className = 'cheat-master-col';
  formulaCol.appendChild(buildMasterSection('\u{1F4D0} Top Formulas', 'cheat-formulas', formulas));
  grid.appendChild(formulaCol);

  // Rules + traps column
  const rulesCol = document.createElement('div');
  rulesCol.className = 'cheat-master-col';
  rulesCol.appendChild(buildMasterSection('\u2705 Key Rules', 'cheat-rules', rules));
  rulesCol.appendChild(buildMasterSection('\u26A0\uFE0F Top Traps to Avoid', 'cheat-traps', traps));
  grid.appendChild(rulesCol);

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

// ============ HELPERS ============

function buildSection(title: string, cssClass: string, items: string[]): HTMLElement {
  const section = document.createElement('div');
  section.className = `cheat-section ${cssClass}`;
  const h = document.createElement('h4');
  h.className = 'cheat-section-title';
  h.textContent = title;
  section.appendChild(h);
  const ul = document.createElement('ul');
  ul.className = 'cheat-list';
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
  section.appendChild(ul);
  return section;
}

function buildMasterSection(title: string, cssClass: string, items: { text: string; subject: string }[]): HTMLElement {
  const section = document.createElement('div');
  section.className = `cheat-section ${cssClass}`;
  const h = document.createElement('h4');
  h.className = 'cheat-section-title';
  h.textContent = title;
  section.appendChild(h);
  const ul = document.createElement('ul');
  ul.className = 'cheat-list';
  for (const item of items) {
    const li = document.createElement('li');
    li.innerHTML = `${esc(item.text)} <span class="cheat-subject-tag">${esc(item.subject)}</span>`;
    ul.appendChild(li);
  }
  section.appendChild(ul);
  return section;
}

function extractFlat(value: unknown, out: string[], prefix = ''): void {
  if (typeof value === 'string' && value.trim()) {
    out.push(prefix + value.trim());
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) out.push(prefix + item.trim());
    }
  }
}

function extractFlatTagged(value: unknown, subject: string, out: { text: string; subject: string }[]): void {
  if (typeof value === 'string' && value.trim()) {
    out.push({ text: value.trim(), subject });
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) out.push({ text: item.trim(), subject });
    }
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
