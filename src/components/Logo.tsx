import { cn } from '../lib/utils';

/** The mark: a staircase climbing to a point, the next step up. Accent only, so it sits on any surface. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d="M2.5 20.5h6v-6h6v-6h6" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20.5" cy="4" r="2.5" fill="var(--accent)" />
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
