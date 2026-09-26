import { useState, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Loader2, 
  X, 
  MapPin, 
  Briefcase, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  Globe, 
  Calendar
} from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { JobDetailPane } from '../components/JobDetailPane';
import { fetcher } from '../lib/api';
import type { JobsResponse, CountriesResponse } from '../lib/api';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 20;
const MAX_SEARCH_DEPTH = 100;
const MAX_QUERY_TERMS = 5;

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

const DATE_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Past 24h', value: '24h' },
  { label: 'Past week', value: 'week' },
  { label: 'Past month', value: 'month' },
];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const companyParam = searchParams.get('company') || '';
  const countryParam = searchParams.get('country') || '';
  const locationParam = searchParams.get('location') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const yoeParam = searchParams.get('yoe') || '';
  const dateParam = searchParams.get('date') || '';
  const selectedJobId = searchParams.get('job') || '';

  // Parse comma-separated multi-query terms
  const currentQueryTerms = useMemo(() => {
    return queryParam
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [queryParam]);

  const [queryTerms, setQueryTerms] = useState<string[]>(currentQueryTerms);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQueryTerms(currentQueryTerms);
  }, [currentQueryTerms]);

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

  const handleAddTerm = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;

    // Handle comma-separated input in one go
    const parts = cleaned
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const merged = Array.from(new Set([...queryTerms, ...parts])).slice(0, MAX_QUERY_TERMS);
    setQueryTerms(merged);
    setCurrentInput('');
    updateFilters({ q: merged.join(', ') || null });
  };

  const handleRemoveTerm = (indexToRemove: number) => {
    const updated = queryTerms.filter((_, idx) => idx !== indexToRemove);
    setQueryTerms(updated);
    updateFilters({ q: updated.join(', ') || null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTerm(currentInput);
    } else if (e.key === 'Backspace' && !currentInput && queryTerms.length > 0) {
      handleRemoveTerm(queryTerms.length - 1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      handleAddTerm(currentInput);
    } else {
      updateFilters({ q: queryTerms.join(', ') || null });
    }
  };

  const clearQuery = () => {
    setQueryTerms([]);
    setCurrentInput('');
    updateFilters({ q: null });
  };

  const clearAllFilters = () => {
    setQueryTerms([]);
    setCurrentInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    queryParam || companyParam || countryParam || locationParam || workplaceParam || yoeParam || dateParam
  );

  // Dynamic Country Facets from GET /v1/countries
  const { data: countriesData } = useSWR<CountriesResponse>('/v1/countries', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

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
    if (countryParam) params.set('country', countryParam);
    if (locationParam) params.set('location', locationParam);
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

  // Available countries: from API endpoint or fallback to distinct country codes in rawJobs
  const availableCountries = useMemo(() => {
    if (countriesData?.countries && countriesData.countries.length > 0) {
      return countriesData.countries;
    }
    const counts: Record<string, number> = {};
    rawJobs.forEach((job) => {
      if (job.country_code) {
        const code = job.country_code.toUpperCase();
        counts[code] = (counts[code] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([code, count]) => ({ code, name: code, count }))
      .sort((a, b) => b.count - a.count);
  }, [countriesData, rawJobs]);

  // Client-side refinements: YOE and Date Posted
  const jobs = useMemo(() => {
    return rawJobs.filter((job) => {
      if (yoeParam) {
        const yoeMin = job.structured_metadata?.yoe_min ?? 0;
        if (yoeParam === '0-2' && yoeMin > 2) return false;
        if (yoeParam === '3-5' && (yoeMin < 3 || yoeMin > 5)) return false;
        if (yoeParam === '5+' && yoeMin < 5) return false;
      }

      if (dateParam) {
        const dateStr = job.posted_at || job.created_at;
        if (dateStr) {
          const postTime = new Date(dateStr).getTime();
          const now = Date.now();
          const diffHours = (now - postTime) / (1000 * 60 * 60);
          if (dateParam === '24h' && diffHours > 24) return false;
          if (dateParam === 'week' && diffHours > 24 * 7) return false;
          if (dateParam === 'month' && diffHours > 24 * 30) return false;
        }
      }

      return true;
    });
  }, [rawJobs, yoeParam, dateParam]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || rawJobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, rawJobs, selectedJobId]);

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

          {/* Unified Search & Multi-Query Command Card */}
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            {/* Multi-Query Search Input Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              onClick={() => inputRef.current?.focus()}
              className="flex flex-wrap items-center px-3.5 py-2 gap-1.5 min-h-[48px] cursor-text"
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-0.5 mr-1" />

              {/* Active Search Term Chips */}
              {queryTerms.map((term, index) => (
                <span
                  key={`${term}-${index}`}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0"
                >
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTerm(index);
                    }}
                    className="hover:opacity-75 cursor-pointer text-primary"
                    title={`Remove "${term}"`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Inline Input Field */}
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  queryTerms.length === 0
                    ? "Job title, keywords, or company (press Enter or comma for multiple)..."
                    : queryTerms.length < MAX_QUERY_TERMS
                    ? "Add another keyword..."
                    : "Max keywords reached"
                }
                value={currentInput}
                disabled={queryTerms.length >= MAX_QUERY_TERMS}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-hidden py-1 px-1"
              />

              {(queryTerms.length > 0 || currentInput) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearQuery();
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer shrink-0"
                  title="Clear all keywords"
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
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Workplace Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Workplace</span>
                  </span>
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5 shadow-2xs">
                    {WORKPLACE_OPTIONS.map(({ label, value }) => {
                      const isActive = (workplaceParam || '') === value;
                      return (
                        <button
                          key={value || 'all-workplace'}
                          type="button"
                          onClick={() => updateFilters({ workplace_type: value || null })}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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

                {/* Country Filter Dropdown (Dynamic from GET /v1/countries) */}
                {availableCountries.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Country</span>
                    </span>
                    <select
                      value={countryParam}
                      onChange={(e) => updateFilters({ country: e.target.value || null })}
                      className="h-7 px-2 text-xs font-medium bg-background/80 border border-border/70 rounded-lg text-foreground outline-hidden cursor-pointer shadow-2xs"
                    >
                      <option value="">All Countries</option>
                      {availableCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} {c.count ? `(${c.count.toLocaleString()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Posted Filter (LinkedIn Style) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Date</span>
                  </span>
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5 shadow-2xs">
                    {DATE_OPTIONS.map(({ label, value }) => {
                      const isActive = (dateParam || '') === value;
                      return (
                        <button
                          key={value || 'all-date'}
                          type="button"
                          onClick={() => updateFilters({ date: value || null })}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Exp</span>
                  </span>
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background/60 p-0.5 shadow-2xs">
                    {YOE_OPTIONS.map(({ label, value }) => {
                      const isActive = (yoeParam || '') === value;
                      return (
                        <button
                          key={value || 'all-yoe'}
                          type="button"
                          onClick={() => updateFilters({ yoe: value || null })}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            {/* Active Secondary Filters (Company / Location) */}
            {(companyParam || locationParam || countryParam) && (
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
                {countryParam && (
                  <span className="inline-flex items-center gap-1.5 h-6 rounded-md px-2.5 text-xs font-medium bg-secondary text-secondary-foreground border border-border shadow-2xs">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    Country: <strong className="font-semibold">{countryParam}</strong>
                    <button
                      type="button"
                      onClick={() => updateFilters({ country: null })}
                      className="hover:opacity-75 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Remove country filter"
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

      {/* Job Listings & LinkedIn-Style Split View Container */}
      <div className={`container mx-auto transition-all duration-300 ${selectedJob ? 'max-w-7xl' : 'max-w-5xl'} px-4 sm:px-6 py-6`}>
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

        {/* Master-Detail Split Pane Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Job Cards List */}
          <div className={`${selectedJob ? 'w-full lg:w-5/12 xl:w-5/12' : 'w-full'} space-y-3.5 transition-all`}>
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
                onSelectCompany={(company: string) => updateFilters({ company, job: null })}
                onSelectLocation={(location: string) => updateFilters({ location, job: null })}
              />
            ))}

            {/* Load More Button */}
            {!isLoadingInitialData && !isReachingEnd && (
              <div className="pt-6 pb-12 flex justify-center">
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

            {isReachingEnd && !isEmpty && !isLoadingInitialData && (
              <p className="text-center text-xs text-muted-foreground py-8">
                You've reached the end of active listings matching this query.
              </p>
            )}
          </div>

          {/* Right Column (Desktop): Sticky LinkedIn-Style Job Detail Pane */}
          {selectedJob && (
            <div className="hidden lg:block lg:w-7/12 xl:w-7/12 sticky top-20 h-[calc(100vh-6rem)]">
              <JobDetailPane
                job={selectedJob}
                onClose={() => updateFilters({ job: null })}
                onSelectCompany={(company) => updateFilters({ company, job: null })}
                onSelectLocation={(location) => updateFilters({ location, job: null })}
              />
            </div>
          )}
        </div>

        {/* Mobile / Tablet Drawer (Screen < 1024px) */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-xs flex flex-col justify-end">
            <div className="fixed inset-0" onClick={() => updateFilters({ job: null })} />
            <div className="relative w-full h-[92vh] bg-card border-t border-border rounded-t-2xl shadow-2xl overflow-hidden flex flex-col">
              <JobDetailPane
                job={selectedJob}
                onClose={() => updateFilters({ job: null })}
                onSelectCompany={(company) => updateFilters({ company, job: null })}
                onSelectLocation={(location) => updateFilters({ location, job: null })}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
