import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
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
  SlidersHorizontal,
  User as UserIcon,
  Kanban,
  Building2,
  LogIn,
  LogOut
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { DropdownSelect } from './DropdownSelect';
import { fetcher, type CountriesResponse } from '../lib/api';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';

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

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

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

  const isJobsRoute = location.pathname === '/jobs';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs shadow-2xs">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 sm:h-15 items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity shrink-0">
            <Orbit className="h-6 w-6 stroke-[2.2]" />
            <span className="font-bold text-lg tracking-tight text-foreground">
              careeragent<span className="text-primary font-semibold">.fyi</span>
            </span>
          </Link>

          {/* Center Column: Search Bar (when on /jobs) OR Navigation Links (when on other pages) */}
          {isJobsRoute ? (
            <form 
              onSubmit={handleSearchSubmit} 
              onClick={() => inputRef.current?.focus()}
              className="flex-1 max-w-xl flex items-center bg-card border border-border rounded-xl px-2.5 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary min-w-0 cursor-text"
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
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium">
              <Link
                to="/jobs"
                className={`transition-colors hover:text-foreground ${
                  location.pathname === '/jobs' ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/portals"
                className={`transition-colors hover:text-foreground ${
                  location.pathname === '/portals' ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Portals
              </Link>
              <Link
                to="/tracker"
                className={`transition-colors hover:text-foreground ${
                  location.pathname === '/tracker' ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                Tracker
              </Link>
              <a
                href="/#workflow"
                className="transition-colors hover:text-foreground text-muted-foreground"
              >
                How it works
              </a>
              <a
                href="/#pricing"
                className="transition-colors hover:text-foreground text-muted-foreground"
              >
                Pricing
              </a>
            </nav>
          )}

          {/* Right Action Cluster: Filters (on /jobs) + Theme + SSO Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Filter Popover (Active only on /jobs) */}
            {isJobsRoute && (
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none ${
                    activeFilterCount > 0
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-card text-foreground hover:bg-muted/70'
                  } ${isFilterOpen ? 'ring-1 ring-primary/40 border-primary' : ''}`}
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
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
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

                    <div className="pt-2 border-t border-border flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                        className="h-7 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If on /jobs, show direct links to Tracker & Portals on desktop */}
            {isJobsRoute && (
              <>
                <Link
                  to="/tracker"
                  className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none ${
                    location.pathname === '/tracker'
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-card text-foreground hover:bg-muted/70'
                  }`}
                  title="View Application Tracker"
                >
                  <Kanban className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Tracker</span>
                </Link>

                <Link
                  to="/portals"
                  className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none ${
                    location.pathname === '/portals'
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-card text-foreground hover:bg-muted/70'
                  }`}
                  title="Monitored ATS Portals"
                >
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Portals</span>
                </Link>
              </>
            )}

            {/* Candidate Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer select-none ${
                    location.pathname === '/profile'
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-card text-foreground hover:bg-muted/70'
                  }`}
                  title="Candidate Profile & Autofill Settings"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-4 w-4 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground h-9 w-9 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={openAuthModal}
                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Theme Toggle */}
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
      </div>
    </header>
  );
}
