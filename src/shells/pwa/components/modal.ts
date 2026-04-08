/**
 * Custom modal — replaces browser alert() and confirm() with styled popups.
 * Supports: alert (info), confirm (yes/no), and toast (auto-dismiss).
 */

export type ModalType = 'info' | 'success' | 'warning' | 'error';

const ICONS: Record<ModalType, string> = {
  info: '\u{2139}\uFE0F',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
};

let overlay: HTMLElement | null = null;
let toastContainer: HTMLElement | null = null;

function ensureOverlay(): HTMLElement {
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function ensureToastContainer(): HTMLElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/** Show an info/success/error modal (replaces alert) */
export function showModal(
  message: string,
  opts: { title?: string; type?: ModalType; buttonText?: string } = {},
): Promise<void> {
  return new Promise(resolve => {
    const ov = ensureOverlay();
    ov.innerHTML = '';
    ov.style.display = 'flex';

    const type = opts.type ?? 'info';
    const dialog = document.createElement('div');
    dialog.className = `modal-dialog modal-${type}`;

    dialog.innerHTML = `
      <div class="modal-icon">${ICONS[type]}</div>
      ${opts.title ? `<h3 class="modal-title">${esc(opts.title)}</h3>` : ''}
      <p class="modal-message">${esc(message)}</p>
    `;

    const btn = document.createElement('button');
    btn.className = 'modal-btn modal-btn-primary';
    btn.textContent = opts.buttonText ?? 'OK';
    btn.addEventListener('click', () => {
      ov.style.display = 'none';
      resolve();
    });
    dialog.appendChild(btn);

    ov.appendChild(dialog);
    btn.focus();

    // Close on overlay click
    ov.addEventListener('click', (e) => {
      if (e.target === ov) {
        ov.style.display = 'none';
        resolve();
      }
    }, { once: true });

    // Close on Escape
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ov.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
        resolve();
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

/** Show a confirm dialog (replaces confirm) — returns true/false */
export function showConfirm(
  message: string,
  opts: { title?: string; type?: ModalType; confirmText?: string; cancelText?: string } = {},
): Promise<boolean> {
  return new Promise(resolve => {
    const ov = ensureOverlay();
    ov.innerHTML = '';
    ov.style.display = 'flex';

    const type = opts.type ?? 'warning';
    const dialog = document.createElement('div');
    dialog.className = `modal-dialog modal-${type}`;

    dialog.innerHTML = `
      <div class="modal-icon">${ICONS[type]}</div>
      ${opts.title ? `<h3 class="modal-title">${esc(opts.title)}</h3>` : ''}
      <p class="modal-message">${esc(message)}</p>
    `;

    const btnRow = document.createElement('div');
    btnRow.className = 'modal-btn-row';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.textContent = opts.cancelText ?? 'Cancel';
    cancelBtn.addEventListener('click', () => {
      ov.style.display = 'none';
      resolve(false);
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn modal-btn-primary';
    confirmBtn.textContent = opts.confirmText ?? 'Confirm';
    confirmBtn.addEventListener('click', () => {
      ov.style.display = 'none';
      resolve(true);
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    dialog.appendChild(btnRow);

    ov.appendChild(dialog);
    confirmBtn.focus();

    // Close on overlay click = cancel
    ov.addEventListener('click', (e) => {
      if (e.target === ov) {
        ov.style.display = 'none';
        resolve(false);
      }
    }, { once: true });

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ov.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
        resolve(false);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

/** Show a toast notification (auto-dismisses) */
export function showToast(
  message: string,
  opts: { type?: ModalType; durationMs?: number } = {},
): void {
  const container = ensureToastContainer();
  const type = opts.type ?? 'info';
  const duration = opts.durationMs ?? 3000;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${ICONS[type]}</span><span class="toast-text">${esc(message)}</span>`;

  // Close button
  const close = document.createElement('button');
  close.className = 'toast-close';
  close.textContent = '\u2715';
  close.addEventListener('click', () => dismiss());
  toast.appendChild(close);

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  function dismiss() {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }

  setTimeout(dismiss, duration);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}
