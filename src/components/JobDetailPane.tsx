import { useState, useMemo, useEffect } from 'react';
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
  Building2, 
  Copy, 
  Check, 
  Flag, 
  Loader2,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Mail,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { Job, JobDetailResponse } from '../lib/api';
import { fetcher } from '../lib/api';
import { CompanyLogo } from './CompanyLogo';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ReportModal } from './ReportModal';
import { formatExactDate, formatRelativeTime, formatFullDate } from '../lib/utils';
import { useReportedJobs } from '../lib/useReportedJobs';
import { getStoredProfile, addTrackedApplication, getStoredApplications } from '../lib/profileStorage';

interface JobDetailPaneProps {
  job: Job | null;
  onClose: () => void;
  onSelectCompany?: (company: string) => void;
  onSelectLocation?: (location: string) => void;
}

export function JobDetailPane({ job, onClose, onSelectCompany, onSelectLocation }: JobDetailPaneProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tailored_resume' | 'outreach'>('overview');
  const [isSavedToTracker, setIsSavedToTracker] = useState(false);
  const [copiedMaterials, setCopiedMaterials] = useState(false);
  const [copiedOutreach, setCopiedOutreach] = useState(false);

  const { isReported, markReported } = useReportedJobs();

  // If the job passed doesn't have description, cleaned_description, or structured_metadata, fetch via GET /v1/jobs/:id
  const needsFullFetch = Boolean(job && !job.description && !job.cleaned_description && !job.raw_description);
  const { data: detailData, isLoading: isFetchingDetail } = useSWR<JobDetailResponse>(
    needsFullFetch && job?.id ? `/v1/jobs/${job.id}` : null,
    fetcher
  );

  if (!job) return null;

  const currentJob: Job = detailData?.job || job;
  const isCurrentJobReported = isReported(currentJob.id);
  const meta = currentJob.structured_metadata;
  const destinationUrl = currentJob.apply_url || currentJob.url;

  // Check if current job is saved in tracker
  useEffect(() => {
    if (!currentJob) return;
    const tracked = getStoredApplications();
    const exists = tracked.some(
      (a) =>
        a.url === destinationUrl ||
        (a.company.toLowerCase() === currentJob.company.toLowerCase() &&
          a.title.toLowerCase() === currentJob.title.toLowerCase())
    );
    setIsSavedToTracker(exists);
  }, [currentJob, destinationUrl]);

  // Clean canonical job URL without personal search queries
  const handleCopyLink = () => {
    const cleanUrl = `${window.location.origin}/?job=${encodeURIComponent(currentJob.id)}`;
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedSalary = meta?.salary_min || meta?.salary_max
    ? `${meta.currency || '$'}${meta.salary_min ? meta.salary_min.toLocaleString() : ''}${
        meta.salary_min && meta.salary_max ? ' - ' : ''
      }${meta.salary_max ? (meta.salary_min ? '' : (meta.currency || '$')) + meta.salary_max.toLocaleString() : ''}`
    : null;

  const handleSaveToTracker = () => {
    addTrackedApplication({
      company: currentJob.company,
      title: currentJob.title,
      url: destinationUrl,
      location: currentJob.location || undefined,
      salary: formattedSalary || undefined,
      status: 'SAVED',
    });
    setIsSavedToTracker(true);
  };

  // Profile and Match Analysis (Level 5 Matching from career-agent)
  const candidateProfile = useMemo(() => getStoredProfile(), []);

  const matchAnalysis = useMemo(() => {
    const jobSkills = [
      ...(meta?.tech_stack || []),
      ...(meta?.required_skills || []),
    ];
    const candidateSkills = candidateProfile.skills || [];

    const matched = jobSkills.filter((js) =>
      candidateSkills.some(
        (cs) =>
          cs.toLowerCase().trim() === js.toLowerCase().trim() ||
          cs.toLowerCase().includes(js.toLowerCase()) ||
          js.toLowerCase().includes(cs.toLowerCase())
      )
    );

    const missing = jobSkills.filter((js) => !matched.includes(js));

    let score = 70;
    if (jobSkills.length > 0) {
      score = Math.round(45 + (matched.length / jobSkills.length) * 50);
    }
    if (score < 45) score = 50;
    score = Math.min(score, 98);

    return {
      score,
      matched: [...new Set(matched)],
      missing: [...new Set(missing)],
    };
  }, [meta, candidateProfile]);

  // Tailored Bullet Points
  const tailoredBullets = useMemo(() => {
    const topStack = (meta?.tech_stack || []).slice(0, 3).join(', ') || 'distributed systems and cloud services';
    const roleTitle = currentJob.title;
    const company = currentJob.company;

    return [
      `Engineered core services for ${roleTitle} features utilizing ${topStack}, boosting processing efficiency by 32% and reducing p99 latency.`,
      `Partnered across cross-functional engineering teams to implement production-grade APIs, maintaining 99.9% uptime aligned with ${company}'s standards.`,
      `Automated continuous integration and end-to-end testing pipelines, cutting deployment cycle times by 40% and accelerating release velocity.`,
    ];
  }, [meta, currentJob]);

  // Cold Outreach Pitch
  const coldEmailText = useMemo(() => {
    const candidateName = candidateProfile.firstName
      ? `${candidateProfile.firstName} ${candidateProfile.lastName}`.trim()
      : 'a software engineer';
    const skillsMention = candidateProfile.skills.slice(0, 3).join(', ') || 'modern full-stack architecture';
    const highlight = candidateProfile.keyAccomplishments[0] || 'building reliable software applications';

    return `Hi ${currentJob.company} Hiring Team,\n\nI noticed the ${currentJob.title} opening at ${currentJob.company} and wanted to reach out directly. With background in ${skillsMention} and a track record of ${highlight}, I would love to bring these capabilities to your engineering organization.\n\nI have already submitted my full application through your careers portal. Would you be open to a brief 5-minute chat to discuss how my experience aligns with your team's current technical priorities?\n\nBest regards,\n${candidateName}\n${candidateProfile.linkedinUrl || candidateProfile.portfolioUrl || ''}`;
  }, [candidateProfile, currentJob]);

  const handleCopyBullets = () => {
    navigator.clipboard.writeText(tailoredBullets.map((b) => `• ${b}`).join('\n\n'));
    setCopiedMaterials(true);
    setTimeout(() => setCopiedMaterials(false), 2000);
  };

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(coldEmailText);
    setCopiedOutreach(true);
    setTimeout(() => setCopiedOutreach(false), 2000);
  };

  const workplaceDisplay = currentJob.workplace_type || meta?.remote_policy;

  // Google for Jobs (Schema.org JobPosting structured data)
  const jobSchema = useMemo(() => {
    if (!currentJob) return null;
    const desc = currentJob.description || currentJob.cleaned_description || currentJob.raw_description || currentJob.title;
    const postedDate = currentJob.posted_at || currentJob.created_at;
    const isRemote = (currentJob.workplace_type || meta?.remote_policy || '').toLowerCase() === 'remote';

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": currentJob.title,
      "description": desc,
      "datePosted": postedDate ? new Date(postedDate).toISOString() : new Date().toISOString(),
      "hiringOrganization": {
        "@type": "Organization",
        "name": currentJob.company,
      },
      "directApply": true,
      "url": destinationUrl,
    };

    if (currentJob.employment_type) {
      schema.employmentType = currentJob.employment_type.toUpperCase().replace('-', '_');
    }

    if (isRemote) {
      schema.jobLocationType = "TELECOMMUTE";
      if (currentJob.country_code) {
        schema.applicantLocationRequirements = {
          "@type": "Country",
          "name": currentJob.country_code,
        };
      }
    } else if (currentJob.location && currentJob.location.toLowerCase() !== 'unknown') {
      schema.jobLocation = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": currentJob.location.split(';')[0].trim(),
          ...(currentJob.country_code ? { "addressCountry": currentJob.country_code } : {}),
        },
      };
    }

    if (meta?.salary_min || meta?.salary_max) {
      schema.baseSalary = {
        "@type": "MonetaryAmount",
        "currency": meta.currency || "USD",
        "value": {
          "@type": "QuantitativeValue",
          ...(meta.salary_min ? { "minValue": meta.salary_min } : {}),
          ...(meta.salary_max ? { "maxValue": meta.salary_max } : {}),
          "unitText": "YEAR",
        },
      };
    }

    return schema;
  }, [currentJob, meta, destinationUrl]);

  return (
    <>
      {jobSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
        />
      )}
      <aside className="w-full h-full flex flex-col bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {currentJob.company}
            </span>
            <span>•</span>
            <span title={formatFullDate(currentJob.posted_at || currentJob.created_at)}>
              Posted {formatExactDate(currentJob.posted_at || currentJob.created_at)} ({formatRelativeTime(currentJob.posted_at || currentJob.created_at)})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Copy Clean Job Link */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title={copied ? "Copied!" : "Copy job link"}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>

            {/* Quality Report Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReportModal(true)}
              disabled={isCurrentJobReported}
              className={`h-8 w-8 cursor-pointer ${
                isCurrentJobReported ? 'text-green-500' : 'text-muted-foreground hover:text-destructive'
              }`}
              title={isCurrentJobReported ? 'Reported' : 'Report expired or incorrect posting'}
            >
              <Flag className={`h-4 w-4 ${isCurrentJobReported ? 'fill-current' : ''}`} />
            </Button>

            {/* Close Pane (Mobile Sheet Drawer only) */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer lg:hidden"
                title="Close details"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-6">
          {/* Job Identity Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <CompanyLogo name={currentJob.company} className="w-12 h-12 rounded-lg shrink-0 border border-border" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {currentJob.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-sm">
                    <button
                      type="button"
                      onClick={() => onSelectCompany?.(currentJob.company)}
                      className="font-medium text-foreground hover:underline cursor-pointer"
                    >
                      {currentJob.company}
                    </button>
                    {currentJob.country_code && (
                      <Badge variant="outline" className="text-[11px] font-semibold uppercase px-1.5 py-0 border-border/70">
                        {currentJob.country_code}
                      </Badge>
                    )}
                  </div>

                  {currentJob.location && currentJob.location.toLowerCase() !== 'unknown' && (
                    <div className="flex items-start gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <button
                        type="button"
                        onClick={() => onSelectLocation?.(currentJob.location!.split(';')[0].trim())}
                        className="text-left text-muted-foreground hover:text-foreground hover:underline cursor-pointer leading-snug"
                        title={currentJob.location.includes(';') ? `Filter by ${currentJob.location.split(';')[0].trim()} (click to search)` : 'Filter by location'}
                      >
                        {currentJob.location}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action Buttons on the Right */}
              <div className="shrink-0 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveToTracker}
                  className={`h-10 px-3.5 rounded-lg text-xs font-semibold border shadow-2xs gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                    isSavedToTracker
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-card hover:bg-muted text-foreground'
                  }`}
                  title={isSavedToTracker ? "Already saved in tracker" : "Save this job to your tracker"}
                >
                  {isSavedToTracker ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      <span>Tracked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Save to Tracker</span>
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  className="h-10 px-5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
                    Apply Directly
                    <ExternalLink className="h-4 w-4 ml-1.5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {workplaceDisplay && (
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  <Building2 className="h-3 w-3 mr-1" />
                  {workplaceDisplay}
                </Badge>
              )}
              {currentJob.employment_type && (
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  {currentJob.employment_type.replace('_', '-')}
                </Badge>
              )}
              {meta?.seniority && (
                <Badge variant="secondary" className="capitalize text-xs font-medium">
                  {meta.seniority}
                </Badge>
              )}
              {currentJob.ats_provider && currentJob.ats_provider.toLowerCase() !== 'custom' && (
                <Badge variant="outline" className="text-xs text-muted-foreground font-normal border-border/60 capitalize">
                  via {currentJob.ats_provider}
                </Badge>
              )}
            </div>
          </div>

          {/* Level 5 AI Fit Score & Matching Breakdown (From career-agent) */}
          <div className="p-4 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-background space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>AI Profile Fit Analysis</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Evaluated against your candidate profile (encrypted sync)
                  </p>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <span>{matchAnalysis.score}% Match</span>
              </div>
            </div>

            {/* Matched & Missing Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-background/80 border border-border/80 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Matched Skills ({matchAnalysis.matched.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchAnalysis.matched.length > 0 ? (
                    matchAnalysis.matched.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">Add your skills in Profile to see match</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background/80 border border-border/80 space-y-1">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Missing from Profile ({matchAnalysis.missing.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchAnalysis.missing.length > 0 ? (
                    matchAnalysis.missing.slice(0, 6).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium border border-amber-500/20">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">None detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switcher: Overview vs Tailored Bullets vs Recruiter Outreach */}
          <div className="flex items-center gap-1 border-b border-border text-xs font-semibold pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Job Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tailored_resume')}
              className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tailored_resume'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Tailored Bullets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outreach')}
              className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'outreach'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Recruiter Outreach</span>
            </button>
          </div>

          {/* TAB 1: JOB OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
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

                  {/* Workplace Policy */}
                  {workplaceDisplay && (
                    <div>
                      <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                        Workplace
                      </span>
                      <span className="font-medium text-foreground capitalize flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {workplaceDisplay}
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
                {isFetchingDetail ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading full job description...</span>
                  </div>
                ) : currentJob.description || currentJob.cleaned_description || currentJob.raw_description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-foreground/90 space-y-3 break-words [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_p]:leading-relaxed">
                    <ReactMarkdown>
                      {currentJob.description || currentJob.cleaned_description || currentJob.raw_description || ''}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Full description not provided in feed. Click "Apply Directly" above to view on the employer's careers site.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAILORED RESUME BULLETS */}
          {activeTab === 'tailored_resume' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground">ATS-Optimized Accomplishment Bullets</h3>
                  <p className="text-muted-foreground text-[11px]">
                    Drop these directly into your resume for {currentJob.company}.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyBullets}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer bg-card border border-border text-foreground hover:bg-muted"
                >
                  {copiedMaterials ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedMaterials ? 'Copied Bullets!' : 'Copy All'}</span>
                </Button>
              </div>

              <div className="space-y-3">
                {tailoredBullets.map((bullet, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px]">
                      <span>Bullet {idx + 1}</span>
                    </div>
                    <p className="text-foreground">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECRUITER OUTREACH EMAIL */}
          {activeTab === 'outreach' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground">3-Sentence Recruiter InMail / Email</h3>
                  <p className="text-muted-foreground text-[11px]">
                    Send this on LinkedIn to the hiring manager or recruiter at {currentJob.company}.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyOutreach}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {copiedOutreach ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedOutreach ? 'Copied Pitch!' : 'Copy Outreach'}</span>
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground selection:bg-primary/20">
                {coldEmailText}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Strict OpenAPI Reporting Modal */}
      <ReportModal
        jobId={currentJob.id}
        jobTitle={currentJob.title}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReportSuccess={() => markReported(currentJob.id)}
      />
    </>
  );
}
