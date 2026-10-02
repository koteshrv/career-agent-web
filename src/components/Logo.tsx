import { cn } from '../lib/utils';

/** The mark: two chevrons climbing, cut from an ink tile. Monochrome, so it holds on every palette and at 16px. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="24" height="24" rx="6.5" fill="var(--ink)" />
      <path d="M7.5 12.5 12 8l4.5 4.5M7.5 17.5 12 13l4.5 4.5" fill="none" stroke="var(--canvas)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
