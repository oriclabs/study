import type { HostAdapter } from '@platform/types.js';

export function createPwaHost(): HostAdapter {
  return {
    async openExternal(url: string): Promise<void> {
      window.open(url, '_blank', 'noopener');
    },
    async showNotification(title: string, body: string): Promise<void> {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    },
    getDisplayMode(): 'window' | 'tab' {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      return isStandalone ? 'window' : 'tab';
    },
    getLocale(): string {
      return navigator.language || 'en';
    },
  };
}
