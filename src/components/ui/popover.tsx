import * as React from 'react';
import { cn } from '../../lib/utils';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** The element that opened the popover; focus returns to it on close. */
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
}

/** Floating panel anchored below its trigger. Closes on outside click and Escape, returns focus. */
export function Popover({ open, onClose, anchorRef, align = 'end', className, children }: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        anchorRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full mt-2 z-40 bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}
