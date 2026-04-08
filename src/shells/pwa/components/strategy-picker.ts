/**
 * Strategy picker — shows applicable strategies for a classified problem,
 * lets the user pick one (or two for comparison), then plays the lesson.
 *
 * Builds its own DOM — no dependency on pre-existing HTML elements.
 *
 * Flow:
 *   1. User types equation + clicks "Pick a method"
 *   2. Subject.identify() classifies the input → Problem
 *   3. Strategy cards rendered with applicability, badges, tradeoffs
 *   4. User selects one (or two for comparison)
 *   5. "Play selected" generates a lesson and plays it on the canvas
 */

import type { App } from '@engines/app/index.js';
import type { SubjectModule } from '@core/types/subject.js';
import type { Problem, StrategyMatch, RankingMode } from '@core/types/strategy.js';
import type { Lesson } from '@core/types/lesson.js';

export class StrategyPicker {
  private panel: HTMLElement;
  private listEl: HTMLElement;
  private problemEcho: HTMLElement;
  private problemInfo: HTMLElement;
  private playBtn: HTMLButtonElement;
  private explainBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;

  private app: App;
  private currentProblem: Problem | null = null;
  private currentSubject: SubjectModule | null = null;
  private selectedIds: Set<string> = new Set();
  private rankingMode: RankingMode = 'fastest';

  /** Called when a lesson should be played on the canvas. */
  onPlay: ((lesson: Lesson) => void) | null = null;

  constructor(app: App) {
    this.app = app;

    // Build the panel DOM
    this.panel = document.createElement('section');
    this.panel.className = 'practice-panel';
    this.panel.hidden = true;
    this.panel.setAttribute('aria-label', 'Strategy picker');

    // Header
    const header = document.createElement('div');
    header.className = 'practice-header';
    const h2 = document.createElement('h2');
    h2.textContent = 'Choose a method';
    this.problemInfo = document.createElement('span');
    this.problemInfo.className = 'muted';
    header.appendChild(h2);
    header.appendChild(this.problemInfo);
    this.panel.appendChild(header);

    // Problem echo
    this.problemEcho = document.createElement('div');
    this.problemEcho.className = 'practice-prompt';
    this.panel.appendChild(this.problemEcho);

    // Ranking modes
    const modes: { value: RankingMode; label: string }[] = [
      { value: 'fastest', label: 'Fastest' },
      { value: 'most-general', label: 'General' },
      { value: 'builds-understanding', label: 'Deepest' },
      { value: 'for-me', label: 'For me' },
    ];
    const modeGroup = document.createElement('div');
    modeGroup.className = 'ranking-modes';
    modeGroup.setAttribute('role', 'radiogroup');
    modeGroup.setAttribute('aria-label', 'Ranking mode');

    for (const mode of modes) {
      const label = document.createElement('label');
      label.className = 'ranking-mode';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'strategy-ranking-mode';
      radio.value = mode.value;
      if (mode.value === 'fastest') radio.checked = true;
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.rankingMode = mode.value;
          this.rerenderStrategies();
        }
      });
      const span = document.createElement('span');
      span.textContent = mode.label;
      label.appendChild(radio);
      label.appendChild(span);
      modeGroup.appendChild(label);
    }
    this.panel.appendChild(modeGroup);

    // Strategy list
    this.listEl = document.createElement('div');
    this.listEl.className = 'strategy-list';
    this.panel.appendChild(this.listEl);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'practice-actions';

    this.explainBtn = document.createElement('button');
    this.explainBtn.textContent = 'Why multiple methods?';
    this.explainBtn.addEventListener('click', () => this.handleExplain());

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'primary';
    this.playBtn.textContent = '\u25B6 Play selected';
    this.playBtn.disabled = true;
    this.playBtn.addEventListener('click', () => this.handlePlay());

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.textContent = 'Cancel';
    this.cancelBtn.addEventListener('click', () => this.close());

    actions.appendChild(this.explainBtn);
    actions.appendChild(this.playBtn);
    actions.appendChild(this.cancelBtn);
    this.panel.appendChild(actions);
  }

  /** Get the panel DOM element to insert into the page. */
  getElement(): HTMLElement {
    return this.panel;
  }

  /**
   * Open the strategy picker for a given input.
   * Returns false if the input couldn't be classified.
   */
  open(input: string, subjectId: string): boolean {
    const subject = this.app.getSubject(subjectId);
    if (!subject?.identify) return false;

    const problem = subject.identify(input);
    if (!problem) return false;

    this.currentProblem = problem;
    this.currentSubject = subject;
    this.selectedIds.clear();

    // Show panel
    this.panel.hidden = false;

    // Echo the problem
    this.problemEcho.textContent = problem.rawInput;
    this.problemInfo.textContent = `${problem.type} equation \u2022 ${problem.goal}`;

    // Render strategy cards
    this.rerenderStrategies();

    // Scroll to panel
    this.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return true;
  }

  close(): void {
    this.panel.hidden = true;
    this.currentProblem = null;
    this.currentSubject = null;
    this.selectedIds.clear();
    this.listEl.innerHTML = '';
  }

  get isOpen(): boolean {
    return !this.panel.hidden;
  }

  private rerenderStrategies(): void {
    if (!this.currentProblem || !this.currentSubject?.strategies) return;

    const matches = this.currentSubject.strategies(this.currentProblem, this.rankingMode);
    this.listEl.innerHTML = '';

    const firstApplicable = matches.find(m => m.check.applicable);

    for (const match of matches) {
      const card = this.createStrategyCard(match, match === firstApplicable);
      this.listEl.appendChild(card);
    }

    this.updatePlayButton();
  }

  private createStrategyCard(match: StrategyMatch, recommended: boolean): HTMLElement {
    const { strategy, check, cost, learningValue } = match;
    const applicable = check.applicable;

    const card = document.createElement('div');
    card.className = `strategy-card ${applicable ? 'applicable' : 'inapplicable'}`;
    if (this.selectedIds.has(strategy.id)) card.classList.add('selected');
    card.dataset.strategyId = strategy.id;

    // Header: name + badges
    const header = document.createElement('div');
    header.className = 'strat-header';

    const name = document.createElement('span');
    name.className = 'strat-name';
    name.textContent = strategy.name;
    header.appendChild(name);

    const badges = document.createElement('span');
    badges.className = 'strat-badges';
    badges.appendChild(this.badge(strategy.tradeoffs.speed, strategy.tradeoffs.speed));
    badges.appendChild(this.badge(strategy.tradeoffs.generality, strategy.tradeoffs.generality));
    if (recommended) badges.appendChild(this.badge('recommended', 'recommended'));
    header.appendChild(badges);
    card.appendChild(header);

    // Description
    const desc = document.createElement('div');
    desc.className = 'strat-desc';
    desc.textContent = strategy.shortDescription;
    card.appendChild(desc);

    // Applicability reason
    const reason = document.createElement('div');
    reason.className = 'strat-reason';
    reason.textContent = check.reason;
    card.appendChild(reason);

    // Checks
    if (check.passedChecks?.length || check.failedChecks?.length) {
      const checks = document.createElement('ul');
      checks.className = 'strat-checks';
      for (const pc of check.passedChecks ?? []) {
        const li = document.createElement('li');
        li.className = 'pass';
        li.textContent = pc;
        checks.appendChild(li);
      }
      for (const fc of check.failedChecks ?? []) {
        const li = document.createElement('li');
        li.className = 'fail';
        li.textContent = fc;
        checks.appendChild(li);
      }
      card.appendChild(checks);
    }

    // Builds
    if (strategy.tradeoffs.builds.length > 0) {
      const builds = document.createElement('div');
      builds.className = 'strat-builds';
      builds.innerHTML = `<strong>Builds:</strong> ${strategy.tradeoffs.builds.join(', ')}`;
      card.appendChild(builds);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'strat-footer';
    footer.innerHTML = `
      <span>Effort: ${'*'.repeat(cost)}</span>
      <span>Learning: ${'*'.repeat(learningValue)}</span>
      <span class="select-hint">${this.selectedIds.has(strategy.id) ? 'Selected' : applicable ? 'Click to select' : 'Not applicable'}</span>
    `;
    card.appendChild(footer);

    // Click to toggle selection
    if (applicable) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (this.selectedIds.has(strategy.id)) {
          this.selectedIds.delete(strategy.id);
          card.classList.remove('selected');
        } else {
          this.selectedIds.add(strategy.id);
          card.classList.add('selected');
        }
        this.updateSelectHints();
        this.updatePlayButton();
      });
    }

    return card;
  }

  private updateSelectHints(): void {
    this.listEl.querySelectorAll<HTMLElement>('.strategy-card').forEach(card => {
      const hint = card.querySelector('.select-hint');
      if (!hint) return;
      const id = card.dataset.strategyId;
      if (id && this.selectedIds.has(id)) {
        hint.textContent = 'Selected';
      } else if (card.classList.contains('applicable')) {
        hint.textContent = 'Click to select';
      }
    });
  }

  private badge(text: string, type: string): HTMLElement {
    const el = document.createElement('span');
    el.className = `strat-badge ${type}`;
    el.textContent = text;
    return el;
  }

  private updatePlayButton(): void {
    const count = this.selectedIds.size;
    this.playBtn.disabled = count === 0;
    this.playBtn.textContent = count > 1
      ? `\u25B6 Compare ${count} methods`
      : '\u25B6 Play selected';
  }

  private handlePlay(): void {
    if (!this.currentProblem || !this.currentSubject || this.selectedIds.size === 0) return;

    const ids = [...this.selectedIds];

    if (ids.length === 1) {
      const lesson = this.currentSubject.solveWith?.(this.currentProblem, ids[0]!);
      if (lesson && this.onPlay) {
        this.close();
        this.onPlay(lesson);
      }
    } else {
      const result = this.currentSubject.compareStrategies?.(this.currentProblem, ids);
      if (result && this.onPlay) {
        this.close();
        this.onPlay(result.summary);
      }
    }
  }

  private handleExplain(): void {
    if (!this.currentProblem || !this.currentSubject?.explainChoice) return;
    const lesson = this.currentSubject.explainChoice(this.currentProblem);
    if (lesson && this.onPlay) {
      this.onPlay(lesson);
    }
  }
}
