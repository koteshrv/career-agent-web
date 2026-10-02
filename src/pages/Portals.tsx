import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import { Search, Building2 } from 'lucide-react';
import { CompanyLogo } from '../components/CompanyLogo';
import { Input } from '../components/ui/field';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { Page, PageHeader } from '../components/ui/page';
import { fetcher } from '../lib/api';
import type { CompaniesResponse } from '../lib/api';

const PAGE = 50;

/** The employers in the index, straight from /v1/companies, with live open-role counts. */
export function Portals() {
  const [query, setQuery] = useState('');
  const q = query.trim();
  const { data, size, setSize, error, isLoading } = useSWRInfinite<CompaniesResponse>(
    (index, prev) => (prev && !prev.has_more ? null : `/v1/companies?limit=${PAGE}&offset=${index * PAGE}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  const companies = data?.flatMap((p) => p.companies) ?? [];
  const totals = data?.[0]?.totals;
  const hasMore = data ? data[data.length - 1]?.has_more : false;
  const loadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  return (
    <Page width="wide">
      <PageHeader
        title="Companies we index"
        description={totals ? `${totals.companies} employers, ${totals.active_jobs.toLocaleString()} open roles, read directly from their own applicant systems.` : 'Career sites we read directly, so every posting in Jobs comes from the employer’s own applicant system.'}
      />

      <div className="relative mb-5 sm:w-80">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input type="search" aria-label="Search companies" placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
      </div>

      {error ? (
        <EmptyState icon={<Building2 />} title="The company list is not reachable" body={error.message || 'Try again in a moment.'} />
      ) : !isLoading && companies.length === 0 ? (
        <EmptyState icon={<Building2 />} title="No companies match" body="Try a different name." />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((c) => (
              <li key={c.name} className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
                <CompanyLogo name={c.name} size={40} className="shrink-0 rounded-xs" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-medium text-foreground">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {c.job_count.toLocaleString()} open {c.job_count === 1 ? 'role' : 'roles'}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to={`/jobs?q=${encodeURIComponent(c.name)}`}>Open roles</Link>
                </Button>
              </li>
            ))}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <li key={`s${i}`} className="flex items-center gap-3 rounded-md border border-border bg-card p-4" aria-hidden="true">
                  <div className="size-10 animate-pulse rounded-xs bg-muted" />
                  <div className="flex-1"><div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" /><div className="mt-2 h-3 w-1/3 animate-pulse rounded-sm bg-muted" /></div>
                </li>
              ))}
          </ul>
          {hasMore && (
            <div className="mt-5 flex justify-center">
              <Button onClick={() => setSize(size + 1)} disabled={Boolean(loadingMore)}>
                {loadingMore ? 'Loading' : 'Show more'}
              </Button>
            </div>
          )}
        </>
      )}
    </Page>
  );
}
