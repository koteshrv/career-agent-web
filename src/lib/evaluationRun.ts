import { useSyncExternalStore } from 'react';
import { fetcher, ApiError } from './api';
import type { Job, JobDetailResponse, JobsResponse } from './api';
import { sendExtensionMessage } from './extensionBridge';
import { getEvaluations, saveEvaluations, type JobEvaluation } from './evaluations';
import { addLog } from './logger';

/**
 * Batch triage that outlives the page: it walks the whole result set (not just the rows on screen), then sends
 * postings to the extension twenty at a time. Progress lives here, so leaving For you and coming back shows the
 * same run; results are saved per batch, so a stop or a crash keeps everything scored so far.
 */
export const BATCH = 20;
const PAGE = 50;

export type RunState = {
  phase: 'idle' | 'collecting' | 'evaluating' | 'done';
  target: number;
  found: number;
  scored: number;
  skipped: number;
  failure: string | null;
  stopping: boolean;
};

const IDLE: RunState = { phase: 'idle', target: 0, found: 0, scored: 0, skipped: 0, failure: null, stopping: false };
let state: RunState = IDLE;
const listeners = new Set<() => void>();
const set = (patch: Partial<RunState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export function useEvaluationRun(): RunState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}

export const isRunning = () => state.phase === 'collecting' || state.phase === 'evaluating';
export function stopRun() {
  if (isRunning()) set({ stopping: true });
}
export function clearRun() {
  if (!isRunning()) set(IDLE);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The job index allows about 100 requests a minute per client. A long run can cross that, so a 429 (or a network
 * blip) waits and retries instead of dropping postings; anything else fails fast.
 */
async function fetchPatiently<T>(url: string): Promise<T> {
  const waits = [2_000, 8_000, 20_000, 45_000];
  for (let attempt = 0; ; attempt++) {
    try {
      return (await fetcher(url)) as T;
    } catch (e) {
      const retryable = !(e instanceof ApiError) || e.status === 429 || e.status >= 500;
      if (!retryable || attempt >= waits.length || state.stopping) throw e;
      await sleep(e instanceof ApiError && e.retryAfterSecs ? e.retryAfterSecs * 1000 : waits[attempt]);
    }
  }
}

/** Runs `fn` over `items` with at most `limit` in flight. */
async function mapLimited<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

type Candidate = { id: string; title: string; company: string; location?: string; description: string };

const textOf = (j: Job & { excerpt?: string | null }) => j.excerpt || j.description || j.cleaned_description || j.raw_description || '';

/**
 * Evaluate up to `target` not-yet-scored postings for this search. `extra` (pinned postings) go first.
 * `excludes` re-applies title exclusions for API versions that ignore the parameter.
 */
export async function startRun(params: URLSearchParams, target: number, extra: Job[], excludes: string[]) {
  if (isRunning() || target < 1) return;
  set({ ...IDLE, phase: 'collecting', target });
  const done = new Set(Object.keys(getEvaluations()));
  const queue: Candidate[] = [];
  const take = (j: Job & { excerpt?: string | null }) => {
    if (queue.length >= target || done.has(j.id) || queue.some((q) => q.id === j.id)) return;
    if (excludes.length && excludes.some((t) => j.title.toLowerCase().includes(t))) return;
    queue.push({ id: j.id, title: j.title, company: j.company, location: j.location || undefined, description: textOf(j) });
  };

  try {
    // 1. Find the postings: walk the result pages until there are enough unscored ones.
    extra.forEach(take);
    let offset = 0;
    let more = true;
    while (more && queue.length < target && !state.stopping) {
      const p = new URLSearchParams(params);
      p.set('limit', String(PAGE));
      p.set('offset', String(offset));
      p.set('include', 'excerpt');
      const page = await fetchPatiently<JobsResponse>(`/v1/jobs?${p.toString()}`);
      (page.jobs as Array<Job & { excerpt?: string | null }>).forEach(take);
      more = Boolean(page.has_more);
      offset = (page.offset ?? offset) + (page.limit ?? PAGE);
      set({ found: queue.length });
    }

    // 2. Score them, BATCH at a time, fetching a description only where the list carried none.
    set({ phase: 'evaluating', target: queue.length });
    for (let i = 0; i < queue.length && !state.stopping; i += BATCH) {
      // Only needed when the API did not send excerpts; kept to a few at a time to stay under its rate limit.
      const batch = await mapLimited(queue.slice(i, i + BATCH), 3, async (c) => {
        if (c.description) return c;
        try {
          const d = await fetchPatiently<JobDetailResponse>(`/v1/jobs/${c.id}`);
          return { ...c, description: textOf(d.job) };
        } catch {
          return c;
        }
      });
      const usable = batch.filter((c) => c.description).map((c) => ({ ...c, description: c.description.slice(0, 4000) }));
      const skipped = batch.length - usable.length;
      if (usable.length) {
        const res = await sendExtensionMessage<{ results: Omit<JobEvaluation, 'evaluatedAt'>[]; meta?: { model?: string; provider?: string; durationMs?: number; systemPrompt?: string } }>(
          { action: 'evaluate_jobs', payload: { jobs: usable } },
          180_000
        );
        const now = new Date().toISOString();
        saveEvaluations(res.results.map((r) => ({ ...r, evaluatedAt: now, model: res.meta?.model })));
        addLog({
          endpoint: 'Extension background worker → your AI provider',
          action: `Evaluate ${usable.length} postings`,
          timestamp: now,
          status: 200,
          meta: res.meta,
          requestBody: { postings: usable.map((j) => `${j.title} · ${j.company}`) },
          responseBody: { results: res.results },
        });
        set({ scored: state.scored + res.results.length, skipped: state.skipped + skipped });
      } else {
        set({ skipped: state.skipped + skipped });
      }
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    addLog({ endpoint: 'Extension background worker', action: 'Evaluate postings', timestamp: new Date().toISOString(), status: 500, requestBody: {}, responseBody: { error: message } });
    set({ failure: message });
  } finally {
    set({ phase: 'done', stopping: false });
  }
}
