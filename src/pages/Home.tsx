import { useState, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Filter } from 'lucide-react';
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
      {/* Search Hero Section */}
      <section className="pt-10 pb-8 px-4 border-b border-border bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Find your next career move
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Discover crowdsourced jobs fetched directly from company ATS platforms.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleFormSubmit}
            className="max-w-xl mx-auto relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
          >
            <Search className="h-4 w-4 text-muted-foreground ml-3.5 mr-2 shrink-0" />
            <input
              type="search"
              placeholder="Job title, keywords, or company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none pr-2"
            />
            <Button
              type="submit"
              className="h-8 rounded-full px-4 text-xs font-medium shrink-0"
            >
              Search
            </Button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setSort('recent');
                applyFilters(undefined, 'recent', undefined);
              }}
              className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
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
              className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
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
              className={`h-7 rounded-full px-3 text-xs font-medium transition-colors border ${
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          {isLoadingInitialData && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 border border-destructive/20 bg-destructive/5 rounded-2xl">
              <h3 className="text-lg font-medium text-destructive mb-1">Failed to load jobs</h3>
              <p className="text-destructive/80">The backend API might be down or the endpoint does not exist.</p>
            </div>
          )}

          {isEmpty && !isLoadingInitialData && !error && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No jobs found</h3>
              <p className="text-muted-foreground">We couldn't find any jobs matching your criteria.</p>
            </div>
          )}

          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {!isEmpty && !isReachingEnd && !isLoadingInitialData && !error && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore}
              className="gap-2 rounded-xl px-10 h-12 font-medium"
            >
              {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoadingMore ? 'Loading...' : 'Load More Jobs'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
