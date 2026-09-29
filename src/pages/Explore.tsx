import { useState, useMemo, useRef, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  X, 
  Globe, 
  Briefcase, 
  Calendar, 
  RotateCcw, 
  SlidersHorizontal,
  Clock,
  AlertCircle,
  Loader2
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
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

  const workplaceOptions = [
    { value: '', label: 'Any Workplace' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' },
  ];

  const dateOptions = [
    { value: '', label: 'Any Time' },
    { value: '24h', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
  ];

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
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Search & Filter Header Strip */}
      <div className="p-4 sm:px-6 border-b border-border bg-card/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Keyword Search Input */}
          <div 
            onClick={() => inputRef.current?.focus()}
            className="flex-1 flex items-center bg-background border border-border rounded-xl px-3 py-1.5 shadow-2xs focus-within:ring-1 focus-within:ring-primary focus-within:border-primary min-w-0 cursor-text"
          >
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 py-0.5">
              {keywords.map((kw, idx) => (
                <span
                  key={`${kw}-${idx}`}
                  className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border shrink-0 select-none shadow-2xs"
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{kw}</span>
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
                    ? "Search title, company, or skills (e.g. Python, React)..."
                    : "Add keyword..."
                }
                value={queryInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="min-w-[120px] flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
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
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-36 hidden sm:block">
              <DropdownSelect
                icon={<Globe className="h-3.5 w-3.5" />}
                value={countryParam}
                onChange={(val) => updateFilters({ country: val || null })}
                options={countryOptions}
                placeholder="Country"
                searchable
                fullWidth
              />
            </div>

            <div className="w-32 hidden md:block">
              <DropdownSelect
                icon={<Briefcase className="h-3.5 w-3.5" />}
                value={workplaceParam}
                onChange={(val) => updateFilters({ workplace_type: val || null })}
                options={workplaceOptions}
                placeholder="Workplace"
                fullWidth
              />
            </div>

            <div className="w-32 hidden lg:block">
              <DropdownSelect
                icon={<Calendar className="h-3.5 w-3.5" />}
                value={dateParam}
                onChange={(val) => updateFilters({ date: val || null })}
                options={dateOptions}
                placeholder="Date"
                fullWidth
              />
            </div>

            {/* Mobile / Full Filter Toggle */}
            <div className="relative sm:hidden" ref={filterRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="h-9 px-2.5 text-xs gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 pb-2 overflow-hidden">
        {/* Results Bar */}
        <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs text-muted-foreground">
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
                {activeFilterCount > 0 && <span className="text-muted-foreground ml-1 font-normal">(filtered)</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Updated hourly from 150+ ATS portals</span>
          </div>
        </div>

        {/* Content Pane */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No matching openings found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Try removing some keywords or resetting filters to see more results.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="mt-4 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
            {/* Left Job Cards Column */}
            <div className="md:col-span-5 h-full overflow-y-auto pr-1 space-y-2">
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
                <div className="pt-2 pb-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSize(size + 1)}
                    disabled={isLoadingMore}
                    className="w-full text-xs font-semibold h-8"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more...
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
                  Select a job from the list to view full description
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
