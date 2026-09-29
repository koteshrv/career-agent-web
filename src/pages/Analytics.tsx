import { useMemo } from 'react';
import { Target, Building2 } from 'lucide-react';
import { getStoredApplications } from '../lib/profileStorage';

export function Analytics() {
  const applications = useMemo(() => getStoredApplications(), []);

  const stats = useMemo(() => {
    const total = applications.length;
    const saved = applications.filter((a) => a.status === 'SAVED').length;
    const applied = applications.filter((a) => a.status === 'APPLIED').length;
    const interviewing = applications.filter((a) => a.status === 'INTERVIEWING').length;
    const offered = applications.filter((a) => a.status === 'OFFER').length;
    const archived = applications.filter((a) => a.status === 'ARCHIVED').length;

    const responseRate = applied + interviewing + offered > 0
      ? Math.round(((interviewing + offered) / (applied + interviewing + offered)) * 100)
      : 0;

    // Company breakdown
    const companyCounts: Record<string, number> = {};
    applications.forEach((a) => {
      const comp = a.company || 'Other';
      companyCounts[comp] = (companyCounts[comp] || 0) + 1;
    });

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      saved,
      applied,
      interviewing,
      offered,
      archived,
      responseRate,
      topCompanies,
    };
  }, [applications]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Tracked</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium mb-1">Response Rate</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.responseRate}%
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium mb-1">Interviewing</p>
          <p className="text-2xl sm:text-3xl font-bold text-status-interviewing">{stats.interviewing}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium mb-1">Offers Received</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.offered}</p>
        </div>
      </div>

      {/* Funnel Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span>Application Pipeline Funnel</span>
        </h3>

        <div className="space-y-3 pt-2">
          {/* Saved */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-muted-foreground">1. Saved Roles</span>
              <span className="font-semibold text-foreground">{stats.saved}</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.saved / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Applied */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-muted-foreground">2. Submitted Applications</span>
              <span className="font-semibold text-foreground">{stats.applied}</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Interviewing */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-muted-foreground">3. Active Interviews</span>
              <span className="font-semibold text-foreground">{stats.interviewing}</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.interviewing / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Offered */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-muted-foreground">4. Job Offers</span>
              <span className="font-semibold text-foreground">{stats.offered}</span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all" 
                style={{ width: `${stats.total > 0 ? (stats.offered / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span>Top Companies in Pipeline</span>
        </h3>

        {stats.topCompanies.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No applications tracked yet. Move jobs into your pipeline to see analytics.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {stats.topCompanies.map(([comp, count]) => (
              <div key={comp} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{comp}</span>
                <span className="text-muted-foreground font-mono">{count} role{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
