/**
 * Runtime ID generation.
 *
 * Uses crypto.randomUUID() when available (modern browsers + Node 19+);
 * falls back to a counter + timestamp + random suffix for ancient runtimes
 * or hostile test environments. IDs returned here are NOT seeded — they
 * are meant for in-session runtime entities (newly raised armies, queued
 * events, generated characters). Reproducible content uses RNG streams.
 */

let fallbackCounter = 0;

function uuidLike(): string {
  fallbackCounter += 1;
  const ts = Date.now().toString(36);
  const ctr = fallbackCounter.toString(36).padStart(4, '0');
  const rand = Math.floor(Math.random() * 0x7fffffff)
    .toString(36)
    .padStart(6, '0');
  return `${ts}-${ctr}-${rand}`;
}

export function generateId(prefix?: string): string {
  let core: string;
  // crypto.randomUUID is on the WebCrypto interface; guard for environments
  // that ship a partial crypto polyfill.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    core = crypto.randomUUID();
  } else {
    core = uuidLike();
  }
  return prefix ? `${prefix}_${core}` : core;
}
