import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Copy, Check, Flag, Bookmark, BookmarkCheck, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import type { Job, JobDetailResponse } from '../lib/api';
import { fetcher } from '../lib/api';
import { CompanyLogo } from './CompanyLogo';
import { Button } from './ui/button';
import { IconButton } from './ui/icon-button';
import { Chip } from './ui/chip';
import { ReportModal } from './ReportModal';
import { useToast } from './ui/toast';
import { formatFullDate, formatRelativeTime } from '../lib/utils';
import { useReportedJobs } from '../lib/useReportedJobs';
import { addTrackedApplication, getStoredApplications, SYNC_EVENT } from '../lib/profileStorage';
import { primaryLocation } from './JobRow';

interface ReadingPaneProps {
  job: Job;
  /** Shown on phones, where the pane replaces the list. */
  onBack?: () => void;
}

export function ReadingPane({ job, onBack }: ReadingPaneProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isReported, markReported } = useReportedJobs();

  // The feed omits long fields; fetch the full posting when they are missing.
  const needsFullFetch = Boolean(job && !job.description && !job.cleaned_description && !job.raw_description);
  const { data: detailData, isLoading: isFetchingDetail } = useSWR<JobDetailResponse>(needsFullFetch && job?.id ? `/v1/jobs/${job.id}` : null, fetcher);

  const current: Job = detailData?.job || job;
  const meta = current.structured_metadata;
  const destinationUrl = current.apply_url || current.url;
  const reported = isReported(current.id);
  const location = primaryLocation(current);
  const workplace = (current.workplace_type || meta?.remote_policy || '').toLowerCase();
  const posted = current.posted_at || current.created_at;
  const description = current.description || current.cleaned_description || current.raw_description || '';

  useEffect(() => {
    const check = () => {
      const tracked = getStoredApplications();
      setIsSaved(tracked.some((a) => a.url === destinationUrl || (a.company.toLowerCase() === current.company.toLowerCase() && a.title.toLowerCase() === current.title.toLowerCase())));
    };
    check();
    window.addEventListener(SYNC_EVENT, check);
    return () => window.removeEventListener(SYNC_EVENT, check);
  }, [current.company, current.title, destinationUrl]);

  const salary = useMemo(() => {
    if (!meta || (!meta.salary_min && !meta.salary_max)) return null;
    const cur = meta.currency || '$';
    const fmt = (n: number) => `${cur}${n.toLocaleString()}`;
    if (meta.salary_min && meta.salary_max) return `${fmt(meta.salary_min)} – ${fmt(meta.salary_max)}`;
    return fmt((meta.salary_min || meta.salary_max) as number);
  }, [meta]);

  const experience = useMemo(() => {
    if (!meta || meta.yoe_min === null || meta.yoe_min === undefined) return null;
    return meta.yoe_max && meta.yoe_max > meta.yoe_min ? `${meta.yoe_min}–${meta.yoe_max} years` : `${meta.yoe_min}+ years`;
  }, [meta]);

  const facts: Array<[string, string]> = [];
  if (experience) facts.push(['Experience', experience]);
  if (meta?.seniority) facts.push(['Level', meta.seniority.charAt(0).toUpperCase() + meta.seniority.slice(1).toLowerCase()]);
  if (workplace) facts.push(['Workplace', workplace.charAt(0).toUpperCase() + workplace.slice(1)]);
  if (current.employment_type) facts.push(['Type', current.employment_type.replace('_', '-').replace(/^\w/, (c) => c.toUpperCase())]);
  if (salary) facts.push(['Compensation', salary]);
  if (meta?.visa_sponsorship !== null && meta?.visa_sponsorship !== undefined) facts.push(['Sponsorship', meta.visa_sponsorship ? 'Offered' : 'Not offered']);
  if (meta?.clearance_required) facts.push(['Clearance', 'Required']);
  if (current.ats_provider && current.ats_provider.toLowerCase() !== 'custom') facts.push(['Source', current.ats_provider.charAt(0).toUpperCase() + current.ats_provider.slice(1)]);

  const handleCopyLink = async () => {
    const cleanUrl = `${window.location.origin}/?job=${encodeURIComponent(current.id)}`;
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      toast('Link copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy the link', 'error');
    }
  };

  const handleSave = () => {
    if (isSaved) return;
    addTrackedApplication({
      company: current.company,
      title: current.title,
      url: destinationUrl,
      location: location || undefined,
      salary: salary || undefined,
      status: 'SAVED',
    });
    setIsSaved(true);
    toast('Saved to your pipeline', 'success');
  };

  // Google for Jobs structured data
  const jobSchema = useMemo(() => {
    const isRemote = workplace === 'remote';
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: current.title,
      description: description || current.title,
      datePosted: posted ? new Date(posted).toISOString() : new Date().toISOString(),
      hiringOrganization: { '@type': 'Organization', name: current.company },
      directApply: true,
      url: destinationUrl,
    };
    if (current.employment_type) schema.employmentType = current.employment_type.toUpperCase().replace('-', '_');
    if (isRemote) {
      schema.jobLocationType = 'TELECOMMUTE';
      if (current.country_code) schema.applicantLocationRequirements = { '@type': 'Country', name: current.country_code };
    } else if (location) {
      schema.jobLocation = {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: location, ...(current.country_code ? { addressCountry: current.country_code } : {}) },
      };
    }
    if (meta?.salary_min || meta?.salary_max) {
      schema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: meta.currency || 'USD',
        value: { '@type': 'QuantitativeValue', ...(meta.salary_min ? { minValue: meta.salary_min } : {}), ...(meta.salary_max ? { maxValue: meta.salary_max } : {}), unitText: 'YEAR' },
      };
    }
    return schema;
  }, [current, meta, destinationUrl, description, location, posted, workplace]);

  const openDrafts = (kind: 'resume' | 'cover_letter') => {
    try {
      sessionStorage.setItem('careeragent_draft_context', JSON.stringify({ jobId: current.id, company: current.company, title: current.title, description: description.slice(0, 12_000) }));
    } catch {}
    navigate(`/drafts?kind=${kind}`);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />
      <article className="flex h-full min-h-0 flex-col bg-card lg:rounded-md lg:border lg:border-border">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden -ml-2">
                <ArrowLeft />
                Jobs
              </Button>
            )}
            <span className="truncate" title={formatFullDate(posted)}>
              Posted {formatRelativeTime(posted)}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <IconButton label={copied ? 'Link copied' : 'Copy link to this job'} size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="text-success" /> : <Copy />}
            </IconButton>
            <IconButton label={reported ? 'You reported this posting' : 'Report this posting'} size="sm" tone="danger" disabled={reported} onClick={() => setShowReportModal(true)}>
              <Flag className={reported ? 'fill-current text-success' : ''} />
            </IconButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <header className="flex items-start gap-3.5">
            <CompanyLogo name={current.company} className="size-12 shrink-0 rounded-md border border-border" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-medium leading-snug tracking-tight text-foreground">{current.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{current.company}</span>
                {location && <> · {location}</>}
                {current.country_code && <> · {current.country_code}</>}
              </p>
            </div>
          </header>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button asChild variant="primary" size="lg">
              <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
                Apply on {current.company}'s site
                <ExternalLink />
              </a>
            </Button>
            <Button variant="secondary" size="lg" onClick={handleSave} aria-pressed={isSaved} className={isSaved ? 'border-transparent bg-tint-green' : ''}>
              {isSaved ? <BookmarkCheck /> : <Bookmark />}
              {isSaved ? 'In pipeline' : 'Save to pipeline'}
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span className="mr-1">Draft with AI:</span>
            <Button variant="ghost" size="sm" onClick={() => openDrafts('resume')}>
              <Sparkles />
              Tailored resume
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openDrafts('cover_letter')}>
              <FileText />
              Cover letter
            </Button>
          </div>

          {facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {(meta?.tech_stack?.length || meta?.required_skills?.length) ? (
            <div className="mt-5 space-y-3">
              {meta?.tech_stack && meta.tech_stack.length > 0 && (
                <div>
                  <h3 className="mb-1.5 text-sm font-medium text-muted-foreground">Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.tech_stack.map((item) => (
                      <Chip key={item} size="sm">{item}</Chip>
                    ))}
                  </div>
                </div>
              )}
              {meta?.required_skills && meta.required_skills.length > 0 && (
                <div>
                  <h3 className="mb-1.5 text-sm font-medium text-muted-foreground">Skills they ask for</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.required_skills.map((s) => (
                      <Chip key={s} size="sm">{s}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-6">
            {isFetchingDetail ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading description">
                <div className="h-4 w-1/3 animate-pulse rounded-sm bg-muted" />
                <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
                <div className="h-3.5 w-11/12 animate-pulse rounded-sm bg-muted" />
                <div className="h-3.5 w-4/5 animate-pulse rounded-sm bg-muted" />
              </div>
            ) : description ? (
              <div className="reading">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-base text-muted-foreground">
                The feed has no description for this posting. Read it on {current.company}'s site.
              </p>
            )}
          </div>
        </div>
      </article>

      <ReportModal jobId={current.id} jobTitle={current.title} isOpen={showReportModal} onClose={() => setShowReportModal(false)} onReportSuccess={() => markReported(current.id)} />
    </>
  );
}
