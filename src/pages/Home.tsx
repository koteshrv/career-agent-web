import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  Clock,
  AlertCircle,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { JobDetailPane } from '../components/JobDetailPane';
import { fetcher } from '../lib/api';
import type { JobsResponse } from '../lib/api';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 20;
const MAX_SEARCH_DEPTH = 100; // API ceiling: offset + limit <= 100

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';
  const selectedJobId = searchParams.get('job') || '';

  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    queryParam || countryParam || workplaceParam || dateParam
  );

  // SWR Infinite key generator respecting limit=20 and depth limit of 100
  const getKey = (pageIndex: number, previousPageData: JobsResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;

    const offset = pageIndex * PAGE_SIZE;
    if (offset + PAGE_SIZE > MAX_SEARCH_DEPTH) return null;

    const params = new URLSearchParams({
      limit: PAGE_SIZE.toString(),
      offset: offset.toString(),
    });

    if (queryParam) params.set('q', queryParam);
    if (countryParam) params.set('country', countryParam);
    if (workplaceParam) params.set('workplace_type', workplaceParam);

    return `/v1/jobs?${params.toString()}`;
  };

  const { data, size, setSize, error, mutate, isValidating } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const rawJobs = useMemo(() => {
    return data ? data.flatMap((page) => (page && Array.isArray(page.jobs) ? page.jobs : [])) : [];
  }, [data]);

  const jobs = useMemo(() => {
    if (!dateParam) return rawJobs;
    const now = Date.now();
    const maxAgeMs =
      dateParam === '24h'
        ? 24 * 60 * 60 * 1000
        : dateParam === 'week'
        ? 7 * 24 * 60 * 60 * 1000
        : dateParam === 'month'
        ? 30 * 24 * 60 * 60 * 1000
        : null;

    if (!maxAgeMs) return rawJobs;

    return rawJobs.filter((job) => {
      const timeStr = job.posted_at || job.created_at;
      if (!timeStr) return true;
      const time = new Date(timeStr).getTime();
      return now - time <= maxAgeMs;
    });
  }, [rawJobs, dateParam]);

  const selectedJob = useMemo(() => {
    if (selectedJobId) {
      return jobs.find((j) => j.id === selectedJobId) || null;
    }
    // Permanent constant sideview (LinkedIn style)
    return jobs.length > 0 ? jobs[0] : null;
  }, [jobs, selectedJobId]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && !error && jobs.length === 0;

  // Max depth stop condition: offset >= 80 or has_more === false
  const currentOffset = (size - 1) * PAGE_SIZE;
  const isSearchDepthLimit = currentOffset + PAGE_SIZE >= MAX_SEARCH_DEPTH;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.has_more === false) ||
    isSearchDepthLimit;

  return (
    <main className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
      {/* Main Full-Height Viewport Container */}
      <div className={`container mx-auto flex-1 min-h-0 flex flex-col transition-all duration-300 ${selectedJob ? 'max-w-7xl' : 'max-w-5xl'} px-4 sm:px-6 pt-3 pb-2`}>
        {/* Results Header Bar */}
        <div className="shrink-0 flex items-center justify-between pb-2.5 mb-2 border-b border-border/60 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            {isLoadingInitialData ? (
              'Searching active positions...'
            ) : error ? (
              <span className="text-destructive font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Connection unavailable
              </span>
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{jobs.length}</span> {jobs.length === 1 ? 'position' : 'positions'}
                {hasActiveFilters && <span className="text-muted-foreground ml-1 font-normal">(filtered)</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {dateParam === '24h'
                ? 'Past 24 hours'
                : dateParam === 'week'
                ? 'Past week'
                : dateParam === 'month'
                ? 'Past month'
                : 'Most recent'}
            </span>
          </div>
        </div>

        {/* Master-Detail Split Pane Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 items-stretch overflow-hidden">
          {/* Left Column: Job Cards List (Independently scrollable) */}
          <div className={`${selectedJob ? 'w-full lg:w-5/12 xl:w-5/12' : 'w-full max-w-4xl mx-auto'} h-full overflow-y-auto overscroll-contain pr-1 sm:pr-2 space-y-3`}>
            {isLoadingInitialData && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Fetching latest jobs...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 sm:py-16 px-6 border border-destructive/25 bg-destructive/5 rounded-2xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-3">
                  <WifiOff className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  Unable to load positions
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-3.5 leading-relaxed">
                  We could not reach the CareerAgent job feed. The service might be temporarily unavailable or restarting.
                </p>
                {error.message && (
                  <div className="mb-4 inline-block text-[11px] font-mono text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-lg max-w-md truncate">
                    {error.message}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    onClick={() => mutate()}
                    disabled={isValidating}
                    className="h-9 px-4 text-xs font-semibold cursor-pointer gap-2"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                    {isValidating ? 'Connecting...' : 'Try Again'}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="h-9 px-4 text-xs cursor-pointer"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            {isEmpty && (
              <div className="text-center py-20 px-4 border-2 border-dashed border-border rounded-2xl bg-card">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No jobs match your criteria</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Try adjusting or clearing your search filters to discover more opportunities.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs cursor-pointer">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}

            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelectJob={(clickedJob) => updateFilters({ job: clickedJob.id })}
                onSelectCompany={(company: string) => updateFilters({ q: company, job: null })}
                onSelectLocation={(location: string) => updateFilters({ q: location, job: null })}
              />
            ))}

            {/* Pagination / Load More */}
            {!isLoadingInitialData && !isReachingEnd && (
              <div className="pt-4 pb-8 flex justify-center">
                <Button
                  onClick={() => setSize(size + 1)}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="min-w-[140px] text-xs font-semibold h-9 rounded-lg shadow-xs hover:bg-muted cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      Loading...
                    </>
                  ) : (
                    'Load More Jobs'
                  )}
                </Button>
              </div>
            )}

            {/* Depth ceiling limit prompt */}
            {isSearchDepthLimit && !isEmpty && !isLoadingInitialData && (
              <div className="text-center py-6 px-4 bg-muted/40 border border-border rounded-xl">
                <p className="text-xs text-foreground font-medium mb-1">
                  Search depth limit reached (100 results).
                </p>
                <p className="text-xs text-muted-foreground">
                  Please refine your keyword or country search terms to see additional postings.
                </p>
              </div>
            )}
          </div>

          {/* Right Column (Desktop): Constant Split View Job Detail Pane */}
          {selectedJob && (
            <div className="hidden lg:block lg:w-7/12 xl:w-7/12 h-full overflow-hidden">
              <JobDetailPane
                job={selectedJob}
                onClose={() => updateFilters({ job: null })}
                onSelectCompany={(company) => updateFilters({ q: company, job: null })}
                onSelectLocation={(location) => updateFilters({ q: location, job: null })}
              />
            </div>
          )}
        </div>

        {/* Mobile / Tablet Sheet Drawer (Screen < 1024px) - only when user explicitly tapped a card */}
        {selectedJob && Boolean(selectedJobId) && (
          <div className="fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-xs flex flex-col justify-end">
            <div className="fixed inset-0" onClick={() => updateFilters({ job: null })} />
            <div className="relative w-full h-[92vh] bg-card border-t border-border rounded-t-2xl shadow-2xl overflow-hidden flex flex-col">
              <JobDetailPane
                job={selectedJob}
                onClose={() => updateFilters({ job: null })}
                onSelectCompany={(company) => updateFilters({ q: company, job: null })}
                onSelectLocation={(location) => updateFilters({ q: location, job: null })}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
