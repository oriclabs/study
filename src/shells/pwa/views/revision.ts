/**
 * Quick Revision view — auto-generated compact summary from study notes.
 * Extracts: formulas, golden rules, tips, key facts, definitions, solving steps.
 * Designed for last-minute review before exams — no verbose explanations.
 */

import type { ContentSourceAdapter, TTSAdapter } from '@platform/types.js';
import type { ContentPackManager } from '../components/content-packs.js';

/** Fields to extract for revision, by category */
const FORMULA_KEYS = [
  'formula', 'formulas', 'key_formulas', 'key_formula', 'basic_formula',
  'fundamental_formula', 'derived_formulas', 'key_equation',
  'working_backwards_formula', 'average_speed_rule', 'compound_interest',
  'simple_interest', 'pythagoras_theorem',
];
const TIP_KEYS = [
  'tips_and_tricks', 'golden_rule', 'golden_rules', 'key_notes',
  'key_rules', 'key_facts', 'key_principle', 'useful_shortcuts',
];
const DEFINITION_KEYS = ['definitions', 'properties', 'laws', 'theorems'];
const CUE_KEYS = ['identification_cues', 'what_it_looks_like', 'solving_strategy'];

interface RevisionItem {
  text: string;
  source: string; // "Category > Topic"
}

interface RevisionSection {
  title: string;
  icon: string;
  cssClass: string;
  items: RevisionItem[];
}

export async function renderRevision(
  exam: string,
  subject: string,
  content: ContentSourceAdapter,
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Generating revision...</div>';

  let data: Record<string, unknown>;
  try {
    if (exam.startsWith('pack:')) {
      const notes = await packManager.loadNotes(exam.slice(5), subject);
      if (!notes) throw new Error('Notes not found');
      data = notes;
    } else {
      data = await content.loadNotes(exam, subject) as Record<string, unknown>;
    }
  } catch (e) {
    container.innerHTML = `<div class="notes-error">Failed to load: ${e instanceof Error ? e.message : String(e)}</div>`;
    return;
  }

  container.innerHTML = '';

  // Extract revision content
  const formulas: RevisionItem[] = [];
  const tips: RevisionItem[] = [];
  const definitions: RevisionItem[] = [];
  const cues: RevisionItem[] = [];

  const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
  if (categories) {
    for (const cat of categories) {
      const catName = (cat['category'] as string) || '';
      const topics = (cat['topics'] as Array<Record<string, unknown>>) || [];

      for (const topic of topics) {
        const topicTitle = (topic['title'] as string) || '';
        const source = catName ? `${catName} > ${topicTitle}` : topicTitle;

        for (const [key, value] of Object.entries(topic)) {
          if (FORMULA_KEYS.includes(key)) extractStrings(value, source, formulas);
          if (TIP_KEYS.includes(key)) extractStrings(value, source, tips);
          if (DEFINITION_KEYS.includes(key)) extractDefinitions(value, source, definitions);
          if (CUE_KEYS.includes(key)) extractStrings(value, source, cues);
        }
      }
    }
  }

  // Golden rules from exam info
  const examInfo = data['exam'] as Record<string, unknown> | undefined;
  const goldenRules = examInfo?.['golden_rules'] ?? examInfo?.['golden_rule'];
  if (goldenRules) extractStrings(goldenRules, 'Exam Golden Rules', tips);

  // Quick reference
  const quickRef = data['quick_reference'] as Record<string, unknown> | undefined;
  if (quickRef) {
    for (const [, v] of Object.entries(quickRef)) {
      extractStrings(v, 'Quick Reference', formulas);
    }
  }

  // Build sections
  const sections: RevisionSection[] = [];
  if (formulas.length > 0) sections.push({ title: 'Key Formulas & Rules', icon: '\u{1F4D0}', cssClass: 'rev-formulas', items: formulas });
  if (tips.length > 0) sections.push({ title: 'Tips & Golden Rules', icon: '\u2705', cssClass: 'rev-tips', items: tips });
  if (definitions.length > 0) sections.push({ title: 'Key Definitions', icon: '\u{1F4D6}', cssClass: 'rev-definitions', items: definitions });
  if (cues.length > 0) sections.push({ title: 'How to Identify', icon: '\u{1F50D}', cssClass: 'rev-cues', items: cues });

  // Render header
  const header = document.createElement('div');
  header.className = 'rev-header';
  const subjectName = (examInfo?.['subject'] as string) || subject;
  header.innerHTML = `
    <h2 class="rev-title">\u26A1 Quick Revision — ${esc(subjectName)}</h2>
    <p class="rev-subtitle">${formulas.length} formulas \u00B7 ${tips.length} tips \u00B7 ${definitions.length} definitions \u00B7 ${cues.length} cues</p>
  `;

  // Print button
  const printBtn = document.createElement('button');
  printBtn.className = 'rev-print-btn';
  printBtn.textContent = '\u{1F5A8} Print';
  printBtn.addEventListener('click', () => window.print());
  header.appendChild(printBtn);

  container.appendChild(header);

  // Render sections
  for (const section of sections) {
    const sEl = document.createElement('div');
    sEl.className = `rev-section ${section.cssClass}`;

    const heading = document.createElement('h3');
    heading.className = 'rev-section-title';
    heading.textContent = `${section.icon} ${section.title} (${section.items.length})`;
    sEl.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'rev-items';

    for (const item of section.items) {
      const row = document.createElement('div');
      row.className = 'rev-item';
      row.innerHTML = `
        <span class="rev-item-text">${esc(item.text)}</span>
        <span class="rev-item-source">${esc(item.source)}</span>
      `;
      list.appendChild(row);
    }

    sEl.appendChild(list);
    container.appendChild(sEl);
  }

  if (sections.length === 0) {
    container.innerHTML += '<div class="placeholder"><p>No revision content could be extracted from the notes.</p></div>';
  }
}

/* ============ Extractors ============ */

function extractStrings(value: unknown, source: string, out: RevisionItem[]): void {
  if (typeof value === 'string' && value.trim()) {
    out.push({ text: value.trim(), source });
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        out.push({ text: item.trim(), source });
      } else if (typeof item === 'object' && item !== null) {
        // Extract text-like fields from objects
        const obj = item as Record<string, unknown>;
        for (const key of ['rule', 'formula', 'description', 'key_principle', 'method', 'strategy', 'step']) {
          if (typeof obj[key] === 'string') {
            const label = obj['name'] ?? obj['type'] ?? obj['divisor'] ?? '';
            const prefix = label ? `${label}: ` : '';
            out.push({ text: `${prefix}${obj[key]}`, source });
          }
        }
        // If it has 'steps' array, join them
        if (Array.isArray(obj['steps'])) {
          const name = (obj['method'] ?? obj['name'] ?? '') as string;
          out.push({
            text: `${name ? name + ': ' : ''}${(obj['steps'] as string[]).join(' → ')}`,
            source,
          });
        }
      }
    }
  } else if (typeof value === 'object' && value !== null) {
    // Object with string values (e.g. { "key": "value" })
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'string') {
        out.push({ text: `${k}: ${v}`, source });
      }
    }
  }
}

function extractDefinitions(value: unknown, source: string, out: RevisionItem[]): void {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'string') {
        out.push({ text: `${humanize(k)}: ${v}`, source });
      }
    }
  }
}

function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
