import { cn } from '../lib/utils';

/**
 * The mark: an index of rows with the agent's cursor on the active one.
 * Tile and bars follow the ink/canvas tokens so it holds up in both themes; the cursor is the accent.
 */
export function Mark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect width="24" height="24" rx="6" fill="var(--ink)" />
      <rect x="6" y="6.5" width="12" height="2.6" rx="1.3" fill="var(--canvas)" />
      <rect x="6" y="10.7" width="7" height="2.6" rx="1.3" fill="var(--canvas)" />
      <rect x="14.6" y="10.2" width="3.6" height="3.6" rx="1" fill="var(--accent)" />
      <rect x="6" y="14.9" width="12" height="2.6" rx="1.3" fill="var(--canvas)" />
    </svg>
  );
}

export function Logo({ className, markSize = 24 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-foreground', className)}>
      <Mark size={markSize} />
      <span className="text-[17px] font-semibold tracking-[-0.02em] leading-none">CareerAgent</span>
    </span>
  );
}
