import type { StorageAdapter } from '@platform/types.js';

/**
 * Gamification engine: XP, levels, streaks, badges.
 * Subject-agnostic. Fed by attempts from the test engine.
 */

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

export interface GameState {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDay: string; // YYYY-MM-DD
  badges: string[];
  totalCorrect: number;
  totalAttempts: number;
}

const BADGES: Record<string, { condition: (s: GameState) => boolean; description: string }> = {
  'first-correct': {
    condition: s => s.totalCorrect >= 1,
    description: 'Answer your first question correctly',
  },
  'ten-correct': {
    condition: s => s.totalCorrect >= 10,
    description: '10 correct answers',
  },
  'streak-3': {
    condition: s => s.currentStreak >= 3,
    description: '3-day streak',
  },
  'streak-7': {
    condition: s => s.currentStreak >= 7,
    description: 'Week-long streak',
  },
  'level-3': {
    condition: s => s.level >= 3,
    description: 'Reach level 3',
  },
  'level-5': {
    condition: s => s.level >= 5,
    description: 'Reach level 5',
  },
  'perfect-10': {
    condition: s => s.totalAttempts >= 10 && s.totalCorrect === s.totalAttempts,
    description: 'Perfect score across 10 attempts',
  },
};

export class Gamification {
  private state: GameState;
  private loaded = false;

  constructor(private storage: StorageAdapter) {
    this.state = {
      xp: 0, level: 1, currentStreak: 0, longestStreak: 0,
      lastActiveDay: '', badges: [], totalCorrect: 0, totalAttempts: 0,
    };
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    const saved = await this.storage.get<GameState>('game.state');
    if (saved) this.state = saved;
    this.loaded = true;
  }

  async onAttempt(correct: boolean): Promise<{ levelUp: boolean; newBadges: string[]; xpGained: number }> {
    await this.load();
    const today = new Date().toISOString().slice(0, 10);
    const prevLevel = this.state.level;

    this.state.totalAttempts++;
    if (correct) this.state.totalCorrect++;

    // XP: +10 for correct, +2 for honest attempt (participation points)
    const xpGained = correct ? 10 : 2;
    this.state.xp += xpGained;

    // Level up
    while (this.state.level < LEVEL_THRESHOLDS.length && this.state.xp >= LEVEL_THRESHOLDS[this.state.level]!) {
      this.state.level++;
    }

    // Streak: increment if today is new; break if gap > 1 day
    if (this.state.lastActiveDay === '') {
      this.state.currentStreak = 1;
    } else if (this.state.lastActiveDay !== today) {
      const prev = new Date(this.state.lastActiveDay);
      const now = new Date(today);
      const daysBetween = Math.round((now.getTime() - prev.getTime()) / 86400000);
      if (daysBetween === 1) this.state.currentStreak++;
      else this.state.currentStreak = 1;
    }
    this.state.lastActiveDay = today;
    if (this.state.currentStreak > this.state.longestStreak) {
      this.state.longestStreak = this.state.currentStreak;
    }

    // Badge evaluation
    const newBadges: string[] = [];
    for (const [id, def] of Object.entries(BADGES)) {
      if (!this.state.badges.includes(id) && def.condition(this.state)) {
        this.state.badges.push(id);
        newBadges.push(id);
      }
    }

    await this.storage.set('game.state', this.state);

    return {
      levelUp: this.state.level > prevLevel,
      newBadges,
      xpGained,
    };
  }

  getState(): GameState { return { ...this.state }; }

  xpToNextLevel(): number {
    const next = LEVEL_THRESHOLDS[this.state.level];
    return next === undefined ? 0 : next - this.state.xp;
  }

  getBadgeInfo(id: string): { id: string; description: string } | null {
    const def = BADGES[id];
    return def ? { id, description: def.description } : null;
  }

  allBadgeIds(): string[] { return Object.keys(BADGES); }
}
