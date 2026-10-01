import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Puzzle, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getStoredProfile, getStoredApplications, broadcastSync } from '../lib/profileStorage';
import { useTheme } from '../components/ThemeProvider';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [extensionDetected, setExtensionDetected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const profile = getStoredProfile();
  const applications = getStoredApplications();

  // Test extension connection via window.postMessage
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === 'CAREERAGENT_EXTENSION') {
        setExtensionDetected(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // Broadcast a ping
    window.postMessage({ source: 'CAREERAGENT_WEB', type: 'PING' }, '*');

    // If no response after 1.5s, mark as not detected
    timeout = setTimeout(() => {
      if (extensionDetected === null) {
        setExtensionDetected(false);
      }
    }, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [extensionDetected]);

  const handleTestSync = () => {
    setIsSyncing(true);
    setSyncStatus(null);
    broadcastSync('SYNC_PROFILE', profile);
    broadcastSync('SYNC_APPLICATIONS', applications);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Sync broadcast dispatched successfully!');
      setTimeout(() => setSyncStatus(null), 3000);
    }, 600);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear your local profile and tracked applications? This cannot be undone.')) {
      localStorage.removeItem('careeragent_candidate_profile');
      localStorage.removeItem('careeragent_tracked_applications');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background px-4 sm:px-6 py-6 pb-20">
      <div className="container mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your CareerAgent connection, backend architecture, and community telemetry.
          </p>
        </div>

        {/* Appearance & Interface Theme */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Interface Appearance
                </h3>
                <p className="text-xs text-muted-foreground">
                  Switch between Dark Mode (Linear cool palette), Light Mode, or follow System preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`h-9 px-4 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark Mode (Linear)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`h-9 px-4 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`h-9 px-4 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>System Default</span>
            </button>
          </div>
        </div>

        {/* Extension Status Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Puzzle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Browser Extension Engine
                </h3>
                <p className="text-xs text-muted-foreground">
                  The local execution engine that handles DOM scraping and ATS autofill.
                </p>
              </div>
            </div>

            <div>
              {extensionDetected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border">
                  Not Detected
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-muted-foreground">
              {extensionDetected
                ? 'Your web app syncs in real-time with the extension via postMessage.'
                : 'Install the open-source extension to unlock automated job captures.'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSync}
                disabled={isSyncing}
                className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Test Sync
              </Button>
            </div>
          </div>
          {syncStatus && <p className="text-xs text-emerald-600 font-medium">{syncStatus}</p>}
        </div>

        {/* Global Agent Intelligence & Filters (Seeded by AI Onboarding) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Global Search Profile (AI Seeded)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Default roles, keywords, and exclusions applied to your search feeds.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('open_onboarding_modal'))}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs gap-1.5 font-semibold cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Run Onboarding Setup
            </Button>
          </div>

          <div className="pt-2 border-t border-border/60 text-xs space-y-2">
            {(() => {
              const raw = localStorage.getItem('careeragent_global_filters');
              if (!raw) {
                return (
                  <p className="text-muted-foreground italic">
                    No default filters configured yet. Click "Run Onboarding Setup" to seed from your resume or set them manually.
                  </p>
                );
              }
              try {
                const filters = JSON.parse(raw);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">Target Roles:</span>
                      <p className="text-muted-foreground">{filters.roles || 'None specified'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">Keywords:</span>
                      <p className="text-muted-foreground">{filters.keywords || 'None specified'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">Exclusions:</span>
                      <p className="text-muted-foreground">{filters.excludes || 'None specified'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="font-semibold text-foreground text-[11px]">Default Location:</span>
                      <p className="text-muted-foreground">{filters.location || 'Anywhere'}</p>
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
          </div>
        </div>

        {/* Bring Your Own Backend (BYOB) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
            Advanced: API Configuration (BYOB)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By default, public users connect to the central CareerAgent API. Self-hosted users running the Python backend container can override this to route heavy compute tasks locally.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-xs font-medium text-foreground">Backend API URL</label>
            <input 
              type="text" 
              defaultValue={localStorage.getItem('careeragent_api_url') || 'https://api.careeragent.fyi'}
              onChange={(e) => localStorage.setItem('careeragent_api_url', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="http://localhost:8000"
            />
          </div>
        </div>

        {/* Community Intelligence Network */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Community Intelligence Network
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Help us build the ultimate decentralized job market database. Opt-in to anonymously share salary bands, ghosting rates, and interview timelines from your applications.
          </p>
          <div className="pt-1 flex items-center justify-between bg-secondary/50 p-3 rounded-lg border border-border">
            <span className="text-sm font-medium text-foreground">Share anonymous insights</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked={localStorage.getItem('careeragent_telemetry') !== 'false'}
                onChange={(e) => localStorage.setItem('careeragent_telemetry', e.target.checked.toString())}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Local Storage & Privacy */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Local-First Privacy Architecture
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your candidate profile and job tracker applications are saved directly in your browser's local storage. Zero personal resume data is ever sent to our servers.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-background rounded-lg border border-border">
              <span className="text-muted-foreground block mb-0.5">Profile Status</span>
              <span className="font-semibold text-foreground">
                {profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Empty'}
              </span>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <span className="text-muted-foreground block mb-0.5">Tracked Applications</span>
              <span className="font-semibold text-foreground">{applications.length} jobs</span>
            </div>
          </div>
          <div className="pt-3 border-t border-border flex justify-end">
            <Button variant="destructive" size="sm" onClick={handleClearData} className="h-8 px-3 text-xs gap-1.5 cursor-pointer">
              <Trash2 className="h-3.5 w-3.5" />
              Clear Local Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
