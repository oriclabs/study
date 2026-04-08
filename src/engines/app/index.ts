import type { Platform } from '@platform/types.js';
import type { SubjectModule } from '@core/types/subject.js';
import type { Lesson } from '@core/types/lesson.js';

import { Loader } from '@engines/loader/index.js';
import { ContentIndex } from '@engines/content-index/index.js';
import { Renderer } from '@engines/renderer/index.js';
import { Progress } from '@engines/progress/index.js';
import { SRScheduler } from '@engines/sr/index.js';
import { Feedback } from '@engines/feedback/index.js';
import { TestEngine } from '@engines/test/index.js';
import { CurriculumEngine } from '@engines/curriculum/index.js';
import { Gamification } from '@engines/gamification/index.js';
import { DashboardExporter } from '@engines/dashboard/index.js';
import { ExamEngine } from '@engines/exam/index.js';
import { PrintEngine } from '@engines/print/index.js';
import { A11yEngine } from '@engines/a11y/index.js';
import { LessonRecorder } from '@engines/recorder/index.js';
import { UserContent } from '@engines/user-content/index.js';
import { StudyNotesEngine } from '@engines/study-notes/index.js';

export interface AppOptions {
  platform: Platform;
  subjects: SubjectModule[];
  canvas: HTMLCanvasElement;
}

/**
 * Composition root. Wires engines + subjects + platform together.
 * This is the one place that imports from every layer.
 */
export class App {
  readonly loader: Loader;
  readonly index: ContentIndex;
  readonly renderer: Renderer;
  readonly progress: Progress;
  readonly sr: SRScheduler;
  readonly feedback: Feedback;
  readonly test: TestEngine;
  readonly curriculum: CurriculumEngine;
  readonly gamification: Gamification;
  readonly dashboard: DashboardExporter;
  readonly exam: ExamEngine;
  readonly print: PrintEngine;
  readonly a11y: A11yEngine;
  readonly recorder: LessonRecorder;
  readonly userContent: UserContent;
  readonly studyNotes: StudyNotesEngine;
  readonly platform: Platform;
  readonly subjects: Map<string, SubjectModule>;

  constructor(private opts: AppOptions) {
    this.subjects = new Map(opts.subjects.map(s => [s.id, s]));
    this.platform = opts.platform;
    this.userContent = new UserContent(opts.platform.storage);
    this.loader = new Loader(opts.platform.content, this.userContent);
    this.index = new ContentIndex(opts.platform.content, this.userContent);
    this.renderer = new Renderer({ canvas: opts.canvas, tts: opts.platform.tts });
    this.progress = new Progress(opts.platform.storage);
    this.sr = new SRScheduler(opts.platform.storage);
    this.feedback = new Feedback(opts.platform.storage);
    this.test = new TestEngine(this.subjects);
    this.curriculum = new CurriculumEngine(opts.platform.content, opts.platform.storage, this.index);
    this.gamification = new Gamification(opts.platform.storage);
    this.dashboard = new DashboardExporter(this.progress, this.feedback, this.gamification, this.curriculum);
    this.exam = new ExamEngine(this.test, this.progress);
    this.print = new PrintEngine();
    this.a11y = new A11yEngine(opts.platform.storage);
    this.recorder = new LessonRecorder();
    this.studyNotes = new StudyNotesEngine(this.subjects, this.index);
  }

  async init(): Promise<void> {
    await this.index.build();
    await this.curriculum.init();
    await this.progress.load();
    await this.sr.load();
    await this.feedback.load();
    await this.gamification.load();
    await this.a11y.load();
  }

  getSubject(id: string): SubjectModule | undefined {
    return this.subjects.get(id);
  }

  /** Resolve a free-form input to a lesson via a subject's solve(). */
  solveWith(subjectId: string, input: string): Lesson | null {
    return this.subjects.get(subjectId)?.solve?.(input) ?? null;
  }

  async playLesson(id: string): Promise<void> {
    const lesson = await this.loader.loadLesson(id);
    await this.renderer.play(lesson);
  }

  /** Reload the content index after user content has changed. */
  async refreshContent(): Promise<void> {
    await this.index.build();
  }

  async playSolvedLesson(lesson: Lesson): Promise<void> {
    await this.renderer.play(lesson);
  }
}
