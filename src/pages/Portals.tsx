import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, Building2 } from 'lucide-react';
import { MONITORED_PORTALS } from '../data/monitoredPortals';
import { CompanyLogo } from '../components/CompanyLogo';
import { Input } from '../components/ui/field';
import { SegmentedControl } from '../components/ui/segmented';
import { EmptyState } from '../components/ui/empty-state';
import { Page, PageHeader } from '../components/ui/page';

const DOMAINS = ['All', 'AI / ML', 'Dev Tools & Infra', 'Fintech & Payments', 'Enterprise SaaS', 'Big Tech & Consumer'] as const;
type Domain = (typeof DOMAINS)[number];

export function Portals() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<Domain>('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MONITORED_PORTALS.filter((p) => {
      const matches = !q || p.company.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matches && (domain === 'All' || p.domain === domain);
    });
  }, [query, domain]);

  return (
    <Page width="wide">
      <PageHeader title="Companies we index" description="Career sites we read directly, so every posting in Jobs comes from the employer's own applicant system." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Search companies" placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <SegmentedControl ariaLabel="Sector" value={domain} onChange={setDomain} size="sm" options={DOMAINS.map((d) => ({ value: d, label: d }))} className="sm:ml-auto" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 />} title="No companies match" body="Try a different name or sector." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.company} className="flex flex-col rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <CompanyLogo name={p.company} className="size-10 shrink-0 rounded-md border border-border" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-foreground">{p.company}</h2>
                  <p className="text-sm text-muted-foreground">
                    {p.domain} · via {p.provider}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <Link to={`/?q=${encodeURIComponent(p.company)}`} className="font-medium text-primary-text underline-offset-2 hover:underline">
                  Open roles
                </Link>
                <a href={p.careersUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  Careers site
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
