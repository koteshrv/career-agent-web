import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { useStoredApplications } from '../lib/useStoredApplications';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { groupFollowUps } from '../lib/followups';
import { cn } from '../lib/utils';

export const NAV = [
  { to: '/', label: 'Jobs', end: true },
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
    <header className="shrink-0 z-30 w-full border-b border-border bg-card">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center" aria-label="CareerAgent home">
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
                    'inline-flex h-9 items-center gap-2 rounded-full px-4 text-base font-medium transition-colors',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {item.label}
                {item.to === '/pipeline' && dueCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-semibold text-background tabular-nums" aria-label={`${dueCount} follow-ups due`}>
                    {dueCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <Link
          to="/settings"
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
            extension ? 'border-transparent bg-tint-green text-foreground' : 'border-line-strong bg-card text-foreground hover:bg-muted'
          )}
          aria-label={extension === null ? 'Checking extension' : extension ? 'Extension connected. Open settings' : 'Extension not connected. Open settings'}
        >
          <span aria-hidden="true" className={cn('size-2 rounded-full', extension ? 'bg-dot-green' : extension === null ? 'bg-line-strong' : 'bg-muted-foreground/60')} />
          <span className="hidden sm:inline">{extension === null ? 'Extension' : extension ? 'Extension connected' : 'Install extension'}</span>
        </Link>
      </div>
    </header>
  );
}
