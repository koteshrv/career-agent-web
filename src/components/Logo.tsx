import { cn } from '../lib/utils';

/** The mark: three rising steps, the career ladder, in the accent. No tile so it sits on any surface. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect x="2" y="14" width="5.5" height="8" rx="1.5" fill="var(--accent)" />
      <rect x="9.25" y="8" width="5.5" height="14" rx="1.5" fill="var(--accent)" />
      <rect x="16.5" y="2" width="5.5" height="20" rx="1.5" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ className, markSize = 22 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <Mark size={markSize} />
      <span className="text-[17px] font-medium tracking-[-0.02em] leading-none">
        careeragent<span className="text-muted-foreground">.fyi</span>
      </span>
    </span>
  );
}
