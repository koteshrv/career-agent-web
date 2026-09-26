import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { 
  Moon, 
  Sun, 
  Search, 
  X, 
  Globe, 
  Briefcase, 
  Calendar,
  RotateCcw,
  Orbit
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { DropdownSelect } from './DropdownSelect';
import { fetcher, type CountriesResponse } from '../lib/api';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';

  const [queryInput, setQueryInput] = useState(queryParam);

  // Determine current active theme (handling system preference)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

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
    localStorage.setItem('careeragent_country_initialized', 'true');
    setQueryInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    queryParam || countryParam || workplaceParam || dateParam
  );

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
      { value: '', label: 'All Countries' },
      ...countries.map((c) => ({ value: c.code, label: c.name })),
    ];
  }, [countries]);

  // Auto-detect country based on IP for first-time visitors
  useEffect(() => {
    const isInitialized = localStorage.getItem('careeragent_country_initialized');
    if (countryParam || isInitialized || !countries.length) return;

    let isMounted = true;
    async function autoDetect() {
      try {
        let detectedCode: string | null = null;
        // 1. Try Cloudflare Pages edge function
        try {
          const res = await fetch('/api/geo');
          if (res.ok) {
            const data = await res.json();
            if (data?.country && data.country !== 'XX') {
              detectedCode = data.country;
            }
          }
        } catch {
          // Cloudflare function not reached (e.g. dev)
        }

        // 2. Dev / non-Cloudflare fallback
        if (!detectedCode) {
          try {
            const fallbackRes = await fetch('https://ipapi.co/json/');
            if (fallbackRes.ok) {
              const fbData = await fallbackRes.json();
              if (fbData?.country_code) {
                detectedCode = fbData.country_code;
              }
            }
          } catch {
            // Ignore fallback network issues
          }
        }

        if (isMounted && detectedCode) {
          const matched = countries.find(
            (c) => c.code.toUpperCase() === detectedCode!.toUpperCase()
          );
          if (matched) {
            updateFilters({ country: matched.code });
          }
        }
      } finally {
        if (isMounted) {
          localStorage.setItem('careeragent_country_initialized', 'true');
        }
      }
    }

    autoDetect();
    return () => {
      isMounted = false;
    };
  }, [countries, countryParam]);

  const workplaceOptions = [
    { value: '', label: 'Workplace: Any' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'Onsite' },
  ];

  const dateOptions = [
    { value: '', label: 'Date: Any time' },
    { value: '24h', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-xs">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Row: Brand | Search Form | Theme & GitHub */}
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo with Orbit */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity shrink-0">
            <Orbit className="h-6 w-6 stroke-[2.2]" />
            <span className="font-bold text-lg tracking-tight text-foreground hidden md:block">CareerAgent</span>
          </Link>

          {/* Integrated Search Input (LinkedIn style beside logo) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-2xl flex items-center bg-card border border-border rounded-xl px-2.5 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary"
          >
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search title, company, or skills (e.g. Python, React)..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
            />
            {queryInput && (
              <button
                type="button"
                onClick={clearQuery}
                className="text-muted-foreground hover:text-foreground p-0.5 mr-1 cursor-pointer"
                title="Clear search"
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

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-9 w-9 transition-colors cursor-pointer"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500 transition-all rotate-0 scale-100" />
              ) : (
                <Moon className="h-4 w-4 text-foreground transition-all rotate-0 scale-100" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Filter Strip directly under search */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Country Select */}
            <DropdownSelect
              icon={<Globe className="h-3.5 w-3.5" />}
              value={countryParam}
              onChange={(val) => {
                localStorage.setItem('careeragent_country_initialized', 'true');
                updateFilters({ country: val || null });
              }}
              options={countryOptions}
              placeholder="All Countries"
              ariaLabel="Filter by country"
              searchable
            />

            {/* Workplace Select */}
            <DropdownSelect
              icon={<Briefcase className="h-3.5 w-3.5" />}
              value={workplaceParam}
              onChange={(val) => updateFilters({ workplace_type: val || null })}
              options={workplaceOptions}
              placeholder="Workplace: Any"
              ariaLabel="Filter by workplace type"
            />

            {/* Date Posted Select (LinkedIn style) */}
            <DropdownSelect
              icon={<Calendar className="h-3.5 w-3.5" />}
              value={dateParam}
              onChange={(val) => updateFilters({ date: val || null })}
              options={dateOptions}
              placeholder="Date: Any time"
              ariaLabel="Filter by date posted"
            />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 hover:text-foreground font-medium text-xs cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
