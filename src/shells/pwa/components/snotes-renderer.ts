/**
 * Snotes renderer — recursive JSON→HTML renderer for pre-authored study notes.
 * Color-coded, type-aware rendering for rich educational content.
 *
 * Color system:
 *   Blue    — formulas, key equations, definitions
 *   Green   — tips, tricks, key notes (positive guidance)
 *   Amber   — identification cues, solving strategy, "how to spot it"
 *   Red     — common mistakes, warnings
 *   Purple  — vocabulary, key terms, word types
 *   Default — general content, explanations
 */

/* ============ Field classification ============ */

const SKIP_FIELDS = new Set(['id', 'version', 'schemaVersion', 'topic_id', 'related_topics']);

/** Green callouts — positive guidance */
const TIP_FIELDS = new Set([
  'tips_and_tricks', 'golden_rule', 'golden_rules', 'key_notes',
  'key_rules', 'key_facts', 'key_principle', 'critical_rule',
  'useful_shortcuts', 'hierarchy_note',
]);

/** Amber callouts — identification / strategy */
const CUE_FIELDS = new Set([
  'identification_cues', 'identification_strategy', 'what_it_looks_like',
  'solving_strategy', 'signal_words', 'context_clue_types',
]);

/** Red callouts — mistakes / warnings */
const WARN_FIELDS = new Set([
  'common_mistakes', 'common_logical_errors_to_avoid',
]);

/** Blue blocks — formulas / equations */
const FORMULA_FIELDS = new Set([
  'formula', 'formulas', 'key_formulas', 'key_formula', 'basic_formula',
  'fundamental_formula', 'derived_formulas', 'key_equation', 'key_formulas',
  'working_backwards_formula', 'average_speed_rule', 'expected_outcomes_formula',
  'inverse_proportion_formula', 'combined_rate_rule', 'compound_interest',
  'simple_interest', 'magic_triangle',
]);

/** Purple blocks — vocabulary / terms / types */
const VOCAB_FIELDS = new Set([
  'key_vocabulary', 'number_types', 'triangle_types', 'common_polygons',
  'parts_of_speech', 'analogy_relationship_types', 'sequence_types',
  'common_prefixes', 'common_suffixes', 'key_greek_roots', 'key_latin_roots',
  'common_idioms', 'common_proverbs', 'commonly_misspelled_words',
  'examples_of_multiple_meaning_words', 'word_to_maths_translations',
  'word_problem_translations',
]);

/** Structured step methods (render as method cards) */
const METHOD_FIELDS = new Set([
  'hcf_methods', 'lcm_methods', 'methods', 'solving_steps',
  'solution_steps', 'steps',
]);

/** Table-friendly: arrays of objects with consistent keys */
const TABLE_FIELDS = new Set([
  'divisibility_rules', 'probability_rules', 'sign_rules',
  'place_values', 'benchmark_conversions', 'benchmark_fractions',
  'unit_conversions', 'conversions', 'perfect_squares', 'perfect_cubes',
  'pi_approximations', 'bodmas_order', 'proportion_types',
  'question_types', 'common_coding_types', 'syllogism_patterns',
  'common_letter_patterns',
]);

/** Definition objects (key→value pairs) */
const DEFINITION_FIELDS = new Set([
  'definitions', 'properties', 'laws', 'theorems',
  'congruence_conditions', 'similarity_conditions', 'similarity_properties',
  'key_operations', 'key_angle_facts', 'angle_facts',
  'parallel_lines_transversal', 'parallel_perpendicular',
  'pythagoras_theorem', 'prime_factorisation', 'exterior_angle_theorem',
]);

/* ============ Callbacks ============ */

import { generateDiagram } from './diagram-generator.js';

export type SolverCallback = (question: string, subjectId: string) => void;
export type StepsCallback = (example: Record<string, unknown>, subjectId: string, slotEl: HTMLElement) => void;
export type VisualStepsCallback = (example: Record<string, unknown>, subjectId: string, slotEl: HTMLElement) => void;

/* ============ Renderer ============ */

export class SnotesRenderer {
  private solverCallback: SolverCallback | null = null;
  private stepsCallback: StepsCallback | null = null;
  private visualStepsCallback: VisualStepsCallback | null = null;
  private subjectId = '';

  setSolverCallback(cb: SolverCallback): void { this.solverCallback = cb; }
  setStepsCallback(cb: StepsCallback): void { this.stepsCallback = cb; }
  setVisualStepsCallback(cb: VisualStepsCallback): void { this.visualStepsCallback = cb; }
  setSubjectId(id: string): void { this.subjectId = id; }

  /** Render a full snotes JSON document (categories view) */
  renderCategories(data: Record<string, unknown>, container: HTMLElement): void {
    container.innerHTML = '';

    // Exam overview
    const overview = data['exam_overview'] as Record<string, unknown> | undefined;
    if (overview) {
      const section = this.createSection('Exam Overview', 'overview');
      this.renderObject(overview, section);
      container.appendChild(section);
    }

    // Category list
    const categories = data['categories'] as Array<Record<string, unknown>> | undefined;
    if (!categories) { container.textContent = 'No categories found.'; return; }

    const list = el('div', 'snotes-category-list');
    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci];
      const topics = cat['topics'] as Array<Record<string, unknown>> | undefined;
      const catName = (cat['category'] as string) || `Category ${ci + 1}`;

      const card = el('div', 'snotes-category-card');
      const title = el('h3', 'snotes-category-title');
      title.textContent = catName;
      card.appendChild(title);

      if (topics && topics.length > 0) {
        const topicList = el('ul', 'snotes-topic-list');
        for (let ti = 0; ti < topics.length; ti++) {
          const topic = topics[ti];
          const li = el('li', 'snotes-topic-item');
          const link = el('a', 'snotes-topic-link') as HTMLAnchorElement;
          link.textContent = (topic['title'] as string) || `Topic ${ti + 1}`;
          link.href = '#';
          link.dataset.catIdx = String(ci);
          link.dataset.topicIdx = String(ti);
          li.appendChild(link);
          topicList.appendChild(li);
        }
        card.appendChild(topicList);
      }
      list.appendChild(card);
    }
    container.appendChild(list);

    // Exam strategy & quick reference
    for (const [key, label] of [['exam_strategy', 'Exam Strategy'], ['quick_reference', 'Quick Reference']] as const) {
      const section_data = data[key] as Record<string, unknown> | undefined;
      if (section_data) {
        const section = this.createSection(label, key.replace('_', ''));
        this.renderObject(section_data, section);
        container.appendChild(section);
      }
    }
  }

  /** Render a single topic */
  renderTopic(topic: Record<string, unknown>, container: HTMLElement): void {
    container.innerHTML = '';

    const title = el('h2', 'snotes-topic-title');
    title.textContent = (topic['title'] as string) || 'Topic';
    // Curriculum level badge
    const level = topic['curriculum_level'] as string | undefined;
    if (level) {
      const badge = el('span', 'snotes-level-badge');
      badge.textContent = `Level ${level}`;
      title.appendChild(document.createTextNode(' '));
      title.appendChild(badge);
    }
    container.appendChild(title);

    // Concept / description first
    for (const key of ['description', 'concept_explanation', 'concept']) {
      if (topic[key]) {
        const p = el('p', 'snotes-concept');
        p.textContent = topic[key] as string;
        container.appendChild(p);
      }
    }

    // Inline SVG diagram if available for this topic
    const topicTitle = (topic['title'] as string) || '';
    const diagramSvg = generateDiagram(topicTitle);
    if (diagramSvg) {
      const diagramWrap = el('div', 'snotes-diagram');
      diagramWrap.innerHTML = diagramSvg;
      container.appendChild(diagramWrap);
    }

    // Render all other fields with type-aware rendering
    for (const [key, value] of Object.entries(topic)) {
      if (SKIP_FIELDS.has(key)) continue;
      if (['title', 'description', 'concept_explanation', 'concept'].includes(key)) continue;
      if (value === null || value === undefined) continue;
      this.renderField(key, value, container);
    }
  }

  /* ============ Field dispatch ============ */

  private renderField(key: string, value: unknown, parent: HTMLElement): void {
    if (key === 'examples' || key === 'problem_types' || key === 'technique_examples') {
      this.renderExamples(value as Array<Record<string, unknown>>, parent, key);
      return;
    }
    if (TIP_FIELDS.has(key)) { this.renderCallout(key, value, parent, 'tip'); return; }
    if (CUE_FIELDS.has(key)) { this.renderCallout(key, value, parent, 'cue'); return; }
    if (WARN_FIELDS.has(key)) { this.renderCallout(key, value, parent, 'warn'); return; }
    if (FORMULA_FIELDS.has(key)) { this.renderFormulas(key, value, parent); return; }
    if (VOCAB_FIELDS.has(key)) { this.renderVocab(key, value, parent); return; }
    if (TABLE_FIELDS.has(key)) { this.renderTable(key, value, parent); return; }
    if (DEFINITION_FIELDS.has(key)) { this.renderDefinitions(key, value, parent); return; }
    if (METHOD_FIELDS.has(key)) { this.renderMethods(key, value, parent); return; }

    // Generic fallback
    this.renderGeneric(key, value, parent);
  }

  /* ============ Examples ============ */

  private renderExamples(examples: Array<Record<string, unknown>>, parent: HTMLElement, fieldName: string): void {
    const section = this.createSection(humanize(fieldName), 'examples');

    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i];
      const card = el('div', 'snotes-example');

      const q = ex['question'] as string | undefined ?? ex['type'] as string | undefined;
      if (q) {
        const qEl = el('div', 'snotes-example-question');
        const diff = ex['difficulty'] as number | undefined;
        const diffBadge = diff ? ` <span class="snotes-diff-badge snotes-diff-${diff}">${diffLabel(diff)}</span>` : '';
        qEl.innerHTML = `<span class="snotes-q-badge">Q${i + 1}</span> ${esc(q)}${diffBadge}`;
        card.appendChild(qEl);
      }

      const steps = ex['solution_steps'] as string[] | undefined ?? ex['steps'] as string[] | undefined;
      if (steps) {
        const stepsEl = el('ol', 'snotes-example-steps');
        for (const step of steps) {
          const li = el('li');
          li.innerHTML = highlightMath(esc(step));
          stepsEl.appendChild(li);
        }
        card.appendChild(stepsEl);
      }

      const ans = ex['answer'] as string | undefined;
      if (ans) {
        const ansEl = el('div', 'snotes-example-answer');
        ansEl.innerHTML = `<span class="snotes-answer-badge">Answer</span> ${esc(ans)}`;
        card.appendChild(ansEl);
      }

      // Step-by-step button — prefer visual (canvas + graphs) for math,
      // fall back to DOM-based chalkboard for other subjects
      if (steps && steps.length > 0) {
        const slot = el('div', 'snotes-solver-slot');
        const isMath = this.subjectId === 'math' || this.subjectId === 'numerical';

        if (isMath && this.visualStepsCallback) {
          const btn = el('button', 'snotes-solve-btn snotes-steps-btn') as HTMLButtonElement;
          btn.textContent = '\u25B6 Watch it solved';
          btn.addEventListener('click', () => this.visualStepsCallback!(ex, this.subjectId, slot));
          slot.appendChild(btn);
        } else if (this.stepsCallback) {
          const btn = el('button', 'snotes-solve-btn snotes-steps-btn') as HTMLButtonElement;
          btn.textContent = '\u25B6 Watch step-by-step';
          btn.addEventListener('click', () => this.stepsCallback!(ex, this.subjectId, slot));
          slot.appendChild(btn);
        }

        card.appendChild(slot);
      }

      // Remaining fields
      for (const [k, v] of Object.entries(ex)) {
        if (['question', 'solution_steps', 'steps', 'answer', 'type'].includes(k)) continue;
        if (v === null || v === undefined) continue;
        if (typeof v === 'string') {
          const p = el('p', 'snotes-example-extra');
          p.innerHTML = `<strong>${esc(humanize(k))}:</strong> ${highlightMath(esc(v))}`;
          card.appendChild(p);
        } else if (Array.isArray(v) && typeof v[0] === 'string') {
          const p = el('p', 'snotes-example-extra');
          p.innerHTML = `<strong>${esc(humanize(k))}:</strong>`;
          card.appendChild(p);
          card.appendChild(this.renderStringList(v as string[]));
        }
      }

      section.appendChild(card);
    }
    parent.appendChild(section);
  }

  /* ============ Colored callouts ============ */

  private renderCallout(key: string, value: unknown, parent: HTMLElement, kind: 'tip' | 'cue' | 'warn'): void {
    const icons = { tip: '\u2705', cue: '\uD83D\uDD0D', warn: '\u26A0\uFE0F' };
    const section = el('div', `snotes-callout snotes-callout-${kind}`);
    const heading = el('h4', 'snotes-callout-heading');
    heading.textContent = `${icons[kind]} ${humanize(key)}`;
    section.appendChild(heading);

    // Special handling for solving_strategy with worked_example
    if (key === 'solving_strategy' && typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const obj = value as Record<string, unknown>;
      const steps = obj['steps'] as string[] | undefined;
      const workedEx = obj['worked_example'] as Record<string, unknown> | undefined;

      if (steps && Array.isArray(steps)) {
        const ol = el('ol', 'snotes-strategy-steps');
        for (const s of steps) {
          const li = el('li');
          li.innerHTML = highlightMath(esc(s));
          ol.appendChild(li);
        }
        section.appendChild(ol);
      }

      if (workedEx) {
        const exCard = el('div', 'snotes-strategy-example');
        const exLabel = el('div', 'snotes-strategy-example-label');
        exLabel.textContent = '\uD83D\uDCDD Worked Example';
        exCard.appendChild(exLabel);

        const q = workedEx['question'] as string | undefined;
        if (q) {
          const qEl = el('div', 'snotes-strategy-example-q');
          qEl.innerHTML = highlightMath(esc(q));
          exCard.appendChild(qEl);
        }

        const exSteps = workedEx['steps'] as string[] | undefined;
        if (exSteps) {
          const ol = el('ol', 'snotes-strategy-example-steps');
          for (const s of exSteps) {
            const li = el('li');
            li.innerHTML = highlightMath(esc(s));
            ol.appendChild(li);
          }
          exCard.appendChild(ol);
        }

        const ans = workedEx['answer'] as string | undefined;
        if (ans) {
          const ansEl = el('div', 'snotes-strategy-example-answer');
          ansEl.innerHTML = `<span class="snotes-answer-badge">Answer</span> ${highlightMath(esc(ans))}`;
          exCard.appendChild(ansEl);
        }

        section.appendChild(exCard);
      }

      parent.appendChild(section);
      return;
    }

    if (typeof value === 'string') {
      const p = el('p');
      p.textContent = value;
      section.appendChild(p);
    } else if (Array.isArray(value)) {
      if (typeof value[0] === 'string') {
        section.appendChild(this.renderStringList(value as string[]));
      } else if (typeof value[0] === 'object') {
        // Structured (e.g. solving_strategy with steps)
        this.renderObject(value[0] as Record<string, unknown>, section);
      }
    } else if (typeof value === 'object' && value !== null) {
      this.renderObject(value as Record<string, unknown>, section);
    }

    parent.appendChild(section);
  }

  /* ============ Formulas (blue) ============ */

  private renderFormulas(key: string, value: unknown, parent: HTMLElement): void {
    const section = this.createSection(humanize(key), 'formulas');

    if (typeof value === 'string') {
      section.appendChild(formulaBlock(value));
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          section.appendChild(formulaBlock(item));
        } else if (typeof item === 'object' && item !== null) {
          const card = el('div', 'snotes-formula-card');
          this.renderObject(item as Record<string, unknown>, card);
          section.appendChild(card);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      this.renderObject(value as Record<string, unknown>, section);
    }
    parent.appendChild(section);
  }

  /* ============ Vocabulary / types (purple) ============ */

  private renderVocab(key: string, value: unknown, parent: HTMLElement): void {
    const section = el('div', 'snotes-vocab-section');
    const heading = el('h4', 'snotes-section-heading snotes-vocab-heading');
    heading.textContent = humanize(key);
    section.appendChild(heading);

    if (Array.isArray(value)) {
      if (typeof value[0] === 'string') {
        // Render as tag pills
        const tags = el('div', 'snotes-tag-cloud');
        for (const item of value as string[]) {
          const tag = el('span', 'snotes-vocab-tag');
          tag.textContent = item;
          tags.appendChild(tag);
        }
        section.appendChild(tags);
      } else if (typeof value[0] === 'object') {
        // Render as vocab cards (e.g. analogy_relationship_types)
        for (const item of value as Record<string, unknown>[]) {
          const card = el('div', 'snotes-vocab-card');
          const name = (item['type'] as string) ?? (item['name'] as string) ?? '';
          if (name) {
            const label = el('div', 'snotes-vocab-label');
            label.textContent = name;
            card.appendChild(label);
          }
          for (const [k, v] of Object.entries(item)) {
            if (['type', 'name', 'id'].includes(k)) continue;
            if (typeof v === 'string') {
              const p = el('p', 'snotes-vocab-detail');
              p.innerHTML = `<strong>${esc(humanize(k))}:</strong> ${highlightMath(esc(v))}`;
              card.appendChild(p);
            } else if (Array.isArray(v) && typeof v[0] === 'string') {
              const p = el('p', 'snotes-vocab-detail');
              p.innerHTML = `<strong>${esc(humanize(k))}:</strong> ${(v as string[]).map(s => esc(s)).join(', ')}`;
              card.appendChild(p);
            }
          }
          section.appendChild(card);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      this.renderDefinitions(key, value, section);
    }
    parent.appendChild(section);
  }

  /* ============ Tables ============ */

  private renderTable(key: string, value: unknown, parent: HTMLElement): void {
    if (!Array.isArray(value) || value.length === 0 || typeof value[0] !== 'object') {
      this.renderGeneric(key, value, parent);
      return;
    }

    const items = value as Record<string, unknown>[];
    const cols = Object.keys(items[0]).filter(k => !SKIP_FIELDS.has(k));
    if (cols.length === 0) { this.renderGeneric(key, value, parent); return; }

    const section = this.createSection(humanize(key), 'table-section');
    const tableWrap = el('div', 'snotes-table-wrap');
    const table = el('table', 'snotes-table') as HTMLTableElement;

    // Header
    const thead = el('thead');
    const headerRow = el('tr');
    for (const col of cols) {
      const th = el('th');
      th.textContent = humanize(col);
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = el('tbody');
    for (const item of items) {
      const row = el('tr');
      for (const col of cols) {
        const td = el('td');
        const v = item[col];
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          td.innerHTML = highlightMath(esc(String(v)));
        } else if (Array.isArray(v)) {
          td.textContent = (v as string[]).join(', ');
        } else {
          td.textContent = JSON.stringify(v);
        }
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    section.appendChild(tableWrap);
    parent.appendChild(section);
  }

  /* ============ Definitions (blue-tinted) ============ */

  private renderDefinitions(key: string, value: unknown, parent: HTMLElement): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      this.renderGeneric(key, value, parent);
      return;
    }

    const section = this.createSection(humanize(key), 'definitions');
    const dl = el('dl', 'snotes-dl');
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === null || v === undefined) continue;
      const dt = el('dt', 'snotes-dt');
      dt.textContent = humanize(k);
      dl.appendChild(dt);
      const dd = el('dd', 'snotes-dd');
      if (typeof v === 'string') {
        dd.innerHTML = highlightMath(esc(v));
      } else if (Array.isArray(v) && typeof v[0] === 'string') {
        dd.appendChild(this.renderStringList(v as string[]));
      } else if (typeof v === 'object') {
        this.renderObject(v as Record<string, unknown>, dd);
      }
      dl.appendChild(dd);
    }
    section.appendChild(dl);
    parent.appendChild(section);
  }

  /* ============ Methods (step-by-step cards) ============ */

  private renderMethods(key: string, value: unknown, parent: HTMLElement): void {
    const section = this.createSection(humanize(key), 'methods');

    if (Array.isArray(value)) {
      if (typeof value[0] === 'string') {
        const ol = el('ol', 'snotes-steps');
        for (const step of value as string[]) {
          const li = el('li');
          li.innerHTML = highlightMath(esc(step));
          ol.appendChild(li);
        }
        section.appendChild(ol);
      } else {
        for (const item of value as Record<string, unknown>[]) {
          const card = el('div', 'snotes-method-card');
          const name = (item['method'] as string) ?? (item['name'] as string) ?? '';
          const methodSteps = item['steps'] as string[] | undefined;
          if (name) {
            const heading = el('div', 'snotes-method-name');
            heading.textContent = name;
            if (methodSteps && methodSteps.length > 0) {
              const badge = el('span', 'snotes-method-step-count');
              badge.textContent = `${methodSteps.length} step${methodSteps.length === 1 ? '' : 's'}`;
              heading.appendChild(badge);
            }
            card.appendChild(heading);
          }
          if (methodSteps) {
            const ol = el('ol', 'snotes-method-steps');
            for (const s of methodSteps) {
              const li = el('li');
              li.innerHTML = highlightMath(esc(s));
              ol.appendChild(li);
            }
            card.appendChild(ol);
          }
          // Other fields
          for (const [k, v] of Object.entries(item)) {
            if (['method', 'name', 'steps', 'id'].includes(k)) continue;
            if (typeof v === 'string') {
              const p = el('p', 'snotes-method-detail');
              p.innerHTML = `<strong>${esc(humanize(k))}:</strong> ${highlightMath(esc(v))}`;
              card.appendChild(p);
            }
          }
          section.appendChild(card);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      this.renderObject(value as Record<string, unknown>, section);
    }
    parent.appendChild(section);
  }

  /* ============ Generic fallback ============ */

  private renderGeneric(key: string, value: unknown, parent: HTMLElement): void {
    const section = this.createSection(humanize(key));

    if (typeof value === 'string') {
      const p = el('p');
      p.innerHTML = highlightMath(esc(value));
      section.appendChild(p);
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        section.appendChild(this.renderStringList(value as string[]));
      } else if (value.length > 0 && typeof value[0] === 'object') {
        for (const item of value) {
          const card = el('div', 'snotes-card');
          this.renderObject(item as Record<string, unknown>, card);
          section.appendChild(card);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      this.renderObject(value as Record<string, unknown>, section);
    }
    parent.appendChild(section);
  }

  /* ============ Object renderer ============ */

  private renderObject(obj: Record<string, unknown>, parent: HTMLElement): void {
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_FIELDS.has(key)) continue;
      if (value === null || value === undefined) continue;

      if (typeof value === 'string') {
        const p = el('p');
        p.innerHTML = `<strong>${esc(humanize(key))}:</strong> ${highlightMath(esc(value))}`;
        parent.appendChild(p);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        const p = el('p');
        p.innerHTML = `<strong>${esc(humanize(key))}:</strong> ${String(value)}`;
        parent.appendChild(p);
      } else if (Array.isArray(value)) {
        if (value.length === 0) continue;
        if (typeof value[0] === 'string') {
          const label = el('p');
          label.innerHTML = `<strong>${esc(humanize(key))}:</strong>`;
          parent.appendChild(label);
          parent.appendChild(this.renderStringList(value as string[]));
        } else if (typeof value[0] === 'object') {
          const sub = this.createSection(humanize(key));
          for (const item of value) {
            const card = el('div', 'snotes-card');
            this.renderObject(item as Record<string, unknown>, card);
            sub.appendChild(card);
          }
          parent.appendChild(sub);
        }
      } else if (typeof value === 'object') {
        const sub = this.createSection(humanize(key));
        this.renderObject(value as Record<string, unknown>, sub);
        parent.appendChild(sub);
      }
    }
  }

  /* ============ Helpers ============ */

  private renderStringList(items: string[]): HTMLElement {
    const ul = el('ul', 'snotes-list');
    for (const item of items) {
      const li = el('li');
      li.innerHTML = highlightMath(esc(item));
      ul.appendChild(li);
    }
    return ul;
  }

  private createSection(title: string, extraClass?: string): HTMLElement {
    const section = el('div', `snotes-section${extraClass ? ' snotes-' + extraClass : ''}`);
    const h = el('h4', 'snotes-section-heading');
    h.textContent = title;
    section.appendChild(h);
    return section;
  }
}

/* ============ Utility functions ============ */

function el(tag: string, className?: string): HTMLElement {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

/**
 * Highlight math-like content inline with color-coded spans.
 * Operates on already-escaped HTML — only adds span wrappers.
 */
function highlightMath(html: string): string {
  return html
    // Checkmarks and crosses
    .replace(/✓/g, '<span class="hl-good">\u2713</span>')
    .replace(/✗/g, '<span class="hl-bad">\u2717</span>')

    // Arrows
    .replace(/→/g, '<span class="hl-arrow">\u2192</span>')
    .replace(/⟹/g, '<span class="hl-arrow">\u27F9</span>')

    // Inline equations: "something = something" — highlight the whole expression
    // Match: text with = that looks like math (has digits/variables on both sides)
    .replace(/(\b\w[\w\s.²³ⁿ⁻¹×÷±√π]*\s*=\s*[\w\d.²³ⁿ⁻¹×÷±√πθ()\/\[\]\-+]+)/g,
      '<span class="hl-equation">$1</span>')

    // Standalone formulas in parentheses: (a+b)², etc.
    .replace(/(\([^)]{2,30}\)[²³ⁿ]?)/g, '<span class="hl-formula">$1</span>')

    // Superscripts: ², ³, ⁿ, ⁻¹ — make them visually distinct
    .replace(/([²³⁴⁵⁶⁷⁸⁹⁰ⁿ⁻¹]+)/g, '<span class="hl-sup">$1</span>')

    // Greek letters and special math symbols
    .replace(/(π|θ|Σ|Δ)/g, '<span class="hl-greek">$1</span>')

    // Square root symbol
    .replace(/(√)/g, '<span class="hl-op">$1</span>')

    // Math operators (only when surrounded by spaces or digits to avoid false matches)
    .replace(/(\s[×÷±]\s)/g, '<span class="hl-op">$1</span>')

    // Fractions: digit/digit patterns like 1/2, 3/4
    .replace(/(\b\d+\/\d+\b)/g, '<span class="hl-frac">$1</span>')

    // Percentages
    .replace(/(\d+(?:\.\d+)?%)/g, '<span class="hl-pct">$1</span>');
}

function diffLabel(d: number): string {
  if (d === 1) return 'Foundation';
  if (d === 2) return 'Standard';
  if (d === 3) return 'Extension';
  return '';
}

function formulaBlock(text: string): HTMLElement {
  const block = el('div', 'snotes-formula');
  block.textContent = text;
  return block;
}

function looksLikeEquation(text: string): boolean {
  const t = text.toLowerCase();
  if (!t.includes('=')) return false;
  if (!/\bx\b|[^a-z]x[^a-z]|^x[^a-z]|[^a-z]x$/.test(t)) return false;
  const wordCount = t.split(/\s+/).length;
  if (wordCount > 15) return false;
  if (/^(which|what|how|find|if|when|where|who|why|solve|calculate)\b/i.test(text)) {
    if (/^solve\s*[:.]?\s*/i.test(text) && wordCount <= 8) return true;
    return false;
  }
  return true;
}
