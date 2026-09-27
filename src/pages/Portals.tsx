import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight
} from 'lucide-react';
import { MONITORED_PORTALS } from '../data/monitoredPortals';
import { CompanyLogo } from '../components/CompanyLogo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const DOMAIN_OPTIONS = [
  'All',
  'AI / ML',
  'Dev Tools & Infra',
  'Fintech & Payments',
  'Enterprise SaaS',
  'Big Tech & Consumer',
];

export function Portals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const filteredPortals = useMemo(() => {
    return MONITORED_PORTALS.filter((portal) => {
      const matchesSearch =
        portal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portal.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portal.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portal.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain =
        selectedDomain === 'All' || portal.domain === selectedDomain;

      return matchesSearch && matchesDomain;
    });
  }, [searchQuery, selectedDomain]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background px-4 sm:px-6 py-6 pb-24">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
                Direct ATS Index
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Zero Recruiter Spam
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Monitored Company Portals
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live careers portals scanned directly for open engineering, product, and tech roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs gap-1.5 cursor-pointer">
                <Briefcase className="h-3.5 w-3.5" />
                Browse 50,000+ Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, domains, or ATS providers..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-card border border-border text-foreground text-xs placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-primary focus:border-primary shadow-2xs"
            />
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
            {DOMAIN_OPTIONS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                  selectedDomain === domain
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => (
            <div
              key={portal.company}
              className="p-4 rounded-xl bg-card border border-border shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CompanyLogo
                      name={portal.company}
                      className="w-10 h-10 rounded-lg shrink-0 border border-border"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {portal.company}
                      </h3>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {portal.domain}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold uppercase px-1.5 py-0 border-border/80 text-muted-foreground shrink-0 capitalize"
                  >
                    via {portal.provider}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <Link
                  to={`/?q=${encodeURIComponent(portal.company)}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <span>View Open Roles</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <a
                  href={portal.careersUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground p-1 rounded inline-flex items-center gap-1 text-[11px]"
                  title="Open direct company careers portal"
                >
                  <span>ATS Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredPortals.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No matching company portals found</p>
            <p className="text-xs text-muted-foreground">Try clearing your search query or selecting "All" domains.</p>
          </div>
        )}
      </div>
    </div>
  );
}
