import type { HostAdapter, DisplayMode } from '@platform/types.js';

declare const chrome: {
  tabs: { create(opts: { url: string }): Promise<unknown> };
  notifications?: {
    create(opts: { type: string; iconUrl: string; title: string; message: string }): void;
  };
  i18n?: { getUILanguage(): string };
};

export function createExtHost(mode: DisplayMode): HostAdapter {
  return {
    async openExternal(url: string): Promise<void> {
      await chrome.tabs.create({ url });
    },
    async showNotification(title: string, body: string): Promise<void> {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title,
          message: body,
        });
      }
    },
    getDisplayMode(): DisplayMode { return mode; },
    getLocale(): string {
      return chrome.i18n?.getUILanguage() ?? 'en';
    },
  };
}
