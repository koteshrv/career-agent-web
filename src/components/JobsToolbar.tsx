import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { Search, X, Globe, Building2, Calendar, RotateCcw } from 'lucide-react';
import { DropdownSelect } from './DropdownSelect';
import { fetcher, type CountriesResponse } from '../lib/api';
import { cn } from '../lib/utils';

const WORKPLACE = [
  { value: '', label: 'Any workplace' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];
const DATES = [
  { value: '', label: 'Any time' },
  { value: '24h', label: 'Past 24 hours' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
];

interface JobsToolbarProps {
  resultSummary: React.ReactNode;
  /** Rendered beside the summary, e.g. a batch action. */
  action?: React.ReactNode;
  /** Rendered under the filters, e.g. which search defaults are in play. */
  note?: React.ReactNode;
  /** For you: the list is already a search, so no free-text box and no companies link. */
  compact?: boolean;
}

/** Search with keyword chips plus three filters, owned by the Jobs page. */
export function JobsToolbar({ resultSummary, action, note, compact }: JobsToolbarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const countryParam = searchParams.get('country') || '';
  const workplaceParam = searchParams.get('workplace_type') || '';
  const dateParam = searchParams.get('date') || '';
  const companyParam = searchParams.get('company') || '';
  const keywords = useMemo(() => queryParam.split(',').map((k) => k.trim()).filter(Boolean), [queryParam]);

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setInput(''), [queryParam]);

  const update = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    next.delete('job');
    setSearchParams(next);
  };
  const applyKeywords = (next: string[]) => update({ q: next.join(', ') || null });
  const commit = () => {
    const t = input.trim();
    if (t && !keywords.includes(t)) applyKeywords([...keywords, t]);
    setInput('');
  };

  const { data: countriesData } = useSWR<CountriesResponse>('/v1/countries', fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const countryOptions = useMemo(() => [{ value: '', label: 'Any country' }, ...(countriesData?.countries || []).map((c) => ({ value: c.code, label: c.name }))], [countriesData]);

  const activeCount = [countryParam, workplaceParam, dateParam, companyParam].filter(Boolean).length + keywords.length;

  return (
    <div className="shrink-0 space-y-3">
      {!compact && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-md border border-border-strong bg-card px-3.5 cursor-text transition-colors',
          'focus-within:border-foreground focus-within:ring-2 focus-within:ring-foreground/10'
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-1 flex-wrap items-center gap-1.5 py-1.5 min-w-0">
          {companyParam && (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-tint-blue pl-3 pr-1.5 text-sm font-medium text-foreground" title="Only postings from this employer">
              <Building2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="max-w-[180px] truncate">{companyParam}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  update({ company: null });
                }}
                aria-label={`Stop filtering by ${companyParam}`}
                className="rounded-full p-0.5 hover:bg-foreground/10 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </span>
          )}
          {keywords.map((kw, idx) => (
            <span key={`${kw}-${idx}`} className="inline-flex h-7 items-center gap-1 rounded-full bg-muted pl-3 pr-1.5 text-sm font-medium text-foreground">
              <span className="max-w-[160px] truncate">{kw}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  applyKeywords(keywords.filter((_, i) => i !== idx));
                  inputRef.current?.focus();
                }}
                aria-label={`Remove ${kw}`}
                className="rounded-full p-0.5 hover:bg-foreground/10 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            aria-label="Search jobs by title, company or skill. Press Enter to add a keyword."
            placeholder={keywords.length ? 'Add another keyword' : 'Search title, company or skill'}
            value={input}
            onChange={(e) => {
              const v = e.target.value;
              if (v.includes(',')) {
                const parts = v.split(',');
                const terms = parts.slice(0, -1).map((t) => t.trim()).filter((t) => t && !keywords.includes(t));
                if (terms.length) applyKeywords([...keywords, ...terms]);
                setInput(parts[parts.length - 1]);
              } else setInput(v);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !input && keywords.length) applyKeywords(keywords.slice(0, -1));
            }}
            className="min-w-[140px] flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/80 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        {(keywords.length > 0 || input) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInput('');
              update({ q: null });
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </form>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownSelect icon={<Globe />} value={countryParam} onChange={(v) => update({ country: v || null })} options={countryOptions} placeholder="Any country" ariaLabel="Country" searchable />
          <DropdownSelect icon={<Building2 />} value={workplaceParam} onChange={(v) => update({ workplace_type: v || null })} options={WORKPLACE} placeholder="Any workplace" ariaLabel="Workplace" />
          <DropdownSelect icon={<Calendar />} value={dateParam} onChange={(v) => update({ date: v || null })} options={DATES} placeholder="Any time" ariaLabel="Date posted" />
          {activeCount > 0 && (
            <button type="button" onClick={() => setSearchParams(new URLSearchParams())} className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xs px-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <span aria-live="polite">{resultSummary}</span>
          {action}
          {!compact && (
            <Link to="/portals" className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
              <span className="sm:hidden">Companies</span>
              <span className="hidden sm:inline">Companies we index</span>
            </Link>
          )}
        </div>
      </div>
      {note}
    </div>
  );
}
