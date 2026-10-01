import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
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
      const response = await sendExtensionMessage<{ filters: ResumeFilters }>({ action: 'parse_resume_for_filters', payload: { fileName: file.name, fileData: base64File } }, 90_000);

      localStorage.setItem('careeragent_global_filters', JSON.stringify(response.filters));
      localStorage.setItem('careeragent_onboarded', 'true');
      addLog({
        endpoint: 'Extension background worker → your AI provider',
        action: 'Resume parsing',
        timestamp: new Date().toISOString(),
        status: 200,
        requestBody: { fileName: file.name, operation: 'Extract search defaults from PDF' },
        responseBody: response.filters,
      });
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
      }, 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message === 'EXTENSION_NOT_INSTALLED'
          ? 'The extension is not connected. Install it, or check the Extension ID in Settings, then try again.'
          : message === 'EXTENSION_TIMEOUT'
          ? 'The extension did not answer in time. Check your AI key in the extension settings and retry.'
          : message
      );
      addLog({
        endpoint: 'Extension background worker',
        action: 'Resume parsing',
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

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title="Fill search defaults from your resume"
      description="The extension sends the PDF to the AI provider you configured and returns target roles, keywords and exclusions. Nothing goes to CareerAgent servers."
      footer={<Button onClick={() => setIsOpen(false)}>{success ? 'Close' : 'Cancel'}</Button>}
    >
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors ${
          success ? 'border-success/50 bg-success-soft' : 'border-border-strong bg-card hover:bg-muted'
        }`}
      >
        {success ? <CheckCircle2 className="size-7 text-success" /> : fileName ? <FileText className="size-7 text-muted-foreground" /> : <Upload className="size-7 text-muted-foreground" />}
        <span className="text-base font-medium text-foreground">{success ? 'Defaults saved' : isProcessing ? 'Reading your resume' : fileName || 'Choose a PDF resume'}</span>
        <span className="text-sm text-muted-foreground">{success ? 'Reloading the feed with your new defaults.' : isProcessing ? 'This usually takes 10 to 30 seconds.' : 'Up to 5 MB.'}</span>
        <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing || success} className="sr-only" />
      </label>
      {error && (
        <p role="alert" className="mt-3 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </Dialog>
  );
}
