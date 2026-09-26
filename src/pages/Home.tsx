import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  Sparkles 
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
  const sortParam = searchParams.get('sort') || '';
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
    queryParam || countryParam || workplaceParam || sortParam
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
    if (sortParam) params.set('sort', sortParam);

    return `/v1/jobs?${params.toString()}`;
  };

  const { data, size, setSize, error } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const jobs = useMemo(() => {
    return data ? data.flatMap((page) => (page && Array.isArray(page.jobs) ? page.jobs : [])) : [];
  }, [data]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && jobs.length === 0;

  // Max depth stop condition: offset >= 80 or has_more === false
  const currentOffset = (size - 1) * PAGE_SIZE;
  const isSearchDepthLimit = currentOffset + PAGE_SIZE >= MAX_SEARCH_DEPTH;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.has_more === false) ||
    isSearchDepthLimit;

  return (
    <main className="w-full">
      {/* Main Full-Height Viewport Container */}
      <div className={`container mx-auto transition-all duration-300 ${selectedJob ? 'max-w-7xl' : 'max-w-5xl'} px-4 sm:px-6 py-4`}>
        {/* Results Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            {isLoadingInitialData ? (
              'Searching active positions...'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{jobs.length}</span> {jobs.length === 1 ? 'position' : 'positions'}
                {hasActiveFilters && <span className="text-muted-foreground ml-1 font-normal">(filtered)</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{sortParam === 'random' ? 'Discovery shuffle' : 'Sorted by newest'}</span>
          </div>
        </div>

        {/* Master-Detail Split Pane Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Job Cards List */}
          <div className={`${selectedJob ? 'w-full lg:w-5/12 xl:w-5/12' : 'w-full'} space-y-3 transition-all`}>
            {isLoadingInitialData && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Fetching latest jobs...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16 px-4 border border-destructive/20 bg-destructive/5 rounded-2xl">
                <h3 className="text-base font-semibold text-destructive mb-1">Failed to load jobs</h3>
                <p className="text-xs text-destructive/80">
                  The service might be temporarily unavailable. Please try again.
                </p>
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

          {/* Right Column (Desktop): Sticky LinkedIn-Style Job Detail Pane */}
          {selectedJob && (
            <div className="hidden lg:block lg:w-7/12 xl:w-7/12 sticky top-28 h-[calc(100vh-8rem)]">
              <JobDetailPane
                job={selectedJob}
                onClose={() => updateFilters({ job: null })}
                onSelectCompany={(company) => updateFilters({ q: company, job: null })}
                onSelectLocation={(location) => updateFilters({ q: location, job: null })}
              />
            </div>
          )}
        </div>

        {/* Mobile / Tablet Sheet Drawer (Screen < 1024px) */}
        {selectedJob && (
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
