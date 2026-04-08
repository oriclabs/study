import type { TestEngine } from '@engines/test/index.js';
import type { Progress } from '@engines/progress/index.js';
import type { Lesson } from '@core/types/lesson.js';
import type { Question } from '@core/types/question.js';
import type { GradeBoundaries } from '@core/types/curriculum.js';

/**
 * Exam engine (Phase 12). Runs a timed assessment session with
 * no hints, collects all answers, scores at the end, and applies
 * optional grade boundaries from the active curriculum.
 */

export interface ExamSession {
  id: string;
  startedAt: number;
  lessons: Lesson[];
  questions: { lesson: Lesson; question: Question }[];
  answers: Map<string, unknown>;
  timeLimitMs: number | null;
  endedAt: number | null;
}

export interface ExamResult {
  sessionId: string;
  totalQuestions: number;
  correct: number;
  percent: number;
  grade?: string;
  details: { questionId: string; correct: boolean; mistake?: string }[];
  durationMs: number;
}

export class ExamEngine {
  private current: ExamSession | null = null;

  constructor(private test: TestEngine, private progress: Progress) {}

  start(lessons: Lesson[], timeLimitMinutes?: number): ExamSession {
    const questions: { lesson: Lesson; question: Question }[] = [];
    for (const lesson of lessons) {
      if (lesson.assessment) {
        for (const q of lesson.assessment.questions) {
          questions.push({ lesson, question: q });
        }
      }
    }
    this.current = {
      id: `exam-${Date.now()}`,
      startedAt: Date.now(),
      lessons,
      questions,
      answers: new Map(),
      timeLimitMs: timeLimitMinutes ? timeLimitMinutes * 60_000 : null,
      endedAt: null,
    };
    return this.current;
  }

  recordAnswer(questionId: string, answer: unknown): void {
    if (!this.current) throw new Error('No active exam');
    this.current.answers.set(questionId, answer);
  }

  timeRemainingMs(): number | null {
    if (!this.current || !this.current.timeLimitMs) return null;
    const elapsed = Date.now() - this.current.startedAt;
    return Math.max(0, this.current.timeLimitMs - elapsed);
  }

  isExpired(): boolean {
    const r = this.timeRemainingMs();
    return r !== null && r <= 0;
  }

  async finish(gradeBoundaries?: GradeBoundaries): Promise<ExamResult> {
    if (!this.current) throw new Error('No active exam');
    this.current.endedAt = Date.now();

    const details: ExamResult['details'] = [];
    let correct = 0;
    for (const { lesson, question } of this.current.questions) {
      const answer = this.current.answers.get(question.id);
      if (answer === undefined) {
        details.push({ questionId: question.id, correct: false, mistake: 'unanswered' });
        continue;
      }
      const result = this.test.check(question, answer, lesson.subject);
      if (result.correct) correct++;
      details.push({
        questionId: question.id,
        correct: result.correct,
        ...(result.mistake ? { mistake: result.mistake.category } : {}),
      });
      await this.progress.recordAttempt(lesson.topic, {
        lessonId: lesson.id,
        questionId: question.id,
        correct: result.correct,
        timeMs: 0,
        timestamp: Date.now(),
        ...(result.mistake ? { mistake: result.mistake } : {}),
      });
    }

    const total = this.current.questions.length;
    const percent = total === 0 ? 0 : (correct / total) * 100;
    let grade: string | undefined;
    if (gradeBoundaries) {
      const sorted = Object.entries(gradeBoundaries).sort((a, b) => b[1] - a[1]);
      for (const [letter, threshold] of sorted) {
        if (percent >= threshold) { grade = letter; break; }
      }
    }

    const result: ExamResult = {
      sessionId: this.current.id,
      totalQuestions: total,
      correct,
      percent,
      ...(grade !== undefined ? { grade } : {}),
      details,
      durationMs: this.current.endedAt - this.current.startedAt,
    };
    this.current = null;
    return result;
  }

  abandon(): void { this.current = null; }

  getCurrent(): ExamSession | null { return this.current; }
}
