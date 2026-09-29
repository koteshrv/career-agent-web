import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Rocket, 
  Briefcase, 
  CalendarClock, 
  Zap, 
  LineChart, 
  Settings, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bell, 
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const NAV_ITEMS = [
  { to: "/", label: "Explore Jobs", title: "Explore Jobs", subtitle: "8,420+ verified direct company openings across 150+ ATS portals.", icon: Rocket, exact: true },
  { to: "/pipeline", label: "Pipeline", title: "Pipeline", subtitle: "Every job you're tracking, in one list.", icon: Briefcase },
  { to: "/followups", label: "Follow-ups", title: "Follow-ups", subtitle: "Applications waiting on a nudge.", icon: CalendarClock },
  { to: "/quick-generate", label: "Quick Generate", title: "Quick Generate", subtitle: "Instantly generate tailored cover letters and resume bullets.", icon: Zap },
  { to: "/analytics", label: "Analytics", title: "Analytics", subtitle: "Insights and metrics on your job search progress.", icon: LineChart },
  { to: "/settings", label: "Settings", title: "Settings", subtitle: "Manage your candidate profile, BYOK API keys, and extension sync.", icon: Settings },
];

export function SidebarLayout() {
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const currentNav = NAV_ITEMS.find((item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }) || {
    title: "CareerAgent",
    subtitle: "Automate the job hunt. Keep your privacy intact."
  };

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          onClick={onNavigate}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
            }`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-foreground font-sans flex flex-col overflow-hidden bg-background">
      <div className="flex flex-1 overflow-hidden h-screen">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col z-40 shrink-0">
          <Link
            to="/"
            className="h-16 flex items-center px-6 border-b border-border hover:bg-accent/40 transition-colors gap-2.5 text-primary"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shadow-2xs">
              ⚡
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              CareerAgent
            </span>
          </Link>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {renderNavLinks()}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono text-[11px] text-muted-foreground/80">v1.2.0 • BYOK</span>
            <a
              href="https://github.com/koteshrv/career-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col z-50">
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <div className="flex items-center gap-2.5 text-primary">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    CareerAgent
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                {renderNavLinks(() => setMobileNavOpen(false))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-background">
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:bg-accent transition-colors shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-foreground truncate">
                  {currentNav.title}
                </h1>
                {currentNav.subtitle && (
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">
                    {currentNav.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://github.com/koteshrv/career-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold shadow-2xs transition-colors"
                title="Star CareerAgent on GitHub"
              >
                <span className="text-amber-500">⭐</span>
                <span>Star on GitHub</span>
              </a>
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-foreground" />}
              </button>

              {/* Notification Tray */}
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              </button>

              {/* User Profile / Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 h-9 px-2.5 rounded-lg hover:bg-accent transition-colors text-xs font-medium border border-border"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-primary" />
                    )}
                    <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={openAuthModal}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </header>

          {/* Scrollable Routed Page Content */}
          <main className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
