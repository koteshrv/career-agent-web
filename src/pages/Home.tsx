import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { sendExtensionMessage } from '../lib/extensionBridge';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { useEvaluations, saveEvaluations, type JobEvaluation } from '../lib/evaluations';
import { useToast } from '../components/ui/toast';
import { usePins } from '../lib/foryou';
import { addLog } from '../lib/logger';
import { UserRound } from 'lucide-react';
import type { Job, JobDetailResponse } from '../lib/api';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { JobRow, JobRowSkeleton } from '../components/JobRow';
import { JobsToolbar } from '../components/JobsToolbar';
import { ReadingPane } from '../components/ReadingPane';
import { fetcher } from '../lib/api';
import type { JobsResponse } from '../lib/api';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { cn } from '../lib/utils';

const PAGE_SIZE = 20;
const MAX_SEARCH_DEPTH = 100; // API ceiling: offset + limit <= 100

type Defaults = { roles: string; keywords: string; excludes: string; location: string };
function readDefaults(): Defaults {
  try {
    return { roles: '', keywords: '', excludes: '', location: '', ...JSON.parse(localStorage.getItem('careeragent_global_filters') || '{}') };
  } catch {
    return { roles: '', keywords: '', excludes: '', location: '' };
  }
}

/** Jobs (`all`) is the whole feed, untouched. For you (`matches`) applies the profile's search defaults and can triage with AI. */
export function Home({ mode }: { mode: 'all' | 'matches' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = mode === 'matches';
  const defaults = useMemo(readDefaults, []);
  const hasDefaults = Boolean(defaults.roles || defaults.keywords);
  const evaluations = useEvaluations();
  const extension = useExtensionStatus();
  const toast = useToast();
  const [evaluating, setEvaluating] = useState<{ done: number; total: number } | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const pins = usePins();
  // Pinned postings that the search did not bring in are fetched by id.
  const [pinnedJobs, setPinnedJobs] = useState<Job[]>([]);
  useEffect(() => {
    if (!matches || pins.length === 0) { setPinnedJobs([]); return; }
    let alive = true;
    Promise.all(pins.map((id) => fetcher(`/v1/jobs/${id}`).then((d) => (d as JobDetailResponse).job).catch(() => null))).then((list) => {
      if (alive) setPinnedJobs(list.filter((j): j is Job => Boolean(j)));
    });
    return () => { alive = false; };
  }, [matches, pins]);
  // For you without search defaults has nothing to search for; only hand-picked postings show.
  const nothingToMatch = matches && !hasDefaults;
  const [isRetrying, setIsRetrying] = useState(false);

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';
  const selectedJobId = searchParams.get('job') || '';

  const setJob = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('job', id);
    else next.delete('job');
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilters = Boolean(queryParam || countryParam || workplaceParam || dateParam);

  const getKey = (pageIndex: number, previousPageData: JobsResponse | null) => {
    if (nothingToMatch) return null;
    if (previousPageData && !previousPageData.has_more) return null;
    const offset = pageIndex * PAGE_SIZE;
    if (offset + PAGE_SIZE > MAX_SEARCH_DEPTH) return null;

    const params = new URLSearchParams({ limit: PAGE_SIZE.toString(), offset: offset.toString() });
    let finalQuery = queryParam;
    if (matches && !queryParam) finalQuery = `${defaults.roles} ${defaults.keywords}`;
    finalQuery = finalQuery.trim();
    if (finalQuery) params.set('q', finalQuery);
    if (countryParam) params.set('country', countryParam);
    if (workplaceParam) params.set('workplace_type', workplaceParam);
    return `/v1/jobs?${params.toString()}`;
  };

  const { data, size, setSize, error, mutate } = useSWRInfinite<JobsResponse>(getKey, fetcher, {
    revalidateFirstPage: true,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      setSize(1);
      await mutate(undefined, { revalidate: true });
    } finally {
      setIsRetrying(false);
    }
  };

  const rawJobs = useMemo(() => (data ? data.flatMap((page) => (page && Array.isArray(page.jobs) ? page.jobs : [])) : []), [data]);

  // Excluded terms apply only on For you: the feed's search has no negation, so they are filtered here.
  const excludes = useMemo(() => (matches ? defaults.excludes.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : []), [matches, defaults.excludes]);

  const jobs = useMemo(() => {
    const now = Date.now();
    const maxAgeMs = dateParam === '24h' ? 86_400_000 : dateParam === 'week' ? 7 * 86_400_000 : dateParam === 'month' ? 30 * 86_400_000 : null;
    const list = rawJobs.filter((job) => {
      if (excludes.length > 0) {
        const title = job.title.toLowerCase();
        if (excludes.some((term) => title.includes(term))) return false;
      }
      if (!maxAgeMs) return true;
      const t = job.posted_at || job.created_at;
      return !t || now - new Date(t).getTime() <= maxAgeMs;
    });
    if (!matches) return list;
    // Hand-picked postings join the search results; evaluated postings float to the top by score.
    const seen = new Set(list.map((j) => j.id));
    const merged = [...pinnedJobs.filter((j) => !seen.has(j.id)), ...list];
    return merged.sort((a, b) => (evaluations[b.id]?.score ?? -1) - (evaluations[a.id]?.score ?? -1));
  }, [rawJobs, dateParam, excludes, matches, evaluations, pinnedJobs]);

  // Batch triage: 10 postings per request, descriptions fetched where the list lacks them.
  const pending = useMemo(() => (matches ? jobs.filter((j) => !evaluations[j.id]) : []), [matches, jobs, evaluations]);
  const evaluateAll = async () => {
    if (pending.length === 0 || evaluating) return;
    const targets = pending.slice(0, 50);
    setEvaluating({ done: 0, total: targets.length });
    setLastRun(null);
    let scored = 0;
    let noText = 0;
    let failure: string | null = null;
    try {
      for (let i = 0; i < targets.length; i += 10) {
        const batch = targets.slice(i, i + 10);
        const withText = await Promise.all(
          batch.map(async (job: Job) => {
            let description = job.description || job.cleaned_description || job.raw_description || '';
            if (!description) {
              try {
                const d = (await fetcher(`/v1/jobs/${job.id}`)) as JobDetailResponse;
                description = d.job.description || d.job.cleaned_description || d.job.raw_description || '';
              } catch {}
            }
            return { id: job.id, title: job.title, company: job.company, location: job.location || undefined, description: description.slice(0, 6000) };
          })
        );
        const usable = withText.filter((j) => j.description);
        noText += withText.length - usable.length;
        if (usable.length > 0) {
          try {
            const res = await sendExtensionMessage<{ results: Omit<JobEvaluation, 'evaluatedAt'>[]; meta?: { model?: string; provider?: string; durationMs?: number; systemPrompt?: string } }>({ action: 'evaluate_jobs', payload: { jobs: usable } }, 180_000);
            const now = new Date().toISOString();
            saveEvaluations(res.results.map((r) => ({ ...r, evaluatedAt: now, model: res.meta?.model })));
            scored += res.results.length;
            addLog({ endpoint: 'Extension background worker → your AI provider', action: `Evaluate ${usable.length} postings`, timestamp: now, status: 200, meta: res.meta, requestBody: { postings: usable.map((j) => `${j.title} · ${j.company}`), postingText: usable.map((j) => `## ${j.title} · ${j.company}\n${j.description}`).join('\n\n') }, responseBody: { results: res.results } });
          } catch (e: unknown) {
            failure = e instanceof Error ? e.message : String(e);
            addLog({ endpoint: 'Extension background worker', action: `Evaluate ${usable.length} postings`, timestamp: new Date().toISOString(), status: 500, requestBody: { postings: usable.map((j) => `${j.title} · ${j.company}`) }, responseBody: { error: failure } });
            break;
          }
        }
        setEvaluating({ done: Math.min(i + 10, targets.length), total: targets.length });
      }
    } finally {
      setEvaluating(null);
      const parts = [`${scored} scored`];
      if (noText > 0) parts.push(`${noText} skipped (no description in the feed)`);
      if (failure) parts.push(`stopped: ${failure}`);
      setLastRun(parts.join(' · '));
      if (failure) toast(failure, 'error');
    }
  };


  // Desktop keeps a posting open at all times; phones open one only on tap.
  const selectedJob = useMemo(() => (selectedJobId ? jobs.find((j) => j.id === selectedJobId) || null : jobs[0] ?? null), [jobs, selectedJobId]);
  const detailOpen = Boolean(selectedJobId);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && !error && jobs.length === 0;
  const currentOffset = (size - 1) * PAGE_SIZE;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.has_more === false) || currentOffset + PAGE_SIZE >= MAX_SEARCH_DEPTH;

  const summary = isLoadingInitialData ? 'Loading' : error ? 'Feed unavailable' : `${jobs.length} ${jobs.length === 1 ? 'posting' : 'postings'}${hasActiveFilters ? ' match' : ''}`;

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 min-h-0 flex-col gap-4 px-4 pt-5 pb-16 sm:px-8 md:pb-6">
        <div className={cn(detailOpen && 'hidden lg:block')}>
          <JobsToolbar
            compact={matches}
            resultSummary={summary}
            action={
              matches && jobs.length > 0 ? (
                <Button size="sm" variant="primary" onClick={evaluateAll} disabled={!extension || pending.length === 0 || Boolean(evaluating)} title={extension ? undefined : 'Connect the extension to evaluate with your AI key'}>
                  <Sparkles className={evaluating ? 'animate-pulse' : ''} />
                  {evaluating ? `Evaluating ${evaluating.done} of ${evaluating.total}` : pending.length === 0 ? 'All evaluated' : `Evaluate ${Math.min(pending.length, 50)} with AI (${Math.ceil(Math.min(pending.length, 50) / 10)} ${Math.min(pending.length, 50) > 10 ? 'requests' : 'request'})`}
                </Button>
              ) : null
            }
            note={
              matches ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Filtered automatically from your search defaults{defaults.roles && <>: <span className="text-foreground">{defaults.roles}</span></>}{defaults.keywords && <>, <span className="text-foreground">{defaults.keywords}</span></>}{defaults.excludes && <>, excluding <span className="text-foreground">{defaults.excludes}</span></>}
                  {' '}(<Link to="/profile#search-defaults" className="text-primary-text underline-offset-2 hover:underline">edit</Link>), plus anything you add from Jobs with “Add to For you”. Evaluate sends postings to your own AI key, ten per request, and scores each 1–5 against your profile.
                  {lastRun && <span className="block text-foreground">{lastRun}</span>}
                </p>
              ) : null
            }
          />
        </div>

        {nothingToMatch && pinnedJobs.length === 0 ? (
          <EmptyState
            icon={<UserRound />}
            title="Tell us what you are looking for"
            body="For you fills itself from the search defaults in your profile: target roles, keywords and terms to exclude. Add them, or pick postings from Jobs with “Add to For you”."
            action={
              <>
                <Button asChild variant="primary"><Link to="/profile#search-defaults">Set search defaults</Link></Button>
                <Button asChild><Link to="/jobs">Browse jobs</Link></Button>
              </>
            }
          />
        ) : (
        <div className="flex flex-1 min-h-0 gap-4">
          {/* List */}
          <section aria-label="Job postings" className={cn('min-h-0 w-full flex-col lg:flex lg:w-[420px] xl:w-[460px] lg:shrink-0', detailOpen ? 'hidden' : 'flex')}>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card">
              {isLoadingInitialData && (
                <ul aria-busy="true" aria-label="Loading postings">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <JobRowSkeleton key={i} />
                  ))}
                </ul>
              )}

              {error && (
                <EmptyState
                  icon={<AlertCircle />}
                  title="The job feed is not reachable"
                  body={error.message || 'The service may be restarting. Try again in a moment.'}
                  action={
                    <>
                      <Button variant="primary" onClick={handleRetry} disabled={isRetrying}>
                        <RefreshCw className={isRetrying ? 'animate-spin' : ''} />
                        {isRetrying ? 'Connecting' : 'Try again'}
                      </Button>
                      {hasActiveFilters && (
                        <Button onClick={() => setSearchParams(new URLSearchParams())}>Clear filters</Button>
                      )}
                    </>
                  }
                />
              )}

              {isEmpty && (
                <EmptyState
                  icon={<Search />}
                  title="No postings match"
                  body={hasActiveFilters ? 'Remove a keyword or widen the filters.' : 'The feed is empty right now. Check back soon.'}
                  action={hasActiveFilters && <Button onClick={() => setSearchParams(new URLSearchParams())}>Clear filters</Button>}
                />
              )}

              {jobs.length > 0 && (
                <ul>
                  {jobs.map((job) => (
                    <JobRow key={job.id} evaluation={evaluations[job.id]} job={job} selected={selectedJob?.id === job.id} onSelect={(j) => setJob(j.id)} />
                  ))}
                </ul>
              )}

              {jobs.length > 0 && !isReachingEnd && (
                <div className="p-3 text-center">
                  <Button size="sm" onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Loading' : 'Load more'}
                  </Button>
                </div>
              )}
              {jobs.length > 0 && isReachingEnd && !isEmpty && (
                <p className="p-3 text-center text-sm text-muted-foreground">
                  {currentOffset + PAGE_SIZE >= MAX_SEARCH_DEPTH ? 'Showing the first 100. Add a keyword to narrow the search.' : 'End of results'}
                </p>
              )}
            </div>
          </section>

          {/* Reading pane */}
          {selectedJob && (
            <section aria-label="Job details" className={cn('min-h-0 min-w-0 flex-1', detailOpen ? 'block' : 'hidden lg:block')}>
              <ReadingPane evaluation={selectedJob ? evaluations[selectedJob.id] : undefined} job={selectedJob} onBack={() => setJob(null)} />
            </section>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
