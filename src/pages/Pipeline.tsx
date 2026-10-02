import { useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Plus, ExternalLink, Trash2, Mail, Copy, Check, Search, CalendarClock, KanbanSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { IconButton } from '../components/ui/icon-button';
import { Dialog } from '../components/ui/dialog';
import { Field, Input, Select } from '../components/ui/field';
import { EmptyState } from '../components/ui/empty-state';
import { SegmentedControl } from '../components/ui/segmented';
import { StatusBadge, StatusDot } from '../components/ui/status-badge';
import { CompanyLogo } from '../components/CompanyLogo';
import { StatusMenu } from '../components/ui/status-menu';
import { useToast } from '../components/ui/toast';
import { Page, PageHeader } from '../components/ui/page';
import { useStoredApplications } from '../lib/useStoredApplications';
import { groupFollowUps, nudgeEmail, daysUntilFollowUp } from '../lib/followups';
import {
  updateApplicationStatus,
  updateApplicationFollowUp,
  snoozeApplicationFollowUp,
  deleteTrackedApplication,
  addTrackedApplication,
  getStoredProfile,
} from '../lib/profileStorage';
import { STATUS_ORDER, STATUS_CONFIG, type TrackedApplication, type ApplicationStatus } from '../types/tracker';
import { cn } from '../lib/utils';

type Tab = 'board' | 'followups' | 'stats';

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function Pipeline({ tab }: { tab: Tab }) {
  const [apps, refresh] = useStoredApplications();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nudgeApp, setNudgeApp] = useState<TrackedApplication | null>(null);
  const [deleteApp, setDeleteApp] = useState<TrackedApplication | null>(null);
  const toast = useToast();

  const groups = useMemo(() => groupFollowUps(apps), [apps]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => a.company.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || (a.location || '').toLowerCase().includes(q));
  }, [apps, query]);

  const setStatus = (id: string, status: ApplicationStatus) => {
    updateApplicationStatus(id, status);
    refresh();
    toast(`Moved to ${STATUS_CONFIG[status].label}`);
  };
  const confirmDelete = () => {
    if (!deleteApp) return;
    deleteTrackedApplication(deleteApp.id);
    setDeleteApp(null);
    refresh();
    toast('Removed from pipeline');
  };

  const tabs = (
    <nav aria-label="Pipeline sections" className="flex items-center gap-1 border-b border-border -mb-px">
      {[
        { to: '/pipeline', label: 'Board', count: apps.length },
        { to: '/pipeline/followups', label: 'Follow-ups', count: groups.actionable },
        { to: '/pipeline/stats', label: 'Stats' },
      ].map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) =>
            cn(
              'inline-flex h-10 items-center gap-1.5 border-b-2 px-3 text-base font-medium transition-colors',
              isActive ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            )
          }
        >
          {t.label}
          {t.count !== undefined && t.count > 0 && <span className="text-sm tabular-nums text-muted-foreground">{t.count}</span>}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <Page width="wide" className="flex min-h-full flex-col">
      <PageHeader
        title="Pipeline"
        description="Every job you saved or applied to, with follow-ups timed three days after you apply."
        actions={
          <>
            {tab === 'board' && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  aria-label="Filter pipeline by company, title or location"
                  placeholder="Filter"
                  value={query}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    if (e.target.value.trim()) next.set('q', e.target.value);
                    else next.delete('q');
                    setSearchParams(next, { replace: true });
                  }}
                  className="w-44 pl-8 sm:w-56"
                />
              </div>
            )}
            <Button variant="primary" onClick={() => setIsAddOpen(true)}>
              <Plus />
              Add job
            </Button>
          </>
        }
        tabs={tabs}
      />

      {tab === 'board' && (
        <Board apps={filtered} total={apps.length} query={query} onStatus={setStatus} onNudge={setNudgeApp} onDelete={setDeleteApp} onAdd={() => setIsAddOpen(true)} />
      )}
      {tab === 'followups' && <FollowUps apps={apps} refresh={refresh} onNudge={setNudgeApp} />}
      {tab === 'stats' && <Stats apps={apps} />}

      <AddJobDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => {
          refresh();
          toast('Added to pipeline', 'success');
        }}
      />

      <NudgeDialog
        app={nudgeApp}
        onClose={() => setNudgeApp(null)}
        onChanged={refresh}
      />

      <Dialog
        open={Boolean(deleteApp)}
        onClose={() => setDeleteApp(null)}
        title="Remove this job?"
        description={deleteApp ? `${deleteApp.title} at ${deleteApp.company} will be removed from your pipeline.` : undefined}
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleteApp(null)}>Keep it</Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </>
        }
      >
        <span className="sr-only">Confirm removal</span>
      </Dialog>
    </Page>
  );
}

/* ---------- Board ---------- */

function Board({ apps, total, query, onStatus, onNudge, onDelete, onAdd }: {
  apps: TrackedApplication[];
  total: number;
  query: string;
  onStatus: (id: string, s: ApplicationStatus) => void;
  onNudge: (a: TrackedApplication) => void;
  onDelete: (a: TrackedApplication) => void;
  onAdd: () => void;
}) {
  if (total === 0) {
    return (
      <EmptyState
        icon={<KanbanSquare />}
        title="Your pipeline is empty"
        body="Save a posting from Jobs, or add one you applied to elsewhere. The extension can add them automatically when you apply."
        action={
          <>
            <Button variant="primary" onClick={onAdd}>
              <Plus />
              Add a job
            </Button>
            <Button asChild>
              <NavLink to="/">Browse jobs</NavLink>
            </Button>
          </>
        }
      />
    );
  }
  if (apps.length === 0) {
    return <EmptyState icon={<Search />} title={`Nothing matches “${query}”`} body="Try a company name or a job title." />;
  }

  return (
    <>
      {/* Board on wide screens */}
      <div className="hidden lg:flex flex-1 min-h-0 gap-4 overflow-x-auto pb-2">
        {STATUS_ORDER.map((status) => {
          const col = apps.filter((a) => a.status === status);
          return (
            <section key={status} aria-labelledby={`col-${status}`} className="flex min-w-[240px] flex-1 flex-col rounded-md bg-muted/50">
              <h2 id={`col-${status}`} className="flex items-center gap-2 px-4 pt-3.5 pb-2 text-sm font-medium text-foreground">
                <StatusDot status={status} />
                {STATUS_CONFIG[status].label}
                <span className="tabular-nums text-muted-foreground">{col.length}</span>
              </h2>
              <ul className="flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-2.5">
                {col.map((app) => (
                  <PipelineCard key={app.id} app={app} onStatus={onStatus} onNudge={onNudge} onDelete={onDelete} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Grouped list below lg */}
      <div className="lg:hidden space-y-6">
        {STATUS_ORDER.map((status) => {
          const col = apps.filter((a) => a.status === status);
          if (col.length === 0) return null;
          return (
            <section key={status} aria-labelledby={`list-${status}`}>
              <h2 id={`list-${status}`} className="mb-2 flex items-center gap-2 text-sm font-medium">
                <StatusBadge status={status} className="text-foreground" />
                <span className="tabular-nums text-muted-foreground">{col.length}</span>
              </h2>
              <ul className="space-y-2">
                {col.map((app) => (
                  <PipelineCard key={app.id} app={app} onStatus={onStatus} onNudge={onNudge} onDelete={onDelete} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

function PipelineCard({ app, onStatus, onNudge, onDelete }: {
  app: TrackedApplication;
  onStatus: (id: string, s: ApplicationStatus) => void;
  onNudge: (a: TrackedApplication) => void;
  onDelete: (a: TrackedApplication) => void;
}) {
  const needsNudge = (app.status === 'APPLIED' || app.status === 'INTERVIEWING') && !app.followedUp && daysUntilFollowUp(app) <= 2;
  return (
    <li className="group rounded-md border border-border bg-card p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <CompanyLogo name={app.company} size={32} className="mt-0.5 shrink-0 rounded-xs" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-snug text-foreground">{app.title}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {app.company}
            {app.location && <> · {app.location}</>}
          </p>
          {app.salary && <p className="mt-1 text-xs font-medium text-foreground">{app.salary}</p>}
        </div>
        {app.url && (
          <IconButton label={`Open ${app.company} posting`} size="sm" className="-mr-1.5 -mt-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={() => window.open(app.url, '_blank', 'noopener')}>
            <ExternalLink />
          </IconButton>
        )}
      </div>
      {needsNudge && (
        <button type="button" onClick={() => onNudge(app)} className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-tint-yellow px-2.5 py-1 text-xs font-medium text-foreground hover:underline underline-offset-2 cursor-pointer">
          <Mail className="size-3.5" />
          Follow-up due
        </button>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusMenu value={app.status} onChange={(s) => onStatus(app.id, s)} label={`Stage of ${app.title} at ${app.company}`} className="-ml-1" />
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <span className="shrink-0 whitespace-nowrap">{fmtDay(app.appliedDate)}</span>
          <IconButton label={`Remove ${app.title} from pipeline`} size="sm" tone="danger" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={() => onDelete(app)}>
            <Trash2 />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

/* ---------- Follow-ups ---------- */

function FollowUps({ apps, refresh, onNudge }: { apps: TrackedApplication[]; refresh: () => void; onNudge: (a: TrackedApplication) => void }) {
  const groups = useMemo(() => groupFollowUps(apps), [apps]);
  const [bucket, setBucket] = useState<'overdue' | 'due' | 'upcoming'>(groups.overdue.length ? 'overdue' : 'due');
  const toast = useToast();
  const list = groups[bucket];

  const markDone = (id: string) => {
    updateApplicationFollowUp(id, true);
    refresh();
    toast('Marked as followed up', 'success');
  };
  const snooze = (id: string, days: number) => {
    snoozeApplicationFollowUp(id, days);
    refresh();
    toast(`Snoozed ${days} days`);
  };

  return (
    <div className="max-w-[760px]">
      <SegmentedControl
        ariaLabel="Follow-up queue"
        value={bucket}
        onChange={setBucket}
        options={[
          { value: 'overdue', label: 'Overdue', count: groups.overdue.length },
          { value: 'due', label: 'Due soon', count: groups.due.length },
          { value: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
        ]}
        className="mb-4"
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<CalendarClock />}
          title={bucket === 'upcoming' ? 'Nothing scheduled' : 'Nothing to follow up on'}
          body="Jobs you apply to get a follow-up reminder three days later."
          compact
        />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {list.map((app) => {
            const d = daysUntilFollowUp(app);
            return (
              <li key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{app.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {app.company} · applied {fmtDay(app.appliedDate)} ·{' '}
                    {d < 0 ? `${Math.abs(d)} ${Math.abs(d) === 1 ? 'day' : 'days'} overdue` : d === 0 ? 'due today' : `due in ${d} ${d === 1 ? 'day' : 'days'}`}
                  </p>
                  {app.notes && <p className="mt-1 text-sm text-foreground/80">{app.notes}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => snooze(app.id, 3)}>
                    Snooze 3d
                  </Button>
                  <Button size="sm" onClick={() => onNudge(app)}>
                    <Mail />
                    Email
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => markDone(app.id)}>
                    <Check />
                    Done
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Stats ---------- */

function Stats({ apps }: { apps: TrackedApplication[] }) {
  const s = useMemo(() => {
    const count = (st: ApplicationStatus) => apps.filter((a) => a.status === st).length;
    const applied = count('APPLIED');
    const interviewing = count('INTERVIEWING');
    const offers = count('OFFER');
    const submitted = applied + interviewing + offers;
    const responseRate = submitted > 0 ? Math.round(((interviewing + offers) / submitted) * 100) : null;
    const companies: Record<string, number> = {};
    for (const a of apps) companies[a.company || 'Other'] = (companies[a.company || 'Other'] || 0) + 1;
    const top = Object.entries(companies).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { total: apps.length, saved: count('SAVED'), applied, interviewing, offers, archived: count('ARCHIVED'), submitted, responseRate, top };
  }, [apps]);

  if (s.total === 0) {
    return <EmptyState icon={<KanbanSquare />} title="No numbers yet" body="Stats appear once your pipeline has a few jobs in it." compact />;
  }

  const stages: Array<[string, number]> = [
    ['Saved', s.saved],
    ['Applied', s.applied],
    ['Interviewing', s.interviewing],
    ['Offer', s.offers],
  ];
  const max = Math.max(1, ...stages.map(([, n]) => n));

  return (
    <div className="max-w-[760px] space-y-8">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">In pipeline</dt>
          <dd className="text-3xl font-semibold text-foreground">{s.total}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Submitted</dt>
          <dd className="text-3xl font-semibold text-foreground">{s.submitted}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Heard back</dt>
          <dd className="text-3xl font-semibold text-foreground">{s.responseRate === null ? '–' : `${s.responseRate}%`}</dd>
          {s.responseRate !== null && s.submitted < 5 && <p className="text-xs text-muted-foreground">from {s.submitted} applications</p>}
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Offers</dt>
          <dd className="text-3xl font-semibold text-foreground">{s.offers}</dd>
        </div>
      </dl>

      <section aria-labelledby="funnel-title">
        <h2 id="funnel-title" className="text-lg font-semibold text-foreground">
          Where jobs are
        </h2>
        <p className="mt-0.5 mb-4 text-sm text-muted-foreground">Count by stage. Archived jobs are not shown.</p>
        <ul className="space-y-3">
          {stages.map(([label, n]) => (
            <li key={label} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm">
              <span className="text-foreground">{label}</span>
              <div className="h-5 rounded-full bg-muted" role="presentation">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(n / max) * 100}%` }} />
              </div>
              <span className="text-right tabular-nums font-medium text-foreground">{n}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="companies-title">
        <h2 id="companies-title" className="text-lg font-semibold text-foreground">
          Companies
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
          {s.top.map(([company, n]) => (
            <li key={company} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium text-foreground">{company}</span>
              <span className="tabular-nums text-muted-foreground">
                {n} {n === 1 ? 'job' : 'jobs'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Dialogs ---------- */

function AddJobDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const formId = 'add-job-form';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;
    addTrackedApplication({
      company: company.trim(),
      title: title.trim(),
      url: url.trim(),
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      status,
    });
    setCompany('');
    setTitle('');
    setUrl('');
    setLocation('');
    setSalary('');
    setStatus('APPLIED');
    onAdded();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a job"
      description="For postings you found or applied to outside the feed."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form={formId}>
            Add to pipeline
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company">
          <Input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Datadog" autoFocus />
        </Field>
        <Field label="Job title">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Backend Engineer" />
        </Field>
        <Field label="Posting URL" hint="Optional" className="sm:col-span-2">
          <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://boards.greenhouse.io/…" />
        </Field>
        <Field label="Location">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote or a city" />
        </Field>
        <Field label="Salary">
          <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="$180k – $220k" />
        </Field>
        <Field label="Stage" className="sm:col-span-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}>
            {STATUS_ORDER.filter((s) => s !== 'ARCHIVED').map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Dialog>
  );
}

function NudgeDialog({ app, onClose, onChanged }: { app: TrackedApplication | null; onClose: () => void; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const profile = useMemo(() => getStoredProfile(), []);
  if (!app) return null;
  const email = nudgeEmail(app, profile);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast('Email copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy', 'error');
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Follow up with ${app.company}`}
      description={`${app.title}, applied ${fmtDay(app.appliedDate)}`}
      size="lg"
      footer={
        <>
          <Button
            onClick={() => {
              snoozeApplicationFollowUp(app.id, 3);
              onChanged();
              onClose();
              toast('Snoozed 3 days');
            }}
          >
            Snooze 3d
          </Button>
          <Button
            onClick={() => {
              snoozeApplicationFollowUp(app.id, 7);
              onChanged();
              onClose();
              toast('Snoozed 7 days');
            }}
          >
            Snooze 7d
          </Button>
          <span className="flex-1" />
          <Button onClick={copy}>
            {copied ? <Check className="text-success" /> : <Copy />}
            {copied ? 'Copied' : 'Copy email'}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              updateApplicationFollowUp(app.id, true);
              onChanged();
              onClose();
              toast('Marked as followed up', 'success');
            }}
          >
            Mark followed up
          </Button>
        </>
      }
    >
      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-sm border border-border bg-muted/60 p-4 font-sans text-base leading-relaxed text-foreground">{email}</pre>
    </Dialog>
  );
}
