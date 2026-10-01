import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock, AlarmClock, ArrowRight } from 'lucide-react';
import { getStoredApplications, saveStoredApplications } from '../lib/profileStorage';
import { Button } from '../components/ui/button';

export function Followups() {
  const [tab, setTab] = useState<'overdue' | 'due' | 'upcoming'>('due');
  const [updatedTick, setUpdatedTick] = useState(0);

  useEffect(() => {
    const bump = () => setUpdatedTick((t) => t + 1);
    window.addEventListener('careeragent_sync', bump);
    return () => window.removeEventListener('careeragent_sync', bump);
  }, []);

  const applications = useMemo(() => getStoredApplications(), [updatedTick]);

  const groups = useMemo(() => {
    const now = new Date().getTime();
    const appliedOrInterviewing = applications.filter(
      (a) => a.status === 'APPLIED' || a.status === 'INTERVIEWING'
    );

    const overdue: typeof appliedOrInterviewing = [];
    const due: typeof appliedOrInterviewing = [];
    const upcoming: typeof appliedOrInterviewing = [];

    appliedOrInterviewing.forEach((app) => {
      const targetTime = app.followUpDate 
        ? new Date(app.followUpDate).getTime()
        : new Date(app.appliedDate).getTime() + 5 * 24 * 60 * 60 * 1000;

      const diffDays = Math.round((targetTime - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        overdue.push(app);
      } else if (diffDays <= 2) {
        due.push(app);
      } else {
        upcoming.push(app);
      }
    });

    return { overdue, due, upcoming };
  }, [applications]);

  const handleMarkFollowedUp = (id: string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...app,
          followUpDate: nextDate,
          notes: (app.notes ? `${app.notes}\n` : '') + `Followed up on ${new Date().toLocaleDateString()}`,
        };
      }
      return app;
    });
    saveStoredApplications(updated);
    setUpdatedTick((t) => t + 1);
  };

  const handleSnooze = (id: string, days: number) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        const nextDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        return { ...app, followUpDate: nextDate };
      }
      return app;
    });
    saveStoredApplications(updated);
    setUpdatedTick((t) => t + 1);
  };

  const activeList = groups[tab];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'overdue'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlarmClock className="w-3.5 h-3.5" />
          <span>Overdue ({groups.overdue.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('due')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'due'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due Soon ({groups.due.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'upcoming'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Upcoming ({groups.upcoming.length})</span>
        </button>
      </div>

      {/* List / Empty State */}
      {activeList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-2xs space-y-3">
          <CalendarClock className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No applications in this queue</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            CareerAgent automatically calculates follow-up nudges for jobs you apply to in your Pipeline.
          </p>
          <div className="pt-2">
            <Link to="/pipeline">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <span>View Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border/60 shadow-2xs overflow-hidden">
          {activeList.map((app) => (
            <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{app.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {app.company} • Applied on {new Date(app.appliedDate).toLocaleDateString()}
                </p>
                {app.notes && (
                  <p className="text-xs text-foreground/80 mt-1 italic font-mono bg-muted/30 px-2 py-0.5 rounded">
                    "{app.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSnooze(app.id, 3)}
                  className="h-8 px-2.5 text-xs text-muted-foreground"
                >
                  Snooze 3d
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleMarkFollowedUp(app.id)}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Followed Up</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
