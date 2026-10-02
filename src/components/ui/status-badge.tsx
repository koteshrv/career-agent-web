import { STATUS_CONFIG, type ApplicationStatus } from '../../types/tracker';
import { cn } from '../../lib/utils';

/** Status always ships as dot + label, never color alone. One config feeds every surface. */
export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium', c.pill, c.text, className)}>
      <span aria-hidden="true" className={cn('size-2 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: ApplicationStatus; className?: string }) {
  return <span aria-hidden="true" className={cn('size-2 rounded-full', STATUS_CONFIG[status].dot, className)} />;
}
