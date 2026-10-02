import * as React from 'react';
import { cn } from '../../lib/utils';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'good' | 'warn';
  size?: 'sm' | 'md';
}

/** Small inline fact as a soft pill. Text wears ink; only the ground changes. */
export function Chip({ tone = 'neutral', size = 'md', className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full whitespace-nowrap font-medium text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0',
        size === 'sm' ? 'h-6 px-2.5 text-xs' : 'h-7 px-3 text-sm',
        tone === 'neutral' && 'bg-muted',
        tone === 'accent' && 'bg-tint-blue',
        tone === 'good' && 'bg-tint-green',
        tone === 'warn' && 'bg-tint-yellow',
        className
      )}
      {...props}
    />
  );
}
