import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  ariaLabel: string;
  className?: string;
  size?: 'sm' | 'md';
}

/** Single-choice control that reads as one piece. Arrow keys move the selection. */
export function SegmentedControl<T extends string>({ value, onChange, options, ariaLabel, className, size = 'md' }: SegmentedControlProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(options[(idx + 1) % options.length].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(options[(idx - 1 + options.length) % options.length].value);
    }
  };
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('inline-flex items-center gap-1 rounded-full bg-muted p-1 max-w-full overflow-x-auto no-scrollbar', className)}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors cursor-pointer',
              size === 'sm' ? 'h-7 px-3 text-sm' : 'h-8 px-4 text-sm',
              selected ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('tabular-nums text-xs', selected ? 'text-muted-foreground' : 'text-muted-foreground/80')}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
