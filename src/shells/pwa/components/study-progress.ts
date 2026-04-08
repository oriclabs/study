/**
 * Study progress — tracks practice/exam results, wrong answers, bookmarks,
 * and study streaks. Stored in IndexedDB via StorageAdapter.
 * Completely pack-agnostic — works with any content.
 *
 * Storage keys:
 *   progress.attempts    — all practice/exam attempts
 *   progress.wrong       — wrong answer log
 *   progress.bookmarks   — bookmarked items
 *   progress.streak      — daily streak data
 *   progress.daily       — daily practice log
 */

import type { StorageAdapter } from '@platform/types.js';

/** Format a Date as YYYY-MM-DD in the user's LOCAL timezone (not UTC). */
function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface AttemptRecord {
  id: string;
  packId: string;
  subject: string;
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  difficulty?: number;
  timestamp: number;
  source: 'practice' | 'exam' | 'daily';
}

export interface WrongAnswer extends AttemptRecord {
  correct: false;
  solutionSteps?: string[];
  reviewedAt?: number;
}

export interface Bookmark {
  id: string;
  packId: string;
  subject: string;
  type: 'topic' | 'example' | 'formula';
  title: string;
  content: string;
  addedAt: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  totalDaysActive: number;
}

export interface TopicScore {
  packId: string;
  subject: string;
  topic: string;
  attempts: number;
  correct: number;
  lastAttempt: number;
  bestScore: number; // percentage
}

export class StudyProgress {
  constructor(private storage: StorageAdapter) {}

  // ============ Attempts ============

  async recordAttempt(attempt: Omit<AttemptRecord, 'id' | 'timestamp'>): Promise<void> {
    const record: AttemptRecord = {
      ...attempt,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };

    const attempts = await this.getAttempts();
    attempts.push(record);
    // Keep last 1000 attempts
    if (attempts.length > 1000) attempts.splice(0, attempts.length - 1000);
    await this.storage.set('progress.attempts', attempts);

    // Track wrong answers separately
    if (!record.correct) {
      const wrong = await this.getWrongAnswers();
      wrong.push({ ...record, correct: false as const });
      await this.storage.set('progress.wrong', wrong);
    }

    // Update topic scores
    await this.updateTopicScore(record);

    // Update streak
    await this.updateStreak();
  }

  async getAttempts(packId?: string, subject?: string): Promise<AttemptRecord[]> {
    const all = await this.storage.get<AttemptRecord[]>('progress.attempts') ?? [];
    return all.filter(a =>
      (!packId || a.packId === packId) &&
      (!subject || a.subject === subject)
    );
  }

  // ============ Wrong Answers ============

  async getWrongAnswers(packId?: string, subject?: string): Promise<WrongAnswer[]> {
    const all = await this.storage.get<WrongAnswer[]>('progress.wrong') ?? [];
    return all.filter(a =>
      (!packId || a.packId === packId) &&
      (!subject || a.subject === subject)
    );
  }

  async markReviewed(wrongAnswerId: string): Promise<void> {
    const wrong = await this.storage.get<WrongAnswer[]>('progress.wrong') ?? [];
    const item = wrong.find(w => w.id === wrongAnswerId);
    if (item) {
      item.reviewedAt = Date.now();
      await this.storage.set('progress.wrong', wrong);
    }
  }

  async clearReviewed(): Promise<void> {
    const wrong = await this.storage.get<WrongAnswer[]>('progress.wrong') ?? [];
    const remaining = wrong.filter(w => !w.reviewedAt);
    await this.storage.set('progress.wrong', remaining);
  }

  // ============ Topic Scores ============

  private async updateTopicScore(attempt: AttemptRecord): Promise<void> {
    const key = `progress.topic.${attempt.packId}.${attempt.subject}.${attempt.topic}`;
    const existing = await this.storage.get<TopicScore>(key) ?? {
      packId: attempt.packId,
      subject: attempt.subject,
      topic: attempt.topic,
      attempts: 0,
      correct: 0,
      lastAttempt: 0,
      bestScore: 0,
    };
    existing.attempts++;
    if (attempt.correct) existing.correct++;
    existing.lastAttempt = Date.now();
    const pct = Math.round((existing.correct / existing.attempts) * 100);
    if (pct > existing.bestScore) existing.bestScore = pct;
    await this.storage.set(key, existing);
  }

  async getTopicScores(packId?: string): Promise<TopicScore[]> {
    const keys = await this.storage.list('progress.topic.');
    const scores: TopicScore[] = [];
    for (const key of keys) {
      const score = await this.storage.get<TopicScore>(key);
      if (score && (!packId || score.packId === packId)) scores.push(score);
    }
    return scores.sort((a, b) => b.lastAttempt - a.lastAttempt);
  }

  // ============ Bookmarks ============

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'addedAt'>): Promise<void> {
    const bookmarks = await this.getBookmarks();
    // Don't duplicate
    if (bookmarks.some(b => b.title === bookmark.title && b.packId === bookmark.packId)) return;
    bookmarks.push({
      ...bookmark,
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: Date.now(),
    });
    await this.storage.set('progress.bookmarks', bookmarks);
  }

  async removeBookmark(id: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    await this.storage.set('progress.bookmarks', filtered);
  }

  async getBookmarks(packId?: string): Promise<Bookmark[]> {
    const all = await this.storage.get<Bookmark[]>('progress.bookmarks') ?? [];
    return packId ? all.filter(b => b.packId === packId) : all;
  }

  // ============ Streaks ============

  private async updateStreak(): Promise<void> {
    const streak = await this.getStreak();
    const today = localDateString(new Date());

    if (streak.lastPracticeDate === today) return; // Already counted today

    const yesterday = localDateString(new Date(Date.now() - 86400000));
    if (streak.lastPracticeDate === yesterday) {
      streak.currentStreak++;
    } else if (streak.lastPracticeDate !== today) {
      streak.currentStreak = 1; // Reset
    }

    streak.lastPracticeDate = today;
    streak.totalDaysActive++;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    await this.storage.set('progress.streak', streak);
  }

  async getStreak(): Promise<StreakData> {
    return await this.storage.get<StreakData>('progress.streak') ?? {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      totalDaysActive: 0,
    };
  }

  // ============ Stats ============

  async getOverallStats(): Promise<{
    totalAttempts: number;
    totalCorrect: number;
    accuracy: number;
    topicsStudied: number;
    streak: StreakData;
    wrongCount: number;
    bookmarkCount: number;
  }> {
    const attempts = await this.getAttempts();
    const correct = attempts.filter(a => a.correct).length;
    const topicScores = await this.getTopicScores();
    const streak = await this.getStreak();
    const wrong = await this.getWrongAnswers();
    const bookmarks = await this.getBookmarks();

    return {
      totalAttempts: attempts.length,
      totalCorrect: correct,
      accuracy: attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0,
      topicsStudied: topicScores.length,
      streak,
      wrongCount: wrong.filter(w => !w.reviewedAt).length,
      bookmarkCount: bookmarks.length,
    };
  }
}
