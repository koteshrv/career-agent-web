import { ExternalLink } from 'lucide-react';
import type { Job } from '../lib/api';
import { CompanyLogo } from './CompanyLogo';
import { Chip } from './ui/chip';
import { formatRelativeTime, formatFullDate } from '../lib/utils';
import { cn } from '../lib/utils';

export function primaryLocation(job: Job): string | null {
  if (!job.location || job.location.toLowerCase() === 'unknown') return null;
  return job.location.split(';')[0].trim();
}

interface JobRowProps {
  job: Job;
  selected: boolean;
  onSelect: (job: Job) => void;
}

/** One posting as a scannable row. The whole row selects; Apply is the only other control. */
export function JobRow({ job, selected, onSelect }: JobRowProps) {
  const meta = job.structured_metadata;
  const location = primaryLocation(job);
  const workplace = (job.workplace_type || meta?.remote_policy || '').toLowerCase();
  const stack = meta?.tech_stack?.slice(0, 4) ?? [];
  const posted = job.posted_at || job.created_at;

  return (
    <li className={cn('relative border-b border-border last:border-b-0', selected ? 'bg-muted' : 'hover:bg-muted/60')}>
      {selected && <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-foreground" />}
      <button
        type="button"
        onClick={() => onSelect(job)}
        aria-current={selected ? 'true' : undefined}
        aria-label={`${job.title} at ${job.company}${location ? `, ${location}` : ''}`}
        className="absolute inset-0 w-full cursor-pointer focus-visible:outline-offset-[-2px]"
      />
      <div className="pointer-events-none relative px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn('text-lg font-semibold leading-snug line-clamp-2', selected ? 'text-foreground' : 'text-foreground')}>{job.title}</h3>
          <a
            href={job.apply_url || job.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto hidden sm:inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            Apply
            <ExternalLink className="size-3.5" />
          </a>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <CompanyLogo name={job.company} size={16} className="rounded-xs" />
            {job.company}
          </span>
          {location && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[220px]">{location}</span>
            </>
          )}
          {workplace === 'remote' && (
            <>
              <span aria-hidden="true">·</span>
              <span>Remote</span>
            </>
          )}
          <span className="ml-auto whitespace-nowrap" title={formatFullDate(posted)}>
            {formatRelativeTime(posted)}
          </span>
        </div>
        {stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stack.map((t) => (
              <Chip key={t} size="sm">
                {t}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export function JobRowSkeleton() {
  return (
    <li className="border-b border-border px-5 py-4" aria-hidden="true">
      <div className="h-4 w-2/3 animate-pulse rounded-sm bg-muted" />
      <div className="mt-2.5 h-3.5 w-1/2 animate-pulse rounded-sm bg-muted" />
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-14 animate-pulse rounded-sm bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded-sm bg-muted" />
        <div className="h-5 w-12 animate-pulse rounded-sm bg-muted" />
      </div>
    </li>
  );
}
