import { useState, useMemo, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  X, 
  Globe, 
  RotateCcw, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { JobCard } from '../components/JobCard';
import { JobDetailPane } from '../components/JobDetailPane';
import { DropdownSelect } from '../components/DropdownSelect';
import { fetcher, type JobsResponse, type CountriesResponse } from '../lib/api';
import { Button } from '../components/ui/button';

const PAGE_SIZE = 20;
const MAX_SEARCH_DEPTH = 100;

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';
  const selectedJobId = searchParams.get('job') || '';

  // Parse discrete keyword chips
  const keywords = useMemo(() => {
    if (!queryParam.trim()) return [];
    return queryParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }, [queryParam]);

  const [queryInput, setQueryInput] = useState('');

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

  const removeKeyword = (indexToRemove: number) => {
    const next = keywords.filter((_, idx) => idx !== indexToRemove);
    applyKeywords(next);
    inputRef.current?.focus();
  };

  const clearQuery = () => {
    setQueryInput('');
    updateFilters({ q: null });
    inputRef.current?.focus();
  };

  const clearAllFilters = () => {
    setQueryInput('');
    setSearchParams(new URLSearchParams());
  };

  // Quick 1-click filter toggle helpers
  const toggleWorkplace = (type: string) => {
    updateFilters({ workplace_type: workplaceParam === type ? null : type });
  };

  const toggleDate = (date: string) => {
    updateFilters({ date: dateParam === date ? null : date });
  };

  const activeFilterCount = [
    Boolean(countryParam),
    Boolean(workplaceParam),
    Boolean(dateParam),
  ].filter(Boolean).length;

  // Fetch dynamic countries list
  const { data: countriesData } = useSWR<CountriesResponse>('/v1/countries', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const countries = useMemo(() => countriesData?.countries || [], [countriesData]);

  const countryOptions = useMemo(() => {
    return [
      { value: '', label: 'All Countries' },
      ...countries.map((c) => ({ value: c.code, label: c.name })),
    ];
  }, [countries]);

  // SWR Infinite key generator
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

  const { data, error, size, setSize } = useSWRInfinite<JobsResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      persistSize: false,
    }
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
    return jobs.length > 0 ? jobs[0] : null;
  }, [jobs, selectedJobId]);

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = !isLoadingInitialData && !error && jobs.length === 0;

  const currentOffset = (size - 1) * PAGE_SIZE;
  const isSearchDepthLimit = currentOffset + PAGE_SIZE >= MAX_SEARCH_DEPTH;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1]?.has_more === false) ||
    isSearchDepthLimit;

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-background">
      {/* Sleek, Minimalist Command & Filter Bar */}
      <div className="border-b border-border/80 bg-card px-4 sm:px-6 py-3 shrink-0 space-y-2.5">
        {/* Search Input Row */}
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex-1 flex items-center bg-muted/40 hover:bg-muted/60 focus-within:bg-background border border-border/80 rounded-xl px-3 py-1.5 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/60 min-w-0 transition-colors cursor-text"
          >
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />

            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 py-0.5">
              {keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md text-xs font-medium bg-card text-foreground border border-border shrink-0 select-none shadow-2xs"
                >
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">{kw}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(idx);
                    }}
                    className="text-muted-foreground hover:text-foreground rounded p-0.5 cursor-pointer"
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
                    ? "Search roles, companies, or tech stack (e.g. React, Go, Remote)..."
                    : "Add keyword..."
                }
                value={queryInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="min-w-[140px] flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
              />
            </div>

            {(keywords.length > 0 || queryInput) ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearQuery();
                }}
                className="text-muted-foreground hover:text-foreground p-0.5 mr-1 cursor-pointer shrink-0"
                title="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center text-[10px] text-muted-foreground/70 font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/50 select-none">
                ↵ enter
              </kbd>
            )}
          </div>
        </div>

        {/* Minimalist Controls & Fast Toggles Strip */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs pt-0.5">
          {/* Left: Quick Pill Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Country Selector */}
            <div className="w-36">
              <DropdownSelect
                icon={<Globe className="h-3 w-3" />}
                value={countryParam}
                onChange={(val) => updateFilters({ country: val || null })}
                options={countryOptions}
                placeholder="Country: All"
                searchable
                fullWidth
              />
            </div>

            {/* Quick 1-Click Toggles */}
            <button
              type="button"
              onClick={() => toggleWorkplace('remote')}
              className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
                workplaceParam === 'remote'
                  ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Remote
            </button>

            <button
              type="button"
              onClick={() => toggleWorkplace('hybrid')}
              className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
                workplaceParam === 'hybrid'
                  ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Hybrid
            </button>

            <button
              type="button"
              onClick={() => toggleDate('24h')}
              className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
                dateParam === '24h'
                  ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Past 24h
            </button>

            <button
              type="button"
              onClick={() => toggleDate('week')}
              className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
                dateParam === 'week'
                  ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Past Week
            </button>

            {/* Reset Filters Button */}
            {(activeFilterCount > 0 || keywords.length > 0) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right: Live Status Indicator & Extension Link */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 ml-auto">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground font-semibold">{jobs.length}</span>
              <span>openings</span>
            </div>

            <span className="text-border">|</span>

            <Link
              to="/settings"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-[11px]"
            >
              <span>1-Click Autofill Extension</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 pb-3 overflow-hidden">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <Search className="h-9 w-9 text-muted-foreground/30" />
            <h3 className="text-sm font-semibold text-foreground">No matching openings found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try removing some search keywords or clearing active filters to see all available roles.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs cursor-pointer"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
            {/* Left Job Cards Column */}
            <div className="md:col-span-5 h-full overflow-y-auto pr-1 space-y-2.5">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onSelectJob={() => updateFilters({ job: job.id })}
                />
              ))}

              {/* Load More Button */}
              {!isReachingEnd && (
                <div className="pt-2 pb-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSize(size + 1)}
                    disabled={isLoadingMore}
                    className="w-full text-xs font-semibold h-8 cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more openings...
                      </span>
                    ) : (
                      'Load More Openings'
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Job Detail Inspector */}
            <div className="hidden md:flex md:col-span-7 h-full flex-col min-h-0 bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
              {selectedJob ? (
                <JobDetailPane
                  job={selectedJob}
                  onClose={() => updateFilters({ job: null })}
                  onSelectCompany={(c) => updateFilters({ q: c })}
                  onSelectLocation={(l) => updateFilters({ country: l })}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                  Select an opening on the left to inspect details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
