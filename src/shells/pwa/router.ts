/**
 * Hash-based router for the PWA shell.
 * No dependencies — listens to hashchange and dispatches to view renderers.
 */

export type Route =
  | { view: 'home' }
  | { view: 'packs' }
  | { view: 'search' }
  | { view: 'progress' }
  | { view: 'wrong-answers' }
  | { view: 'bookmarks' }
  | { view: 'daily' }
  | { view: 'speed-drill' }
  | { view: 'flashcards' }
  | { view: 'solve'; exam?: string; subject?: string }
  | { view: 'dictionary' }
  | { view: 'grammar-check' }
  | { view: 'generate'; packId: string }
  | { view: 'subjects'; exam: string }
  | { view: 'notes'; exam: string; subject: string }
  | { view: 'notes-topic'; exam: string; subject: string; categoryIdx: number; topicIdx: number }
  | { view: 'revision'; exam: string; subject: string }
  | { view: 'practice'; exam: string; subject: string }
  | { view: 'exam'; exam: string; subject: string }
  | { view: 'cheatsheet'; exam: string; subject: string }
  | { view: 'master-sheet'; exam: string };

export type ViewRenderer = (route: Route, container: HTMLElement) => void | Promise<void>;

export class Router {
  private container: HTMLElement;
  private renderer: ViewRenderer;
  private current: Route | null = null;

  constructor(container: HTMLElement, renderer: ViewRenderer) {
    this.container = container;
    this.renderer = renderer;
  }

  start(): void {
    window.addEventListener('hashchange', () => this.dispatch());
    this.dispatch();
  }

  private dispatch(): void {
    const route = parseHash(location.hash);
    this.current = route;
    this.renderer(route, this.container);
  }

  getCurrent(): Route | null {
    return this.current;
  }
}

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (!h) return { view: 'home' };
  if (h === 'packs') return { view: 'packs' };
  if (h.startsWith('generate/')) return { view: 'generate', packId: h.slice(9) };
  if (h === 'search') return { view: 'search' };
  if (h === 'progress') return { view: 'progress' };
  if (h === 'wrong-answers') return { view: 'wrong-answers' };
  if (h === 'bookmarks') return { view: 'bookmarks' };
  if (h === 'daily') return { view: 'daily' };
  if (h === 'speed-drill') return { view: 'speed-drill' };
  if (h === 'flashcards') return { view: 'flashcards' };
  if (h === 'dictionary') return { view: 'dictionary' };
  if (h === 'grammar-check') return { view: 'grammar-check' };
  if (h === 'solve') return { view: 'solve' };
  if (h.startsWith('solve/')) {
    const solveParts = h.slice(6).split('/');
    return { view: 'solve', exam: solveParts[0], subject: solveParts[1] };
  }

  const parts = h.split('/');

  // #/c/:exam
  if (parts[0] === 'c' && parts.length === 2) {
    return { view: 'subjects', exam: parts[1] };
  }

  // #/c/:exam/s/:subject/notes
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'notes' && parts.length === 5) {
    return { view: 'notes', exam: parts[1], subject: parts[3] };
  }

  // #/c/:exam/s/:subject/notes/:catIdx/:topicIdx
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'notes' && parts.length === 7) {
    return {
      view: 'notes-topic',
      exam: parts[1],
      subject: parts[3],
      categoryIdx: parseInt(parts[5], 10),
      topicIdx: parseInt(parts[6], 10),
    };
  }

  // #/c/:exam/s/:subject/revision
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'revision') {
    return { view: 'revision', exam: parts[1]!, subject: parts[3]! };
  }

  // #/c/:exam/s/:subject/cheatsheet
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'cheatsheet') {
    return { view: 'cheatsheet', exam: parts[1]!, subject: parts[3]! };
  }

  // #/c/:exam/master-sheet
  if (parts[0] === 'c' && parts[2] === 'master-sheet') {
    return { view: 'master-sheet', exam: parts[1]! };
  }

  // #/c/:exam/s/:subject/practice
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'practice') {
    return { view: 'practice', exam: parts[1], subject: parts[3] };
  }

  // #/c/:exam/s/:subject/exam
  if (parts[0] === 'c' && parts[2] === 's' && parts[4] === 'exam') {
    return { view: 'exam', exam: parts[1], subject: parts[3] };
  }

  return { view: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case 'home':
      return '#/';
    case 'packs':
      return '#/packs';
    case 'generate':
      return `#/generate/${route.packId}`;
    case 'search':
      return '#/search';
    case 'progress':
      return '#/progress';
    case 'wrong-answers':
      return '#/wrong-answers';
    case 'bookmarks':
      return '#/bookmarks';
    case 'daily':
      return '#/daily';
    case 'speed-drill':
      return '#/speed-drill';
    case 'flashcards':
      return '#/flashcards';
    case 'dictionary':
      return '#/dictionary';
    case 'grammar-check':
      return '#/grammar-check';
    case 'solve':
      if (route.exam && route.subject) return `#/solve/${route.exam}/${route.subject}`;
      if (route.exam) return `#/solve/${route.exam}`;
      return '#/solve';
    case 'subjects':
      return `#/c/${route.exam}`;
    case 'notes':
      return `#/c/${route.exam}/s/${route.subject}/notes`;
    case 'notes-topic':
      return `#/c/${route.exam}/s/${route.subject}/notes/${route.categoryIdx}/${route.topicIdx}`;
    case 'revision':
      return `#/c/${route.exam}/s/${route.subject}/revision`;
    case 'practice':
      return `#/c/${route.exam}/s/${route.subject}/practice`;
    case 'exam':
      return `#/c/${route.exam}/s/${route.subject}/exam`;
    case 'cheatsheet':
      return `#/c/${route.exam}/s/${route.subject}/cheatsheet`;
    case 'master-sheet':
      return `#/c/${route.exam}/master-sheet`;
  }
}

export function navigate(route: Route): void {
  location.hash = routeToHash(route);
}
