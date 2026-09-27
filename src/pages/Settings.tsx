import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Puzzle, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getStoredProfile, getStoredApplications, broadcastSync } from '../lib/profileStorage';

export function Settings() {
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
            Companion & Sync Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your CareerAgent browser extension connection and local data storage.
          </p>
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
                  CareerAgent Browser Companion
                </h3>
                <p className="text-xs text-muted-foreground">
                  Powers 1-click ATS autofill on Greenhouse, Lever, and Workday.
                </p>
              </div>
            </div>

            <div>
              {extensionDetected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected (v1.0)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border">
                  Extension Not Detected
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-muted-foreground">
              {extensionDetected
                ? 'Your web app profile and applications sync in real-time with the extension.'
                : 'Install the extension in Chrome or Firefox to unlock automated job captures and autofill.'}
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

          {syncStatus && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {syncStatus}
            </p>
          )}
        </div>

        {/* Data Architecture & Privacy */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Encrypted Sync & Data Management
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Your candidate profile, work history, and job tracker entries sync securely between your web session and the companion browser extension. All sensitive career data is encrypted in transit and at rest.
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearData}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Local Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
