import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { 
  Orbit, 
  User as UserIcon,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Globe,
  Briefcase,
  Calendar,
  Settings,
  Sparkles,
  Bell,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { DropdownSelect } from './DropdownSelect';
import { fetcher, type CountriesResponse } from '../lib/api';
import { getStoredApplications } from '../lib/profileStorage';
import type { TrackedApplication } from '../types/tracker';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isJobsActive = location.pathname === '/' || location.pathname === '/jobs' || location.pathname === '/explore';
  const isTrackerActive = location.pathname === '/tracker' || location.pathname === '/pipeline' || location.pathname === '/applications';
  const isSettingsActive = location.pathname === '/settings';
  const isProfileActive = location.pathname === '/profile';
  const isLogsActive = location.pathname === '/logs';

  // Common Search & Filter state
  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';

  // Parse discrete keyword chips from comma-separated query parameter for Jobs
  const keywords = useMemo(() => {
    if (!isJobsActive || !queryParam.trim()) return [];
    return queryParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }, [isJobsActive, queryParam]);

  const [queryInput, setQueryInput] = useState(isTrackerActive ? queryParam : '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync queryInput when route changes or queryParam changes on Tracker
  useEffect(() => {
    if (isTrackerActive) {
      setQueryInput(queryParam);
    } else if (isJobsActive) {
      // In jobs, keywords handle the chips, queryInput is only the unstaged text
      setQueryInput('');
    }
  }, [location.pathname, queryParam, isTrackerActive, isJobsActive]);

  // Close filter popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Notifications & Follow-up Nudges
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [trackedApps, setTrackedApps] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    setTrackedApps(getStoredApplications());
    const handleSync = () => setTrackedApps(getStoredApplications());
    window.addEventListener('storage', handleSync);
    window.addEventListener('careeragent_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('careeragent_sync', handleSync);
    };
  }, [location.pathname]);

  const pendingNudges = useMemo(() => {
    const now = Date.now();
    return trackedApps.filter((app) => {
      if (app.status !== 'APPLIED' && app.status !== 'INTERVIEWING') return false;
      if (app.followedUp) return false;
      const targetTime = app.followUpDate
        ? new Date(app.followUpDate).getTime()
        : new Date(app.appliedDate).getTime() + 5 * 24 * 60 * 60 * 1000;
      const diffDays = Math.round((targetTime - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    });
  }, [trackedApps]);

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
    if (isTrackerActive) {
      setQueryInput(val);
      updateFilters({ q: val.trim() || null });
    } else if (isJobsActive) {
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
    } else {
      setQueryInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = queryInput.trim();
      if (isJobsActive) {
        if (trimmed) {
          if (!keywords.includes(trimmed)) {
            const next = [...keywords, trimmed];
            applyKeywords(next);
          }
          setQueryInput('');
        } else if (keywords.length > 0) {
          applyKeywords(keywords);
        }
      } else if (isTrackerActive) {
        updateFilters({ q: trimmed || null });
      } else {
        // From Settings/Profile, navigate to Jobs with query
        navigate(`/?q=${encodeURIComponent(trimmed)}`);
      }
    } else if (isJobsActive && e.key === 'Backspace' && !queryInput && keywords.length > 0) {
      const next = keywords.slice(0, -1);
      applyKeywords(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isJobsActive) {
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
    if (isJobsActive) {
      if (trimmed && !keywords.includes(trimmed)) {
        const next = [...keywords, trimmed];
        applyKeywords(next);
        setQueryInput('');
      } else {
        applyKeywords(keywords);
      }
    } else if (isTrackerActive) {
      updateFilters({ q: trimmed || null });
    } else {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
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
  const { data: countriesData } = useSWR<CountriesResponse>(
    isJobsActive ? '/v1/countries' : null, 
    fetcher, 
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

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

  // Context-aware search placeholder
  const searchPlaceholder = isJobsActive
    ? (keywords.length === 0 ? "Search jobs by title, company, or skills..." : "Add keyword...")
    : isTrackerActive
    ? "Search applications by company or title..."
    : "Search jobs across 150+ ATS portals...";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-xs shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Constant Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity shrink-0">
              <Orbit className="h-6 w-6 stroke-[2.2]" />
              <span className="font-bold text-lg tracking-tight text-foreground">
                careeragent<span className="text-primary font-semibold">.fyi</span>
              </span>
            </Link>

            {/* Permanent Primary Nav Links */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <Link
                to="/"
                className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center transition-all cursor-pointer select-none ${
                  isJobsActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/tracker"
                className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center transition-all cursor-pointer select-none ${
                  isTrackerActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Tracker
              </Link>
            </nav>
          </div>

          {/* Common Context-Aware Search Bar in Center */}
          <div className="flex-1 max-w-xl xl:max-w-2xl flex items-center gap-2 min-w-0">
            <form 
              onSubmit={handleSearchSubmit} 
              onClick={() => inputRef.current?.focus()}
              className="flex-1 flex items-center bg-card border border-border/80 rounded-xl px-2.5 py-1 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary min-w-0 cursor-text"
            >
              <Search className="h-4 w-4 text-muted-foreground mr-1.5 shrink-0" />

              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 py-0.5">
                {isJobsActive && keywords.map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border shrink-0 select-none shadow-2xs animate-in fade-in zoom-in-95"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-[160px]">{kw}</span>
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
                  placeholder={searchPlaceholder}
                  value={queryInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className="min-w-[90px] flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-hidden py-0.5"
                />
              </div>

              {((isJobsActive && (keywords.length > 0 || queryInput)) || (isTrackerActive && queryInput)) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearQuery();
                  }}
                  className="text-muted-foreground hover:text-foreground p-0.5 mr-1 cursor-pointer shrink-0"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <Button
                type="submit"
                size="sm"
                className="h-7 px-3 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 shadow-2xs cursor-pointer shrink-0"
              >
                Search
              </Button>
            </form>

            {/* If on Jobs, show the Filters popover button directly beside Search */}
            {isJobsActive && (
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

                    {(() => {
                      const isOnboardingDone = typeof window !== 'undefined' && Boolean(
                        localStorage.getItem('careeragent_onboarded') || 
                        localStorage.getItem('careeragent_global_filters')
                      );

                      return (
                        <div className={`pt-2 border-t border-border/60 flex items-center ${isOnboardingDone ? 'justify-end' : 'justify-between'}`}>
                          {!isOnboardingDone && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsFilterOpen(false);
                                window.dispatchEvent(new CustomEvent('open_onboarding_modal'));
                              }}
                              className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              AI Onboarding Setup
                            </button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => setIsFilterOpen(false)}
                            className="h-7 px-3 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                          >
                            Done
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Constant Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Star on GitHub */}
            <a
              href="https://github.com/koteshrv/career-agent"
              target="_blank"
              rel="noreferrer"
              className="h-8.5 px-2.5 sm:px-3 rounded-lg border border-border/60 bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 inline-flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0"
              title="Star on GitHub"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 16 16" 
                fill="currentColor" 
                className="shrink-0"
              >
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <span className="hidden md:inline">Star</span>
            </a>

            {/* Notifications & Nudges */}
            <div className="relative shrink-0" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`h-8.5 w-8.5 rounded-lg border text-xs font-medium flex items-center justify-center transition-all cursor-pointer select-none relative ${
                  isNotificationsOpen || pendingNudges.length > 0
                    ? 'border-border/80 bg-card text-foreground hover:bg-muted/50'
                    : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={pendingNudges.length > 0 ? `${pendingNudges.length} Follow-up Nudges Due` : "Notifications & Nudges"}
                aria-label="Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
                {pendingNudges.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50">
                    {pendingNudges.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Bell className="h-3.5 w-3.5 text-primary" />
                      <span>Follow-up Nudges</span>
                    </div>
                    {pendingNudges.length > 0 ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {pendingNudges.length} Due
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Up to date</span>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {pendingNudges.length === 0 ? (
                      <div className="py-6 text-center text-muted-foreground space-y-1">
                        <Clock className="h-6 w-6 mx-auto text-muted-foreground/60" />
                        <p className="font-semibold text-xs text-foreground">All caught up!</p>
                        <p className="text-[11px] text-muted-foreground">No follow-up emails due for your tracked applications.</p>
                      </div>
                    ) : (
                      pendingNudges.map((app) => (
                        <Link
                          key={app.id}
                          to="/tracker"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block p-2.5 rounded-lg bg-background hover:bg-muted/50 border border-border/70 space-y-1 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[190px]">
                              {app.company}
                            </span>
                            <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1 shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <Clock className="h-3 w-3" /> Due
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[11px] truncate">
                            {app.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80">
                            Applied {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &bull; Click to draft nudge
                          </p>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/80 flex justify-between items-center text-[11px]">
                    <Link
                      to="/tracker"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-primary hover:underline font-semibold"
                    >
                      Open Pipeline Tracker &rarr;
                    </Link>
                    <span className="text-[10px] text-muted-foreground">3-day nudge reminder</span>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Profile (100% Local) */}
            <Link
              to="/profile"
              className={`h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isProfileActive
                  ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title="Candidate Profile & Local Autofill"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <Link
              to="/logs"
              className={`h-8.5 w-8.5 rounded-lg border text-xs font-medium flex items-center justify-center transition-all cursor-pointer select-none ${
                isLogsActive
                  ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title="API Transparency Logs"
            >
              <Activity className="h-3.5 w-3.5" />
            </Link>

            <Link
              to="/settings"
              className={`h-8.5 w-8.5 rounded-lg border text-xs font-medium flex items-center justify-center transition-all cursor-pointer select-none ${
                isSettingsActive
                  ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                  : 'border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title="Platform Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
