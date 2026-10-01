import { NavLink } from 'react-router-dom';
import { Briefcase, KanbanSquare, User, Settings } from 'lucide-react';
import { useStoredApplications } from '../lib/useStoredApplications';
import { groupFollowUps } from '../lib/followups';
import { cn } from '../lib/utils';

const TABS = [
  { to: '/', label: 'Jobs', icon: Briefcase, end: true },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

/** Phone navigation. Replaces the header nav under 768px. */
export function BottomTabs() {
  const [apps] = useStoredApplications();
  const dueCount = groupFollowUps(apps).actionable;
  return (
    <nav aria-label="Primary" className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {TABS.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn('relative flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium', isActive ? 'text-primary-text' : 'text-muted-foreground')
              }
            >
              <t.icon className="size-5" />
              {t.label}
              {t.to === '/pipeline' && dueCount > 0 && (
                <span className="absolute top-2 right-[calc(50%-20px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground" aria-hidden="true">
                  {dueCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
