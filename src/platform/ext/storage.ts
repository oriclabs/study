import type { StorageAdapter } from '@platform/types.js';

/**
 * Browser extension storage adapter — chrome.storage.local.
 * Key/value, per-user, synced across extension surfaces (popup, sidepanel, options).
 * ~10 MB quota. Well over what progress + SR + mistakes need.
 */

declare const chrome: {
  storage: {
    local: {
      get(keys: string | string[] | null, cb: (items: Record<string, unknown>) => void): void;
      set(items: Record<string, unknown>, cb?: () => void): void;
      remove(keys: string | string[], cb?: () => void): void;
    };
  };
  runtime: { lastError?: { message: string } };
};

function call<T>(fn: (cb: (v: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn(v => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(v);
    });
  });
}

export function createExtStorage(): StorageAdapter {
  return {
    async get<T>(key: string): Promise<T | null> {
      const items = await call<Record<string, unknown>>(cb => chrome.storage.local.get(key, cb));
      return (items[key] as T) ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await call<void>(cb => chrome.storage.local.set({ [key]: value }, cb));
    },
    async delete(key: string): Promise<void> {
      await call<void>(cb => chrome.storage.local.remove(key, cb));
    },
    async list(prefix: string): Promise<string[]> {
      const all = await call<Record<string, unknown>>(cb => chrome.storage.local.get(null, cb));
      return Object.keys(all).filter(k => k.startsWith(prefix));
    },
    async exportAll(): Promise<Record<string, unknown>> {
      return call<Record<string, unknown>>(cb => chrome.storage.local.get(null, cb));
    },
    async importAll(data: Record<string, unknown>): Promise<void> {
      await call<void>(cb => chrome.storage.local.set(data, cb));
    },
  };
}
