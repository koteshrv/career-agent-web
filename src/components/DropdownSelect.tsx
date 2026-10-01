import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  ariaLabel: string;
  searchable?: boolean;
  fullWidth?: boolean;
  /** Prefix shown before the value, e.g. "Country". */
  prefix?: string;
}

export function DropdownSelect({ icon, value, onChange, options, placeholder = 'Any', ariaLabel, searchable = false, fullWidth = false, prefix }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    if (searchable) setTimeout(() => searchInputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);
  const isSet = Boolean(selectedOption && selectedOption.value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const filtered = searchable && searchQuery.trim() ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase().trim())) : options;

  return (
    <div className={cn('relative text-left', fullWidth ? 'w-full' : 'inline-block')} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        className={cn(
          'h-9 rounded-sm border px-3 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none',
          isSet ? 'border-primary/50 bg-primary-soft text-primary-text' : 'border-border-strong bg-card text-foreground hover:bg-muted',
          fullWidth && 'w-full justify-between'
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {icon && <span className={cn('shrink-0 [&_svg]:size-3.5', isSet ? 'text-primary-text' : 'text-muted-foreground')}>{icon}</span>}
          {prefix && !isSet && <span className="text-muted-foreground">{prefix}</span>}
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown className={cn('size-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className={cn('absolute top-full left-0 mt-1.5 z-40 flex flex-col overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg', fullWidth ? 'w-full' : 'min-w-[200px] max-w-xs')}>
          {searchable && options.length > 5 && (
            <div className="mb-1 flex items-center gap-1.5 rounded-sm bg-muted px-2">
              <Search className="size-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Filter"
                aria-label={`Filter ${ariaLabel}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <ul id={listId} role="listbox" aria-label={ariaLabel} className="max-h-60 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
            ) : (
              filtered.map((opt) => {
                const selected = opt.value === value;
                return (
                  <li key={opt.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-sm cursor-pointer',
                        selected ? 'bg-primary-soft text-primary-text font-medium' : 'text-foreground hover:bg-muted'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {selected && <Check className="size-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
