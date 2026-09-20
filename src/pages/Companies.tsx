import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Building2, Loader2, Search } from 'lucide-react';
import { fetcher } from '../lib/api';
import type { CompaniesResponse } from '../lib/api';
import { Card } from '../components/ui/card';
import { CompanyLogo } from '../components/CompanyLogo';

export function Companies() {
  const { data, isLoading, error } = useSWR<CompaniesResponse>(
    '/v1/companies',
    fetcher
  );

  const [search, setSearch] = useState('');
  const companies = data?.companies || [];

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const term = search.toLowerCase();
    return companies.filter(c => c.company.toLowerCase().includes(term));
  }, [companies, search]);

  return (
    <main className="w-full">
      {/* Tsenta-style Header */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 border-b border-border/80 bg-background/50">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="ts-display text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight mb-3">
            Companies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed font-normal">
            Explore companies with active openings and direct ATS integrations.
          </p>

          {/* Quick Filter */}
          <div className="max-w-md mx-auto relative flex items-center bg-card border border-border/90 rounded-full px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus-within:border-foreground/30 transition-all">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="search"
              placeholder="Filter companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none font-normal"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Loading companies...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-4 border border-destructive/20 bg-destructive/5 rounded-2xl">
            <h3 className="text-sm font-semibold text-destructive mb-1">Failed to load companies</h3>
            <p className="text-xs text-destructive/80">The service may be temporarily unavailable.</p>
          </div>
        )}

        {!isLoading && !error && filteredCompanies.length === 0 && (
          <div className="text-center py-20 px-4 border border-dashed border-border rounded-2xl bg-card">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No companies found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filter keyword.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredCompanies.map((companyData) => (
            <Link
              key={companyData.company}
              to={`/?company=${encodeURIComponent(companyData.company)}`}
              className="group outline-none"
            >
              <Card className="p-4 rounded-2xl border border-border/90 bg-card hover:border-foreground/25 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 min-w-[40px] rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <CompanyLogo 
                      name={companyData.company} 
                      className="w-6 h-6 min-w-[24px] rounded shrink-0" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-foreground">
                      {companyData.company}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {companyData.job_count} {companyData.job_count === 1 ? 'role' : 'roles'}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                  →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
