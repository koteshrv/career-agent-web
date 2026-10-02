import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Check, Sparkles, FileText, Mail, Download, Printer } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/button';
import { Field, Input, Textarea } from '../components/ui/field';
import { SegmentedControl } from '../components/ui/segmented';
import { Page, PageHeader } from '../components/ui/page';
import { useToast } from '../components/ui/toast';
import { getStoredProfile } from '../lib/profileStorage';
import { sendExtensionMessage, type MaterialKind } from '../lib/extensionBridge';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { addLog, type ApiLog } from '../lib/logger';

const KINDS: Array<{ value: MaterialKind; label: string; title: string }> = [
  { value: 'resume', label: 'Tailored resume', title: 'Resume for this job' },
  { value: 'cover_letter', label: 'Cover letter', title: 'Cover letter' },
  { value: 'cold_email', label: 'Cold email', title: 'Cold email' },
];

function readContext(): { jobId?: string; company: string; title: string; description: string } | null {
  try {
    const raw = sessionStorage.getItem('careeragent_draft_context');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Template fallback for when the extension is not connected. Kept so the page works offline. */
function templateDraft(kind: MaterialKind, company: string, jobTitle: string) {
  const profile = getStoredProfile();
  const name = profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Candidate';
  const skills = profile.skills.length > 0 ? profile.skills.join(', ') : 'software engineering';
  const top3 = skills.split(', ').slice(0, 3).join(', ');
  if (kind === 'cover_letter') {
    return `Dear Hiring Team at ${company || 'your organization'},\n\nI am writing to express my interest in the ${jobTitle || 'open position'}. With my background in ${skills}, I have built reliable, high-throughput systems and delivered measurable product impact.\n\nReading the requirements, I was drawn to the team's focus on scalable architecture and engineering craft. In previous roles I have led system improvements, automated complex workflows and shipped on time with product and design partners.\n\nI would welcome the chance to discuss how my experience fits your goals. Thank you for your time.\n\nSincerely,\n${name}`;
  }
  if (kind === 'resume') {
    const exp = profile.experiences.map((e) => `### ${e.role} · ${e.company}\n${e.startDate || ''}${e.current ? ' – present' : e.endDate ? ` – ${e.endDate}` : ''}\n\n${e.description || ''}`).join('\n\n');
    const edu = profile.education.map((e) => `- ${e.degree} ${e.fieldOfStudy}, ${e.institution} ${e.graduationYear}`).join('\n');
    return `# ${name}\n${profile.headline || ''}\n${[profile.email, profile.phone, profile.location].filter(Boolean).join(' · ')}\n\n## Summary\n${profile.summary || ''}\n\n## Skills\n${skills}\n\n## Experience\n${exp}\n\n## Education\n${edu}`;
  }
  return `Hi [Name],\n\nI noticed you are hiring for a ${jobTitle || 'role'} at ${company || 'your team'} and wanted to reach out directly.\n\nI have deep experience with ${top3} and have followed ${company || 'your company'}'s recent engineering work with interest.\n\nWould you be open to a short call this week to see whether my background is a fit? Happy to share my resume and portfolio.\n\nBest regards,\n${name}`;
}

export function Drafts() {
  const [params] = useSearchParams();
  const ctx = readContext();
  const extension = useExtensionStatus();
  const toast = useToast();
  const [kind, setKind] = useState<MaterialKind>((params.get('kind') as MaterialKind) || 'resume');
  const [company, setCompany] = useState(params.get('company') || ctx?.company || '');
  const [jobTitle, setJobTitle] = useState(params.get('title') || ctx?.title || '');
  const [description, setDescription] = useState(ctx?.description || '');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const profile = getStoredProfile();
  const current = KINDS.find((k) => k.value === kind)!;
  const profileThin = !profile.firstName && profile.experiences.length === 0 && profile.skills.length === 0;

  useEffect(() => {
    const k = params.get('kind') as MaterialKind | null;
    if (k && KINDS.some((x) => x.value === k)) setKind(k);
  }, [params]);

  const generate = async () => {
    setError(null);
    setCopied(false);
    if (extension) {
      setBusy(true);
      try {
        const res = await sendExtensionMessage<{ text: string; meta?: ApiLog['meta'] }>({ action: 'generate_material', payload: { kind, job: { title: jobTitle, company, description } } }, 120_000);
        setOutput(res.text);
        addLog({
          endpoint: 'Extension background worker → your AI provider',
          action: `Draft: ${current.label}`,
          timestamp: new Date().toISOString(),
          status: 200,
          meta: res.meta,
          requestBody: { kind, company, title: jobTitle, description, profile: { name: `${profile.firstName} ${profile.lastName}`.trim(), skills: profile.skills.length, experiences: profile.experiences.length } },
          responseBody: { chars: res.text.length, text: res.text },
        });
      } catch (e: unknown) {
        const m = e instanceof Error ? e.message : String(e);
        addLog({ endpoint: 'Extension background worker', action: `Draft: ${current.label}`, timestamp: new Date().toISOString(), status: 500, requestBody: { kind, company, title: jobTitle, description }, responseBody: { error: m } });
        setError(m === 'EXTENSION_TIMEOUT' ? 'The extension did not answer in time. Check your AI key in its settings.' : m);
      } finally {
        setBusy(false);
      }
    } else {
      setOutput(templateDraft(kind, company, jobTitle));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast('Copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy', 'error');
    }
  };

  const download = () => {
    const name = `${(company || 'draft').replace(/[^\w-]+/g, '-')}-${kind.replace('_', '-')}.md`;
    const blob = new Blob([output], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  /** Markdown passes through; plain text gets headings for short bare lines and keeps its line breaks. */
  const toPrintableMarkdown = (text: string) => {
    if (/^#{1,3} /m.test(text)) return text;
    const lines = text.split('\n');
    return lines
      .map((line, i) => {
        const prevBlank = i === 0 || lines[i - 1].trim() === '';
        const nextFull = i + 1 < lines.length && lines[i + 1].trim() !== '';
        const bare = line.trim();
        if (i === 0 && bare) return `# ${bare}`;
        if (prevBlank && nextFull && bare.length > 0 && bare.length <= 40 && !/[.:,;]$/.test(bare) && !/^[-*•]/.test(bare)) return `## ${bare}`;
        return bare === '' || /^[-*•] /.test(bare) ? line : `${line}  `;
      })
      .join('\n');
  };

  // PDF through the browser's own print engine: a clean A4 sheet in a hidden frame, then "Save as PDF".
  // ponytail: no pdf library; fonts and layout come from the print stylesheet below.
  const downloadPdf = () => {
    const title = `${company || 'Draft'} – ${current.label}`;
    const body = renderToStaticMarkup(<ReactMarkdown>{toPrintableMarkdown(output)}</ReactMarkdown>);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/</g, '&lt;')}</title><style>
      @page { size: A4; margin: 18mm 16mm; }
      body { margin: 0; color: #111; font: 10.5pt/1.45 "Helvetica Neue", Helvetica, Arial, sans-serif; }
      h1 { font-size: 17pt; margin: 0 0 2pt; letter-spacing: -0.01em; }
      h2 { font-size: 11pt; margin: 14pt 0 4pt; padding-bottom: 2pt; border-bottom: 1px solid #ccc; text-transform: uppercase; letter-spacing: 0.04em; }
      h3 { font-size: 10.5pt; margin: 8pt 0 2pt; }
      p { margin: 0 0 5pt; } ul, ol { margin: 0 0 5pt; padding-left: 14pt; } li { margin: 1.5pt 0; }
      a { color: inherit; text-decoration: none; } strong { font-weight: 600; } hr { border: 0; border-top: 1px solid #ccc; margin: 8pt 0; }
    </style></head><body>${body}</body></html>`;
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
    const win = frame.contentWindow!;
    win.onafterprint = () => frame.remove();
    setTimeout(() => { win.focus(); win.print(); }, 150);
  };

  return (
    <Page width="wide">
      <PageHeader
        title="Drafts"
        description={
          extension === false ? (
            <>
              The extension is not connected, so these are templates built from your profile.{' '}
              <Link to="/settings" className="text-primary-text underline-offset-2 hover:underline">
                Connect it
              </Link>{' '}
              to get drafts written by your AI for the specific posting.
            </>
          ) : (
            'Written by your own AI key through the extension, from your profile and the posting. Edit before you send; nothing goes to CareerAgent servers.'
          )
        }
      />
      {profileThin && (
        <p className="mb-5 rounded-md border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-foreground">
          Your profile is empty, so drafts will be generic.{' '}
          <Link to="/profile" className="font-medium text-primary-text underline-offset-2 hover:underline">
            Fill it in first.
          </Link>
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_6fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="min-w-0 space-y-4"
        >
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">What to draft</p>
            <SegmentedControl ariaLabel="Material" value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k.value, label: k.label }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
            </Field>
            <Field label="Job title">
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" />
            </Field>
          </div>
          <Field label="Job description" hint={ctx?.description ? 'Filled from the posting you opened. Edit freely.' : 'Paste the posting. The more of it, the better the draft.'}>
            <Textarea rows={12} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          {error && (
            <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" disabled={busy || !description.trim()}>
            <Sparkles className={busy ? 'animate-pulse' : ''} />
            {busy ? 'Writing' : extension ? `Write ${current.label.toLowerCase()} with AI` : `Build ${current.label.toLowerCase()} from template`}
          </Button>
        </form>

        <div className="flex min-h-[420px] min-w-0 flex-col rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              {kind === 'cold_email' ? <Mail className="size-4 text-muted-foreground" /> : <FileText className="size-4 text-muted-foreground" />}
              {current.title}
            </h2>
            {output && (
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="primary" onClick={downloadPdf}>
                  <Printer />
                  PDF
                </Button>
                <Button size="sm" onClick={download} title="Markdown source">
                  <Download />
                  .md
                </Button>
                <Button size="sm" onClick={copy}>
                  {copied ? <Check className="text-success" /> : <Copy />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>
          {busy ? (
            <div className="space-y-3 p-5" aria-busy="true">
              <div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-5/6 animate-pulse rounded-sm bg-muted" />
            </div>
          ) : output ? (
            <Textarea aria-label="Draft text" value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[380px] flex-1 rounded-none border-0 font-sans text-[15px] leading-relaxed focus:ring-0" />
          ) : (
            <p className="m-auto max-w-xs p-6 text-center text-sm text-muted-foreground">
              {kind === 'resume' ? 'A resume reordered and reworded for this posting, built only from facts in your profile.' : kind === 'cover_letter' ? 'A short, specific letter that names what in the posting matches your experience.' : 'A four-line note to a recruiter or hiring manager.'}
            </p>
          )}
        </div>
      </div>
    </Page>
  );
}
