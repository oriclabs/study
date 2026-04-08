/**
 * Progress Dashboard — tracks study progress, scores, streaks, weak topics.
 * Pack-agnostic — works across all imported content.
 */

import type { StudyProgress, TopicScore, StreakData } from '../components/study-progress.js';
import type { ContentPackManager } from '../components/content-packs.js';
import { navigate } from '../router.js';

export async function renderProgress(
  progress: StudyProgress,
  packManager: ContentPackManager,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Loading progress...</div>';

  const stats = await progress.getOverallStats();
  const topicScores = await progress.getTopicScores();
  const packs = await packManager.listPacks();

  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'dash-header';
  header.innerHTML = '<h2 class="dash-title">\u{1F4CA} Progress Dashboard</h2>';
  container.appendChild(header);

  // Stats cards
  const statsGrid = document.createElement('div');
  statsGrid.className = 'dash-stats';
  statsGrid.innerHTML = `
    <div class="dash-stat">
      <div class="dash-stat-num">${stats.streak.currentStreak}</div>
      <div class="dash-stat-label">\u{1F525} Day Streak</div>
    </div>
    <div class="dash-stat">
      <div class="dash-stat-num">${stats.totalAttempts}</div>
      <div class="dash-stat-label">Questions Done</div>
    </div>
    <div class="dash-stat">
      <div class="dash-stat-num">${stats.accuracy}%</div>
      <div class="dash-stat-label">Accuracy</div>
    </div>
    <div class="dash-stat">
      <div class="dash-stat-num">${stats.topicsStudied}</div>
      <div class="dash-stat-label">Topics Studied</div>
    </div>
    <div class="dash-stat dash-stat-warn">
      <div class="dash-stat-num">${stats.wrongCount}</div>
      <div class="dash-stat-label">To Review</div>
    </div>
    <div class="dash-stat">
      <div class="dash-stat-num">${stats.bookmarkCount}</div>
      <div class="dash-stat-label">\u2B50 Bookmarks</div>
    </div>
  `;
  container.appendChild(statsGrid);

  // Quick actions
  const actions = document.createElement('div');
  actions.className = 'dash-actions';
  const actionItems = [
    { label: '\u{1F4DD} Daily Practice', route: { view: 'daily' as const } },
    { label: '\u274C Wrong Answers', route: { view: 'wrong-answers' as const } },
    { label: '\u2B50 Bookmarks', route: { view: 'bookmarks' as const } },
    { label: '\u{1F50D} Search', route: { view: 'search' as const } },
  ];
  for (const item of actionItems) {
    const btn = document.createElement('button');
    btn.className = 'dash-action-btn';
    btn.textContent = item.label;
    btn.addEventListener('click', () => navigate(item.route));
    actions.appendChild(btn);
  }
  container.appendChild(actions);

  // Streak info
  if (stats.streak.longestStreak > 0) {
    const streakInfo = document.createElement('div');
    streakInfo.className = 'dash-streak-info';
    streakInfo.innerHTML = `
      <p>Longest streak: <strong>${stats.streak.longestStreak} days</strong> \u00B7
      Total active days: <strong>${stats.streak.totalDaysActive}</strong></p>
    `;
    container.appendChild(streakInfo);
  }

  // Topic scores by pack/subject
  if (topicScores.length > 0) {
    const scoresSection = document.createElement('div');
    scoresSection.className = 'dash-scores';
    scoresSection.innerHTML = '<h3 class="dash-section-title">Topic Performance</h3>';

    // Group by pack + subject
    const groups = new Map<string, TopicScore[]>();
    for (const score of topicScores) {
      const key = `${score.packId}|${score.subject}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(score);
    }

    for (const [key, scores] of groups) {
      const [packId, subject] = key.split('|');
      const pack = packs.find(p => p.packId === packId);
      const subMeta = pack?.subjects.find(s => s.id === subject);

      const groupEl = document.createElement('div');
      groupEl.className = 'dash-score-group';
      groupEl.innerHTML = `<h4>${esc(pack?.exam ?? packId!)} — ${esc(subMeta?.label ?? subject!)}</h4>`;

      // Sort: weakest first
      scores.sort((a, b) => {
        const aPct = a.attempts > 0 ? a.correct / a.attempts : 0;
        const bPct = b.attempts > 0 ? b.correct / b.attempts : 0;
        return aPct - bPct;
      });

      for (const score of scores) {
        const pct = score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : 0;
        const status = pct >= 80 ? 'mastered' : pct >= 50 ? 'practicing' : 'weak';
        const row = document.createElement('div');
        row.className = `dash-score-row dash-score-${status}`;
        row.innerHTML = `
          <span class="dash-score-topic">${esc(score.topic)}</span>
          <span class="dash-score-bar-wrap">
            <span class="dash-score-bar" style="width:${pct}%"></span>
          </span>
          <span class="dash-score-pct">${pct}%</span>
          <span class="dash-score-detail">${score.correct}/${score.attempts}</span>
        `;
        groupEl.appendChild(row);
      }

      scoresSection.appendChild(groupEl);
    }

    container.appendChild(scoresSection);
  } else {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'dash-empty';
    emptyEl.innerHTML = '<p>No practice data yet. Start practicing to see your progress here!</p>';
    container.appendChild(emptyEl);
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
