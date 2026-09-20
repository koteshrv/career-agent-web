import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { Building2, Loader2 } from 'lucide-react';
import { fetcher } from '../lib/api';
import type { CompaniesResponse } from '../lib/api';
import { Card } from '../components/ui/card';
import { CompanyLogo } from '../components/CompanyLogo';

export function Companies() {
  const { data, isLoading, error } = useSWR<CompaniesResponse>(
    '/v1/companies',
    fetcher
  );

  const companies = data?.companies || [];

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">Companies</h1>
        <p className="text-muted-foreground">Browse companies currently hiring.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 border border-destructive/20 bg-destructive/5 rounded-2xl">
          <h3 className="text-lg font-medium text-destructive mb-1">Failed to load companies</h3>
          <p className="text-destructive/80">The backend API might be down or the endpoint does not exist.</p>
        </div>
      )}

      {!isLoading && !error && companies.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No companies found</h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {companies.map((companyData) => (
          <Link
            key={companyData.company}
            to={`/?company=${encodeURIComponent(companyData.company)}`}
            className="group outline-none"
          >
            <Card className="p-5 hover:shadow-md hover:border-primary/50 transition-all flex items-center justify-between group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <div className="flex items-center gap-3">
                <CompanyLogo 
                  name={companyData.company} 
                  className="w-12 h-12 min-w-[48px] rounded-lg shadow-sm border border-border shrink-0" 
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{companyData.company}</h3>
                  <p className="text-sm text-muted-foreground">
                    {companyData.job_count} {companyData.job_count === 1 ? 'job' : 'jobs'}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
