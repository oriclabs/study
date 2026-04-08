import type { StorageAdapter } from '@platform/types.js';

/**
 * PWA storage adapter backed by IndexedDB via a tiny wrapper.
 * Key/value only; no indexes needed.
 */

const DB_NAME = 'study';
const STORE = 'kv';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function createPwaStorage(): StorageAdapter {
  return {
    async get<T>(key: string): Promise<T | null> {
      const value = await tx<T | undefined>('readonly', s => s.get(key) as IDBRequest<T | undefined>);
      return value ?? null;
    },
    async set<T>(key: string, value: T): Promise<void> {
      await tx('readwrite', s => s.put(value, key));
    },
    async delete(key: string): Promise<void> {
      await tx('readwrite', s => s.delete(key));
    },
    async list(prefix: string): Promise<string[]> {
      const keys = await tx<IDBValidKey[]>('readonly', s => s.getAllKeys() as IDBRequest<IDBValidKey[]>);
      return keys.map(String).filter(k => k.startsWith(prefix));
    },
    async exportAll(): Promise<Record<string, unknown>> {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const out: Record<string, unknown> = {};
        const store = db.transaction(STORE, 'readonly').objectStore(STORE);
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            out[String(cursor.key)] = cursor.value;
            cursor.continue();
          } else {
            resolve(out);
          }
        };
        req.onerror = () => reject(req.error);
      });
    },
    async importAll(data: Record<string, unknown>): Promise<void> {
      for (const [k, v] of Object.entries(data)) {
        await tx('readwrite', s => s.put(v, k));
      }
    },
  };
}
