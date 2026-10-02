import { cn } from '../lib/utils';

/** The mark: three steps with a flag planted on the top one. Steps in the accent, flag in a warm note. */
export function Mark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d="M2 19h6v-5h6v-5h6v13H2z" fill="var(--accent)" />
      <path d="M17 9V2.5" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.8 2.5h5.2l-1.6 2 1.6 2h-5.2z" fill="#f5a524" />
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
