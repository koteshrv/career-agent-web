import { useState } from 'react';
import { MapPin, Flag, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { reportJob } from '../lib/api';
import type { Job } from '../lib/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CompanyLogo } from './CompanyLogo';

export function JobCard({ job }: { job: Job }) {
  const [reported, setReported] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReport = async () => {
    if (reported || isReporting) return;
    setIsReporting(true);
    try {
      await reportJob(job.id);
      setReported(true);
      setReportSuccess(true);
    } catch (e) {
      alert('Failed to report job. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days === 0 ? 'Today' : `${days}d ago`;
  };

  return (
    <>
      <Card className="group relative border border-border/90 bg-card rounded-2xl p-4 sm:p-5 hover:border-foreground/20 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 min-w-[40px] rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <CompanyLogo name={job.company} className="w-6 h-6 min-w-[24px] rounded shrink-0" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[15px] sm:text-base leading-snug tracking-[-0.01em] text-foreground truncate mb-1">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <span className="font-medium text-foreground/80 truncate max-w-[140px] sm:max-w-none">
                {job.company}
              </span>
              {job.location && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1 shrink text-ellipsis overflow-hidden whitespace-nowrap max-w-[180px] sm:max-w-[260px]">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{job.location}</span>
                  </span>
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              <span className="shrink-0">{getDaysAgo(job.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirm(true)}
            disabled={reported}
            title={reported ? "Reported" : "Report Spam / Dead Link"}
            className={`h-8 w-8 rounded-full transition-colors ${
              reported 
                ? 'text-emerald-600 bg-emerald-500/10' 
                : 'text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10'
            }`}
          >
            <Flag className={`h-3.5 w-3.5 ${reported ? 'fill-current' : ''}`} />
          </Button>

          <Button 
            asChild 
            className="h-8 rounded-full px-4 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity gap-1.5 shadow-sm"
          >
            <a href={job.url} target="_blank" rel="noreferrer">
              Apply
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </Button>
        </div>
      </Card>

      {/* Tsenta-style Report Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => { if (!isReporting) setShowConfirm(false); }} />
          <div className="relative bg-card border border-border shadow-xl rounded-2xl max-w-sm w-full p-6">
            {!reportSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">Report Job</h3>
                    <p className="text-xs text-muted-foreground">Help keep listings accurate</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Are you sure you want to flag <span className="font-medium text-foreground">{job.title}</span>? Our system will review this listing for dead links or spam.
                </p>
                <div className="flex items-center justify-end gap-2.5">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowConfirm(false)} 
                    disabled={isReporting}
                    className="h-8 rounded-full px-3.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReport} 
                    disabled={isReporting}
                    className="h-8 rounded-full px-4 text-xs font-medium min-w-[90px]"
                  >
                    {isReporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Report'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Flag className="h-5 w-5 text-emerald-600 fill-current" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Listing Reported</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Thank you for helping keep the job board accurate.
                </p>
                <Button 
                  className="w-full h-8 rounded-full text-xs font-medium" 
                  onClick={() => setShowConfirm(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
