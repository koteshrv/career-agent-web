import * as React from 'react';
import { cn } from '../../lib/utils';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'good' | 'warn';
  size?: 'sm' | 'md';
}

/** Small inline fact. Text wears ink; only the tone of the ground changes. */
export function Chip({ tone = 'neutral', size = 'md', className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm whitespace-nowrap font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
        size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-6 px-2 text-sm',
        tone === 'neutral' && 'bg-muted text-muted-foreground',
        tone === 'accent' && 'bg-primary-soft text-primary-text',
        tone === 'good' && 'bg-success-soft text-success',
        tone === 'warn' && 'bg-warning-soft text-warning',
        className
      )}
      {...props}
    />
  );
}
