import { cn } from '../lib/utils';

/** The mark: a line from where you are to a higher point. Two dots and a stroke, nothing else. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d="M5.5 18.5 16 8" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="5.5" cy="18.5" r="2.4" fill="var(--ink)" />
      <circle cx="17.5" cy="6.5" r="4" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ className, markSize = 24 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <Mark size={markSize} />
      <span className="text-[17px] font-medium tracking-[-0.02em] leading-none">
        careeragent<span className="text-muted-foreground">.fyi</span>
      </span>
    </span>
  );
}
