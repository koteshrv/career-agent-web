import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Check, Sparkles, FileText, Mail, Download, RefreshCw, Upload, Columns2 } from 'lucide-react';
import { diffResumes } from '../lib/resumeDiff';
import { Button } from '../components/ui/button';
import { Field, Input, Textarea, Select } from '../components/ui/field';
import { SegmentedControl } from '../components/ui/segmented';
import { Page, PageHeader } from '../components/ui/page';
import { useToast } from '../components/ui/toast';
import { getStoredProfile } from '../lib/profileStorage';
import { sendExtensionMessage, type MaterialKind, type MaterialResult, type ResumeMeta } from '../lib/extensionBridge';
import { useExtensionStatus } from '../lib/useExtensionStatus';
import { addLog } from '../lib/logger';
import { cn } from '../lib/utils';

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
  const [pdf, setPdf] = useState<string | null>(null);
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [view, setView] = useState<'preview' | 'source' | 'compare'>('preview');
  const [baseText, setBaseText] = useState<string | null>(null);
  const [basePdf, setBasePdf] = useState<string | null>(null);
  const [sideBySide, setSideBySide] = useState(false);
  const [baseCompiling, setBaseCompiling] = useState(false);
  // Text resumes stored in the extension can be the base: a .tex one becomes the template, .md/.txt add facts.
  const [bases, setBases] = useState<ResumeMeta[]>([]);
  const [baseId, setBaseId] = useState('');
  useEffect(() => {
    if (!extension) return;
    let alive = true;
    sendExtensionMessage<ResumeMeta[]>({ action: 'list_resumes' }, 4000).then((list) => alive && setBases(list.filter((r) => r.kind !== 'pdf'))).catch(() => undefined);
    return () => { alive = false; };
  }, [extension]);
  const profile = getStoredProfile();
  const current = KINDS.find((k) => k.value === kind)!;
  const isResume = kind === 'resume';

  // Compare: the chosen base resume's source, or the plain profile facts when drafting from our template.
  useEffect(() => {
    setBasePdf(null);
    setSideBySide(false);
    if (!baseId || !extension) { setBaseText(null); return; }
    let alive = true;
    sendExtensionMessage<{ text?: string }>({ action: 'get_resume', payload: { id: baseId } }, 8000).then((r) => alive && setBaseText(r.text ?? null)).catch(() => alive && setBaseText(null));
    return () => { alive = false; };
  }, [baseId, extension]);
  const baseKind = bases.find((b) => b.id === baseId)?.kind;
  const compareAgainst = baseText ?? templateDraft('resume', company, jobTitle);
  const diff = useMemo(() => (isResume && output ? diffResumes(compareAgainst, output) : []), [isResume, output, compareAgainst]);
  const basePdfUrl = useMemo(() => (basePdf ? URL.createObjectURL(new Blob([Uint8Array.from(atob(basePdf), (c) => c.charCodeAt(0))], { type: 'application/pdf' })) : null), [basePdf]);
  useEffect(() => () => { if (basePdfUrl) URL.revokeObjectURL(basePdfUrl); }, [basePdfUrl]);
  const showSideBySide = async () => {
    setSideBySide(true);
    if (basePdf || !baseText || baseKind !== 'tex') return;
    setBaseCompiling(true);
    try {
      const res = await sendExtensionMessage<{ pdf: string | null }>({ action: 'compile_latex', payload: { tex: baseText } }, 300_000);
      setBasePdf(res.pdf);
    } catch {
      setBasePdf(null);
    } finally {
      setBaseCompiling(false);
    }
  };

  // One object URL per compiled PDF; revoked when it changes or the page unmounts.
  const pdfUrl = useMemo(() => (pdf ? URL.createObjectURL(new Blob([Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0))], { type: 'application/pdf' })) : null), [pdf]);
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);
  const profileThin = !profile.firstName && profile.experiences.length === 0 && profile.skills.length === 0;

  useEffect(() => {
    const k = params.get('kind') as MaterialKind | null;
    if (k && KINDS.some((x) => x.value === k)) setKind(k);
  }, [params]);

  const generate = async () => {
    setError(null);
    setCopied(false);
    setPdf(null);
    setCompileLog(null);
    if (extension) {
      setBusy(true);
      try {
        const res = await sendExtensionMessage<MaterialResult>({ action: 'generate_material', payload: { kind, baseResumeId: baseId || undefined, job: { title: jobTitle, company, description } } }, 300_000);
        setOutput(res.text);
        setPdf(res.pdf ?? null);
        setCompileLog(res.pdf ? null : res.log ?? null);
        setView(res.pdf ? 'preview' : 'source');
        addLog({
          endpoint: 'Extension background worker → your AI provider',
          action: `Draft: ${current.label}`,
          timestamp: new Date().toISOString(),
          status: 200,
          meta: res.meta,
          requestBody: { kind, company, title: jobTitle, description, profile: { name: `${profile.firstName} ${profile.lastName}`.trim(), skills: profile.skills.length, experiences: profile.experiences.length } },
          responseBody: { chars: res.text.length, pdfBytes: res.pdf ? Math.round((res.pdf.length * 3) / 4) : 0, compileLog: res.log, text: res.text },
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

  /** Turns pdfTeX's "File `x.sty' not found" into one plain sentence; the raw log stays underneath. */
  const explainLog = (log: string | null) => {
    const m = log?.match(/File `([^']+)' not found/);
    if (m) return `This resume needs ${m[1]}, which the extension's built-in TeX Live does not include. Use a template built on the bundled packages, or ask for it to be added.`;
    const u = log?.match(/Undefined control sequence\.\s*\n\s*l\.(\d+)\s+(\\\S+)/);
    if (u) return `Line ${u[1]}: ${u[2]} is not defined. Fix it in the LaTeX tab and recompile.`;
    return null;
  };

  const recompile = async () => {
    setCompiling(true);
    try {
      const res = await sendExtensionMessage<{ pdf: string | null; log?: string }>({ action: 'compile_latex', payload: { tex: output } }, 300_000);
      setPdf(res.pdf);
      setCompileLog(res.pdf ? null : res.log ?? 'LaTeX failed with no log.');
      if (res.pdf) setView('preview');
    } catch (e: unknown) {
      setCompileLog(e instanceof Error ? e.message : String(e));
    } finally {
      setCompiling(false);
    }
  };

  const saveFile = (data: Blob | string, name: string) => {
    const a = document.createElement('a');
    a.href = typeof data === 'string' ? data : URL.createObjectURL(data);
    a.download = name;
    a.click();
    if (typeof data !== 'string') setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const fileStem = `${(company || 'draft').replace(/[^\w-]+/g, '-')}-${kind.replace('_', '-')}`;

  const useForUploads = async () => {
    if (!pdf) return;
    try {
      await sendExtensionMessage({ action: 'save_resume', payload: { name: `${fileStem}.pdf`, type: 'application/pdf', data: pdf } });
      toast('The extension will upload this resume when a form asks for one', 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    }
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
          {extension && bases.length > 0 && (
            <Field label="Base" hint="Your own LaTeX resume keeps its layout; Markdown or text adds facts the profile may lack.">
              <Select value={baseId} onChange={(e) => setBaseId(e.target.value)}>
                <option value="">CareerAgent template</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
          )}
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
                {isResume ? (
                  <>
                    {pdfUrl && (
                      <Button size="sm" variant="primary" onClick={() => saveFile(pdfUrl, `${fileStem}.pdf`)}>
                        <Download />
                        PDF
                      </Button>
                    )}
                    {pdf && extension && (
                      <Button size="sm" onClick={useForUploads} title="Attach this PDF when the extension autofills an application">
                        <Upload />
                        Use for uploads
                      </Button>
                    )}
                    <Button size="sm" onClick={() => saveFile(new Blob([output], { type: 'application/x-tex' }), `${fileStem}.tex`)} title="LaTeX source">
                      <Download />
                      .tex
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={download} title="Markdown source">
                    <Download />
                    .md
                  </Button>
                )}
                <Button size="sm" onClick={copy}>
                  {copied ? <Check className="text-success" /> : <Copy />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>
          {isResume && output && !busy && (
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
              <SegmentedControl
                size="sm"
                ariaLabel="Resume view"
                value={view}
                onChange={setView}
                options={[
                  { value: 'preview', label: 'Preview' },
                  { value: 'source', label: 'LaTeX' },
                  { value: 'compare', label: 'Compare' },
                ]}
              />
              {view === 'compare' && baseKind === 'tex' && pdfUrl && (
                <Button size="sm" variant={sideBySide ? 'primary' : 'secondary'} onClick={sideBySide ? () => setSideBySide(false) : showSideBySide} disabled={baseCompiling}>
                  <Columns2 />
                  {baseCompiling ? 'Compiling base' : sideBySide ? 'Show changes' : 'Side by side'}
                </Button>
              )}
              {view === 'source' && (
                <Button size="sm" onClick={recompile} disabled={compiling || !extension}>
                  <RefreshCw className={compiling ? 'animate-spin' : ''} />
                  {compiling ? 'Compiling' : 'Recompile'}
                </Button>
              )}
            </div>
          )}
          {busy ? (
            <div className="space-y-3 p-5" aria-busy="true">
              <div className="h-4 w-1/2 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-muted" />
              <div className="h-3.5 w-5/6 animate-pulse rounded-sm bg-muted" />
            </div>
          ) : output && isResume && view === 'compare' ? (
            sideBySide ? (
              <div className="grid flex-1 grid-cols-2 gap-px bg-border">
                <div className="flex min-h-[720px] flex-col bg-card">
                  <p className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">Your resume</p>
                  {basePdfUrl ? <iframe title="Original resume" src={`${basePdfUrl}#toolbar=0&view=FitH`} className="flex-1 w-full bg-white" /> : <p className="m-auto p-6 text-sm text-muted-foreground">{baseCompiling ? 'Compiling your resume' : 'Your resume did not compile.'}</p>}
                </div>
                <div className="flex min-h-[720px] flex-col bg-card">
                  <p className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">Tailored for {company || 'this job'}</p>
                  {pdfUrl && <iframe title="Tailored resume" src={`${pdfUrl}#toolbar=0&view=FitH`} className="flex-1 w-full bg-white" />}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <p className="sticky top-0 border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground">
                  {baseText ? `Against ${bases.find((b) => b.id === baseId)?.name}` : 'Against the facts in your profile'} ·{' '}
                  <span className="text-success">{diff.filter((d) => d.kind === 'added').length} added</span> ·{' '}
                  <span className="text-destructive">{diff.filter((d) => d.kind === 'removed').length} removed</span> · {diff.filter((d) => d.kind === 'same').length} kept
                </p>
                <ol className="p-2 font-sans text-sm leading-relaxed">
                  {diff.map((d, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex gap-2 rounded-xs px-2 py-0.5',
                        d.kind === 'added' && 'bg-tint-green text-foreground',
                        d.kind === 'removed' && 'bg-tint-pink text-muted-foreground line-through decoration-destructive/60',
                        d.kind === 'same' && 'text-muted-foreground'
                      )}
                    >
                      <span aria-hidden="true" className="w-3 shrink-0 select-none text-center">{d.kind === 'added' ? '+' : d.kind === 'removed' ? '−' : ''}</span>
                      <span className="sr-only">{d.kind === 'added' ? 'Added: ' : d.kind === 'removed' ? 'Removed: ' : ''}</span>
                      <span className="min-w-0 break-words">{d.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          ) : output && isResume && view === 'preview' ? (
            pdfUrl ? (
              <iframe title="Resume preview" src={`${pdfUrl}#toolbar=0&view=FitH`} className="min-h-[720px] flex-1 w-full bg-white" />
            ) : (
              <div className="p-5 text-sm">
                <p className="font-medium text-destructive">LaTeX did not compile.</p>
                <p className="mt-1 text-muted-foreground">{explainLog(compileLog) ?? 'Fix the source and recompile, or regenerate the draft.'}</p>
                {compileLog && (
                  <Button size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(compileLog).then(() => toast('Log copied', 'success'))}>
                    <Copy />
                    Copy log
                  </Button>
                )}
                {compileLog && <pre className="mt-3 max-h-72 overflow-auto rounded-sm border border-border bg-muted p-3 font-mono text-xs leading-relaxed">{compileLog}</pre>}
              </div>
            )
          ) : output ? (
            <>
              <Textarea aria-label={isResume ? 'LaTeX source' : 'Draft text'} value={output} onChange={(e) => setOutput(e.target.value)} className={cn('min-h-[380px] flex-1 rounded-none border-0 leading-relaxed focus:ring-0', isResume ? 'font-mono text-xs' : 'font-sans text-[15px]')} />
              {isResume && compileLog && (
                <div className="border-t border-border bg-muted">
                  <div className="flex items-center justify-between px-3 pt-2">
                    <span className="text-xs font-medium text-destructive">{explainLog(compileLog) ?? 'pdfTeX log'}</span>
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(compileLog).then(() => toast('Log copied', 'success'))}>
                      <Copy />
                      Copy log
                    </Button>
                  </div>
                  <pre className="max-h-48 overflow-auto p-3 font-mono text-xs leading-relaxed text-destructive select-text">{compileLog}</pre>
                </div>
              )}
            </>
          ) : (
            <p className="m-auto max-w-xs p-6 text-center text-sm text-muted-foreground">
              {kind === 'resume' ? 'A one-page LaTeX resume reordered and reworded for this posting, typeset by the extension and built only from facts in your profile.' : kind === 'cover_letter' ? 'A short, specific letter that names what in the posting matches your experience.' : 'A four-line note to a recruiter or hiring manager.'}
            </p>
          )}
        </div>
      </div>
    </Page>
  );
}
