import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useSWRInfinite from 'swr/infinite';
import { Search, Building2, ArrowRight, MessageCircle, CircleDot } from 'lucide-react';
import { CompanyLogo } from '../components/CompanyLogo';
import { Input } from '../components/ui/field';
import { Button } from '../components/ui/button';
import { SegmentedControl } from '../components/ui/segmented';
import { EmptyState } from '../components/ui/empty-state';
import { Page, PageHeader } from '../components/ui/page';
import { fetcher } from '../lib/api';
import type { CompaniesResponse, CompanySummary } from '../lib/api';

const PAGE = 50;
const DISCORD_URL = import.meta.env.VITE_DISCORD_URL || '';
const ISSUES_URL = 'https://github.com/koteshrv/career-agent-web/issues/new?title=Add%20employer%3A%20';
type Sort = 'roles' | 'name';

/** The employers in the index, from /v1/companies: live open-role counts, search, sort, and a straight path to their postings. */
export function Portals() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('roles');
  const q = query.trim();
  const { data, size, setSize, error, isLoading } = useSWRInfinite<CompaniesResponse>(
    (index, prev) => (prev && !prev.has_more ? null : `/v1/companies?limit=${PAGE}&offset=${index * PAGE}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  const loaded = useMemo(() => data?.flatMap((p) => p.companies) ?? [], [data]);
  const companies = useMemo<CompanySummary[]>(
    () => (sort === 'name' ? [...loaded].sort((a, b) => a.name.localeCompare(b.name)) : [...loaded].sort((a, b) => b.job_count - a.job_count)),
    [loaded, sort]
  );
  const totals = data?.[0]?.totals;
  const hasMore = data ? data[data.length - 1]?.has_more : false;
  const loadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  return (
    <Page width="wide">
      <PageHeader
        title="Companies we index"
        description="Every posting in Jobs is read from one of these employers' own applicant systems. Nothing is scraped from job boards."
      />

      {totals && (
        <dl className="mb-6 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-md border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Employers</dt>
            <dd className="text-2xl font-medium tabular-nums text-foreground">{totals.companies.toLocaleString()}</dd>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">Open roles</dt>
            <dd className="text-2xl font-medium tabular-nums text-foreground">{totals.active_jobs.toLocaleString()}</dd>
          </div>
        </dl>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Search companies" placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <SegmentedControl
          ariaLabel="Sort"
          size="sm"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'roles', label: 'Most roles' },
            { value: 'name', label: 'A to Z' },
          ]}
        />
      </div>

      {error ? (
        <EmptyState icon={<Building2 />} title="The company list is not reachable" body={error.message || 'Try again in a moment.'} />
      ) : !isLoading && companies.length === 0 ? (
        <EmptyState icon={<Building2 />} title={q ? `No company matches “${q}”` : 'No companies yet'} body={q ? 'Try a shorter name.' : 'The index is being built.'} />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((c) => (
              <li key={c.name}>
                <Link
                  to={`/jobs?company=${encodeURIComponent(c.name)}`}
                  className="group flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-border-strong hover:bg-muted/40"
                  aria-label={`${c.name}: ${c.job_count.toLocaleString()} open roles`}
                >
                  <CompanyLogo name={c.name} size={40} className="shrink-0 rounded-xs" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-medium text-foreground">{c.name}</h2>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {c.job_count.toLocaleString()} open {c.job_count === 1 ? 'role' : 'roles'}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <li key={`s${i}`} className="flex items-center gap-3 rounded-md border border-border bg-card p-4" aria-hidden="true">
                  <div className="size-10 animate-pulse rounded-xs bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded-sm bg-muted" />
                  </div>
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
          <section aria-labelledby="how-built" className="mt-10 grid gap-6 border-t border-border pt-8 lg:grid-cols-[3fr_2fr]">
            <div>
              <h2 id="how-built" className="text-lg font-medium text-foreground">How this index is built</h2>
              <p className="mt-1 text-sm text-muted-foreground">Every hour, for every employer above:</p>
              <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                {[
                  ['List every open role', 'straight from the employer\u2019s own applicant system (Greenhouse, Lever, Ashby, Workday and more), never from job boards. The largest boards are read every four hours.'],
                  ['Fetch every description', 'in full, from each role\u2019s own page, not the snippet a listing shows.'],
                  ['Read each one with AI', 'cleaning the text and extracting seniority, years of experience, stack, skills, salary, workplace and visa details: the fields you filter, scan and evaluate on. Each posting is fingerprinted, so the same role seen twice is stored once.'],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-3">
                    <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-xs tabular-nums text-foreground">{i + 1}</span>
                    <span><span className="text-foreground">{title}</span> {body}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="text-foreground">Kept current.</span> A role missing from its board for a day, across at least two runs, is closed, and three separate
                reports hide a posting until someone checks it. All of it is free and needs no account: the crawling, the AI reading and the API are paid for by the project, not by your data.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="text-base font-medium text-foreground">Missing an employer?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us which company and where its jobs are listed. We add boards once their postings verify.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DISCORD_URL && (
                  <Button asChild variant="primary" size="sm">
                    <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                      <MessageCircle />
                      Ask in Discord
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant={DISCORD_URL ? 'secondary' : 'primary'}>
                  <a href={ISSUES_URL} target="_blank" rel="noreferrer">
                    <CircleDot />
                    Open an issue
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
