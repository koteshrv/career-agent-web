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

    if (finalQuery) params.q = finalQuery;
    if (finalSort !== 'recent') params.sort = finalSort;
    if (finalStale) params.include_stale = 'true';
    setSearchParams(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilters();
    }
  };

  return (
    <main className="w-full">
      {/* Sleek Header Section */}
      <div className="bg-background border-b border-border pt-8 pb-6 px-4 md:px-8 mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
              Find your next career move
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover crowdsourced jobs fetched directly from company ATS platforms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="w-full h-10 pl-9 pr-4 rounded-md bg-card border border-border shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="Job title, keywords, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <select
              className="h-10 px-3 rounded-md bg-card border border-border shadow-sm text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-colors"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters(undefined, e.target.value, undefined);
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="random">Discover Random</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0 bg-card border border-border h-10 px-3 rounded-md shadow-sm">
              <input
                type="checkbox"
                checked={includeStale}
                onChange={(e) => {
                  setIncludeStale(e.target.checked);
                  applyFilters(undefined, undefined, e.target.checked);
                }}
                className="accent-primary w-4 h-4 rounded border-input cursor-pointer"
              />
              Include Stale
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
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
