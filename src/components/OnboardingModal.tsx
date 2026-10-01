import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Upload, Sparkles, X, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fileToBase64, sendExtensionMessage, type ResumeFilters } from '../lib/extensionBridge';
import { addLog } from '../lib/logger';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setSuccess(false);
      setError(null);
      setIsOpen(true);
    };
    window.addEventListener('open_onboarding_modal', handleOpen);
    return () => window.removeEventListener('open_onboarding_modal', handleOpen);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setError(null);

    try {
      const base64File = await fileToBase64(file);
      const response = await sendExtensionMessage<{ filters: ResumeFilters }>(
        { action: 'parse_resume_for_filters', payload: { fileName: file.name, fileData: base64File } },
        90_000
      );

      localStorage.setItem('careeragent_global_filters', JSON.stringify(response.filters));
      localStorage.setItem('careeragent_onboarded', 'true');

      addLog({
        endpoint: 'Extension background worker → your AI provider',
        action: 'Resume Parsing & Preference Extraction',
        timestamp: new Date().toISOString(),
        status: 200,
        requestBody: { fileName: file.name, operation: 'Extract job search filters from PDF' },
        responseBody: response.filters,
      });

      // Attach resume file name to candidate master profile
      try {
        const rawProfile = localStorage.getItem('careeragent_candidate_profile');
        if (rawProfile) {
          const profile = JSON.parse(rawProfile);
          profile.resumeFileName = file.name;
          localStorage.setItem('careeragent_candidate_profile', JSON.stringify(profile));
        }
      } catch {}

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message === 'EXTENSION_NOT_INSTALLED'
          ? 'The CareerAgent extension was not detected. Install it, then try again.'
          : message === 'EXTENSION_TIMEOUT'
          ? 'The extension did not answer in time. Check your AI key in the extension settings and retry.'
          : message
      );
      addLog({
        endpoint: 'Extension background worker',
        action: 'Resume Parsing & Preference Extraction',
        timestamp: new Date().toISOString(),
        status: 500,
        requestBody: { fileName: file.name },
        responseBody: { error: message },
      });
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl p-6 relative">
        <button 
          onClick={handleClose} 
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI Resume Extraction
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Seed Your Agent Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Upload your resume (PDF). The companion browser extension extracts your skills, target roles, and exclusions to automatically calibrate your candidate profile and search feeds.
          </p>
        </div>

        <div className="space-y-4">
          {/* PDF Upload Dropzone */}
          <div className="p-8 border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all rounded-2xl text-center space-y-4 relative group cursor-pointer">
            <div className="mx-auto w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              {success ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : fileName ? (
                <FileText className="h-6 w-6 text-primary" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-sm">
                {success 
                  ? 'Filters & Profile Seeded Successfully!' 
                  : isProcessing 
                  ? 'AI Extension is analyzing resume...' 
                  : fileName 
                  ? fileName 
                  : 'Select or Drop your Resume (PDF)'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {success 
                  ? 'Applying your target roles and exclusions...' 
                  : isProcessing 
                  ? 'Extracting tech stack, accomplishments, and keywords locally' 
                  : 'Sent only to the AI provider you configured in the extension. Never to CareerAgent servers.'}
              </p>
            </div>

            <div className="relative inline-block pt-1">
              <input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isProcessing || success}
              />
              <Button 
                disabled={isProcessing || success} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-none font-semibold px-5 h-9 text-xs gap-1.5 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-white" />
                    Extracting Intelligence...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Done!
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload PDF Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs border bg-destructive/10 border-destructive/20 text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 mt-2 border-t border-border/60 text-xs">
          <p className="text-muted-foreground text-[11px]">
            Prefer manual entry? Configure directly on your Profile page.
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
