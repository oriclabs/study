/**
 * Pen cursor — animated SVG overlay that follows the renderer cursor
 * on the canvas. Supports pencil, chalk, and marker styles.
 * Tip is at bottom-left of SVG, matching the writing point.
 */

export type PenStyle = 'pencil' | 'chalk' | 'marker';

// All SVGs: 24x36, tip at approximately (4, 34)
const PEN_SVGS: Record<PenStyle, string> = {

  // Yellow #2 pencil, sharpened tip at bottom
  pencil: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="0" width="12" height="4" rx="1" fill="#d4a843" stroke="#a07830" stroke-width="0.6"/>
    <rect x="6" y="4" width="12" height="22" fill="#f5c542" stroke="#b8942e" stroke-width="0.6"/>
    <rect x="6" y="4" width="12" height="2" fill="#e8b63a"/>
    <polygon points="6,26 12,36 18,26" fill="#f0d4a0"/>
    <polygon points="10,32 12,36 14,32" fill="#333"/>
    <line x1="6" y1="26" x2="12" y2="36" stroke="#b8942e" stroke-width="0.5"/>
    <line x1="18" y1="26" x2="12" y2="36" stroke="#b8942e" stroke-width="0.5"/>
  </svg>`,

  // Thin chalk stick — tapered cylinder, dusty white
  chalk: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="0" width="8" height="28" rx="3" fill="#f0ece4" stroke="#c8c0b0" stroke-width="0.7"/>
    <rect x="8" y="0" width="8" height="4" rx="2" fill="#e0d8cc"/>
    <polygon points="9,28 12,35 15,28" rx="1" fill="#e8e4dc" stroke="#c8c0b0" stroke-width="0.5"/>
    <circle cx="12" cy="34" r="1" fill="#d8d0c4"/>
    <rect x="9" y="8" width="1" height="12" rx="0.5" fill="#d8d0c4" opacity="0.5"/>
    <rect x="14" y="5" width="1" height="8" rx="0.5" fill="#d8d0c4" opacity="0.4"/>
  </svg>`,

  // Whiteboard marker — fat body, flat felt tip
  marker: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="0" width="14" height="4" rx="2" fill="#0d47a1"/>
    <rect x="5" y="4" width="14" height="20" rx="1" fill="#1565c0" stroke="#0d47a1" stroke-width="0.6"/>
    <rect x="7" y="6" width="3" height="8" rx="1" fill="#1976d2" opacity="0.5"/>
    <rect x="7" y="24" width="10" height="4" fill="#444" stroke="#333" stroke-width="0.5"/>
    <rect x="8" y="28" width="8" height="6" rx="0.5" fill="#555"/>
    <rect x="9" y="34" width="6" height="2" rx="0.5" fill="#333"/>
  </svg>`,
};

// Tip offset: how far from the SVG's top-left corner the writing tip is
const TIP_OFFSETS: Record<PenStyle, { x: number; y: number }> = {
  pencil: { x: 12, y: 36 },
  chalk:  { x: 12, y: 35 },
  marker: { x: 12, y: 36 },
};

export class PenCursor {
  private el: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private style: PenStyle = 'pencil';
  private tipOffset = TIP_OFFSETS.pencil;
  private visible = false;
  private enabled = true;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'pen-cursor';
    this.el.style.display = 'none';
    this.setStyle('pencil');
  }

  getElement(): HTMLElement { return this.el; }

  attachTo(canvasWrap: HTMLElement, canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    canvasWrap.style.position = 'relative';
    if (this.el.parentElement !== canvasWrap) {
      canvasWrap.appendChild(this.el);
    }
  }

  setStyle(style: PenStyle): void {
    this.style = style;
    this.tipOffset = TIP_OFFSETS[style];
    this.el.innerHTML = PEN_SVGS[style];
  }

  getStyle(): PenStyle { return this.style; }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.el.style.display = 'none';
  }

  show(): void {
    this.visible = true;
    if (this.enabled) this.el.style.display = 'block';
  }

  hide(): void {
    this.visible = false;
    this.el.style.display = 'none';
  }

  moveTo(x: number, y: number): void {
    if (!this.canvas || !this.visible || !this.enabled) return;
    const scaleX = this.canvas.clientWidth / this.canvas.width;
    const scaleY = this.canvas.clientHeight / this.canvas.height;
    // Position so the tip (bottom-center of SVG) lands on (x, y)
    this.el.style.left = (x * scaleX - this.tipOffset.x) + 'px';
    this.el.style.top = (y * scaleY - this.tipOffset.y) + 'px';
  }

  createCallback(): (x: number, y: number) => void {
    return (x, y) => this.moveTo(x, y);
  }
}
