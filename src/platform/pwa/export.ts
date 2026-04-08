import type { ExportAdapter } from '@platform/types.js';

export function createPwaExport(): ExportAdapter {
  function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
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
