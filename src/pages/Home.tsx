import { useState, useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Filter, X, MapPin, Briefcase, Clock, RotateCcw, Sparkles } from 'lucide-react';
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
      {/* Search Hero Section */}
      <section className="pt-10 sm:pt-14 pb-8 px-4 sm:px-6 border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2.5">
              Find your next career move
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover crowdsourced jobs fetched directly from company ATS platforms.
            </p>
          </div>

          {/* Unified Search & Filter Command Card */}
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            {/* Search Input Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center px-3.5 py-2 gap-2"
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-hidden py-1 px-1"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                  title="Clear query"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-8 px-4 text-xs font-semibold shrink-0 cursor-pointer"
              >
                Search
              </Button>
            </form>

            {/* Filter Toolbar Strip */}
            <div className="bg-muted/40 border-t border-border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                {/* Workplace Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Workplace</span>
                  </span>
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5 shadow-2xs">
                    {WORKPLACE_OPTIONS.map(({ label, value }) => {
                      const isActive = (workplaceParam || '') === value;
                      return (
                        <button
                          key={value || 'all-workplace'}
                          type="button"
                          onClick={() => updateFilters({ workplace_type: value || null })}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-card text-foreground font-semibold shadow-xs border border-border/80'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience / YOE Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Experience</span>
                  </span>
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5 shadow-2xs">
                    {YOE_OPTIONS.map(({ label, value }) => {
                      const isActive = (yoeParam || '') === value;
                      return (
                        <button
                          key={value || 'all-yoe'}
                          type="button"
                          onClick={() => updateFilters({ yoe: value || null })}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-card text-foreground font-semibold shadow-xs border border-border/80'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reset All Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear filters</span>
                </button>
              )}
            </div>

            {/* Active Criteria Chips (Company / Location) */}
            {(companyParam || locationParam) && (
              <div className="bg-muted/20 border-t border-border/60 px-3.5 py-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mr-1">
                  Active:
                </span>
                {companyParam && (
                  <span className="inline-flex items-center gap-1.5 h-6 rounded-md px-2.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border shadow-2xs">
                    Company: <strong className="font-semibold">{companyParam}</strong>
                    <button
                      type="button"
                      onClick={() => updateFilters({ company: null })}
                      className="hover:opacity-75 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remove company filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {locationParam && (
                  <span className="inline-flex items-center gap-1.5 h-6 rounded-md px-2.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border shadow-2xs">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    Location: <strong className="font-semibold">{locationParam}</strong>
                    <button
                      type="button"
                      onClick={() => updateFilters({ location: null })}
                      className="hover:opacity-75 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remove location filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Listings Container */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {/* Results Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">
            {isLoadingInitialData ? (
              'Loading active positions...'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{jobs.length}</span> {jobs.length === 1 ? 'role' : 'roles'}
                {hasActiveFilters && <span className="text-muted-foreground ml-1.5 font-normal">(filtered)</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Sorted by published date</span>
          </div>
        </div>

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
