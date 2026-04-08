import type { StorageAdapter } from '@platform/types.js';
import type { Mistake } from '@core/types/mistake.js';

export interface AttemptRecord {
  lessonId: string;
  questionId: string;
  correct: boolean;
  mistake?: Mistake;
  timeMs: number;
  timestamp: number;
}

export interface TopicMastery {
  topic: string;
  attempts: number;
  correct: number;
  lastSeen: number;
  mastery: number; // 0..1
}

/**
 * Progress engine — tracks per-topic mastery from attempt records.
 * Subject-agnostic; the topic id carries subject via dot-namespacing.
 */
export class Progress {
  private masteryByTopic = new Map<string, TopicMastery>();
  private loaded = false;

  constructor(private storage: StorageAdapter) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    const keys = await this.storage.list('mastery.');
    for (const key of keys) {
      const rec = await this.storage.get<TopicMastery>(key);
      if (rec) this.masteryByTopic.set(rec.topic, rec);
    }
    this.loaded = true;
  }

  async recordAttempt(topic: string, attempt: AttemptRecord): Promise<void> {
    await this.load();
    const current = this.masteryByTopic.get(topic) ?? {
      topic, attempts: 0, correct: 0, lastSeen: 0, mastery: 0,
    };
    current.attempts++;
    if (attempt.correct) current.correct++;
    current.lastSeen = attempt.timestamp;
    current.mastery = current.attempts === 0 ? 0 : current.correct / current.attempts;
    this.masteryByTopic.set(topic, current);
    await this.storage.set(`mastery.${topic}`, current);
  }

  get(topic: string): TopicMastery | null {
    return this.masteryByTopic.get(topic) ?? null;
  }

  all(): TopicMastery[] {
    return [...this.masteryByTopic.values()];
  }

  weakTopics(limit = 5): TopicMastery[] {
    return this.all()
      .filter(t => t.attempts >= 2)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, limit);
  }
}
