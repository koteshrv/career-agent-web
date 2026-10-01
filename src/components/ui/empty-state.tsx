import * as React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** Compact variant for inside panels and columns. */
  compact?: boolean;
}

/** An empty screen is an invitation to act: one title, one sentence, one action. */
export function EmptyState({ title, body, action, icon, className, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'py-8 px-4' : 'py-16 px-6', className)}>
      {icon && <div className="mb-3 text-muted-foreground [&_svg]:size-6">{icon}</div>}
      <h3 className={cn('font-semibold text-foreground', compact ? 'text-base' : 'text-lg')}>{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  );
}
