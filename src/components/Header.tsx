import { NavLink } from 'react-router-dom';
import { Orbit } from 'lucide-react';
import { useStoredApplications } from '../lib/useStoredApplications';
import { groupFollowUps } from '../lib/followups';
import { cn } from '../lib/utils';

export const NAV = [
  { to: '/', label: 'Jobs', end: true },
  { to: '/pipeline', label: 'Pipeline', end: false },
  { to: '/profile', label: 'Profile', end: false },
  { to: '/settings', label: 'Settings', end: false },
] as const;

export function Header() {
  const [apps] = useStoredApplications();
  const dueCount = groupFollowUps(apps).actionable;

  return (
    <header className="shrink-0 z-30 w-full border-b border-border bg-card">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-stretch justify-between gap-6 px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-foreground" aria-label="CareerAgent home">
          <Orbit className="size-5 text-primary" strokeWidth={2.2} />
          <span className="text-base font-semibold tracking-tight">
            careeragent<span className="text-primary-text">.fyi</span>
          </span>
        </NavLink>

        <nav aria-label="Primary" className="hidden md:flex items-stretch gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex items-center gap-1.5 px-3 text-base font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0',
                  isActive && 'after:opacity-100'
                )
              }
            >
              {item.label}
              {item.to === '/pipeline' && dueCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums" aria-label={`${dueCount} follow-ups due`}>
                  {dueCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
