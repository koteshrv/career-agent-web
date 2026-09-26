import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  X, 
  Globe, 
  Briefcase, 
  ArrowUpDown, 
  RotateCcw, 
  Sparkles 
} from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { JobDetailPane } from '../components/JobDetailPane';
import { fetcher } from '../lib/api';
import type { JobsResponse, CountriesResponse } from '../lib/api';
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

  const [queryInput, setQueryInput] = useState(queryParam);

  useEffect(() => {
    setQueryInput(queryParam);
  }, [queryParam]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: queryInput.trim() || null });
  };

  const clearQuery = () => {
    setQueryInput('');
    updateFilters({ q: null });
  };

  const clearAllFilters = () => {
    setQueryInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    queryParam || countryParam || workplaceParam || sortParam
  );

  // Fetch dynamic countries list from GET /v1/countries
  const { data: countriesData } = useSWR<CountriesResponse>('/v1/countries', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const countries = useMemo(() => {
    return countriesData?.countries || [];
  }, [countriesData]);

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
      {/* Compact Search Header Section */}
      <section className="pt-8 sm:pt-10 pb-6 px-4 sm:px-6 border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1.5">
              Find your next career move
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discover crowdsourced jobs fetched directly from company ATS platforms.
            </p>
          </div>

          {/* Simple, Compact Search Bar (LinkedIn / Indeed / Naukri style) */}
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl p-2 sm:p-2.5 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Universal Keyword Input (single or comma-separated) */}
              <div className="flex-1 flex items-center bg-background border border-border/80 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary">
                <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search title, company, or skills (e.g. Python, React)..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer mr-1"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Country Select Dropdown */}
              <div className="sm:w-44 shrink-0 flex items-center bg-background border border-border/80 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-primary/40">
                <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
                <select
                  value={countryParam}
                  onChange={(e) => updateFilters({ country: e.target.value || null })}
                  className="w-full bg-transparent text-xs font-medium text-foreground outline-hidden cursor-pointer truncate"
                >
                  <option value="">All Countries</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workplace Select Dropdown */}
              <div className="sm:w-36 shrink-0 flex items-center bg-background border border-border/80 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-primary/40">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
                <select
                  value={workplaceParam}
                  onChange={(e) => updateFilters({ workplace_type: e.target.value || null })}
                  className="w-full bg-transparent text-xs font-medium text-foreground outline-hidden cursor-pointer"
                >
                  <option value="">Workplace: Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              {/* Search Submit Button */}
              <Button
                type="submit"
                className="h-9 px-5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer shrink-0"
              >
                Search
              </Button>
            </form>

            {/* Compact Sub-Toolbar: Sort Ordering & Reset Filters */}
            <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/40 text-xs text-muted-foreground">
              {/* Sort Toggle */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] uppercase tracking-wider font-semibold mr-1">Sort:</span>
                <button
                  type="button"
                  onClick={() => updateFilters({ sort: null })}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    sortParam !== 'random'
                      ? 'bg-secondary text-foreground font-semibold shadow-2xs'
                      : 'hover:text-foreground'
                  }`}
                >
                  Recent
                </button>
                <button
                  type="button"
                  onClick={() => updateFilters({ sort: 'random' })}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    sortParam === 'random'
                      ? 'bg-secondary text-foreground font-semibold shadow-2xs'
                      : 'hover:text-foreground'
                  }`}
                >
                  Shuffle
                </button>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 hover:text-foreground font-medium cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Container (Expands to max-w-7xl when split-view is active) */}
      <div className={`container mx-auto transition-all duration-300 ${selectedJob ? 'max-w-7xl' : 'max-w-5xl'} px-4 sm:px-6 py-6`}>
        {/* Results Header Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/60 text-xs text-muted-foreground">
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
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
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
              <div className="pt-5 pb-10 flex justify-center">
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
            <div className="hidden lg:block lg:w-7/12 xl:w-7/12 sticky top-20 h-[calc(100vh-6rem)]">
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
