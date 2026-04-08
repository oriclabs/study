/**
 * Subjects view — shows subjects for a selected exam (builtin or imported pack).
 */

import type { ContentPackManager, PackMeta } from '../components/content-packs.js';
import { navigate } from '../router.js';

function badge(text: string, color: string): HTMLElement {
  const el = document.createElement('span');
  el.className = `subject-badge subject-badge-${color}`;
  el.textContent = text;
  return el;
}

interface SubjectInfo {
  id: string;
  label: string;
  notesKey: string;
  description?: string;
}

/* No hardcoded subjects — all come from imported packs */

export async function renderSubjects(
  exam: string,
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  // All exams are pack-based now
  const packId = exam.startsWith('pack:') ? exam.slice(5) : exam;
  const packMeta = await packManager.getPack(packId);
  if (!packMeta) {
    container.innerHTML = '<p class="notes-error">Content pack not found. Please import a content pack first.</p>';
    return;
  }
  const examName = packMeta.exam;
  const subjects: SubjectInfo[] = packMeta.subjects.map(s => ({
    id: s.id,
    label: s.label,
    notesKey: s.id,
  }));

  if (subjects.length === 0) {
    container.innerHTML = '<p>No subjects found for this exam.</p>';
    return;
  }

  const heading = document.createElement('h2');
  heading.className = 'subjects-heading';
  heading.textContent = examName;
  container.appendChild(heading);

  // Master cheat sheet button
  const masterBtn = document.createElement('button');
  masterBtn.className = 'subject-btn';
  masterBtn.style.marginBottom = '16px';
  masterBtn.textContent = '\u{1F3AF} Exam Day Master Sheet';
  masterBtn.addEventListener('click', () => navigate({ view: 'master-sheet', exam }));
  container.appendChild(masterBtn);

  const grid = document.createElement('div');
  grid.className = 'subjects-grid';

  const icons = ['\u{1F4D0}', '\u{1F4DA}', '\u{1F522}', '\u{1F4D6}', '\u{1F9EA}', '\u{270D}\uFE0F', '\u{1F4DD}', '\u{1F4CA}'];

  for (let i = 0; i < subjects.length; i++) {
    const sub = subjects[i];
    const card = document.createElement('div');
    card.className = 'subject-card';

    const icon = document.createElement('div');
    icon.className = 'subject-icon';
    icon.textContent = icons[i % icons.length]!;
    card.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'subject-title';
    title.textContent = sub.label;
    card.appendChild(title);

    if (sub.description) {
      const desc = document.createElement('p');
      desc.className = 'subject-desc';
      desc.textContent = sub.description;
      card.appendChild(desc);
    }

    const actions = document.createElement('div');
    actions.className = 'subject-actions';

    const notesBtn = document.createElement('button');
    notesBtn.className = 'subject-btn subject-btn-primary';
    notesBtn.textContent = '\u{1F4D6} Study Notes';
    notesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate({ view: 'notes', exam, subject: sub.notesKey });
    });

    const revisionBtn = document.createElement('button');
    revisionBtn.className = 'subject-btn subject-btn-revision';
    revisionBtn.textContent = '\u26A1 Quick Revision';
    revisionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate({ view: 'revision', exam, subject: sub.notesKey });
    });

    const practiceBtn = document.createElement('button');
    practiceBtn.className = 'subject-btn subject-btn-practice';
    practiceBtn.textContent = '\u270D\uFE0F Practice';
    practiceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate({ view: 'practice', exam, subject: sub.notesKey });
    });

    const examBtn = document.createElement('button');
    examBtn.className = 'subject-btn subject-btn-exam';
    examBtn.textContent = '\u{1F4DD} Mock Exam';
    examBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate({ view: 'exam', exam, subject: sub.notesKey });
    });

    const cheatBtn = document.createElement('button');
    cheatBtn.className = 'subject-btn';
    cheatBtn.textContent = '\u{1F4CB} Cheat Sheet';
    cheatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate({ view: 'cheatsheet', exam, subject: sub.notesKey });
    });

    actions.appendChild(notesBtn);
    actions.appendChild(revisionBtn);
    actions.appendChild(cheatBtn);
    actions.appendChild(practiceBtn);
    actions.appendChild(examBtn);
    card.appendChild(actions);

    // Content badges for imported packs
    if (packMeta) {
      const sm = packMeta.subjects.find(s => s.id === sub.id);
      if (sm) {
        const badges = document.createElement('div');
        badges.className = 'subject-badges';
        if (sm.hasNotes) badges.appendChild(badge('Notes', 'blue'));
        if (sm.practiceCount > 0) badges.appendChild(badge(`${sm.practiceCount} Questions`, 'green'));
        if (sm.mockExamCount > 0) badges.appendChild(badge(`${sm.mockExamCount} Exams`, 'purple'));
        card.appendChild(badges);
      }
    }

    card.addEventListener('click', () => {
      navigate({ view: 'notes', exam, subject: sub.notesKey });
    });

    grid.appendChild(card);
  }

  container.appendChild(grid);
}
