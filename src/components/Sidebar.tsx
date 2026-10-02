import { NavLink, Link } from 'react-router-dom';
import { Briefcase, KanbanSquare, User, Settings, Puzzle, Building2, FileText } from 'lucide-react';
import { Logo } from './Logo';
import { useStoredApplications } from '../lib/useStoredApplications';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { groupFollowUps } from '../lib/followups';
import { cn } from '../lib/utils';

const PRIMARY = [
  { to: '/', label: 'Jobs', icon: Briefcase, end: true },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare, end: false },
  { to: '/drafts', label: 'Drafts', icon: FileText, end: false },
  { to: '/portals', label: 'Companies', icon: Building2, end: false },
] as const;
const SECONDARY = [
  { to: '/profile', label: 'Profile', icon: User, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

function Item({ to, label, icon: Icon, end, badge }: { to: string; label: string; icon: typeof Briefcase; end: boolean; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 items-center gap-3 rounded-xs px-3 text-base font-medium transition-colors',
          isActive ? 'bg-muted text-foreground before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
        )
      }
    >
      <Icon className="size-[18px]" />
      <span className="flex-1">{label}</span>
      {badge ? <span className="rounded-full bg-tint-blue px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">{badge}</span> : null}
    </NavLink>
  );
}

/** Desktop app shell navigation. Phones use BottomTabs. */
export function Sidebar() {
  const [apps] = useStoredApplications();
  const due = groupFollowUps(apps).actionable;
  const extension = useExtensionStatus();
  return (
    <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-border bg-card px-3 py-4">
      <Link to="/" className="flex h-10 items-center px-3" aria-label="CareerAgent home">
        <Logo />
      </Link>
      <nav aria-label="Primary" className="mt-6 flex flex-col gap-0.5">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">Workspace</p>
        {PRIMARY.map((i) => (
          <Item key={i.to} {...i} badge={i.to === '/pipeline' ? due : undefined} />
        ))}
      </nav>
      <nav aria-label="Account" className="mt-6 flex flex-col gap-0.5 border-t border-border pt-4">
        {SECONDARY.map((i) => (
          <Item key={i.to} {...i} />
        ))}
      </nav>
      <div className="mt-auto pt-4">
        <Link
          to="/settings"
          className={cn('flex items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-muted', extension ? 'bg-tint-green/60' : 'bg-card')}
          aria-label={extension ? 'Extension connected. Open settings' : 'Extension not connected. Open settings'}
        >
          <Puzzle className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            <span className="block font-medium text-foreground">{extension === null ? 'Extension' : extension ? 'Extension connected' : 'Install the extension'}</span>
            <span className="block truncate text-xs text-muted-foreground">{extension ? 'Autofill and tracking are on' : 'Needed for autofill and AI'}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
