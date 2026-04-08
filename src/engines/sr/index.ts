import type { StorageAdapter } from '@platform/types.js';

/**
 * Simple spaced repetition using an SM-2 variant. Each topic has a box (1..5)
 * and a next-review timestamp. Quality 0-5 drives box transitions.
 */

export interface SRRecord {
  topic: string;
  box: number;            // 1..5
  ease: number;           // starts at 2.5
  intervalDays: number;   // current interval
  nextReview: number;     // ms timestamp
}

export class SRScheduler {
  private cache = new Map<string, SRRecord>();
  private loaded = false;

  constructor(private storage: StorageAdapter) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    const keys = await this.storage.list('sr.');
    for (const key of keys) {
      const rec = await this.storage.get<SRRecord>(key);
      if (rec) this.cache.set(rec.topic, rec);
    }
    this.loaded = true;
  }

  async review(topic: string, quality: number): Promise<void> {
    await this.load();
    const rec = this.cache.get(topic) ?? {
      topic, box: 1, ease: 2.5, intervalDays: 0, nextReview: 0,
    };
    if (quality < 3) {
      rec.box = 1;
      rec.intervalDays = 1;
    } else {
      if (rec.box === 1) rec.intervalDays = 1;
      else if (rec.box === 2) rec.intervalDays = 3;
      else rec.intervalDays = Math.round(rec.intervalDays * rec.ease);
      rec.box = Math.min(5, rec.box + 1);
      rec.ease = Math.max(1.3, rec.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }
    rec.nextReview = Date.now() + rec.intervalDays * 24 * 3600_000;
    this.cache.set(topic, rec);
    await this.storage.set(`sr.${topic}`, rec);
  }

  async due(now = Date.now()): Promise<SRRecord[]> {
    await this.load();
    return [...this.cache.values()].filter(r => r.nextReview <= now);
  }
}
