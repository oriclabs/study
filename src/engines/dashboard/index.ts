import type { Progress } from '@engines/progress/index.js';
import type { Feedback } from '@engines/feedback/index.js';
import type { Gamification } from '@engines/gamification/index.js';
import type { CurriculumEngine } from '@engines/curriculum/index.js';

/**
 * Dashboard exporter (Phase 11 Tier 1 — offline export).
 * Builds HTML/JSON reports from progress + mistakes + gamification
 * for parents and teachers. Tier 2 (cloud sync with share codes)
 * is stubbed; the export format is identical so swapping in network
 * sync later requires no format changes.
 */

export interface DashboardReport {
  generatedAt: string;
  student: { level: number; xp: number; streak: number };
  overall: { attempts: number; correct: number; accuracy: number };
  weakTopics: { topic: string; mastery: number; attempts: number }[];
  strongTopics: { topic: string; mastery: number; attempts: number }[];
  topMistakes: { category: string; count: number }[];
  badges: string[];
  curriculumId: string | null;
  curriculumName: string | null;
}

/** Unit-level view of progress within a curriculum, for the in-app mastery dashboard. */
export interface CurriculumMasteryReport {
  curriculumId: string;
  curriculumName: string;
  units: CurriculumUnitMastery[];
  totalCovered: number;
  totalAttempted: number;
  averageMastery: number;
}

export interface CurriculumUnitMastery {
  unitId: string;
  unitTitle: string;
  term?: number;
  topics: {
    topicId: string;
    mastery: number;
    attempts: number;
    lastSeen: number;
    status: 'mastered' | 'practicing' | 'new' | 'weak';
  }[];
  unitMastery: number;
}

export class DashboardExporter {
  constructor(
    private progress: Progress,
    private feedback: Feedback,
    private gamification: Gamification,
    private curriculum: CurriculumEngine,
  ) {}

  /** Per-curriculum mastery view: walks the curriculum's units and attaches progress to each topic. */
  async buildCurriculumMastery(curriculumId?: string): Promise<CurriculumMasteryReport | null> {
    const cur = curriculumId
      ? await this.curriculum.get(curriculumId)
      : await this.curriculum.getSelected();
    if (!cur) return null;

    const units: CurriculumUnitMastery[] = cur.units.map(unit => {
      const topics = unit.topics.map(topicId => {
        const rec = this.progress.get(topicId);
        const mastery = rec?.mastery ?? 0;
        const attempts = rec?.attempts ?? 0;
        let status: 'mastered' | 'practicing' | 'new' | 'weak';
        if (attempts === 0) status = 'new';
        else if (mastery >= 0.85) status = 'mastered';
        else if (mastery >= 0.5) status = 'practicing';
        else status = 'weak';
        return {
          topicId,
          mastery,
          attempts,
          lastSeen: rec?.lastSeen ?? 0,
          status,
        };
      });

      const attempted = topics.filter(t => t.attempts > 0);
      const unitMastery = attempted.length === 0
        ? 0
        : attempted.reduce((s, t) => s + t.mastery, 0) / attempted.length;

      return {
        unitId: unit.id,
        unitTitle: unit.title,
        ...(unit.term !== undefined ? { term: unit.term } : {}),
        topics,
        unitMastery,
      };
    });

    const allTopics = units.flatMap(u => u.topics);
    const attempted = allTopics.filter(t => t.attempts > 0);
    const averageMastery = attempted.length === 0
      ? 0
      : attempted.reduce((s, t) => s + t.mastery, 0) / attempted.length;

    return {
      curriculumId: cur.id,
      curriculumName: cur.displayName,
      units,
      totalCovered: allTopics.length,
      totalAttempted: attempted.length,
      averageMastery,
    };
  }

  async buildReport(): Promise<DashboardReport> {
    const progress = this.progress.all();
    const totalAttempts = progress.reduce((n, t) => n + t.attempts, 0);
    const totalCorrect = progress.reduce((n, t) => n + t.correct, 0);
    const accuracy = totalAttempts === 0 ? 0 : totalCorrect / totalAttempts;

    const cur = await this.curriculum.getSelected();
    const mistakes = await this.feedback.topMistakes(10);
    const game = this.gamification.getState();

    const sorted = [...progress].filter(p => p.attempts >= 2).sort((a, b) => a.mastery - b.mastery);
    return {
      generatedAt: new Date().toISOString(),
      student: { level: game.level, xp: game.xp, streak: game.currentStreak },
      overall: { attempts: totalAttempts, correct: totalCorrect, accuracy },
      weakTopics: sorted.slice(0, 5).map(t => ({ topic: t.topic, mastery: t.mastery, attempts: t.attempts })),
      strongTopics: sorted.slice(-5).reverse().map(t => ({ topic: t.topic, mastery: t.mastery, attempts: t.attempts })),
      topMistakes: mistakes.map(m => ({ category: m.category, count: m.count })),
      badges: game.badges,
      curriculumId: cur?.id ?? null,
      curriculumName: cur?.displayName ?? null,
    };
  }

  async renderHtml(): Promise<string> {
    const r = await this.buildReport();
    const pct = (n: number) => `${Math.round(n * 100)}%`;
    const bar = (n: number, color: string) =>
      `<div style="background:#eee;border-radius:4px;height:8px;overflow:hidden"><div style="background:${color};height:100%;width:${Math.round(n * 100)}%"></div></div>`;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Study — Progress Report</title>
<style>
  body { font-family: -apple-system, Segoe UI, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #222; line-height: 1.5; }
  h1 { color: #0f3460; margin-bottom: 0.2em; font-size: 2em; }
  .subtitle { color: #888; margin-bottom: 2em; }
  .card { background: #f7f7fb; border: 1px solid #e4e4ef; border-radius: 8px; padding: 1rem 1.2rem; margin: 1em 0; }
  .card h2 { margin-top: 0; color: #0f3460; font-size: 1.2em; }
  .stat { display: inline-block; margin-right: 2em; }
  .stat strong { display: block; font-size: 1.8em; color: #0f3460; }
  .stat .label { font-size: 0.75em; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
  .topic-row { display: grid; grid-template-columns: 1fr 80px 60px; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 0.9em; }
  .topic-row:last-child { border-bottom: none; }
  .mistake { display: inline-block; background: #fff; border: 1px solid #e4e4ef; border-radius: 4px; padding: 4px 10px; margin: 3px; font-size: 0.85em; }
  .badge { display: inline-block; background: linear-gradient(135deg, #0f3460, #d32f2f); color: white; padding: 6px 12px; border-radius: 16px; margin: 3px; font-size: 0.8em; }
  @media print { body { max-width: 100%; } }
</style>
</head>
<body>
  <h1>Progress Report</h1>
  <div class="subtitle">Generated ${new Date(r.generatedAt).toLocaleString()}${r.curriculumName ? ` · ${r.curriculumName}` : ''}</div>

  <div class="card">
    <h2>Overall</h2>
    <div class="stat"><strong>${r.student.level}</strong><div class="label">Level</div></div>
    <div class="stat"><strong>${r.student.xp}</strong><div class="label">XP</div></div>
    <div class="stat"><strong>${r.student.streak}</strong><div class="label">Day streak</div></div>
    <div class="stat"><strong>${pct(r.overall.accuracy)}</strong><div class="label">Accuracy</div></div>
    <div class="stat"><strong>${r.overall.correct}/${r.overall.attempts}</strong><div class="label">Correct</div></div>
  </div>

  ${r.weakTopics.length > 0 ? `
  <div class="card">
    <h2>Topics to review</h2>
    ${r.weakTopics.map(t => `
      <div class="topic-row">
        <div>${t.topic}</div>
        ${bar(t.mastery, '#d32f2f')}
        <div>${pct(t.mastery)}</div>
      </div>
    `).join('')}
  </div>` : ''}

  ${r.strongTopics.length > 0 ? `
  <div class="card">
    <h2>Strengths</h2>
    ${r.strongTopics.map(t => `
      <div class="topic-row">
        <div>${t.topic}</div>
        ${bar(t.mastery, '#0f3460')}
        <div>${pct(t.mastery)}</div>
      </div>
    `).join('')}
  </div>` : ''}

  ${r.topMistakes.length > 0 ? `
  <div class="card">
    <h2>Common mistake patterns</h2>
    ${r.topMistakes.map(m => `<span class="mistake">${m.category} (×${m.count})</span>`).join('')}
  </div>` : ''}

  ${r.badges.length > 0 ? `
  <div class="card">
    <h2>Badges earned</h2>
    ${r.badges.map(b => `<span class="badge">${b}</span>`).join('')}
  </div>` : ''}

</body>
</html>`;
  }

  /** Tier 2 placeholder: produces an opaque share code + payload for cloud sync.
   *  Real implementation would POST to a Cloudflare Worker / Supabase endpoint. */
  async generateShareCode(): Promise<{ code: string; payload: DashboardReport }> {
    const report = await this.buildReport();
    // Simple 8-char code derived from timestamp + hash
    const ts = Date.now().toString(36).toUpperCase();
    const hash = (report.overall.attempts * 7 + report.student.level * 31).toString(36).toUpperCase();
    return { code: `${ts}-${hash}`.slice(0, 10), payload: report };
  }
}
