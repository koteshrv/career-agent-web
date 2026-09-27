import { useState, useEffect, useMemo } from 'react';
import { 
  Kanban, 
  Plus, 
  Search, 
  Clock, 
  Building2, 
  MapPin, 
  ExternalLink, 
  AlertCircle, 
  Trash2, 
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { 
  getStoredApplications, 
  updateApplicationStatus, 
  updateApplicationFollowUp, 
  deleteTrackedApplication, 
  addTrackedApplication 
} from '../lib/profileStorage';
import type { TrackedApplication, ApplicationStatus } from '../types/tracker';
import { STATUS_CONFIG } from '../types/tracker';

const COLUMNS: ApplicationStatus[] = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'ARCHIVED'];

export function Tracker() {
  const [applications, setApplications] = useState<TrackedApplication[]>(getStoredApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state for adding manual job
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('APPLIED');

  const refreshApplications = () => {
    setApplications(getStoredApplications());
  };

  useEffect(() => {
    refreshApplications();
  }, []);

  // Filter applications by search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q))
    );
  }, [applications, searchQuery]);

  // Compute applications with follow-ups due (within 3 days after applied, if not yet followed up)
  const followUpsDue = useMemo(() => {
    const now = new Date();
    return applications.filter((a) => {
      if (a.status !== 'APPLIED' || a.followedUp || !a.followUpDate) return false;
      const fDate = new Date(a.followUpDate);
      return fDate <= now;
    });
  }, [applications]);

  const handleStatusChange = (id: string, nextStatus: ApplicationStatus) => {
    updateApplicationStatus(id, nextStatus);
    refreshApplications();
  };

  const handleFollowUpToggle = (id: string, currentState: boolean) => {
    updateApplicationFollowUp(id, !currentState);
    refreshApplications();
  };

  const handleDelete = (id: string) => {
    deleteTrackedApplication(id);
    refreshApplications();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;

    addTrackedApplication({
      company: newCompany.trim(),
      title: newTitle.trim(),
      url: newUrl.trim() || 'https://careeragent.fyi',
      location: newLocation.trim() || undefined,
      salary: newSalary.trim() || undefined,
      status: newStatus,
    });

    setNewCompany('');
    setNewTitle('');
    setNewUrl('');
    setNewLocation('');
    setNewSalary('');
    setIsAddOpen(false);
    refreshApplications();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background overflow-hidden">
      {/* Top Action Bar */}
      <div className="shrink-0 border-b border-border bg-card/60 px-4 sm:px-6 py-3">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Kanban className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                Application Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                Track jobs captured from LinkedIn or autofilled via the CareerAgent Extension.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or title..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="h-8 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Job
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Day Follow-Up Alert Banner */}
      {followUpsDue.length > 0 && (
        <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-6 py-2.5">
          <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                <strong>{followUpsDue.length} follow-up reminder{followUpsDue.length > 1 ? 's' : ''} due:</strong>{' '}
                {followUpsDue.map((a) => a.company).join(', ')} (applied 3+ days ago).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                Nudge recruiter to stay top-of-mind
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="flex-1 min-h-0 overflow-x-auto p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl h-full flex gap-4 min-w-[1000px]">
          {COLUMNS.map((colKey) => {
            const config = STATUS_CONFIG[colKey];
            const colApps = filteredApps.filter((a) => a.status === colKey);

            return (
              <div
                key={colKey}
                className="flex-1 min-w-[220px] flex flex-col bg-card border border-border rounded-xl shadow-2xs overflow-hidden"
              >
                {/* Column Header */}
                <div className="shrink-0 p-3 border-b border-border bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {config.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground px-1.5 py-0.5 rounded-md bg-background border border-border">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {colApps.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-muted-foreground border border-dashed border-border/70 rounded-lg">
                      <p className="text-xs">No jobs in {config.label}</p>
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-background border border-border rounded-lg shadow-2xs hover:border-primary/50 transition-all space-y-2 group"
                      >
                        {/* Company & Role */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                              {app.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </div>
                          </div>
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded shrink-0 cursor-pointer"
                              title="Open original job posting"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Location & Salary */}
                        {(app.location || app.salary) && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            {app.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {app.location}
                              </span>
                            )}
                            {app.salary && (
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {app.salary}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Follow-up due prompt on Applied card */}
                        {app.status === 'APPLIED' && (
                          <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleFollowUpToggle(app.id, Boolean(app.followedUp))}
                              className={`flex items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                                app.followedUp
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-amber-600 dark:text-amber-400 font-medium hover:underline'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {app.followedUp ? 'Followed up' : '3d Follow-up due'}
                            </button>
                            <span className="text-muted-foreground text-[10px]">
                              {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}

                        {/* Quick Move State Controls */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="text-[11px] font-medium bg-secondary text-foreground rounded px-1.5 py-0.5 border border-border cursor-pointer outline-hidden"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEWING">Interviewing</option>
                            <option value="OFFER">Offer</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer transition-colors"
                            title="Remove job from tracker"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Add Job Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add Application to Tracker
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Datadog, Stripe, Google"
                  className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1">Posting URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://boards.greenhouse.io/..."
                  className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Remote / New York"
                    className="w-full h-8 px-2.5 rounded-lg bg-background border border-border text-foreground text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-border text-foreground text-xs outline-hidden cursor-pointer"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Save Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
