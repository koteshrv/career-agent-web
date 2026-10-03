/**
 * Job-list pages kept in IndexedDB so a For you result of thousands of postings opens instantly on the next visit.
 * Fresh for an hour (the index is crawled hourly); after ten minutes a cached page is still served but refreshed in
 * the background for next time. localStorage is too small for this (5,000 postings with excerpts is ~10 MB).
 */
import { fetcher } from './api';

const DB = 'careeragent-cache';
const STORE = 'pages';
const FRESH_MS = 60 * 60_000;
const REFRESH_AFTER_MS = 10 * 60_000;

type Entry = { url: string; data: unknown; savedAt: number };

let dbPromise: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'url' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function read(url: string): Promise<Entry | null> {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    const req = d.transaction(STORE).objectStore(STORE).get(url);
    req.onsuccess = () => resolve((req.result as Entry) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function write(url: string, data: unknown) {
  const d = await db();
  if (!d) return;
  try {
    d.transaction(STORE, 'readwrite').objectStore(STORE).put({ url, data, savedAt: Date.now() } satisfies Entry);
  } catch {
    /* quota or private mode: caching is best effort */
  }
}

/** Drop pages older than an hour; called once per load. */
export async function pruneCache() {
  const d = await db();
  if (!d) return;
  const store = d.transaction(STORE, 'readwrite').objectStore(STORE);
  const req = store.openCursor();
  req.onsuccess = () => {
    const cursor = req.result;
    if (!cursor) return;
    if (Date.now() - (cursor.value as Entry).savedAt > FRESH_MS) cursor.delete();
    cursor.continue();
  };
}

export async function clearPageCache() {
  const d = await db();
  if (d) d.transaction(STORE, 'readwrite').objectStore(STORE).clear();
}

/** Same contract as `fetcher`, for /v1/jobs list URLs. */
export async function cachedFetcher(url: string): Promise<unknown> {
  const hit = await read(url);
  const age = hit ? Date.now() - hit.savedAt : Infinity;
  if (hit && age < FRESH_MS) {
    if (age > REFRESH_AFTER_MS) fetcher(url).then((data) => write(url, data)).catch(() => undefined);
    return hit.data;
  }
  const data = await fetcher(url);
  write(url, data);
  return data;
}
