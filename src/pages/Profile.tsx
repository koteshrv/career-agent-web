import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Sparkles, Upload, FileUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { IconButton } from '../components/ui/icon-button';
import { Field, Input, Textarea, Select } from '../components/ui/field';
import { Page, PageHeader, Section } from '../components/ui/page';
import { useToast } from '../components/ui/toast';
import { getStoredProfile, saveStoredProfile, SYNC_EVENT } from '../lib/profileStorage';
import { pingExtension, sendExtensionMessage, fileToBase64 } from '../lib/extensionBridge';
import type { CandidateProfile, WorkExperience, Education } from '../types/profile';
import { cn } from '../lib/utils';

type Filters = { roles: string; keywords: string; excludes: string; location: string };
const EMPTY_FILTERS: Filters = { roles: '', keywords: '', excludes: '', location: '' };

function readFilters(): Filters {
  try {
    const raw = localStorage.getItem('careeragent_global_filters');
    return raw ? { ...EMPTY_FILTERS, ...JSON.parse(raw) } : EMPTY_FILTERS;
  } catch {
    return EMPTY_FILTERS;
  }
}

export function Profile() {
  const [profile, setProfile] = useState<CandidateProfile>(getStoredProfile);
  const [filters, setFilters] = useState<Filters>(readFilters);
  const [dirty, setDirty] = useState(false);
  const [extensionOk, setExtensionOk] = useState<boolean | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newAccomplishment, setNewAccomplishment] = useState('');
  const toast = useToast();

  useEffect(() => {
    const load = () => {
      setProfile(getStoredProfile());
      setFilters(readFilters());
    };
    window.addEventListener(SYNC_EVENT, load);
    pingExtension().then(setExtensionOk);
    return () => window.removeEventListener(SYNC_EVENT, load);
  }, []);

  const change = <K extends keyof CandidateProfile>(field: K, value: CandidateProfile[K]) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setDirty(true);
  };
  const changeFilter = (field: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const save = async () => {
    saveStoredProfile(profile);
    localStorage.setItem('careeragent_global_filters', JSON.stringify(filters));
    setDirty(false);
    const ok = await pingExtension();
    setExtensionOk(ok);
    toast(ok ? 'Saved and synced to the extension' : 'Saved in this browser', 'success');
  };

  // Lists
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (!profile.skills.includes(s)) change('skills', [...profile.skills, s]);
    setNewSkill('');
  };
  const addAccomplishment = () => {
    const s = newAccomplishment.trim();
    if (!s) return;
    change('keyAccomplishments', [...profile.keyAccomplishments, s]);
    setNewAccomplishment('');
  };
  const addExperience = () =>
    change('experiences', [{ id: `exp_${Date.now()}`, company: '', role: '', startDate: '', endDate: '', current: false, description: '' }, ...profile.experiences]);
  const updateExperience = (id: string, updates: Partial<WorkExperience>) =>
    change('experiences', profile.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  const addEducation = () => change('education', [{ id: `edu_${Date.now()}`, institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }, ...profile.education]);
  const updateEducation = (id: string, updates: Partial<Education>) => change('education', profile.education.map((e) => (e.id === id ? { ...e, ...updates } : e)));

  const [resumeNote, setResumeNote] = useState<string | null>(null);
  const handleResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    change('resumeFileName', file.name);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => change('resumeText', String(ev.target?.result ?? ''));
      reader.readAsText(file);
      return;
    }
    if (file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
      try {
        const data = await fileToBase64(file);
        await sendExtensionMessage({ action: 'save_resume', payload: { name: file.name, type: file.type, data } }, 10_000);
        setResumeNote('Sent to the extension. It will be attached when a form asks for a resume.');
        toast('Resume sent to the extension', 'success');
      } catch {
        setResumeNote('The extension is not connected, so only the file name was kept. Attach the PDF in the extension to use it for uploads.');
      }
    } else if (file.type === 'application/pdf') {
      setResumeNote('Keep the PDF under 5 MB to let the extension attach it to applications.');
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <Page className="pb-32 md:pb-28">
      <PageHeader
        title="Profile"
        description="The extension fills applications from this. It stays in your browser and syncs only to the extension."
        actions={
          <Button onClick={() => window.dispatchEvent(new CustomEvent('open_onboarding_modal'))}>
            <FileUp />
            Import from resume
          </Button>
        }
      />

      <Section id="contact" title="Contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input value={profile.firstName} onChange={(e) => change('firstName', e.target.value)} autoComplete="given-name" />
          </Field>
          <Field label="Last name">
            <Input value={profile.lastName} onChange={(e) => change('lastName', e.target.value)} autoComplete="family-name" />
          </Field>
          <Field label="Email">
            <Input type="email" value={profile.email} onChange={(e) => change('email', e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input type="tel" value={profile.phone} onChange={(e) => change('phone', e.target.value)} autoComplete="tel" />
          </Field>
          <Field label="Location" hint="City and country, as you would type it on an application." className="sm:col-span-2">
            <Input value={profile.location} onChange={(e) => change('location', e.target.value)} autoComplete="address-level2" />
          </Field>
        </div>
      </Section>

      <Section id="links" title="Links">
        <div className="grid grid-cols-1 gap-4">
          <Field label="LinkedIn">
            <Input type="url" value={profile.linkedinUrl} onChange={(e) => change('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/…" />
          </Field>
          <Field label="GitHub">
            <Input type="url" value={profile.githubUrl} onChange={(e) => change('githubUrl', e.target.value)} placeholder="https://github.com/…" />
          </Field>
          <Field label="Portfolio or website">
            <Input type="url" value={profile.portfolioUrl} onChange={(e) => change('portfolioUrl', e.target.value)} placeholder="https://" />
          </Field>
        </div>
      </Section>

      <Section id="authorization" title="Work authorization" description="Used to answer the sponsorship and eligibility questions on application forms.">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Status">
            <Select value={profile.workAuthorization} onChange={(e) => change('workAuthorization', e.target.value as CandidateProfile['workAuthorization'])}>
              <option value="US_CITIZEN">US citizen</option>
              <option value="PERMANENT_RESIDENT">Permanent resident</option>
              <option value="STUDENT_VISA">Student visa (F-1 / OPT)</option>
              <option value="NEED_SPONSORSHIP">Need sponsorship</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3.5 cursor-pointer">
            <input type="checkbox" checked={profile.requiresSponsorship} onChange={(e) => change('requiresSponsorship', e.target.checked)} className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="block text-base font-medium text-foreground">I will need visa sponsorship</span>
              <span className="block text-sm text-muted-foreground">Now or in the future.</span>
            </span>
          </label>
        </div>
      </Section>

      <Section
        id="experience"
        title="Experience"
        actions={
          <Button size="sm" onClick={addExperience}>
            <Plus />
            Add role
          </Button>
        }
      >
        {profile.experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground">No roles yet. Add the two or three that matter most for the jobs you want.</p>
        ) : (
          <ul className="space-y-4">
            {profile.experiences.map((exp) => (
              <li key={exp.id} className="rounded-md border border-border bg-card p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Company">
                    <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} />
                  </Field>
                  <Field label="Title">
                    <Input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} />
                  </Field>
                  <Field label="Start">
                    <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} />
                  </Field>
                  <Field label="End">
                    <Input type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2 cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} className="size-4 accent-primary" />
                    I currently work here
                  </label>
                  <Field label="What you did" hint="Two or three lines. The extension uses this to answer open questions." className="sm:col-span-2">
                    <Textarea rows={3} value={exp.description} onChange={(e) => updateExperience(exp.id, { description: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="danger" onClick={() => change('experiences', profile.experiences.filter((e) => e.id !== exp.id))}>
                    <Trash2 />
                    Remove role
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="education"
        title="Education"
        actions={
          <Button size="sm" onClick={addEducation}>
            <Plus />
            Add school
          </Button>
        }
      >
        {profile.education.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schools yet.</p>
        ) : (
          <ul className="space-y-4">
            {profile.education.map((edu) => (
              <li key={edu.id} className="rounded-md border border-border bg-card p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="School" className="sm:col-span-2">
                    <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
                  </Field>
                  <Field label="Degree">
                    <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="BS" />
                  </Field>
                  <Field label="Field of study">
                    <Input value={edu.fieldOfStudy} onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })} placeholder="Computer Science" />
                  </Field>
                  <Field label="Graduation year">
                    <Input inputMode="numeric" value={edu.graduationYear} onChange={(e) => updateEducation(edu.id, { graduationYear: e.target.value })} placeholder="2019" />
                  </Field>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="danger" onClick={() => change('education', profile.education.filter((e) => e.id !== edu.id))}>
                    <Trash2 />
                    Remove school
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="summary" title="Summary and skills" description="Short and specific. This is what the extension draws on when a form asks an open question.">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Headline" hint="One line, the way you would introduce yourself.">
            <Input value={profile.headline} onChange={(e) => change('headline', e.target.value)} placeholder="Backend engineer, distributed systems" />
          </Field>
          <Field label="Summary">
            <Textarea rows={4} value={profile.summary} onChange={(e) => change('summary', e.target.value)} />
          </Field>
          <div>
            <Field label="Skills" hint="Press Enter to add.">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Go"
              />
            </Field>
            {profile.skills.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
                {profile.skills.map((s) => (
                  <li key={s} className="inline-flex h-7 items-center gap-1 rounded-sm bg-muted pl-2.5 pr-1 text-sm font-medium text-foreground">
                    {s}
                    <IconButton label={`Remove ${s}`} size="sm" className="h-5 w-5" onClick={() => change('skills', profile.skills.filter((x) => x !== s))}>
                      <X className="size-3.5" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Field label="Accomplishments" hint="Concrete outcomes with numbers. Press Enter to add.">
              <Input
                value={newAccomplishment}
                onChange={(e) => setNewAccomplishment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAccomplishment();
                  }
                }}
                placeholder="Cut p99 checkout latency 40%"
              />
            </Field>
            {profile.keyAccomplishments.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-card">
                {profile.keyAccomplishments.map((a, i) => (
                  <li key={`${a}-${i}`} className="flex items-start justify-between gap-2 px-3 py-2 text-sm text-foreground">
                    <span>{a}</span>
                    <IconButton label="Remove accomplishment" size="sm" onClick={() => change('keyAccomplishments', profile.keyAccomplishments.filter((_, j) => j !== i))}>
                      <X />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      <Section id="resume" title="Resume">
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-border-strong bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-medium text-foreground">{profile.resumeFileName || 'No resume attached'}</p>
            <p className="text-sm text-muted-foreground">{resumeNote || 'A PDF is handed to the extension, which attaches it when a form asks for a resume. Nothing leaves your browser.'}</p>
          </div>
          <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm border border-border-strong bg-card px-3.5 text-base font-medium text-foreground hover:bg-muted">
            <Upload className="size-4" />
            {profile.resumeFileName ? 'Replace' : 'Attach'}
            <input type="file" accept=".pdf,.txt" onChange={handleResume} className="sr-only" />
          </label>
        </div>
      </Section>

      <Section
        id="search-defaults"
        title="Search defaults"
        description="Applied to the Jobs feed whenever you have no keywords of your own. Importing a resume fills these too."
        actions={
          <Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open_onboarding_modal'))}>
            <Sparkles />
            Fill from resume
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Target roles" hint="Comma-separated.">
            <Input value={filters.roles} onChange={(e) => changeFilter('roles', e.target.value)} placeholder="Backend Engineer, Platform Engineer" />
          </Field>
          <Field label="Keywords to prioritise" hint="Comma-separated.">
            <Input value={filters.keywords} onChange={(e) => changeFilter('keywords', e.target.value)} placeholder="Go, Postgres" />
          </Field>
          <Field label="Exclude" hint="Postings containing these are hidden.">
            <Input value={filters.excludes} onChange={(e) => changeFilter('excludes', e.target.value)} placeholder="Junior, Intern" />
          </Field>
          <Field label="Location">
            <Input value={filters.location} onChange={(e) => changeFilter('location', e.target.value)} placeholder="Remote" />
          </Field>
        </div>
      </Section>

      {/* Save bar */}
      <div className={cn('fixed inset-x-0 bottom-14 z-20 border-t border-border bg-card/95 backdrop-blur md:bottom-0')}>
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {dirty ? 'Unsaved changes' : !fullName && !profile.email ? 'Nothing saved yet' : extensionOk === null ? fullName : extensionOk ? 'Saved · synced to extension' : 'Saved in this browser · extension not connected'}
          </p>
          <Button variant="primary" onClick={save} disabled={!dirty}>
            Save
          </Button>
        </div>
      </div>
    </Page>
  );
}
