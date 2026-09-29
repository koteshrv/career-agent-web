import { useMemo, useState, useRef, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  X,
  Globe,
  Briefcase,
  Calendar,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { JobDetailPane } from '../components/JobDetailPane';
import { fetcher, type JobsResponse, type CountriesResponse } from '../lib/api';
import { Button } from '../components/ui/button';
import { DropdownSelect } from '../components/DropdownSelect';

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

  // Parse discrete keyword chips from comma-separated query parameter
  const keywords = useMemo(() => {
    if (!queryParam.trim()) return [];
    return queryParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }, [queryParam]);

  const [queryInput, setQueryInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close filter popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Count active filters (country, workplace, date)
  const activeFilterCount = [
    Boolean(countryParam),
    Boolean(workplaceParam),
    Boolean(dateParam),
  ].filter(Boolean).length;

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

  const applyKeywords = (nextKeywords: string[], remainingInput = '') => {
    const combined = [...nextKeywords];
    if (remainingInput.trim() && !combined.includes(remainingInput.trim())) {
      combined.push(remainingInput.trim());
    }
    const qValue = combined.join(', ');
    updateFilters({ q: qValue || null });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      const newTerms = parts
        .slice(0, -1)
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && !keywords.includes(t));
      const remainder = parts[parts.length - 1];

      const nextKeywords = [...keywords, ...newTerms];
      applyKeywords(nextKeywords);
      setQueryInput(remainder);
    } else {
      setQueryInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = queryInput.trim();
      if (trimmed) {
        if (!keywords.includes(trimmed)) {
          const next = [...keywords, trimmed];
          applyKeywords(next);
        }
        setQueryInput('');
      } else if (keywords.length > 0) {
        applyKeywords(keywords);
      }
    } else if (e.key === 'Backspace' && !queryInput && keywords.length > 0) {
      const next = keywords.slice(0, -1);
      applyKeywords(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.includes(',')) {
      e.preventDefault();
      const tokens = pasted
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && !keywords.includes(t));
      const next = [...keywords, ...tokens];
      applyKeywords(next);
      setQueryInput('');
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    const next = keywords.filter((_, idx) => idx !== indexToRemove);
    applyKeywords(next);
    inputRef.current?.focus();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      const next = [...keywords, trimmed];
      applyKeywords(next);
      setQueryInput('');
    } else {
      applyKeywords(keywords);
    }
  };

  const clearQuery = () => {
    setQueryInput('');
    updateFilters({ q: null });
    inputRef.current?.focus();
  };

  const clearAllFilters = () => {
    localStorage.setItem('careeragent_country_initialized', 'true');
    setQueryInput('');
    setSearchParams(new URLSearchParams());
  };

  // Fetch dynamic countries list from GET /v1/countries
  const { data: countriesData } = useSWR<CountriesResponse>('/v1/countries', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const countries = useMemo(() => {
    return countriesData?.countries || [];
  }, [countriesData]);

  const countryOptions = useMemo(() => {
    return [
      { value: '', label: 'All' },
      ...countries.map((c) => ({ value: c.code, label: c.name })),
    ];
  }, [countries]);

  const workplaceOptions = [
    { value: '', label: 'Any' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' },
  ];

  const dateOptions = [
    { value: '', label: 'Any time' },
    { value: '24h', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
  ];

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

  const { data, size, setSize, error, mutate } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      setSize(1);
      await mutate(undefined, { revalidate: true });
    } finally {
      setIsRetrying(false);
    }
  };

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
      <div className="w-full max-w-[1720px] mx-auto flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        {/* Dedicated Jobs Search & Filter Toolbar */}
        <div className="shrink-0 flex items-center justify-between gap-3 pb-3 mb-2.5 border-b border-border/60">
          {/* Keyword Search Form with Chips */}
          <form 
            onSubmit={handleSearchSubmit} 
            onClick={() => inputRef.current?.focus()}
            className="flex-1 max-w-2xl flex items-center bg-card border border-border/80 rounded-xl px-2.5 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary min-w-0 cursor-text"
          >
            <Search className="h-4 w-4 text-muted-foreground mr-1.5 shrink-0" />

            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 py-0.5">
              {keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border shrink-0 select-none shadow-2xs animate-in fade-in zoom-in-95"
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{kw}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(idx);
                    }}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded p-0.5 cursor-pointer"
                    title={`Remove ${kw}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <input
                ref={inputRef}
                type="text"
                placeholder={
                  keywords.length === 0
                    ? "Search title, company, or skills (e.g. Python, React)..."
                    : "Add keyword..."
                }
                value={queryInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="min-w-[90px] flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
              />
            </div>

            {(keywords.length > 0 || queryInput) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearQuery();
                }}
                className="text-muted-foreground hover:text-foreground p-0.5 mr-1 cursor-pointer shrink-0"
                title="Clear all keywords"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-7 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer shrink-0"
            >
              Search
            </Button>
          </form>

          {/* Floating Filters Popover Button */}
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                activeFilterCount > 0
                  ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              } ${isFilterOpen ? 'ring-1 ring-primary/40 border-primary text-foreground' : ''}`}
              title="Filter by country, workplace type, and date posted"
              aria-expanded={isFilterOpen}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Floating Filter Popover Card */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-card border border-border/80 rounded-xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    <span>Filter Postings</span>
                    {activeFilterCount > 0 && (
                      <span className="text-[11px] text-muted-foreground font-normal">
                        ({activeFilterCount} active)
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-medium text-muted-foreground">Country</label>
                  <DropdownSelect
                    icon={<Globe className="h-3.5 w-3.5" />}
                    value={countryParam}
                    onChange={(val) => {
                      localStorage.setItem('careeragent_country_initialized', 'true');
                      updateFilters({ country: val || null });
                    }}
                    options={countryOptions}
                    placeholder="All"
                    ariaLabel="Filter by country"
                    searchable
                    fullWidth
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-medium text-muted-foreground">Workplace</label>
                  <DropdownSelect
                    icon={<Briefcase className="h-3.5 w-3.5" />}
                    value={workplaceParam}
                    onChange={(val) => updateFilters({ workplace_type: val || null })}
                    options={workplaceOptions}
                    placeholder="Any"
                    ariaLabel="Filter by workplace type"
                    fullWidth
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-medium text-muted-foreground">Date Posted</label>
                  <DropdownSelect
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    value={dateParam}
                    onChange={(val) => updateFilters({ date: val || null })}
                    options={dateOptions}
                    placeholder="Any time"
                    ariaLabel="Filter by date posted"
                    fullWidth
                  />
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="h-7 px-3 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
          <div className={`${selectedJob ? 'w-full lg:w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0' : 'w-full max-w-4xl mx-auto'} h-full overflow-y-auto overscroll-contain pr-1 sm:pr-2 space-y-3`}>
            {isLoadingInitialData && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Fetching latest jobs...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 sm:py-16 px-6 border border-border bg-card rounded-2xl shadow-2xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-3">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  Unable to load positions
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-3.5 leading-relaxed">
                  We could not reach the CareerAgent job feed. The service might be temporarily unavailable or restarting.
                </p>
                {error.message && (
                  <div className="mb-4 inline-block text-xs text-muted-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-lg max-w-md truncate">
                    {error.message}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="h-9 px-4 text-xs font-semibold cursor-pointer gap-2"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Connecting...' : 'Try Again'}
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

            {!isLoadingInitialData && !error && jobs.length === 0 && (
              <div className="text-center py-14 px-6 border border-dashed border-border rounded-2xl bg-card/50">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No matching jobs found
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  {hasActiveFilters
                    ? 'No positions match your current filters. Try removing some filters or searching broader keywords.'
                    : 'No jobs are currently available.'}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-3 text-xs cursor-pointer"
                  >
                    Reset all filters
                  </Button>
                )}
              </div>
            )}

            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelectJob={(j) => updateFilters({ job: j.id })}
                onSelectCompany={(company) => updateFilters({ q: company, job: null })}
                onSelectLocation={(location) => updateFilters({ q: location, job: null })}
              />
            ))}

            {/* Infinite Scroll trigger / Load More */}
            {jobs.length > 0 && !isReachingEnd && (
              <div className="pt-2 pb-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSize(size + 1)}
                  disabled={isLoadingMore}
                  className="h-8 px-4 text-xs font-medium cursor-pointer gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load more positions'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column (Desktop): Constant Split View Job Detail Pane */}
          {selectedJob && (
            <div className="hidden lg:block flex-1 min-w-0 h-full overflow-hidden">
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
