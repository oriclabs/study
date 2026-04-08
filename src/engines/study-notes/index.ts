import type { StudyNotes, NotesSection, NotesItem } from '@core/types/study-notes.js';
import type { SubjectModule } from '@core/types/subject.js';
import type { TopicNode } from '@core/types/topic.js';
import type { MistakeCategory } from '@core/types/mistake.js';
import type { ContentIndex } from '@engines/content-index/index.js';

/**
 * StudyNotes engine — aggregates existing runtime data into a structured
 * per-subject or per-topic reference document. No new content required;
 * notes are built on demand from:
 *   - Subject topic graphs
 *   - SubjectModule.allStrategies() (strategy metadata with tradeoffs)
 *   - ContentIndex (related lessons)
 *   - Shared mistake taxonomy
 *
 * Output is a serializable StudyNotes object that the shell renders into
 * a modal and the PrintEngine can serialize as a printable HTML sheet.
 */

const MISTAKE_DESCRIPTIONS: Record<MistakeCategory, string> = {
  'sign-error': 'Flipping + and − by accident. Always check signs when moving terms across the equals sign or squaring.',
  'arithmetic-slip': 'The method is right but a small calculation is wrong. Verify intermediate steps, especially multiplication.',
  'wrong-formula': 'Picked a formula that doesn\'t fit the problem. Before applying, list what you know and what you need.',
  'misread-question': 'Solved a different question than the one asked. Underline the exact quantity being asked for.',
  'confused-similar-concept': 'Mixed up two related ideas (mean vs median, affect vs effect). Check the precise definition.',
  'incomplete-answer': 'Correct as far as it goes, but missing parts. Quadratics have TWO roots. Remember the ±.',
  'unit-error': 'Wrong or missing units. Convert everything to a single unit system BEFORE calculating.',
  'off-by-one': 'Boundary counting error. Inclusive ranges need +1; exclusive don\'t.',
  'procedural-skip': 'Skipped a step that matters. After squaring both sides, verify the answer in the original equation.',
  'notation-error': 'Right value, wrong form. Write answers in the format the question expects (e.g. f(x) = 5, not just 5).',
};

export class StudyNotesEngine {
  constructor(
    private subjects: Map<string, SubjectModule>,
    private contentIndex: ContentIndex,
  ) {}

  /** Build complete study notes for an entire subject. */
  buildSubjectNotes(subjectId: string): StudyNotes | null {
    const subject = this.subjects.get(subjectId);
    if (!subject) return null;

    const sections: NotesSection[] = [];

    // 1. Topic outline (from the topic graph)
    sections.push(this.buildTopicOutline(subject));

    // 2. Strategies (if the subject has them)
    const strategySection = this.buildStrategiesSection(subject);
    if (strategySection) sections.push(strategySection);

    // 3. Formulas extracted from strategies
    const formulaSection = this.buildFormulasSection(subject);
    if (formulaSection) sections.push(formulaSection);

    // 4. Common mistakes relevant to this subject
    const mistakeSection = this.buildMistakesSection(subject);
    if (mistakeSection) sections.push(mistakeSection);

    // 5. All lessons in this subject
    const lessonSection = this.buildLessonsSection(subjectId);
    if (lessonSection) sections.push(lessonSection);

    return {
      id: `notes.${subjectId}`,
      subjectId,
      title: `${subject.displayName} — Study Notes`,
      sections,
      generatedAt: Date.now(),
    };
  }

  /** Build focused notes for a single topic within a subject. */
  buildTopicNotes(subjectId: string, topicId: string): StudyNotes | null {
    const subject = this.subjects.get(subjectId);
    if (!subject) return null;
    const topicNode = subject.topics.nodes[topicId];
    if (!topicNode) return null;

    const sections: NotesSection[] = [];

    // 1. Prerequisites
    if (topicNode.prereqs.length > 0) {
      sections.push({
        kind: 'prereqs',
        heading: 'Prerequisites',
        items: topicNode.prereqs.map(pid => ({
          title: subject.topics.nodes[pid]?.title ?? pid,
          body: `Make sure you're comfortable with this before tackling ${topicNode.title}.`,
        })),
      });
    }

    // 2. Strategies that apply to this topic
    const stratSection = this.buildStrategiesSection(subject, topicId);
    if (stratSection) sections.push(stratSection);

    // 3. Formulas for this topic (from applicable strategies)
    const formulaSection = this.buildFormulasSection(subject, topicId);
    if (formulaSection) sections.push(formulaSection);

    // 4. Lessons on this topic
    const lessonItems: NotesItem[] = this.contentIndex
      .all()
      .filter(l => l.topic === topicId)
      .map(l => ({
        title: l.title,
        body: (l.objectives && l.objectives.length > 0) ? l.objectives.join(' · ') : '',
        lessonRef: l.id,
      }));
    if (lessonItems.length > 0) {
      sections.push({
        kind: 'lessons',
        heading: 'Lessons on this topic',
        items: lessonItems,
      });
    }

    // 5. Sub-topics
    if (topicNode.children && topicNode.children.length > 0) {
      sections.push({
        kind: 'topic-outline',
        heading: 'Sub-topics',
        items: topicNode.children.map(cid => ({
          title: subject.topics.nodes[cid]?.title ?? cid,
          body: cid,
        })),
      });
    }

    return {
      id: `notes.${subjectId}.${topicId}`,
      subjectId,
      topicId,
      title: `${topicNode.title} — Notes`,
      sections,
      generatedAt: Date.now(),
    };
  }

  // ---------------- section builders ----------------

  private buildTopicOutline(subject: SubjectModule): NotesSection {
    const items: NotesItem[] = subject.topics.roots.map(rid => {
      const node = subject.topics.nodes[rid];
      const children = node?.children ?? [];
      return {
        title: node?.title ?? rid,
        body: children.length > 0 ? `${children.length} sub-topics` : '',
        preconditions: children.map(cid => subject.topics.nodes[cid]?.title ?? cid),
      };
    });
    return {
      kind: 'topic-outline',
      heading: 'Topic outline',
      items,
    };
  }

  private buildStrategiesSection(subject: SubjectModule, topicId?: string): NotesSection | null {
    if (!subject.allStrategies) return null;
    let strategies = subject.allStrategies();
    if (topicId) {
      strategies = strategies.filter(s =>
        s.metadata.appliesTo.some(pt => this.topicMatchesProblemType(topicId, pt))
      );
    }
    if (strategies.length === 0) return null;

    const items: NotesItem[] = strategies.map(s => {
      const m = s.metadata;
      return {
        title: m.name,
        body: m.shortDescription,
        whenToUse: `Builds: ${m.tradeoffs.builds.join(', ')}`,
        tradeoffs: [
          `Speed: ${m.tradeoffs.speed}`,
          `Generality: ${m.tradeoffs.generality}`,
          `Accuracy: ${m.tradeoffs.accuracy}`,
          ...(m.tradeoffs.failsWhen ? [`Fails when: ${m.tradeoffs.failsWhen}`] : []),
        ],
        ...(m.workedExampleId ? { lessonRef: m.workedExampleId } : {}),
      };
    });

    return {
      kind: 'strategies',
      heading: topicId ? 'Strategies for this topic' : 'All strategies',
      items,
    };
  }

  private buildFormulasSection(subject: SubjectModule, topicId?: string): NotesSection | null {
    if (!subject.allStrategies) return null;
    let strategies = subject.allStrategies();
    if (topicId) {
      strategies = strategies.filter(s =>
        s.metadata.appliesTo.some(pt => this.topicMatchesProblemType(topicId, pt))
      );
    }

    // Extract formulas from strategy shortDescriptions where we can detect them.
    // Simple heuristic: look for "=" with surrounding math.
    const formulaRe = /([a-zA-Z]\w*\s*=\s*[^.,;]{3,80})/;
    const items: NotesItem[] = [];
    const seen = new Set<string>();
    for (const s of strategies) {
      const desc = s.metadata.shortDescription;
      const match = desc.match(formulaRe);
      if (match && match[1]) {
        const formula = match[1].trim().replace(/[\.]$/, '');
        if (!seen.has(formula)) {
          seen.add(formula);
          items.push({
            title: s.metadata.name,
            formula,
            body: desc,
          });
        }
      }
    }
    if (items.length === 0) return null;
    return {
      kind: 'formulas',
      heading: topicId ? 'Key formulas' : 'Key formulas across the subject',
      items,
    };
  }

  private buildMistakesSection(subject: SubjectModule): NotesSection | null {
    // Collect all mistake categories referenced by this subject's strategies.
    const relevant = new Set<MistakeCategory>();
    if (subject.allStrategies) {
      for (const s of subject.allStrategies()) {
        for (const cat of s.metadata.commonMistakes ?? []) {
          relevant.add(cat as MistakeCategory);
        }
      }
    }

    // Subjects without strategies still get the universal mistakes.
    if (relevant.size === 0) {
      for (const cat of Object.keys(MISTAKE_DESCRIPTIONS) as MistakeCategory[]) {
        relevant.add(cat);
      }
    }

    const items: NotesItem[] = [...relevant]
      .sort()
      .map(cat => ({
        title: this.humanizeMistake(cat),
        body: MISTAKE_DESCRIPTIONS[cat] ?? '',
        mistakeCategory: cat,
      }));

    if (items.length === 0) return null;
    return {
      kind: 'mistakes',
      heading: 'Common mistakes to avoid',
      items,
    };
  }

  private buildLessonsSection(subjectId: string): NotesSection | null {
    const refs = this.contentIndex.bySubjectKey(subjectId);
    if (refs.length === 0) return null;

    // Group lessons by topic for better reading flow.
    const byTopic = new Map<string, typeof refs>();
    for (const r of refs) {
      if (!byTopic.has(r.topic)) byTopic.set(r.topic, []);
      byTopic.get(r.topic)!.push(r);
    }

    const items: NotesItem[] = [];
    for (const [topic, lessons] of byTopic) {
      items.push({
        title: topic,
        body: lessons.map(l => l.title).join(' · '),
      });
    }
    return {
      kind: 'lessons',
      heading: `Lessons (${refs.length} total)`,
      items,
    };
  }

  // ---------------- helpers ----------------

  private topicMatchesProblemType(topicId: string, problemType: string): boolean {
    // Heuristic: problem types are often a substring of topic IDs (e.g.
    // problemType="quadratic" matches topicId="algebra.quadratics") or
    // the topic's leaf name.
    if (topicId.includes(problemType)) return true;
    const leaf = topicId.split('.').pop() ?? '';
    return leaf.includes(problemType) || problemType.includes(leaf);
  }

  private humanizeMistake(cat: MistakeCategory): string {
    return cat.split('-').map(w => w[0]!.toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Serialize notes to print-friendly HTML. Standalone document suitable
   * for window.open() or file download. Complements the modal display.
   */
  renderHtml(notes: StudyNotes): string {
    const css = `
      body { font-family: Georgia, "Times New Roman", serif; max-width: 820px; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.55; color: #1a1a1a; }
      h1 { color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 0.4em; margin-bottom: 0.3em; font-size: 2.1em; }
      h2 { color: #0f3460; margin-top: 2.2em; border-bottom: 1px solid #ccc; padding-bottom: 0.2em; font-size: 1.3em; }
      .item { padding: 0.9em 1.1em; margin: 0.7em 0; background: #f7f7fb; border-left: 3px solid #0f3460; border-radius: 4px; page-break-inside: avoid; }
      .item-title { font-weight: 700; color: #0f3460; font-size: 1.02em; }
      .item-body { margin: 0.4em 0; font-size: 0.92em; }
      .formula { background: #fff; border: 1px solid #ccc; padding: 0.6em 1em; margin: 0.5em 0; border-radius: 4px; font-family: "Cambria Math", Cambria, serif; font-size: 1.05em; }
      .when { font-size: 0.82em; color: #666; font-style: italic; margin-top: 0.3em; }
      .tradeoffs { display: flex; flex-wrap: wrap; gap: 0.4em; font-size: 0.75em; margin-top: 0.4em; }
      .tradeoffs span { background: #fff; border: 1px solid #ccc; padding: 2px 8px; border-radius: 10px; color: #444; }
      .generated { margin-top: 3em; color: #888; font-size: 0.8em; text-align: center; border-top: 1px solid #ddd; padding-top: 1em; }
      @media print { body { max-width: 100%; } .item { page-break-inside: avoid; } }
    `;
    const sectionHtml = notes.sections.map(s => `
      <h2>${esc(s.heading)}</h2>
      ${s.items.map(item => `
        <div class="item">
          <div class="item-title">${esc(item.title)}</div>
          ${item.formula ? `<div class="formula">${esc(item.formula)}</div>` : ''}
          ${item.body ? `<div class="item-body">${esc(item.body)}</div>` : ''}
          ${item.whenToUse ? `<div class="when">${esc(item.whenToUse)}</div>` : ''}
          ${item.tradeoffs && item.tradeoffs.length > 0 ? `<div class="tradeoffs">${item.tradeoffs.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
      `).join('')}
    `).join('');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(notes.title)}</title>
  <style>${css}</style>
</head>
<body>
  <h1>${esc(notes.title)}</h1>
  ${sectionHtml}
  <div class="generated">Generated ${new Date(notes.generatedAt).toLocaleString()}</div>
</body>
</html>`;
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
