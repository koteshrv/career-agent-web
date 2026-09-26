import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Building2, Loader2, Search, X } from 'lucide-react';
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

  // Handle both string[] and { company: string, job_count?: number }[] shapes
  const normalizedCompanies = useMemo(() => {
    const raw = data?.companies || [];
    return raw.map((item) => {
      if (typeof item === 'string') {
        return { company: item, job_count: undefined };
      }
      return {
        company: item.company || item.name || '',
        job_count: item.job_count,
      };
    }).filter((c) => Boolean(c.company));
  }, [data]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return normalizedCompanies;
    const term = search.toLowerCase();
    return normalizedCompanies.filter((c) => c.company.toLowerCase().includes(term));
  }, [normalizedCompanies, search]);

  return (
    <main className="w-full">
      {/* Companies Hero Section - matches Home hero styling & container */}
      <section className="pt-10 sm:pt-14 pb-8 px-4 sm:px-6 border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Companies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-6">
            Explore companies with active openings and direct ATS integrations.
          </p>

          {/* Quick Filter Search Bar */}
          <div className="max-w-2xl mx-auto relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search className="h-4 w-4 text-muted-foreground ml-3.5 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Filter companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-hidden pr-2"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 mr-1 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
                title="Clear filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Companies Grid Container - matches Home container alignment */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading companies...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 px-4 border border-destructive/20 bg-destructive/5 rounded-2xl">
            <h3 className="text-base font-semibold text-destructive mb-1">Failed to load companies</h3>
            <p className="text-xs text-destructive/80">The service may be temporarily unavailable.</p>
          </div>
        )}

        {!isLoading && !error && filteredCompanies.length === 0 && (
          <div className="text-center py-20 px-4 border-2 border-dashed border-border rounded-2xl bg-card">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
              <Building2 className="h-6 w-6 text-muted-foreground" />
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
              className="group outline-hidden"
            >
              <Card className="p-4 rounded-xl border border-border bg-card hover:border-foreground/30 hover:shadow-xs transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 min-w-[40px] rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                    <CompanyLogo 
                      name={companyData.company} 
                      className="w-6 h-6 min-w-[24px] rounded-xs shrink-0" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {companyData.company}
                    </h3>
                    {companyData.job_count !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {companyData.job_count} {companyData.job_count === 1 ? 'role' : 'roles'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
