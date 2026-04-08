/**
 * Extension service worker (MV3).
 * Minimal responsibilities:
 *  - On install, set the side panel behavior so clicking the toolbar icon
 *    opens the side panel instead of/in addition to the popup.
 *  - Accept messages from popup to open the side panel.
 *
 * No persistent state — MV3 service workers are not persistent.
 * All state lives in chrome.storage.local, read by document contexts.
 */

declare const chrome: {
  sidePanel?: {
    setPanelBehavior(opts: { openPanelOnActionClick: boolean }): Promise<void>;
    open(opts: { windowId?: number; tabId?: number }): Promise<void>;
  };
  runtime: {
    onInstalled: { addListener(cb: () => void): void };
    onMessage: {
      addListener(
        cb: (msg: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => boolean | void
      ): void;
    };
  };
  windows?: {
    getCurrent(): Promise<{ id: number }>;
  };
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => { /* older Chrome */ });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (typeof msg === 'object' && msg && (msg as { type?: string }).type === 'open-sidepanel') {
    (async () => {
      const win = await chrome.windows?.getCurrent();
      if (win) await chrome.sidePanel?.open({ windowId: win.id });
      sendResponse({ ok: true });
    })();
    return true; // async response
  }
  return false;
});
