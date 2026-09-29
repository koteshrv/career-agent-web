import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { 
  ArrowRight, 
  RotateCw, 
  Sparkles, 
  Zap, 
  CalendarClock
} from 'lucide-react';
import { fetcher, type JobsResponse } from '../lib/api';
import { getStoredApplications } from '../lib/profileStorage';

export function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Fetch live jobs pool
  const { data: jobsData, mutate } = useSWR<JobsResponse>('/v1/jobs?limit=25', fetcher, {
    revalidateOnFocus: false,
  });

  const jobs = useMemo(() => jobsData?.jobs || [], [jobsData]);
  const applications = getStoredApplications();

  const appliedJobs = applications.filter((a) => a.status === 'APPLIED');
  const interviewingJobs = applications.filter((a) => a.status === 'INTERVIEWING');

  const topMatches = jobs.slice(0, 5);
  const recentJobs = jobs.slice(5, 10);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await mutate();
      setSyncMessage('Job pool updated successfully!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage('Failed to sync jobs.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Today';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Status Strip — matching career-agent screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* New matches */}
        <Link
          to="/explore"
          className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-status-new/50 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
            <span className="w-2 h-2 rounded-full bg-status-new animate-pulse" />
            <span>New matches</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {jobs.length > 0 ? '500+' : '...'}
          </p>
        </Link>

        {/* Applied */}
        <Link
          to="/pipeline"
          className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-status-applied/50 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
            <span className="w-2 h-2 rounded-full bg-status-applied" />
            <span>Applied</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {appliedJobs.length}
          </p>
        </Link>

        {/* Interviewing */}
        <Link
          to="/pipeline"
          className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-status-interviewing/50 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
            <span className="w-2 h-2 rounded-full bg-status-interviewing" />
            <span>Interviewing</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {interviewingJobs.length}
          </p>
        </Link>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Matches to Review */}
        <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
            <h2 className="text-sm font-bold text-foreground">Top matches to review</h2>
            <Link
              to="/explore"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 flex-1">
            {topMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading fresh matching jobs...
              </div>
            ) : (
              topMatches.map((job) => (
                <Link
                  key={job.id}
                  to={`/explore?q=${encodeURIComponent(job.title)}`}
                  className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {job.company} {job.location ? `• ${job.location}` : ''}
                    </p>
                  </div>
                  {job.structured_metadata?.remote_policy && (
                    <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                      {job.structured_metadata.remote_policy}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Active Interviews */}
        <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
            <h2 className="text-sm font-bold text-foreground">Active Interviews</h2>
            <Link
              to="/pipeline"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
            {interviewingJobs.length === 0 ? (
              <div className="space-y-2">
                <CalendarClock className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <p className="text-sm font-medium text-muted-foreground">No interviews in progress</p>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  When you move applied jobs to Interviewing in your Pipeline, they will appear here.
                </p>
              </div>
            ) : (
              <div className="w-full divide-y divide-border/60">
                {interviewingJobs.map((app) => (
                  <div key={app.id} className="py-3 text-left">
                    <h3 className="text-sm font-semibold text-foreground">{app.title}</h3>
                    <p className="text-xs text-muted-foreground">{app.company}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-card">
            <h2 className="text-sm font-bold text-foreground">Recently added</h2>
          </div>

          <div className="divide-y divide-border/60 flex-1">
            {recentJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading recently indexed roles...
              </div>
            ) : (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/explore?q=${encodeURIComponent(job.title)}`}
                  className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {job.company}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono text-muted-foreground">
                    {formatDate(job.created_at)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-card">
            <h2 className="text-sm font-bold text-foreground">Quick actions</h2>
          </div>

          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-center">
            {/* Sync Jobs */}
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {isSyncing ? 'Syncing direct ATS feeds...' : 'Sync Jobs'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Pull fresh openings from 150+ direct company ATS portals.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Generate materials */}
            <Link
              to="/quick-generate"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Quick Generate materials
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Draft tailored cover letters and resume bullets using free Gemini keys.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Review new matches */}
            <Link
              to="/explore"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Review new matches
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Search and filter 8,420+ direct employer openings.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {syncMessage && (
              <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                {syncMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
