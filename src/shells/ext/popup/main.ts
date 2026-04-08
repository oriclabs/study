/**
 * Extension popup — quick launcher + stats + due topics.
 * Opens the side panel for the full app.
 */
import { createExtPlatform } from '@platform/ext/index.js';
import { Progress } from '@engines/progress/index.js';
import { SRScheduler } from '@engines/sr/index.js';
import { Feedback } from '@engines/feedback/index.js';

declare const chrome: {
  runtime: { sendMessage(msg: unknown): Promise<unknown> };
  windows?: { getCurrent(): Promise<{ id: number }> };
  sidePanel?: { open(opts: { windowId: number }): Promise<void> };
};

const platform = createExtPlatform('popup');
const progress = new Progress(platform.storage);
const sr = new SRScheduler(platform.storage);
const feedback = new Feedback(platform.storage);

const statsEl = document.getElementById('stats') as HTMLDivElement;
const dueListEl = document.getElementById('due-list') as HTMLUListElement;
const openBtn = document.getElementById('open-sidepanel-btn') as HTMLButtonElement;

async function boot() {
  await Promise.all([progress.load(), sr.load(), feedback.load()]);
  renderStats();
  renderDue();
}

function renderStats() {
  const all = progress.all();
  if (all.length === 0) {
    statsEl.innerHTML = '<div>Welcome! Open the full app to start learning.</div>';
    return;
  }
  const attempts = all.reduce((n, t) => n + t.attempts, 0);
  const correct = all.reduce((n, t) => n + t.correct, 0);
  const pct = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
  statsEl.innerHTML = `
    <div><strong>${correct}/${attempts}</strong> · ${pct}% correct</div>
    <div style="color:var(--muted);margin-top:4px">${all.length} topics tracked</div>
  `;
}

async function renderDue() {
  const due = await sr.due();
  if (due.length === 0) {
    dueListEl.innerHTML = '<li class="muted">No topics due.</li>';
    return;
  }
  dueListEl.innerHTML = due
    .slice(0, 5)
    .map(r => `<li>${r.topic.split('.').pop()}</li>`)
    .join('');
}

openBtn.addEventListener('click', async () => {
  try {
    const win = await chrome.windows?.getCurrent();
    if (win && chrome.sidePanel) {
      await chrome.sidePanel.open({ windowId: win.id });
      window.close();
    } else {
      await chrome.runtime.sendMessage({ type: 'open-sidepanel' });
      window.close();
    }
  } catch (e) {
    console.error(e);
  }
});

boot().catch(err => {
  statsEl.textContent = `Failed to load: ${err.message}`;
});
