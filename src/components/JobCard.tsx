import { useState } from 'react';
import { MapPin, Flag, ExternalLink, AlertTriangle, Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { reportJob } from '../lib/api';
import type { Job } from '../lib/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CompanyLogo } from './CompanyLogo';

export function JobCard({ 
  job, 
  isSelected,
  onSelectJob,
  onSelectCompany,
  onSelectLocation,
}: { 
  job: Job; 
  isSelected?: boolean;
  onSelectJob?: (job: Job) => void;
  onSelectCompany?: (company: string) => void;
  onSelectLocation?: (location: string) => void;
}) {
  const [reported, setReported] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reported || isReporting) return;
    setIsReporting(true);
    try {
      await reportJob(job.id);
      setReported(true);
      setReportSuccess(true);
    } catch {
      alert('Failed to report job. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days <= 0 ? 'Today' : `${days} d ago`;
  };

  const meta = job.structured_metadata;

  let yoeText: string | null = null;
  if (meta?.yoe_min !== undefined && meta?.yoe_min !== null) {
    if (meta?.yoe_max !== undefined && meta?.yoe_max !== null && meta.yoe_max > meta.yoe_min) {
      yoeText = `${meta.yoe_min}–${meta.yoe_max} yrs`;
    } else {
      yoeText = `${meta.yoe_min}+ yrs`;
    }
  }

  const seniority = meta?.seniority 
    ? meta.seniority.charAt(0).toUpperCase() + meta.seniority.slice(1).toLowerCase() 
    : null;

  const workplace = job.workplace_type || meta?.remote_policy;
  const workplaceLabel = workplace
    ? workplace.charAt(0).toUpperCase() + workplace.slice(1).toLowerCase()
    : null;

  const topTech = meta?.tech_stack?.slice(0, 3) || [];

  return (
    <>
      <Card 
        onClick={() => onSelectJob?.(job)}
        className={`group relative shadow-xs hover:shadow-md transition-all p-4 sm:p-5 min-w-0 bg-card border-border cursor-pointer ${
          isSelected 
            ? 'border-primary ring-2 ring-primary/30 bg-muted/20 shadow-sm' 
            : 'hover:border-border/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg leading-tight mb-2 truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {job.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground min-w-0 mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCompany?.(job.company);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors cursor-pointer shrink-0"
                title={`Filter by ${job.company}`}
              >
                <CompanyLogo name={job.company} className="w-4 h-4 min-w-[16px] rounded-xs shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">{job.company}</span>
              </button>

              {job.location && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocation?.(job.location!);
                  }}
                  className="flex items-center gap-1 text-xs hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Filter by location"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[160px] sm:max-w-[240px]">{job.location}</span>
                </button>
              )}

              {job.country_code && (
                <span className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold uppercase bg-muted text-muted-foreground border border-border/60 shrink-0">
                  {job.country_code}
                </span>
              )}

              {workplaceLabel && (
                <Badge variant="outline" className="text-xs font-medium border-border/80 shrink-0">
                  {workplaceLabel}
                </Badge>
              )}

              {job.employment_type && (
                <Badge variant="secondary" className="text-xs font-medium capitalize shrink-0">
                  {job.employment_type.replace('_', '-')}
                </Badge>
              )}

              {yoeText && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-md">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span>{yoeText}</span>
                </span>
              )}

              {seniority && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-md">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  <span>{seniority}</span>
                </span>
              )}

              <span className="text-xs text-muted-foreground shrink-0 ml-auto sm:ml-0">
                {getDaysAgo(job.posted_at || job.created_at)}
              </span>
            </div>

            {topTech.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {topTech.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              disabled={reported}
              title={reported ? "Reported" : "Report Spam/Dead Link"}
              className={`transition-colors h-9 w-9 ${reported ? 'text-green-500' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
            >
              <Flag className={`h-4 w-4 ${reported ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              asChild 
              onClick={(e) => e.stopPropagation()}
              className="gap-1.5 h-9 rounded-lg font-medium px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href={job.apply_url || job.url} target="_blank" rel="noreferrer">
                Apply
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => { if (!isReporting) setShowConfirm(false); }} />
          <div className="relative bg-card border border-border shadow-lg rounded-xl max-w-sm w-full p-6">
            {!reportSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Report Job</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to flag <span className="font-semibold text-foreground">{job.title}</span>? This will alert our moderators to check for spam or dead links.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isReporting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReport} disabled={isReporting} className="min-w-[100px]">
                    {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Report'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-3">
                  <Flag className="h-6 w-6 fill-current" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Thank you!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your report has been submitted for community verification.
                </p>
                <Button onClick={() => setShowConfirm(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
