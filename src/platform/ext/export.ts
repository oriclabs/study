import type { ExportAdapter } from '@platform/types.js';

declare const chrome: {
  downloads?: {
    download(opts: { url: string; filename: string; saveAs?: boolean }, cb?: (id: number) => void): void;
  };
};

/**
 * Extension export adapter. Uses chrome.downloads where available
 * (requires "downloads" permission in manifest); falls back to an
 * anchor click otherwise.
 */
export function createExtExport(): ExportAdapter {
  function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    if (chrome.downloads?.download) {
      chrome.downloads.download({ url, filename, saveAs: true });
      // URL lifetime managed by chrome; revoke after a short delay.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return {
    async savePNG(data, filename) { download(data, filename); },
    async savePDF(data, filename) { download(data, filename); },
    async saveJSON(data, filename) {
      download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
    },
    async copyToClipboard(text) {
      await navigator.clipboard.writeText(text);
    },
  };
}
