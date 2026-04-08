import type { Mistake, MistakeCategory } from '@core/types/mistake.js';
import type { StorageAdapter } from '@platform/types.js';

/**
 * Feedback dispatcher. Switches on mistake.category ONLY.
 * Never knows which subject produced the mistake.
 */

export interface FeedbackLevel {
  level: 1 | 2 | 3 | 4 | 5;
  headline: string;
  explain?: string;
  actionLessonId?: string;
}

interface MistakeCount {
  category: MistakeCategory;
  count: number;
  lastSeen: number;
}

export class Feedback {
  private counts = new Map<MistakeCategory, MistakeCount>();
  private loaded = false;

  constructor(private storage: StorageAdapter) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    const keys = await this.storage.list('mistakes.');
    for (const key of keys) {
      const rec = await this.storage.get<MistakeCount>(key);
      if (rec) this.counts.set(rec.category, rec);
    }
    this.loaded = true;
  }

  async record(mistake: Mistake): Promise<FeedbackLevel> {
    await this.load();
    const current = this.counts.get(mistake.category) ?? {
      category: mistake.category, count: 0, lastSeen: 0,
    };
    current.count++;
    current.lastSeen = Date.now();
    this.counts.set(mistake.category, current);
    await this.storage.set(`mistakes.${mistake.category}`, current);

    // Progressive feedback level based on total count
    if (current.count === 1) {
      return { level: 1, headline: this.headlineFor(mistake.category), explain: mistake.detail };
    }
    if (current.count === 2) {
      return { level: 2, headline: 'You made this kind of mistake before.', explain: mistake.detail };
    }
    return {
      level: 3,
      headline: 'This pattern keeps coming up — let\'s work on it.',
      explain: mistake.detail,
      actionLessonId: `_feedback.${mistake.category}.mini-lesson-01`,
    };
  }

  async topMistakes(limit = 5): Promise<MistakeCount[]> {
    await this.load();
    return [...this.counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
  }

  private headlineFor(cat: MistakeCategory): string {
    const map: Record<MistakeCategory, string> = {
      'sign-error': 'Watch the sign.',
      'arithmetic-slip': 'Small arithmetic slip.',
      'wrong-formula': 'Wrong formula for this situation.',
      'misread-question': 'Re-read the question carefully.',
      'confused-similar-concept': 'Two similar ideas got mixed up.',
      'incomplete-answer': 'Answer is on the right track but missing something.',
      'unit-error': 'Check the units.',
      'off-by-one': 'Off by one — boundary counting matters.',
      'procedural-skip': 'A step got skipped.',
      'notation-error': 'Notation needs fixing.',
    };
    return map[cat];
  }
}
