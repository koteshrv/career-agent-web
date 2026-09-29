import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Orbit, 
  User as UserIcon 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const isJobsActive = location.pathname === '/' || location.pathname === '/jobs' || location.pathname === '/explore';
  const isTrackerActive = location.pathname === '/tracker' || location.pathname === '/pipeline' || location.pathname === '/applications';
  const isSettingsActive = location.pathname === '/settings';
  const isProfileActive = location.pathname === '/profile';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-xs shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Brand Logo & Constant Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity shrink-0">
              <Orbit className="h-6 w-6 stroke-[2.2]" />
              <span className="font-bold text-lg tracking-tight text-foreground">
                careeragent<span className="text-primary font-semibold">.fyi</span>
              </span>
            </Link>

            {/* Constant Primary Nav Links */}
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
              <Link
                to="/settings"
                className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center transition-all cursor-pointer select-none ${
                  isSettingsActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Settings
              </Link>
            </nav>
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

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-8.5 w-8.5 transition-colors cursor-pointer"
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
