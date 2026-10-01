import { useMemo, useState } from 'react';
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

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
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
    if (previousPageData && !previousPageData.has_more) return null;
    const offset = pageIndex * PAGE_SIZE;
    if (offset + PAGE_SIZE > MAX_SEARCH_DEPTH) return null;

    const params = new URLSearchParams({ limit: PAGE_SIZE.toString(), offset: offset.toString() });
    let finalQuery = queryParam;
    try {
      const globalStr = localStorage.getItem('careeragent_global_filters');
      if (globalStr) {
        const globals = JSON.parse(globalStr);
        if (globals.roles && !queryParam) finalQuery += ` ${globals.roles}`;
        if (globals.keywords && !queryParam) finalQuery += ` ${globals.keywords}`;
        if (globals.excludes) finalQuery += ` ${globals.excludes.split(',').map((t: string) => `-${t.trim()}`).join(' ')}`;
      }
    } catch {}
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

  const jobs = useMemo(() => {
    if (!dateParam) return rawJobs;
    const now = Date.now();
    const maxAgeMs = dateParam === '24h' ? 86_400_000 : dateParam === 'week' ? 7 * 86_400_000 : dateParam === 'month' ? 30 * 86_400_000 : null;
    if (!maxAgeMs) return rawJobs;
    return rawJobs.filter((job) => {
      const t = job.posted_at || job.created_at;
      return !t || now - new Date(t).getTime() <= maxAgeMs;
    });
  }, [rawJobs, dateParam]);

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
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 min-h-0 flex-col gap-4 px-4 pt-4 pb-16 sm:px-6 md:pb-4">
        <div className={cn(detailOpen && 'hidden lg:block')}>
          <JobsToolbar resultSummary={summary} />
        </div>

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
                    <JobRow key={job.id} job={job} selected={selectedJob?.id === job.id} onSelect={(j) => setJob(j.id)} />
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
              <ReadingPane job={selectedJob} onBack={() => setJob(null)} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
