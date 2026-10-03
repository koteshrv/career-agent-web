import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import { Sparkles, UserRound, Search, AlertCircle, RefreshCw, Square } from 'lucide-react';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { useEvaluations } from '../lib/evaluations';
import { usePins } from '../lib/foryou';
import { jobsParams, readSearchDefaults, excludeTerms } from '../lib/jobQuery';
import { useEvaluationRun, startRun, stopRun, clearRun, isRunning, BATCH } from '../lib/evaluationRun';
import type { Job, JobDetailResponse, JobsResponse } from '../lib/api';
import { fetcher } from '../lib/api';
import { cachedFetcher } from '../lib/pageCache';
import { JobRow, JobRowSkeleton } from '../components/JobRow';
import { JobsToolbar } from '../components/JobsToolbar';
import { ReadingPane } from '../components/ReadingPane';
import { Button } from '../components/ui/button';
import { Popover } from '../components/ui/popover';
import { EmptyState } from '../components/ui/empty-state';
import { cn } from '../lib/utils';

const PAGE_SIZE = 50;

/** Jobs (`all`) is the whole feed with the user's own filters. For you (`matches`) searches with the profile's defaults and can triage with AI. */
export function Home({ mode }: { mode: 'all' | 'matches' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = mode === 'matches';
  const defaults = useMemo(() => readSearchDefaults(), []);
  const hasDefaults = Boolean(defaults.roles || defaults.keywords);
  const evaluations = useEvaluations();
  const extension = useExtensionStatus();
  const run = useEvaluationRun();
  const pins = usePins();
  const [isRetrying, setIsRetrying] = useState(false);

  // Pinned postings that the search did not bring in are fetched by id.
  const [pinnedJobs, setPinnedJobs] = useState<Job[]>([]);
  useEffect(() => {
    if (!matches || pins.length === 0) {
      setPinnedJobs([]);
      return;
    }
    let alive = true;
    Promise.all(pins.map((id) => fetcher(`/v1/jobs/${id}`).then((d) => (d as JobDetailResponse).job).catch(() => null))).then((list) => {
      if (alive) setPinnedJobs(list.filter((j): j is Job => Boolean(j)));
    });
    return () => {
      alive = false;
    };
  }, [matches, pins]);
  // For you without search defaults has nothing to search for; only hand-picked postings show.
  const nothingToMatch = matches && !hasDefaults;

  const filters = {
    q: searchParams.get('q') || '',
    company: searchParams.get('company') || '',
    date: searchParams.get('date') || '',
    country: searchParams.get('country') || '',
    workplace: searchParams.get('workplace_type') || '',
  };
  const selectedJobId = searchParams.get('job') || '';
  const hasActiveFilters = Boolean(filters.q || filters.company || filters.date || filters.country || filters.workplace);
  const baseParams = jobsParams(mode, filters, defaults);
  const baseKey = baseParams.toString();

  const setJob = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('job', id);
    else next.delete('job');
    setSearchParams(next, { replace: true });
  };

  // Each page starts where the last one ended, so this works whether the API serves 20 or 50 per page.
  const getKey = (_pageIndex: number, prev: JobsResponse | null) => {
    if (nothingToMatch) return null;
    if (prev && !prev.has_more) return null;
    const p = new URLSearchParams(baseKey);
    p.set('limit', String(PAGE_SIZE));
    p.set('offset', String(prev ? prev.offset + prev.limit : 0));
    return `/v1/jobs?${p.toString()}`;
  };

  const { data, size, setSize, error, mutate, isValidating } = useSWRInfinite<JobsResponse>(getKey, cachedFetcher as (url: string) => Promise<JobsResponse>, {
    revalidateFirstPage: false,
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
  const excludes = useMemo(() => (matches ? excludeTerms(defaults) : []), [matches, defaults]);

  const jobs = useMemo(() => {
    const list = excludes.length ? rawJobs.filter((j) => !excludes.some((t) => j.title.toLowerCase().includes(t))) : rawJobs;
    if (!matches) return list;
    // Hand-picked postings join the search results; evaluated postings float to the top by score.
    const seen = new Set(list.map((j) => j.id));
    const merged = [...pinnedJobs.filter((j) => !seen.has(j.id)), ...list];
    return merged.sort((a, b) => (evaluations[b.id]?.score ?? -1) - (evaluations[a.id]?.score ?? -1));
  }, [rawJobs, excludes, matches, evaluations, pinnedJobs]);

  const total = data?.[0]?.total;
  const last = data?.[data.length - 1];
  const isLoadingInitialData = !nothingToMatch && !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data !== undefined && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && !error && jobs.length === 0;
  const isReachingEnd = isEmpty || last?.has_more === false;
  // The unfiltered feed stops at the API's shallow depth; say so instead of implying that is everything.
  const shallowEnd = isReachingEnd && !matches && !hasActiveFilters && rawJobs.length >= 20;

  // Infinite scroll: a sentinel well below the fold asks for the next page before the user reaches it.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || isReachingEnd || error) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isLoadingMore && !isValidating) setSize((s) => s + 1);
      },
      { root, rootMargin: '0px 0px 1600px 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [isReachingEnd, isLoadingMore, isValidating, error, setSize, rawJobs.length]);

  // Desktop keeps a posting open at all times; phones open one only on tap.
  const selectedJob = useMemo(() => (selectedJobId ? jobs.find((j) => j.id === selectedJobId) || null : jobs[0] ?? null), [jobs, selectedJobId]);
  const detailOpen = Boolean(selectedJobId);

  const scoredHere = useMemo(() => jobs.filter((j) => evaluations[j.id]).length, [jobs, evaluations]);
  // With a total (current API) the ceiling is exact; without one the runner pages until it finds enough.
  const available = Math.max(0, (total ?? (isReachingEnd ? jobs.length : 10_000)) - scoredHere);
  const running = isRunning();
  const evalBtnRef = useRef<HTMLButtonElement>(null);
  const [evalOpen, setEvalOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const presets = [50, 100, 500].filter((n) => n < available);
  const [picked, setChoice] = useState<number | 'all' | 'custom'>(100);
  // A preset that no longer fits (fewer unscored postings than it) falls back to the largest that does, or All.
  const choice: number | 'all' | 'custom' =
    picked === 'custom' || picked === 'all' || presets.includes(picked) ? picked : presets.length ? presets[presets.length - 1] : 'all';
  const chosen = Math.max(0, Math.min(available, choice === 'all' ? available : choice === 'custom' ? parseInt(custom, 10) || 0 : choice));
  const requests = Math.ceil(chosen / BATCH);
  const begin = () => {
    setEvalOpen(false);
    clearRun();
    startRun(baseParams, chosen, pinnedJobs, excludes);
  };

  const summary = isLoadingInitialData
    ? 'Loading'
    : error
    ? 'Feed unavailable'
    : total !== undefined
    ? `${total.toLocaleString()} ${total === 1 ? 'match' : 'matches'}`
    : !matches && !hasActiveFilters
    ? `Latest from ${jobs.length.toLocaleString()}${isReachingEnd ? "" : "+"} employers`
    : `${jobs.length.toLocaleString()}${isReachingEnd ? '' : '+'} ${jobs.length === 1 ? 'posting' : 'postings'}`;

  const runStatus =
    run.phase === 'done'
      ? [`${run.scored.toLocaleString()} scored`, run.skipped ? `${run.skipped} had no description` : '', run.failure ? `stopped: ${run.failure}` : ''].filter(Boolean).join(' · ')
      : null;

  const pill = (active: boolean) =>
    cn(
      'h-8 rounded-xs border px-2.5 text-sm tabular-nums transition-colors cursor-pointer',
      active ? 'border-foreground bg-muted text-foreground' : 'border-border-strong text-muted-foreground hover:text-foreground'
    );

  const evaluateControl = matches && jobs.length > 0 && (
    <div className="relative flex items-center gap-1.5">
      {running ? (
        <>
          <span className="inline-flex h-8 items-center gap-2 rounded-xs border border-border bg-muted px-3 text-sm tabular-nums text-foreground" aria-live="polite">
            <Sparkles className="size-4 animate-pulse" />
            {run.phase === 'collecting'
              ? `Finding postings ${run.found.toLocaleString()} of ${run.target.toLocaleString()}`
              : `Evaluated ${run.scored.toLocaleString()} of ${run.target.toLocaleString()}`}
          </span>
          <Button size="sm" onClick={stopRun} disabled={run.stopping} title="Finish the batch in progress, then stop">
            <Square />
            {run.stopping ? 'Stopping' : 'Stop'}
          </Button>
        </>
      ) : (
        <>
          <Button
            ref={evalBtnRef}
            size="sm"
            variant="primary"
            disabled={!extension || available === 0}
            aria-haspopup="dialog"
            aria-expanded={evalOpen}
            onClick={() => setEvalOpen((o) => !o)}
            title={extension ? undefined : 'Connect the extension to evaluate with your AI key'}
          >
            <Sparkles />
            {available === 0 ? 'All evaluated' : 'Evaluate with AI'}
          </Button>
          <Popover open={evalOpen} onClose={() => setEvalOpen(false)} anchorRef={evalBtnRef} align="end" className="w-80 p-4">
            <div role="dialog" aria-label="Evaluate postings with AI">
              <p className="text-sm font-medium text-foreground">How many postings?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {total !== undefined ? `${available.toLocaleString()} of ${total.toLocaleString()} matches are not scored yet.` : 'Unscored postings from this search, newest first.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Number of postings">
                {presets.map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={choice === n} onClick={() => setChoice(n)} className={pill(choice === n)}>
                    {n}
                  </button>
                ))}
                {available < 10_000 && (
                  <button type="button" role="radio" aria-checked={choice === 'all'} onClick={() => setChoice('all')} className={pill(choice === 'all')}>
                    All {available.toLocaleString()}
                  </button>
                )}
                <button type="button" role="radio" aria-checked={choice === 'custom'} onClick={() => setChoice('custom')} className={pill(choice === 'custom')}>
                  Custom
                </button>
              </div>
              {choice === 'custom' && (
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={available}
                  autoFocus
                  aria-label="Number of postings to evaluate"
                  value={custom}
                  placeholder={`1 to ${available.toLocaleString()}`}
                  onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && chosen > 0 && begin()}
                  className="mt-2 h-9 w-full rounded-xs border border-border-strong bg-card px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {chosen > 0
                  ? `${requests.toLocaleString()} ${requests === 1 ? 'request' : 'requests'} to your own AI key, ${BATCH} postings each. Scores save as they arrive; you can stop any time.`
                  : 'Pick how many to score.'}
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" onClick={() => setEvalOpen(false)}>Cancel</Button>
                <Button size="sm" variant="primary" disabled={chosen === 0} onClick={begin}>
                  Evaluate {chosen > 0 ? chosen.toLocaleString() : ''}
                </Button>
              </div>
            </div>
          </Popover>
        </>
      )}
    </div>
  );

  return (
    <main className="flex-1 min-h-0 flex flex-col">
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 min-h-0 flex-col gap-4 px-4 pt-5 pb-16 sm:px-8 md:pb-6">
        <div className={cn(detailOpen && 'hidden lg:block')}>
          <JobsToolbar
            compact={matches}
            resultSummary={summary}
            action={evaluateControl || null}
            note={
              matches ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {defaults.roles ? 'Matching your target roles' : 'Matching your keywords'} and postings you pin from Jobs (
                  <Link to="/profile#search-defaults" className="text-primary-text underline-offset-2 hover:underline">edit</Link>).
                  {runStatus && <span className={cn('ml-2', run.failure ? 'text-destructive' : 'text-foreground')}>{runStatus}</span>}
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
                <Button asChild variant="primary">
                  <Link to="/profile#search-defaults">Set search defaults</Link>
                </Button>
                <Button asChild>
                  <Link to="/jobs">Browse jobs</Link>
                </Button>
              </>
            }
          />
        ) : (
          <div className="flex flex-1 min-h-0 gap-4">
            {/* List */}
            <section aria-label="Job postings" className={cn('min-h-0 w-full flex-col lg:flex lg:w-[420px] xl:w-[460px] lg:shrink-0', detailOpen ? 'hidden' : 'flex')}>
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-border bg-card">
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
                        {hasActiveFilters && <Button onClick={() => setSearchParams(new URLSearchParams())}>Clear filters</Button>}
                      </>
                    }
                  />
                )}

                {isEmpty && (
                  <EmptyState
                    icon={<Search />}
                    title="No postings match"
                    body={hasActiveFilters ? 'Remove a keyword or widen the filters.' : matches ? 'Nothing matches your search defaults yet. Widen them in your profile.' : 'The feed is empty right now. Check back soon.'}
                    action={hasActiveFilters && <Button onClick={() => setSearchParams(new URLSearchParams())}>Clear filters</Button>}
                  />
                )}

                {jobs.length > 0 && (
                  <ul>
                    {jobs.map((job) => (
                      <JobRow key={job.id} evaluation={evaluations[job.id]} job={job} selected={selectedJob?.id === job.id} onSelect={(j) => setJob(j.id)} />
                    ))}
                    {!isReachingEnd && Array.from({ length: 3 }).map((_, i) => <JobRowSkeleton key={`tail${i}`} />)}
                  </ul>
                )}
                <div ref={sentinelRef} aria-hidden="true" className="h-px" />

                {jobs.length > 0 && isReachingEnd && !isEmpty && (
                  <p className="p-3 text-center text-sm text-muted-foreground">
                    {shallowEnd ? 'That is the latest from every employer. Search or filter to see all of their postings.' : 'End of results'}
                  </p>
                )}
              </div>
            </section>

            {/* Reading pane */}
            {selectedJob && (
              <section aria-label="Job details" className={cn('min-h-0 min-w-0 flex-1', detailOpen ? 'block' : 'hidden lg:block')}>
                <ReadingPane forYou={matches} evaluation={evaluations[selectedJob.id]} job={selectedJob} onBack={() => setJob(null)} />
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
