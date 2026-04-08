/**
 * Question Generator UI — in-app browser-based question generation.
 * No CLI needed. Works on GitHub Pages.
 */

import type { ContentPackManager, PackMeta } from '../components/content-packs.js';
import { generateQuestions, saveGeneratedQuestions, type GeneratorConfig } from '../components/question-generator.js';
import { showToast, showModal } from '../components/modal.js';

export async function renderGenerator(
  packManager: ContentPackManager,
  packId: string,
  container: HTMLElement,
): Promise<void> {
  const meta = await packManager.getPack(packId);
  if (!meta) {
    container.innerHTML = '<div class="notes-error">Pack not found.</div>';
    return;
  }

  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'gen-header';
  header.innerHTML = `
    <h2 class="gen-title">\u{2699}\uFE0F Generate Questions</h2>
    <p class="gen-subtitle">${esc(meta.exam)} — generate additional practice questions</p>
  `;
  container.appendChild(header);

  // Current question counts
  const countsEl = document.createElement('div');
  countsEl.className = 'gen-counts';
  countsEl.innerHTML = '<h3>Current Question Bank</h3>';
  const countsGrid = document.createElement('div');
  countsGrid.className = 'gen-counts-grid';
  for (const subj of meta.subjects) {
    countsGrid.innerHTML += `
      <div class="gen-count-card">
        <span class="gen-count-num">${subj.practiceCount}</span>
        <span class="gen-count-label">${esc(subj.label)}</span>
      </div>
    `;
  }
  countsEl.appendChild(countsGrid);
  container.appendChild(countsEl);

  // Generator form
  const form = document.createElement('div');
  form.className = 'gen-form';
  form.innerHTML = '<h3>Generate New Questions</h3>';

  // Subject selector
  const subjectRow = createRow('Subject');
  const subjectSelect = document.createElement('select');
  subjectSelect.className = 'gen-select';
  const genSubjects = meta.subjects.filter(s => ['math', 'quantitative', 'verbal', 'reading'].includes(s.id));
  for (const s of genSubjects) {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.label;
    subjectSelect.appendChild(opt);
  }
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All Subjects';
  subjectSelect.insertBefore(allOpt, subjectSelect.firstChild);
  subjectSelect.value = 'all';
  subjectRow.appendChild(subjectSelect);
  form.appendChild(subjectRow);

  // Target count
  const countRow = createRow('Questions per subject');
  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.className = 'gen-input';
  countInput.min = '10';
  countInput.max = '500';
  countInput.value = '100';
  countRow.appendChild(countInput);

  // Mock exam shortcut
  const mockLabel = document.createElement('span');
  mockLabel.className = 'gen-hint';
  mockLabel.textContent = '(or target mock exams:)';
  countRow.appendChild(mockLabel);
  const mockInput = document.createElement('input');
  mockInput.type = 'number';
  mockInput.className = 'gen-input gen-input-sm';
  mockInput.min = '1';
  mockInput.max = '50';
  mockInput.value = '';
  mockInput.placeholder = 'e.g. 25';
  mockInput.addEventListener('input', () => {
    const mocks = parseInt(mockInput.value);
    if (mocks > 0) {
      // 30 questions per mock, 1.3 buffer for overlap
      countInput.value = String(Math.ceil(mocks * 30 * 1.3));
    }
  });
  countRow.appendChild(mockInput);
  form.appendChild(countRow);

  // Difficulty distribution
  const diffRow = createRow('Difficulty');
  const diffSelect = document.createElement('select');
  diffSelect.className = 'gen-select';
  diffSelect.innerHTML = `
    <option value="balanced">Balanced (30% Easy, 50% Medium, 20% Hard)</option>
    <option value="easy">Easy Focus (50% Easy, 40% Medium, 10% Hard)</option>
    <option value="hard">Hard Focus (10% Easy, 40% Medium, 50% Hard)</option>
  `;
  diffRow.appendChild(diffSelect);
  form.appendChild(diffRow);

  // Style
  const styleRow = createRow('Test Style');
  const styleSelect = document.createElement('select');
  styleSelect.className = 'gen-select';
  styleSelect.innerHTML = '<option value="mixed">Mixed (ACER + Edutest)</option>';
  if (meta.testStyles) {
    for (const s of meta.testStyles) {
      styleSelect.innerHTML += `<option value="${s.id}">${esc(s.label)} only</option>`;
    }
  }
  styleRow.appendChild(styleSelect);
  form.appendChild(styleRow);

  // Append vs replace
  const appendRow = createRow('Mode');
  const appendSelect = document.createElement('select');
  appendSelect.className = 'gen-select';
  appendSelect.innerHTML = `
    <option value="append">Add to existing questions</option>
    <option value="replace">Replace all generated (keep imports)</option>
  `;
  appendRow.appendChild(appendSelect);
  form.appendChild(appendRow);

  // Generate button
  const btnRow = document.createElement('div');
  btnRow.className = 'gen-btn-row';
  const genBtn = document.createElement('button');
  genBtn.className = 'gen-btn';
  genBtn.textContent = '\u{26A1} Generate Questions';

  const statusEl = document.createElement('div');
  statusEl.className = 'gen-status';

  genBtn.addEventListener('click', async () => {
    const targetCount = parseInt(countInput.value) || 100;
    const subjects = subjectSelect.value === 'all'
      ? genSubjects.map(s => s.id)
      : [subjectSelect.value];
    const difficulty = diffSelect.value as GeneratorConfig['difficulty'];
    const style = styleSelect.value as GeneratorConfig['style'];
    const append = appendSelect.value === 'append';

    genBtn.disabled = true;
    genBtn.textContent = 'Generating...';
    statusEl.innerHTML = '';

    let totalGenerated = 0;

    for (const subjectId of subjects) {
      statusEl.innerHTML += `<p>Generating ${targetCount} for ${subjectId}...</p>`;

      // Map subject IDs to generator subjects
      const genSubject = subjectId === 'reading' ? 'verbal' as const
        : subjectId as GeneratorConfig['subject'];

      const questions = generateQuestions({
        subject: genSubject,
        targetUnique: targetCount,
        difficulty,
        style,
      });

      const added = await saveGeneratedQuestions(packManager, packId, subjectId, questions, append);
      totalGenerated += added;
      statusEl.innerHTML += `<p class="gen-success">\u2713 ${subjectId}: ${added} new unique questions added</p>`;
    }

    genBtn.disabled = false;
    genBtn.textContent = '\u{26A1} Generate Questions';

    showToast(`Generated ${totalGenerated} new questions`, { type: 'success' });

    // Refresh counts
    renderGenerator(packManager, packId, container);
  });

  btnRow.appendChild(genBtn);
  form.appendChild(btnRow);
  form.appendChild(statusEl);

  container.appendChild(form);

  // Info box
  const info = document.createElement('div');
  info.className = 'gen-info';
  info.innerHTML = `
    <h4>\u{2139}\uFE0F How it works</h4>
    <ul>
      <li>Questions are generated from templates with randomized numbers/values</li>
      <li>Each question is checked for uniqueness — duplicates are skipped</li>
      <li>Generated questions are saved to your browser (IndexedDB) alongside imported ones</li>
      <li>For 25 mock exams: generate ~975 questions per subject (25 × 30 × 1.3 buffer)</li>
      <li>Run multiple times to keep adding more unique questions</li>
    </ul>
  `;
  container.appendChild(info);
}

function createRow(label: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'gen-row';
  const lbl = document.createElement('label');
  lbl.className = 'gen-label';
  lbl.textContent = label;
  row.appendChild(lbl);
  return row;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
