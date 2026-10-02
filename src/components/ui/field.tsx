import * as React from 'react';
import { cn } from '../../lib/utils';

const controlClass =
  'w-full rounded-xs border border-line-strong bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 disabled:opacity-50 aria-invalid:border-destructive';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlClass, 'h-10', className)} {...props} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlClass, 'py-2 leading-relaxed resize-y min-h-20', className)} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(controlClass, 'h-10 pr-8 cursor-pointer', className)} {...props} />
);
Select.displayName = 'Select';

interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
}

/** Wires label, hint and error to one form control so every input has an accessible name. */
export function Field({ label, hint, error, hideLabel, className, children }: FieldProps) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = React.cloneElement(children, {
    id,
    'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': error ? true : undefined,
  });
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-foreground', hideLabel && 'sr-only')}>
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
