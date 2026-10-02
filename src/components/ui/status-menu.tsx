import { useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Popover } from './popover';
import { StatusDot } from './status-badge';
import { STATUS_ORDER, STATUS_CONFIG, type ApplicationStatus } from '../../types/tracker';
import { cn } from '../../lib/utils';

interface StatusMenuProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  /** Accessible name, e.g. "Stage of Senior Engineer at Datadog". */
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Themed replacement for a native select: the OS popup ignored dark mode. */
export function StatusMenu({ value, onChange, label, size = 'sm', className }: StatusMenuProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={anchor}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium text-foreground hover:opacity-80 cursor-pointer',
          STATUS_CONFIG[value].pill,
          size === 'sm' ? 'h-6 pl-2 pr-1.5 text-xs' : 'h-9 px-3 text-base'
        )}
      >
        <StatusDot status={value} />
        {STATUS_CONFIG[value].label}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchor} align="start" className="min-w-[160px] p-1">
        <ul role="menu" aria-label={label}>
          {STATUS_ORDER.map((s) => (
            <li key={s} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={s === value}
                onClick={() => {
                  setOpen(false);
                  if (s !== value) onChange(s);
                  anchor.current?.focus();
                }}
                className={cn('flex w-full items-center gap-2 rounded-xs px-3 py-2 text-left text-sm cursor-pointer', s === value ? 'bg-muted font-medium text-foreground' : 'text-foreground hover:bg-muted')}
              >
                <StatusDot status={s} />
                <span className="flex-1">{STATUS_CONFIG[s].label}</span>
                {s === value && <Check className="size-3.5 text-muted-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}
