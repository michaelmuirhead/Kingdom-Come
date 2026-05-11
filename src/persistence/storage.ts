/**
 * Storage abstraction so save/load can swap backends later (IndexedDB,
 * cloud sync, in-memory for tests) without touching the call sites.
 *
 * v0.1 ships only the localStorage backend; an InMemoryBackend is
 * exported for tests and SSR environments where window.localStorage
 * isn't available.
 */

export interface StorageBackend {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

/** localStorage-backed implementation. */
export class LocalStorageBackend implements StorageBackend {
  private hasStorage(): boolean {
    return typeof globalThis !== 'undefined' &&
      typeof (globalThis as { localStorage?: Storage }).localStorage !==
        'undefined';
  }

  async read(key: string): Promise<string | null> {
    if (!this.hasStorage()) return null;
    return localStorage.getItem(key);
  }

  async write(key: string, value: string): Promise<void> {
    if (!this.hasStorage()) {
      throw new Error('Storage unavailable: no localStorage in this environment');
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Save failed: ${msg}`);
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.hasStorage()) return;
    localStorage.removeItem(key);
  }

  async list(prefix: string): Promise<string[]> {
    if (!this.hasStorage()) return [];
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(k);
    }
    return out;
  }
}

/** Pure-memory backend — used in tests and as an SSR fallback. */
export class InMemoryBackend implements StorageBackend {
  private store = new Map<string, string>();

  async read(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
  async write(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
  async list(prefix: string): Promise<string[]> {
    return [...this.store.keys()].filter((k) => k.startsWith(prefix));
  }
}

/** Process-wide default backend. Swappable for tests. */
let defaultBackend: StorageBackend = new LocalStorageBackend();

export function getStorageBackend(): StorageBackend {
  return defaultBackend;
}

export function setStorageBackend(b: StorageBackend): void {
  defaultBackend = b;
}

export const SAVE_PREFIX = 'kc:save:';

export function slotKey(slot: string): string {
  return `${SAVE_PREFIX}${slot}`;
}
