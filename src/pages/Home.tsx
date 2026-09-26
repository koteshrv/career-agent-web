import { useState, useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Filter, X, MapPin } from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { fetcher } from '../lib/api';
import type { JobsResponse } from '../lib/api';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 20;
const MAX_SEARCH_DEPTH = 100;

const WORKPLACE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Onsite', value: 'onsite' },
];

const YOE_OPTIONS = [
  { label: 'Any Exp', value: '' },
  { label: '0–2 yrs', value: '0-2' },
  { label: '3–5 yrs', value: '3-5' },
  { label: '5+ yrs', value: '5+' },
];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const companyParam = searchParams.get('company') || '';
  const locationParam = searchParams.get('location') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const yoeParam = searchParams.get('yoe') || '';

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
    queryParam || companyParam || locationParam || workplaceParam || yoeParam
  );

  const getKey = (pageIndex: number, previousPageData: JobsResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;

    const offset = pageIndex * PAGE_SIZE;
    if (offset >= MAX_SEARCH_DEPTH) return null;

    const params = new URLSearchParams({
      limit: PAGE_SIZE.toString(),
      offset: offset.toString(),
    });

    if (queryParam) params.set('q', queryParam);
    if (companyParam) params.set('company', companyParam);
    if (workplaceParam) params.set('workplace_type', workplaceParam);

    return `/v1/jobs?${params.toString()}`;
  };

  const { data, size, setSize, error } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const rawJobs = useMemo(() => {
    return data ? data.flatMap((page) => (page && Array.isArray(page.jobs) ? page.jobs : [])) : [];
  }, [data]);

  // Faceted refinement for Location and Experience (YOE)
  const jobs = useMemo(() => {
    return rawJobs.filter((job) => {
      if (locationParam) {
        const jobLoc = (job.location || '').toLowerCase();
        if (!jobLoc.includes(locationParam.toLowerCase())) return false;
      }

      if (yoeParam) {
        const yoeMin = job.structured_metadata?.yoe_min ?? 0;
        if (yoeParam === '0-2' && yoeMin > 2) return false;
        if (yoeParam === '3-5' && (yoeMin < 3 || yoeMin > 5)) return false;
        if (yoeParam === '5+' && yoeMin < 5) return false;
      }

      return true;
    });
  }, [rawJobs, locationParam, yoeParam]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && jobs.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.has_more === false) ||
    rawJobs.length >= MAX_SEARCH_DEPTH;

  return (
    <main className="w-full">
      {/* Search Hero Section - unified with max-w-5xl container */}
      <section className="pt-10 sm:pt-14 pb-8 px-4 sm:px-6 border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Find your next career move
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-6">
            Discover crowdsourced jobs fetched directly from company ATS platforms.
          </p>

          {/* Search Input Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
          >
            <Search className="h-4 w-4 text-muted-foreground ml-3.5 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-hidden pr-2"
            />
            {queryInput && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-1 mr-1 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Button
              type="submit"
              className="h-8 rounded-full px-5 text-xs font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              Search
            </Button>
          </form>

          {/* Filters Bar: Workplace & Experience (YOE) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-5">
            {/* Workplace Segment */}
            <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-0.5 text-xs shadow-2xs">
              {WORKPLACE_OPTIONS.map(({ label, value }) => {
                const isActive = (workplaceParam || '') === value;
                return (
                  <button
                    key={value || 'all-workplace'}
                    type="button"
                    onClick={() => updateFilters({ workplace_type: value || null })}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Experience / YOE Segment */}
            <div className="inline-flex items-center rounded-full border border-border bg-card/80 p-0.5 text-xs shadow-2xs">
              {YOE_OPTIONS.map(({ label, value }) => {
                const isActive = (yoeParam || '') === value;
                return (
                  <button
                    key={value || 'all-yoe'}
                    type="button"
                    onClick={() => updateFilters({ yoe: value || null })}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Reset All Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 underline transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Active Chips (Company / Location) */}
          {(companyParam || locationParam) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {companyParam && (
                <span className="inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-xs font-medium bg-secondary text-foreground border border-border shadow-2xs">
                  Company: <span className="font-semibold">{companyParam}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ company: null })}
                    className="hover:opacity-70 ml-0.5 text-muted-foreground cursor-pointer"
                    title="Remove company filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {locationParam && (
                <span className="inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-xs font-medium bg-secondary text-foreground border border-border shadow-2xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  Location: <span className="font-semibold">{locationParam}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ location: null })}
                    className="hover:opacity-70 ml-0.5 text-muted-foreground cursor-pointer"
                    title="Remove location filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Job Listings Container - strictly aligned with max-w-5xl */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="space-y-4">
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
                <Filter className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No jobs found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any jobs matching your criteria. Try adjusting your filters or search keywords.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-4 text-xs rounded-full cursor-pointer"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onSelectCompany={(company: string) => updateFilters({ company })}
              onSelectLocation={(loc: string) => updateFilters({ location: loc })}
            />
          ))}
        </div>

        {/* Pagination / Load More */}
        {!isEmpty && !isLoadingInitialData && !error && (
          <div className="mt-10 text-center">
            {!isReachingEnd ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSize(size + 1)}
                disabled={isLoadingMore}
                className="gap-2 rounded-xl px-10 h-11 font-medium cursor-pointer"
              >
                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoadingMore ? 'Loading more jobs...' : 'Load More Jobs'}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground pt-4">
                {rawJobs.length >= MAX_SEARCH_DEPTH
                  ? 'Reached search limit of 100 jobs. Refine your search keywords to discover more specific roles.'
                  : "You've reached the end of results."}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
