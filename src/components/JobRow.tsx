import type { Job } from '../lib/api';
import { CompanyLogo } from './CompanyLogo';
import { formatRelativeTime, formatFullDate } from '../lib/utils';
import { cn } from '../lib/utils';
import { VERDICT_LABEL, VERDICT_PILL, type JobEvaluation } from '../lib/evaluations';

export function primaryLocation(job: Job): string | null {
  if (!job.location || job.location.toLowerCase() === 'unknown') return null;
  return job.location.split(';')[0].trim();
}

interface JobRowProps {
  job: Job;
  selected: boolean;
  onSelect: (job: Job) => void;
  evaluation?: JobEvaluation;
}

/** One posting as a scannable row: logo, title in the accent, company, location, age. The whole row selects; applying lives in the pane. */
export function JobRow({ job, selected, onSelect, evaluation }: JobRowProps) {
  const meta = job.structured_metadata;
  const location = primaryLocation(job);
  const workplace = (job.workplace_type || meta?.remote_policy || '').toLowerCase();
  const posted = job.posted_at || job.created_at;
  const where = [location, workplace === 'remote' ? 'Remote' : workplace === 'hybrid' ? 'Hybrid' : null].filter(Boolean).join(' · ');

  return (
    <li className={cn('relative border-b border-border last:border-b-0', selected ? 'bg-muted' : 'hover:bg-muted/60')}>
      {selected && <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-primary" />}
      <button
        type="button"
        onClick={() => onSelect(job)}
        aria-current={selected ? 'true' : undefined}
        aria-label={`${job.title} at ${job.company}${location ? `, ${location}` : ''}`}
        className="absolute inset-0 w-full cursor-pointer focus-visible:outline-offset-[-2px]"
      />
      <div className="pointer-events-none relative flex gap-3 px-4 py-3.5 sm:px-5">
        <CompanyLogo name={job.company} size={40} className="mt-0.5 shrink-0 rounded-xs" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-snug text-primary-text line-clamp-2">{job.title}</h3>
          <p className="mt-0.5 truncate text-sm text-foreground">{job.company}</p>
          {where && <p className="truncate text-xs text-muted-foreground">{where}</p>}
          <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground" title={formatFullDate(posted)}>
            {evaluation && (
              <span className={cn('inline-flex h-5 items-center gap-1 rounded-full px-2 font-medium text-foreground', VERDICT_PILL[evaluation.verdict])} title={evaluation.reason}>
                <span className="tabular-nums">{evaluation.score.toFixed(1)}</span>
                {VERDICT_LABEL[evaluation.verdict]}
              </span>
            )}
            {formatRelativeTime(posted)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function JobRowSkeleton() {
  return (
    <li className="flex gap-3 border-b border-border px-5 py-3.5" aria-hidden="true">
      <div className="size-10 shrink-0 animate-pulse rounded-xs bg-muted" />
      <div className="flex-1">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-muted" />
        <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded-sm bg-muted" />
        <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded-sm bg-muted" />
      </div>
    </li>
  );
}
