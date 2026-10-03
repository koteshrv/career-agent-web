import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './icon-button';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Hide the close button, for flows that must finish (defaults to showing it). */
  dismissible?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Accessible modal: role=dialog, labelled, focus trapped, Escape and scrim close, focus restored. */
export function Dialog({ open, onClose, title, description, size = 'md', dismissible = true, children, footer }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-card border border-border-strong rounded-t-sm sm:rounded-sm shadow-md max-h-[92dvh] flex flex-col focus:outline-none',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-2xl'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold leading-snug text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {dismissible && <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2 -mt-1 shrink-0">
            <X />
          </IconButton>}
        </div>
        <div className="px-5 pb-4 overflow-y-auto empty:hidden">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-border flex flex-wrap items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
