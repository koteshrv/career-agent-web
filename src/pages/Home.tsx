import { useState, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { fetcher } from '../lib/api';
import type { JobsResponse } from '../lib/api';
import { Button } from '../components/ui/button';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('company') || searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'recent';
  const initialStale = searchParams.get('include_stale') === 'true';

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [includeStale, setIncludeStale] = useState(initialStale);

  useEffect(() => {
    const q = searchParams.get('company') || searchParams.get('q') || '';
    setQuery(q);
    setSort(searchParams.get('sort') || 'recent');
    setIncludeStale(searchParams.get('include_stale') === 'true');
  }, [searchParams]);

  const getKey = (pageIndex: number, previousPageData: JobsResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;
    
    const endpoint = `/v1/jobs`;
    const offset = pageIndex * 50;
    
    const params = new URLSearchParams({ limit: '50', offset: offset.toString() });
    
    const activeQuery = searchParams.get('company') || searchParams.get('q');
    if (activeQuery) {
      params.append('q', activeQuery);
    }
    if (searchParams.get('sort')) {
      params.append('sort', searchParams.get('sort')!);
    }
    if (searchParams.get('include_stale') === 'true') {
      params.append('include_stale', 'true');
    }

    return `${endpoint}?${params.toString()}`;
  };

  const { data, size, setSize, error } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher
  );

  const jobs = data ? data.flatMap(page => page.jobs || []) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = (data?.[0]?.jobs?.length || 0) === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.has_more === false);

  const applyFilters = (newQuery?: string, newSort?: string, newIncludeStale?: boolean) => {
    const params: Record<string, string> = {};
    const finalQuery = newQuery !== undefined ? newQuery : query;
    const finalSort = newSort !== undefined ? newSort : sort;
    const finalStale = newIncludeStale !== undefined ? newIncludeStale : includeStale;

    if (finalQuery.trim()) params.q = finalQuery.trim();
    if (finalSort !== 'recent') params.sort = finalSort;
    if (finalStale) params.include_stale = 'true';
    setSearchParams(params);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <main className="w-full">
      {/* Tsenta-style Hero Section */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 border-b border-border/80 bg-background/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Direct company career pages</span>
          </div>

          <h1 className="ts-display text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight mb-3">
            Jobs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8 font-normal leading-relaxed">
            Fresh roles synced directly from 50,000+ top engineering & product career pages.
          </p>

          {/* Sleek Pill Search Bar */}
          <form 
            onSubmit={handleFormSubmit}
            className="max-w-xl mx-auto relative flex items-center bg-card border border-border/90 rounded-full p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-foreground/30 focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all"
          >
            <Search className="h-4 w-4 text-muted-foreground ml-3.5 mr-2 shrink-0" />
            <input
              type="search"
              placeholder="Search by role, company, or tech stack..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none pr-2 font-normal"
            />
            <button
              type="submit"
              className="ts-pill shrink-0"
            >
              Search
            </button>
          </form>

          {/* Filter Pills / Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => {
                setSort('recent');
                applyFilters(undefined, 'recent', undefined);
              }}
              className={`h-7 rounded-full px-3 text-xs font-medium transition-all ${
                sort === 'recent'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Most Recent
            </button>

            <button
              type="button"
              onClick={() => {
                setSort('random');
                applyFilters(undefined, 'random', undefined);
              }}
              className={`h-7 rounded-full px-3 text-xs font-medium transition-all ${
                sort === 'random'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Discover Random
            </button>

            <button
              type="button"
              onClick={() => {
                const nextStale = !includeStale;
                setIncludeStale(nextStale);
                applyFilters(undefined, undefined, nextStale);
              }}
              className={`h-7 rounded-full px-3 text-xs font-medium transition-all border ${
                includeStale
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              Include Stale
            </button>

            {searchParams.get('company') && (
              <span className="inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-xs font-medium bg-secondary text-foreground border border-border">
                Company: <span className="font-semibold">{searchParams.get('company')}</span>
                <button
                  type="button"
                  onClick={() => applyFilters('', undefined, undefined)}
                  className="hover:opacity-70 ml-0.5 text-muted-foreground"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Listings Container */}
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <div className="space-y-3.5">
          {isLoadingInitialData && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Fetching fresh listings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16 px-4 border border-destructive/20 bg-destructive/5 rounded-2xl">
              <h3 className="text-sm font-semibold text-destructive mb-1">Failed to load jobs</h3>
              <p className="text-xs text-destructive/80">The backend service may be undergoing maintenance.</p>
            </div>
          )}

          {isEmpty && !isLoadingInitialData && !error && (
            <div className="text-center py-20 px-4 border border-dashed border-border rounded-2xl bg-card">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No jobs match your search</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                Try searching for broader keywords, or clear your filters to explore all active positions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSort('recent');
                  setIncludeStale(false);
                  setSearchParams({});
                }}
                className="ts-pill"
              >
                Clear all filters
              </button>
            </div>
          )}

          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Load More Button */}
        {!isEmpty && !isReachingEnd && !isLoadingInitialData && !error && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore}
              className="h-10 rounded-full px-8 text-xs font-medium border-border bg-card hover:bg-secondary hover:text-foreground shadow-sm transition-all"
            >
              {isLoadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
              {isLoadingMore ? 'Loading more jobs...' : 'Load more jobs'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
