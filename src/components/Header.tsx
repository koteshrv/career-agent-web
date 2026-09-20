import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity">
            <Zap className="h-6 w-6 fill-current" />
            <span className="font-bold text-lg tracking-tight text-foreground hidden sm:block">CareerAgent</span>
          </Link>
          
          <nav className="flex items-center space-x-1">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              asChild
              className="text-sm font-medium"
            >
              <Link to="/">Search Jobs</Link>
            </Button>
            <Button
              variant={location.pathname === '/companies' ? 'secondary' : 'ghost'}
              asChild
              className="text-sm font-medium"
            >
              <Link to="/companies">Companies</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
            <a href="https://github.com/koteshrv/career-agent" target="_blank" rel="noreferrer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub repository</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
