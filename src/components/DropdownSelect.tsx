import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

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
  ariaLabel?: string;
  searchable?: boolean;
}

export function DropdownSelect({
  icon,
  value,
  onChange,
  options,
  placeholder = 'Select',
  ariaLabel,
  searchable = false,
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : options;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button - Rounded matching the buttons */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayLabel}
        className={`h-8 px-3 rounded-lg border border-border/80 bg-card hover:bg-muted/60 hover:border-border text-foreground text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer select-none focus:outline-hidden focus:ring-1 focus:ring-primary/40 ${
          isOpen ? 'border-primary/50 ring-1 ring-primary/30' : ''
        }`}
      >
        {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{displayLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-foreground' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - Rounded matching the buttons/cards */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[170px] max-w-xs max-h-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg p-1 z-50 flex flex-col animate-in fade-in-50 zoom-in-95">
          {/* Optional Search Filter */}
          {searchable && options.length > 5 && (
            <div className="p-1 border-b border-border/60 mb-1">
              <div className="flex items-center bg-muted/50 rounded-lg px-2 py-1">
                <Search className="h-3 w-3 text-muted-foreground mr-1.5 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-52 space-y-0.5 overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="truncate mr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
