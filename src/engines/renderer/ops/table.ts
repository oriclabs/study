import type { TableOp } from '@core/types/op.js';
import type { RenderContext } from '../state.js';
import { remapColor } from '../theme.js';

/**
 * Table op: renders a grid layout on canvas with animated cell reveals.
 *
 * Use cases:
 *   - Simultaneous equations (side-by-side columns)
 *   - Long division / fraction work
 *   - Strategy comparison tables
 *   - Step-by-step substitution work
 *
 * Cells are revealed row-by-row with handwriting animation.
 * Headers get title styling, highlighted cells get colored borders.
 */
export async function tableOp(op: TableOp, ctx: RenderContext): Promise<void> {
  const { ctx: c, theme } = ctx;
  const { headers, rows, highlightCells, colWidths: customColWidths } = op.data;

  c.save();
  c.textBaseline = 'alphabetic';

  const startX = op.at?.[0] ?? ctx.cursor.x;
  const startY = op.at?.[1] ?? ctx.cursor.y;

  const cellPadX = 16;
  const cellPadY = 10;
  const rowHeight = 44;

  // ─── Calculate column widths ──────────────────────────────────
  const colCount = headers ? headers.length : (rows[0]?.length ?? 0);
  const colWidths: number[] = customColWidths
    ? [...customColWidths]
    : computeColWidths(c, theme, headers, rows, colCount, cellPadX);

  const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
  const totalRows = (headers ? 1 : 0) + rows.length;

  // ─── Draw grid lines ─────────────────────────────────────────
  c.strokeStyle = remapColor(theme, theme.gridLine);
  c.lineWidth = 1;

  // Horizontal lines
  for (let r = 0; r <= totalRows; r++) {
    const y = startY + r * rowHeight - rowHeight + cellPadY;
    c.beginPath();
    c.moveTo(startX, y);
    c.lineTo(startX + tableWidth, y);
    c.stroke();
  }

  // Vertical lines
  let vx = startX;
  for (let col = 0; col <= colCount; col++) {
    c.beginPath();
    c.moveTo(vx, startY - rowHeight + cellPadY);
    c.lineTo(vx, startY + (totalRows - 1) * rowHeight + cellPadY);
    c.stroke();
    vx += colWidths[col] ?? 0;
  }

  await ctx.sleep(100);

  // ─── Render headers ───────────────────────────────────────────
  let currentY = startY;

  if (headers) {
    c.font = theme.titleFont;
    c.fillStyle = remapColor(theme, theme.explainPen);

    let hx = startX;
    for (let col = 0; col < colCount; col++) {
      const text = headers[col] ?? '';
      const cellCenterX = hx + colWidths[col]! / 2;
      const textWidth = c.measureText(text).width;
      const tx = cellCenterX - textWidth / 2;

      // Animate header text
      for (let i = 0; i < text.length; i++) {
        if (ctx.aborted) break;
        const ch = text[i]!;
        c.fillText(ch, tx + c.measureText(text.slice(0, i)).width, currentY);
        await ctx.sleep(20);
      }
      hx += colWidths[col]!;
    }

    // Thicker line under header
    c.strokeStyle = remapColor(theme, undefined);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(startX, currentY + cellPadY);
    c.lineTo(startX + tableWidth, currentY + cellPadY);
    c.stroke();
    c.lineWidth = 1;

    currentY += rowHeight;
    await ctx.sleep(150);
  }

  // ─── Render rows ──────────────────────────────────────────────
  c.font = theme.font;
  c.fillStyle = remapColor(theme, undefined);

  const highlightSet = new Set(
    (highlightCells ?? []).map(([r, col]) => `${r},${col}`)
  );

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]!;
    let rx = startX;

    for (let col = 0; col < colCount; col++) {
      const text = row[col] ?? '';
      const isHighlighted = highlightSet.has(`${r},${col}`);

      // Highlight cell background
      if (isHighlighted) {
        c.save();
        c.strokeStyle = remapColor(theme, '#d32f2f');
        c.lineWidth = 2.5;
        const cellY = currentY - rowHeight + cellPadY;
        c.strokeRect(rx + 2, cellY + 2, colWidths[col]! - 4, rowHeight - 4);
        c.restore();
      }

      // Cell text — left-aligned with padding
      const tx = rx + cellPadX;
      c.font = isHighlighted ? theme.answerFont : theme.font;
      c.fillStyle = remapColor(theme, isHighlighted ? theme.answerPen : undefined);

      // Animate cell text character by character
      const baseDelay = text.length > 20 ? 12 : 25;
      let cx = tx;
      for (let i = 0; i < text.length; i++) {
        if (ctx.aborted) break;
        const ch = text[i]!;
        const jitter = (Math.random() - 0.5) * 1.2;
        c.fillText(ch, cx, currentY + jitter);
        cx += c.measureText(ch).width;
        await ctx.sleep(baseDelay);
      }

      // Reset font for next cell
      c.font = theme.font;
      c.fillStyle = remapColor(theme, undefined);

      rx += colWidths[col]!;
    }

    currentY += rowHeight;
    ctx.onCursorMove?.(startX, currentY);
    await ctx.sleep(100);
  }

  // ─── Record bounds ────────────────────────────────────────────
  const totalHeight = totalRows * rowHeight;
  const id = op.target ?? `auto.${ctx.targets.size}`;
  ctx.targets.set(id, {
    x: startX,
    y: startY - rowHeight + cellPadY,
    w: tableWidth,
    h: totalHeight,
  });
  ctx.lastTargetId = id;

  // Move cursor below table
  ctx.cursor.x = ctx.marginX;
  ctx.cursor.y = currentY + 10;
  ctx.onCursorMove?.(ctx.cursor.x, ctx.cursor.y);

  c.restore();
}

/** Auto-compute column widths based on content. */
function computeColWidths(
  c: CanvasRenderingContext2D,
  theme: { font: string; titleFont: string },
  headers: string[] | undefined,
  rows: string[][],
  colCount: number,
  padX: number,
): number[] {
  const widths: number[] = new Array(colCount).fill(80);

  // Measure headers
  if (headers) {
    c.font = theme.titleFont;
    for (let col = 0; col < colCount; col++) {
      const w = c.measureText(headers[col] ?? '').width + padX * 2;
      widths[col] = Math.max(widths[col]!, w);
    }
  }

  // Measure row content
  c.font = theme.font;
  for (const row of rows) {
    for (let col = 0; col < colCount; col++) {
      const w = c.measureText(row[col] ?? '').width + padX * 2;
      widths[col] = Math.max(widths[col]!, w);
    }
  }

  return widths;
}
