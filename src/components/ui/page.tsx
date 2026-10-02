import * as React from 'react';
import { cn } from '../../lib/utils';

interface PageProps {
  /** narrow: forms and settings (760px). wide: the two workspaces (1280px). */
  width?: 'narrow' | 'wide';
  className?: string;
  children: React.ReactNode;
}

/** Scrollable page body with one of two content measures. */
export function Page({ width = 'narrow', className, children }: PageProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className={cn('mx-auto w-full px-4 sm:px-8 py-8 pb-24 md:pb-12', width === 'narrow' ? 'max-w-[800px]' : 'max-w-[1360px]', className)}>
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Secondary navigation rendered under the title (tabs). */
  tabs?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, tabs, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-base text-muted-foreground max-w-prose">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {tabs && <div className="mt-4">{tabs}</div>}
    </header>
  );
}

/** A titled group of fields or content. Space and a title, not a box, unless `panel`. */
export function Section({ title, description, children, panel, actions, id }: { title: string; description?: React.ReactNode; children: React.ReactNode; panel?: boolean; actions?: React.ReactNode; id?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn('mb-10', panel && 'rounded-md border border-border bg-card p-6')}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id={id ? `${id}-title` : undefined} className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground max-w-prose">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
