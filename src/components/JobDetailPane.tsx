import { useState } from 'react';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  ExternalLink, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Share2, 
  Flag, 
  Loader2, 
  Building2,
  AlertTriangle
} from 'lucide-react';
import type { Job, JobDetailResponse } from '../lib/api';
import { fetcher, reportJob } from '../lib/api';
import { CompanyLogo } from './CompanyLogo';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface JobDetailPaneProps {
  job: Job | null;
  onClose: () => void;
  onSelectCompany?: (company: string) => void;
  onSelectLocation?: (location: string) => void;
}

function getDaysAgo(dateString?: string | null): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export function JobDetailPane({ job, onClose, onSelectCompany, onSelectLocation }: JobDetailPaneProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  // If the job passed doesn't have cleaned_description or structured_metadata, fetch via GET /v1/jobs/:id
  const needsFullFetch = Boolean(job && !job.cleaned_description && !job.raw_description);
  const { data: detailData, isLoading: isFetchingDetail } = useSWR<JobDetailResponse>(
    needsFullFetch && job?.id ? `/v1/jobs/${job.id}` : null,
    fetcher
  );

  if (!job) return null;

  const currentJob: Job = detailData?.job || job;
  const meta = currentJob.structured_metadata;
  const destinationUrl = currentJob.apply_url || currentJob.url;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('job', currentJob.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = async () => {
    if (reported || isReporting) return;
    setIsReporting(true);
    try {
      await reportJob(currentJob.id);
      setReported(true);
      setShowConfirm(false);
    } catch {
      alert('Failed to report job. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const formattedSalary = meta?.salary_min || meta?.salary_max
    ? `${meta.currency || '$'}${meta.salary_min ? meta.salary_min.toLocaleString() : ''}${
        meta.salary_min && meta.salary_max ? ' - ' : ''
      }${meta.salary_max ? (meta.salary_min ? '' : (meta.currency || '$')) + meta.salary_max.toLocaleString() : ''}`
    : null;

  return (
    <>
      <aside className="w-full h-full flex flex-col bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {currentJob.company}
            </span>
            <span>•</span>
            <span>Posted {getDaysAgo(currentJob.posted_at || currentJob.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Copy link to job"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(true)}
              disabled={reported}
              className={`h-8 w-8 cursor-pointer ${
                reported ? 'text-green-500' : 'text-muted-foreground hover:text-destructive'
              }`}
              title={reported ? 'Reported' : 'Report expired or incorrect posting'}
            >
              <Flag className={`h-4 w-4 ${reported ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Close details"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Job Identity Section */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <CompanyLogo name={currentJob.company} className="w-12 h-12 rounded-lg shrink-0 border border-border" />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {currentJob.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm">
                  <button
                    type="button"
                    onClick={() => onSelectCompany?.(currentJob.company)}
                    className="font-medium text-foreground hover:underline cursor-pointer"
                  >
                    {currentJob.company}
                  </button>
                  {currentJob.location && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <button
                        type="button"
                        onClick={() => onSelectLocation?.(currentJob.location!)}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{currentJob.location}</span>
                      </button>
                    </>
                  )}
                  {currentJob.country_code && (
                    <Badge variant="outline" className="text-[11px] font-semibold uppercase px-1.5 py-0 border-border/70">
                      {currentJob.country_code}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {currentJob.workplace_type && (
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  <Building2 className="h-3 w-3 mr-1" />
                  {currentJob.workplace_type}
                </Badge>
              )}
              {meta?.seniority && (
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  {meta.seniority}
                </Badge>
              )}
              {currentJob.ats_provider && (
                <Badge variant="outline" className="text-xs text-muted-foreground font-normal border-border/60">
                  via {currentJob.ats_provider}
                </Badge>
              )}
            </div>

            {/* Call to Action Button */}
            <div className="pt-1 flex items-center gap-3">
              <Button
                asChild
                className="h-10 px-6 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
              >
                <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
                  Apply Directly
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              {copied && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Link copied to clipboard!
                </span>
              )}
            </div>
          </div>

          {/* Structured AI Highlights Card */}
          {meta && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/40 border border-border/80 rounded-xl text-xs">
              {/* Experience */}
              {(meta.yoe_min !== undefined || meta.yoe_max !== undefined) && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Experience
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    {meta.yoe_min !== null && meta.yoe_min !== undefined
                      ? meta.yoe_max
                        ? `${meta.yoe_min}–${meta.yoe_max} yrs`
                        : `${meta.yoe_min}+ yrs`
                      : 'Not specified'}
                  </span>
                </div>
              )}

              {/* Salary */}
              {formattedSalary && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Compensation
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {formattedSalary}
                  </span>
                </div>
              )}

              {/* Remote Policy */}
              {meta.remote_policy && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Remote Policy
                  </span>
                  <span className="font-medium text-foreground capitalize flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {meta.remote_policy}
                  </span>
                </div>
              )}

              {/* Visa Sponsorship */}
              {meta.visa_sponsorship !== null && meta.visa_sponsorship !== undefined && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Visa Sponsorship
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {meta.visa_sponsorship ? 'Available' : 'Not supported'}
                  </span>
                </div>
              )}

              {/* Security Clearance */}
              {meta.clearance_required && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Clearance
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                    Required
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack Chips */}
          {meta?.tech_stack && meta.tech_stack.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tech Stack & Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {meta.tech_stack.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/60"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills Chips */}
          {meta?.required_skills && meta.required_skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required Skills & Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {meta.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/40 text-muted-foreground border border-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Job Description (Cleaned Markdown) */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-base font-bold text-foreground">
              About the Role
            </h3>

            {isFetchingDetail ? (
              <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading full job description...</span>
              </div>
            ) : currentJob.cleaned_description || currentJob.raw_description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-3 break-words [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_p]:leading-relaxed">
                <ReactMarkdown>
                  {currentJob.cleaned_description || currentJob.raw_description || ''}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Full description not provided in feed. Click "Apply Directly" above to view on the employer's careers site.
              </p>
            )}
          </div>
        </div>

        {/* Sticky Bottom Apply Footer */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground truncate">
            {currentJob.title} • <span className="font-semibold text-foreground">{currentJob.company}</span>
          </div>
          <Button
            asChild
            className="h-9 px-5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0 cursor-pointer"
          >
            <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      </aside>

      {/* Report Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => { if (!isReporting) setShowConfirm(false); }} />
          <div className="relative bg-card border border-border shadow-lg rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Report Job</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to flag <span className="font-semibold text-foreground">{currentJob.title}</span>? This will alert moderators to review this posting.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isReporting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReport}
                disabled={isReporting}
              >
                {isReporting ? 'Reporting...' : 'Confirm Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
