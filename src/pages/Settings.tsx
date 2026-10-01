import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Trash2, RefreshCw, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Field, Input } from '../components/ui/field';
import { Dialog } from '../components/ui/dialog';
import { SegmentedControl } from '../components/ui/segmented';
import { Page, PageHeader, Section } from '../components/ui/page';
import { useToast } from '../components/ui/toast';
import { getStoredProfile, getStoredApplications, hydrateFromExtension } from '../lib/profileStorage';
import { pingExtension, getExtensionId, setExtensionIdOverride } from '../lib/extensionBridge';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [detected, setDetected] = useState<boolean | null>(null);
  const [extensionId, setExtensionId] = useState(getExtensionId);
  const [checking, setChecking] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('careeragent_api_url') || '');
  const [telemetry, setTelemetry] = useState(() => localStorage.getItem('careeragent_telemetry') !== 'false');
  const profile = getStoredProfile();
  const applications = getStoredApplications();

  const check = async () => {
    setChecking(true);
    const ok = await pingExtension();
    setDetected(ok);
    if (ok) await hydrateFromExtension();
    setChecking(false);
    return ok;
  };

  useEffect(() => {
    let cancelled = false;
    pingExtension().then((ok) => {
      if (!cancelled) setDetected(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [extensionId]);

  return (
    <Page>
      <PageHeader title="Settings" />

      <Section
        id="extension"
        title="Browser extension"
        description="The extension parses your resume, fills applications and tracks them. This dashboard talks to it over a private channel."
        panel
        actions={
          <span
            className={cn(
              'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 text-sm font-medium',
              detected ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'
            )}
          >
            <span aria-hidden="true" className={cn('size-2 rounded-full', detected ? 'bg-success' : 'bg-muted-foreground')} />
            {detected === null ? 'Checking' : detected ? 'Connected' : 'Not connected'}
          </span>
        }
      >
        <div className="space-y-4">
          <Field label="Extension ID" hint="Pre-filled for the Web Store build. Change it only for an unpacked development build; the id is on chrome://extensions.">
            <Input
              value={extensionId}
              spellCheck={false}
              onChange={(e) => {
                setExtensionIdOverride(e.target.value);
                setExtensionId(e.target.value.trim());
              }}
              placeholder="32 lowercase letters"
              className="font-mono"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={async () => {
                const ok = await check();
                toast(ok ? 'Extension connected. Profile and pipeline synced.' : 'Extension not reachable. Is it installed, and is the id right?', ok ? 'success' : 'error');
              }}
              disabled={checking}
            >
              <RefreshCw className={checking ? 'animate-spin' : ''} />
              {detected ? 'Sync now' : 'Check connection'}
            </Button>
            {!detected && (
              <Button asChild variant="link">
                <a href="https://github.com/koteshrv/career-agent-extension" target="_blank" rel="noreferrer">
                  Get the extension
                  <ExternalLink />
                </a>
              </Button>
            )}
          </div>
        </div>
      </Section>

      <Section id="appearance" title="Appearance">
        <SegmentedControl
          ariaLabel="Theme"
          value={theme}
          onChange={(v) => setTheme(v)}
          options={[
            { value: 'system', label: <span className="inline-flex items-center gap-1.5"><Monitor className="size-4" />System</span> },
            { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun className="size-4" />Light</span> },
            { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon className="size-4" />Dark</span> },
          ]}
        />
      </Section>

      <Section id="data" title="Your data" description="Everything lives in this browser and in the extension. Nothing identifying is sent to our servers.">
        <dl className="grid grid-cols-2 gap-4 rounded-md border border-border bg-card p-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Profile</dt>
            <dd className="font-medium text-foreground">{profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Empty'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pipeline</dt>
            <dd className="font-medium text-foreground">
              {applications.length} {applications.length === 1 ? 'job' : 'jobs'}
            </dd>
          </div>
        </dl>
        <label className="mt-4 flex items-start gap-3 rounded-md border border-border bg-card p-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={telemetry}
            onChange={(e) => {
              setTelemetry(e.target.checked);
              localStorage.setItem('careeragent_telemetry', e.target.checked.toString());
            }}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="block text-base font-medium text-foreground">Share anonymous application outcomes</span>
            <span className="block text-sm text-muted-foreground">Response times and ghosting rates by company, with no names, resumes or notes. Helps everyone spot dead postings.</span>
          </span>
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/settings/activity">View AI activity log</Link>
          </Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            <Trash2 />
            Clear local data
          </Button>
        </div>
      </Section>

      <Section id="advanced" title="Advanced" description="Self-hosting the backend? Point the dashboard at it.">
        <Field label="API base URL" hint="Leave empty to use api.careeragent.fyi. Takes effect after reload.">
          <Input
            value={apiUrl}
            onChange={(e) => {
              setApiUrl(e.target.value);
              if (e.target.value.trim()) localStorage.setItem('careeragent_api_url', e.target.value.trim());
              else localStorage.removeItem('careeragent_api_url');
            }}
            placeholder="http://localhost:8000"
            className="font-mono"
          />
        </Field>
      </Section>

      <Section id="about" title="About">
        <ul className="space-y-1.5 text-sm">
          <li>
            <a className="text-primary-text underline-offset-2 hover:underline" href="https://github.com/koteshrv/career-agent" target="_blank" rel="noreferrer">
              CareerAgent on GitHub
            </a>
          </li>
          <li>
            <a className="text-primary-text underline-offset-2 hover:underline" href="https://github.com/koteshrv/career-agent-extension" target="_blank" rel="noreferrer">
              Extension source
            </a>
          </li>
          <li>
            <a className="text-primary-text underline-offset-2 hover:underline" href="https://github.com/koteshrv/career-agent-web" target="_blank" rel="noreferrer">
              Dashboard source
            </a>
          </li>
        </ul>
      </Section>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear local data?"
        description="Your profile and pipeline will be removed from this browser. The extension keeps its own copy until you clear it there."
        size="sm"
        footer={
          <>
            <Button onClick={() => setConfirmClear(false)}>Keep</Button>
            <Button
              variant="danger"
              onClick={() => {
                localStorage.removeItem('careeragent_candidate_profile');
                localStorage.removeItem('careeragent_tracked_applications');
                localStorage.removeItem('careeragent_global_filters');
                localStorage.removeItem('careeragent_onboarded');
                window.location.reload();
              }}
            >
              Clear
            </Button>
          </>
        }
      >
        <span className="sr-only">Confirm</span>
      </Dialog>
    </Page>
  );
}
