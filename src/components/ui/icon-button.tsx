import * as React from 'react';
import { cn } from '../../lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Required: an icon alone is not a name. */
  label: string;
  size?: 'sm' | 'md';
  tone?: 'default' | 'danger';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', tone = 'default', className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none [&_svg]:shrink-0',
        size === 'sm' ? 'h-8 w-8 [&_svg]:size-4' : 'h-9 w-9 [&_svg]:size-4',
        tone === 'danger' ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-muted hover:text-foreground',
        className
      )}
      {...props}
    />
  )
);
IconButton.displayName = 'IconButton';
