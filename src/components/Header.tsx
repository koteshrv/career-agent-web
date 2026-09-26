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
  Orbit,
  Zap
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { DropdownSelect } from './DropdownSelect';
import { fetcher, type CountriesResponse } from '../lib/api';

type BrandIcon = 'orbit' | 'prompt-arrow' | 'zap';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';

  const [queryInput, setQueryInput] = useState(queryParam);
  const [brandIcon, setBrandIcon] = useState<BrandIcon>(() => {
    return (localStorage.getItem('careeragent_brand_icon') as BrandIcon) || 'orbit';
  });

  const selectBrandIcon = (icon: BrandIcon) => {
    setBrandIcon(icon);
    localStorage.setItem('careeragent_brand_icon', icon);
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
          {/* Brand Logo & Icon Preview */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity">
              <span className="text-primary flex items-center justify-center">
                {brandIcon === 'orbit' && <Orbit className="h-6 w-6 stroke-[2.2]" />}
                {brandIcon === 'prompt-arrow' && (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 9 12 4 7" />
                    <line x1="12" y1="16" x2="19" y2="9" />
                    <polyline points="13 9 19 9 19 15" />
                  </svg>
                )}
                {brandIcon === 'zap' && <Zap className="h-6 w-6 fill-current" />}
              </span>
              <span className="font-bold text-lg tracking-tight text-foreground hidden md:block">CareerAgent</span>
            </Link>

            {/* Quick Pill Selector to compare live */}
            <div className="hidden lg:flex items-center bg-muted/80 p-0.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => selectBrandIcon('orbit')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  brandIcon === 'orbit' 
                    ? 'bg-background text-foreground shadow-2xs font-semibold' 
                    : 'hover:text-foreground'
                }`}
                title="Select Orbit icon"
              >
                Orbit
              </button>
              <button
                type="button"
                onClick={() => selectBrandIcon('prompt-arrow')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  brandIcon === 'prompt-arrow' 
                    ? 'bg-background text-foreground shadow-2xs font-semibold' 
                    : 'hover:text-foreground'
                }`}
                title="Select > ↗ prompt & arrow icon"
              >
                &gt; ↗ Arrow
              </button>
              <button
                type="button"
                onClick={() => selectBrandIcon('zap')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  brandIcon === 'zap' 
                    ? 'bg-background text-foreground shadow-2xs font-semibold' 
                    : 'hover:text-foreground'
                }`}
                title="Select Zap (GitHub default)"
              >
                Zap (GitHub)
              </button>
            </div>
          </div>

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
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
