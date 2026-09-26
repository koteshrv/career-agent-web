import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { 
  Moon, 
  Sun, 
  Zap, 
  Search, 
  X, 
  Globe, 
  Briefcase, 
  Calendar,
  RotateCcw 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { fetcher, type CountriesResponse } from '../lib/api';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-xs">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Row: Brand | Search Form | Theme & GitHub */}
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity shrink-0">
            <Zap className="h-6 w-6 fill-current" />
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
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground h-9 w-9">
              <a href="https://github.com/koteshrv/career-agent" target="_blank" rel="noreferrer" aria-label="GitHub repository">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 16 16" 
                  fill="currentColor" 
                  className="h-5 w-5"
                >
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <span className="sr-only">GitHub repository</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Filter Strip directly under search */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Country Select */}
            <div className="flex items-center bg-card border border-border/80 rounded-lg px-2.5 py-1 shadow-2xs hover:border-border transition-colors">
              <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
              <select
                value={countryParam}
                onChange={(e) => updateFilters({ country: e.target.value || null })}
                aria-label="Filter by country"
                className="bg-transparent text-xs font-medium text-foreground outline-hidden cursor-pointer dark:bg-card [&>option]:bg-white [&>option]:text-zinc-900 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Workplace Select */}
            <div className="flex items-center bg-card border border-border/80 rounded-lg px-2.5 py-1 shadow-2xs hover:border-border transition-colors">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
              <select
                value={workplaceParam}
                onChange={(e) => updateFilters({ workplace_type: e.target.value || null })}
                aria-label="Filter by workplace type"
                className="bg-transparent text-xs font-medium text-foreground outline-hidden cursor-pointer dark:bg-card [&>option]:bg-white [&>option]:text-zinc-900 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100"
              >
                <option value="">Workplace: Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Date Posted Select (LinkedIn style) */}
            <div className="flex items-center bg-card border border-border/80 rounded-lg px-2.5 py-1 shadow-2xs hover:border-border transition-colors">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
              <select
                value={dateParam}
                onChange={(e) => updateFilters({ date: e.target.value || null })}
                aria-label="Filter by date posted"
                className="bg-transparent text-xs font-medium text-foreground outline-hidden cursor-pointer dark:bg-card [&>option]:bg-white [&>option]:text-zinc-900 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100"
              >
                <option value="">Date: Any time</option>
                <option value="24h">Past 24 hours</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </div>
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
