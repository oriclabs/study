import type { Theme } from './theme.js';

/**
 * Render context passed to every op handler.
 * Tracks cursor, targets, theme, timing, and pause/abort state.
 */

export interface TargetBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  /** For write ops: absolute x of each char, for strike/highlight by range. */
  charX?: number[];
  /** For write ops: baseline y. */
  baselineY?: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  theme: Theme;

  cursor: { x: number; y: number };
  marginX: number;
  lineHeight: number;

  /** Named and auto targets recorded by handlers for later reference. */
  targets: Map<string, TargetBounds>;
  /** Id of the most recent primary drawable, used when target === 'prev'. */
  lastTargetId: string | null;

  /** 1.0 = normal, 2.0 = double speed. */
  speed: number;
  paused: boolean;
  aborted: boolean;

  /** Resolve `target: 'prev'` or explicit id to bounds. */
  resolveTarget(id: string | undefined): TargetBounds | null;
  /** Sleep honoring pause + abort + speed. */
  sleep(ms: number): Promise<void>;
  /** Advance cursor to next line. */
  newline(extra?: number): void;
  /** Optional callback fired on every cursor position change (for pen cursor overlay). */
  onCursorMove?: (x: number, y: number) => void;
}

export function createContext(
  canvas: HTMLCanvasElement,
  theme: Theme,
  opts: { speed?: number; marginX?: number; lineHeight?: number } = {}
): RenderContext {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to acquire 2D context');

  const state: RenderContext = {
    ctx,
    canvas,
    theme,
    cursor: { x: opts.marginX ?? 60, y: 80 },
    marginX: opts.marginX ?? 60,
    lineHeight: opts.lineHeight ?? 52,
    targets: new Map(),
    lastTargetId: null,
    speed: opts.speed ?? 1,
    paused: false,
    aborted: false,

    resolveTarget(id) {
      if (!id) return null;
      if (id === 'prev') {
        return state.lastTargetId ? state.targets.get(state.lastTargetId) ?? null : null;
      }
      return state.targets.get(id) ?? null;
    },

    async sleep(ms: number) {
      const scaledMs = ms / Math.max(0.1, state.speed);
      const end = performance.now() + scaledMs;
      const safetyTimeout = performance.now() + 30_000; // 30s max safety
      while (true) {
        if (state.aborted) throw new AbortError();
        if (performance.now() > safetyTimeout) {
          state.aborted = true;
          throw new AbortError();
        }
        const timeUp = performance.now() >= end;
        if (timeUp && !state.paused) break;
        await new Promise<void>(r => setTimeout(r, 16));
      }
    },

    newline(extra = 0) {
      state.cursor.x = state.marginX;
      state.cursor.y += state.lineHeight + extra;
      // Auto-grow canvas if cursor nears the bottom
      growCanvasIfNeeded(canvas, state.ctx, state.theme, state.cursor.y);
      state.onCursorMove?.(state.cursor.x, state.cursor.y);
      autoScrollToCursor(canvas, state.cursor.y);
    },
  };

  return state;
}

/**
 * Scroll the canvas's parent wrapper so the cursor stays near the bottom of
 * the visible area — the last written line sits at ~85% of the viewport with
 * a small padding below so the next line has room to appear.
 *
 * Never overshoots: scroll target is `cursorY + bottomPadding - visibleHeight`,
 * which means the wrapper shows exactly the content up to the cursor plus
 * a small margin, never empty canvas below.
 */
/** Exported for ops that position content directly (graph, numberline). */
export { growCanvasIfNeeded };

export function autoScrollToCursor(canvas: HTMLCanvasElement, cursorY: number): void {
  const wrap = canvas.parentElement;
  if (!wrap) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.height === 0) return;
  const scaleY = rect.height / canvas.height;
  const cursorScreenY = cursorY * scaleY;
  const visibleHeight = wrap.clientHeight;
  const currentTop = wrap.scrollTop;

  // Keep the cursor at about 85% down the visible area.
  // 15% of viewport below cursor = room for the upcoming line, nothing more.
  const bottomPadding = Math.min(80, visibleHeight * 0.15);
  const desiredScroll = cursorScreenY + bottomPadding - visibleHeight;

  // Only scroll down, never up; only if the cursor has actually moved enough.
  if (desiredScroll > currentTop + 8) {
    wrap.scrollTo({ top: Math.max(0, desiredScroll), behavior: 'auto' });
  }
}

/**
 * Grow the canvas height if the cursor is approaching the bottom.
 * Preserves existing drawn content by copying ImageData.
 */
function growCanvasIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  cursorY: number,
): void {
  const margin = 100; // grow when within 100px of bottom
  if (cursorY + margin < canvas.height) return;

  const oldHeight = canvas.height;
  const newHeight = oldHeight + 150; // grow by 150px at a time
  const imgData = ctx.getImageData(0, 0, canvas.width, oldHeight);
  canvas.height = newHeight;
  ctx.putImageData(imgData, 0, 0);
  // Fill the new area with background color
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, oldHeight, canvas.width, newHeight - oldHeight);
}

export class AbortError extends Error {
  constructor() { super('aborted'); this.name = 'AbortError'; }
}

export function clearCanvas(ctx: RenderContext): void {
  const { ctx: c, canvas, theme } = ctx;
  c.fillStyle = theme.background;
  c.fillRect(0, 0, canvas.width, canvas.height);
  ctx.cursor.x = ctx.marginX;
  ctx.cursor.y = 80;
  ctx.targets.clear();
  ctx.lastTargetId = null;
  // Reset the wrapper scroll position when we clear
  canvas.parentElement?.scrollTo({ top: 0, behavior: 'auto' });
}
