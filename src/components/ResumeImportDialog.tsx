import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from './ui/toast';
import { fileToBase64, sendExtensionMessage, type ResumeImport } from '../lib/extensionBridge';
import { getStoredProfile, saveStoredProfile, SYNC_EVENT } from '../lib/profileStorage';
import { addLog, type ApiLog } from '../lib/logger';
import type { CandidateProfile } from '../types/profile';
import { cn } from '../lib/utils';

const SCALAR_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'location', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'headline', 'summary', 'resumeText'] as const;

/** Fills empty fields by default; with overwrite, incoming values win wherever they exist. */
export function mergeProfile(current: CandidateProfile, incoming: Partial<CandidateProfile>, overwrite: boolean): CandidateProfile {
  const next: CandidateProfile = { ...current };
  for (const f of SCALAR_FIELDS) {
    const v = incoming[f];
    if (typeof v === 'string' && v.trim() && (overwrite || !current[f])) next[f] = v;
  }
  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
  if (incoming.skills?.length) next.skills = overwrite ? incoming.skills : union(current.skills, incoming.skills);
  if (incoming.keyAccomplishments?.length) next.keyAccomplishments = overwrite ? incoming.keyAccomplishments : union(current.keyAccomplishments, incoming.keyAccomplishments);
  if (incoming.experiences?.length && (overwrite || current.experiences.length === 0)) next.experiences = incoming.experiences;
  if (incoming.education?.length && (overwrite || current.education.length === 0)) next.education = incoming.education;
  return next;
}

export function ResumeImportDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeImport | null>(null);
  const [applyProfile, setApplyProfile] = useState(true);
  const [applyFilters, setApplyFilters] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const onOpen = () => {
      setResult(null);
      setError(null);
      setFileName(null);
      setOverwrite(false);
      setOpen(true);
    };
    window.addEventListener('open_onboarding_modal', onOpen);
    return () => window.removeEventListener('open_onboarding_modal', onOpen);
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    setError(null);
    try {
      const fileData = await fileToBase64(file);
      const res = await sendExtensionMessage<ResumeImport>({ action: 'parse_resume', payload: { fileName: file.name, fileData } }, 120_000);
      setResult({ profile: { ...res.profile, resumeFileName: file.name }, filters: res.filters });
      addLog({
        endpoint: 'Extension background worker → your AI provider',
        action: 'Resume import',
        timestamp: new Date().toISOString(),
        status: 200,
        meta: (res as { meta?: ApiLog['meta'] }).meta,
        requestBody: { fileName: file.name, fileSizeKb: Math.round(file.size / 1024), operation: 'Extract profile and search defaults from the PDF' },
        responseBody: res,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message === 'EXTENSION_NOT_INSTALLED'
          ? 'The extension is not connected. Install it, or check the Extension ID in Settings, then try again.'
          : message === 'EXTENSION_TIMEOUT'
          ? 'The extension did not answer in time. Check your AI key in the extension settings and retry.'
          : message
      );
      addLog({ endpoint: 'Extension background worker', action: 'Resume import', timestamp: new Date().toISOString(), status: 500, requestBody: { fileName: file.name }, responseBody: { error: message } });
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const apply = () => {
    if (!result) return;
    if (applyProfile) saveStoredProfile(mergeProfile(getStoredProfile(), result.profile, overwrite));
    if (applyFilters) localStorage.setItem('careeragent_global_filters', JSON.stringify(result.filters));
    localStorage.setItem('careeragent_onboarded', 'true');
    window.dispatchEvent(new Event(SYNC_EVENT));
    toast('Profile updated from your resume', 'success');
    setOpen(false);
  };

  const p = result?.profile;
  const current = getStoredProfile();
  const hasExisting = Boolean(current.firstName || current.email || current.experiences.length);
  const found: Array<[string, string]> = p
    ? [
        ['Name', [p.firstName, p.lastName].filter(Boolean).join(' ')],
        ['Email', p.email || ''],
        ['Phone', p.phone || ''],
        ['Location', p.location || ''],
        ['Headline', p.headline || ''],
        ['Roles', p.experiences?.length ? `${p.experiences.length} (${p.experiences.slice(0, 2).map((e) => e.company).filter(Boolean).join(', ')}${p.experiences.length > 2 ? ', …' : ''})` : ''],
        ['Education', p.education?.length ? `${p.education.length}` : ''],
        ['Skills', p.skills?.length ? `${p.skills.length} (${p.skills.slice(0, 5).join(', ')}${p.skills.length > 5 ? ', …' : ''})` : ''],
        ['Search defaults', result?.filters.roles || result?.filters.keywords || ''],
      ].filter(([, v]) => v) as Array<[string, string]>
    : [];

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title={result ? 'Review what was found' : 'Import your resume'}
      description={
        result
          ? 'Nothing is saved until you apply. Fields you already filled are kept unless you choose to replace them.'
          : 'The extension sends the PDF to the AI provider you configured and returns your profile and search defaults. Nothing goes to CareerAgent servers.'
      }
      size="lg"
      footer={
        result ? (
          <>
            <Button onClick={() => setResult(null)}>Choose another file</Button>
            <Button variant="primary" onClick={apply} disabled={!applyProfile && !applyFilters}>
              Apply to profile
            </Button>
          </>
        ) : (
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        )
      }
    >
      {!result ? (
        <>
          <label
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors',
              busy ? 'border-primary/50 bg-primary-soft/60' : 'border-border-strong bg-card hover:bg-muted'
            )}
          >
            {fileName && !error ? <FileText className="size-7 text-muted-foreground" /> : <Upload className="size-7 text-muted-foreground" />}
            <span className="text-base font-medium text-foreground">{busy ? 'Reading your resume' : fileName && !error ? fileName : 'Choose a PDF resume'}</span>
            <span className="text-sm text-muted-foreground">{busy ? 'This usually takes 15 to 45 seconds.' : 'Up to 5 MB. Gemini, OpenAI or Claude keys can read PDFs.'}</span>
            <input type="file" accept=".pdf" onChange={handleFile} disabled={busy} className="sr-only" />
          </label>
          {error && (
            <p role="alert" className="mt-3 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}{' '}
              <Link to="/settings" className="underline underline-offset-2" onClick={() => setOpen(false)}>
                Open settings
              </Link>
            </p>
          )}
        </>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 rounded-md border border-border bg-muted/40 p-4 text-sm sm:grid-cols-2">
            {found.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-medium text-foreground" title={v}>
                  {v}
                </dd>
              </div>
            ))}
            {found.length === 0 && <p className="text-muted-foreground sm:col-span-2">The AI returned no usable fields. Try a text-based PDF rather than a scan.</p>}
          </dl>
          <fieldset className="space-y-2.5">
            <legend className="mb-1 text-sm font-medium text-foreground">Apply to</legend>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={applyProfile} onChange={(e) => setApplyProfile(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span className="text-base text-foreground">
                Profile
                <span className="block text-sm text-muted-foreground">Contact, links, experience, education, skills and summary.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={applyFilters} onChange={(e) => setApplyFilters(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span className="text-base text-foreground">
                Search defaults
                <span className="block text-sm text-muted-foreground">Target roles, keywords and exclusions for the Jobs feed.</span>
              </span>
            </label>
            {hasExisting && (
              <label className="flex items-start gap-3 cursor-pointer border-t border-border pt-3">
                <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
                <span className="text-base text-foreground">
                  Replace fields I already filled
                  <span className="block text-sm text-muted-foreground">Off: only empty fields are filled and lists are merged.</span>
                </span>
              </label>
            )}
          </fieldset>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" />
            Work authorization and sponsorship are never inferred. Set them yourself.
          </p>
        </div>
      )}
    </Dialog>
  );
}
