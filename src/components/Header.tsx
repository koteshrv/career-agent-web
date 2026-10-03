import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { useStoredApplications } from '../lib/useStoredApplications';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { groupFollowUps } from '../lib/followups';
import { cn } from '../lib/utils';

export const NAV = [
  { to: '/jobs', label: 'Jobs', end: false },
  { to: '/matches', label: 'For you', end: false },
  { to: '/pipeline', label: 'Pipeline', end: false },
  { to: '/drafts', label: 'Drafts', end: false },
  { to: '/profile', label: 'Profile', end: false },
  { to: '/settings', label: 'Settings', end: false },
] as const;

export function Header() {
  const [apps] = useStoredApplications();
  const dueCount = groupFollowUps(apps).actionable;
  const extension = useExtensionStatus();

  return (
    <header className="shrink-0 z-30 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex items-center gap-10">
          <Link to="/jobs" className="flex items-center" aria-label="CareerAgent home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-8 items-center gap-2 rounded-xs px-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {item.label}
                {item.to === '/pipeline' && dueCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground tabular-nums" aria-label={`${dueCount} follow-ups due`}>
                    {dueCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/koteshrv/career-agent-web/issues/new"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex h-8 items-center justify-center rounded-xs px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Report issue
          </a>
          <a
            href="https://github.com/koteshrv/career-agent-web"
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            title="Source on GitHub"
            className="inline-flex size-8 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <div className="mx-2 h-4 w-px bg-border" aria-hidden="true" />
          <Link
            to="/settings"
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-xs border px-3 text-sm font-medium transition-colors',
              extension ? 'border-border bg-card text-foreground hover:bg-muted' : 'border-border-strong bg-card text-foreground hover:bg-muted'
            )}
            aria-label={extension === null ? 'Checking extension' : extension ? 'Extension connected. Open settings' : 'Extension not connected. Open settings'}
          >
            <span aria-hidden="true" className={cn('size-2 rounded-full', extension ? 'bg-dot-green' : extension === null ? 'bg-border-strong' : 'bg-muted-foreground/60')} />
            <span className="hidden sm:inline">{extension === null ? 'Extension' : extension ? 'Extension connected' : 'Install extension'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
