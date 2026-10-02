import { useEffect, useState } from 'react';
import type { MaterialKind } from './extensionBridge';

/** Generated drafts, kept per posting and kind so reopening a job shows what was already made. Last 24 kept. */
export interface SavedDraft {
  key: string;
  jobId?: string;
  company: string;
  title: string;
  kind: MaterialKind;
  text: string;
  pdf?: string | null;
  changes?: string[];
  savedAt: string;
}

const KEY = 'careeragent_drafts';
const EVENT = 'careeragent_drafts_updated';
const MAX = 24;

export function draftKey(kind: MaterialKind, jobId: string | undefined, company: string, title: string): string {
  return `${kind}:${jobId || `${company.trim().toLowerCase()}|${title.trim().toLowerCase()}`}`;
}

export function getDrafts(): Record<string, SavedDraft> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function getDraft(key: string): SavedDraft | null {
  return getDrafts()[key] ?? null;
}

export function saveDraft(d: SavedDraft) {
  const all = getDrafts();
  all[d.key] = d;
  const keep = Object.values(all).sort((a, b) => b.savedAt.localeCompare(a.savedAt)).slice(0, MAX);
  const next: Record<string, SavedDraft> = {};
  for (const x of keep) next[x.key] = x;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota: drop the PDFs of older drafts and retry once.
    for (const x of keep.slice(4)) x.pdf = null;
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useDrafts(): Record<string, SavedDraft> {
  const [all, setAll] = useState(getDrafts);
  useEffect(() => {
    const update = () => setAll(getDrafts());
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return all;
}
