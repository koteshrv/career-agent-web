import { cn } from '../lib/utils';

/** The mark: an open C with the agent at its centre, cut from an ink tile. Reads at 16px, needs no colour. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="24" height="24" rx="6.5" fill="var(--ink)" />
      <path d="M15.6 7.4A6 6 0 1 0 15.6 16.6" fill="none" stroke="var(--canvas)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="var(--canvas)" />
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
