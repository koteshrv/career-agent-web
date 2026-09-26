import { useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { reportJob, type ReportReason } from '../lib/api';
import { Button } from './ui/button';

interface ReportModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess?: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  {
    value: 'dead_link',
    label: 'Dead Link / 404 Page',
    desc: 'The job posting URL is broken or no longer accessible.',
  },
  {
    value: 'already_closed',
    label: 'Position Already Closed',
    desc: 'The role is filled or no longer accepting new applications.',
  },
  {
    value: 'fake_posting',
    label: 'Fake / Scam Posting',
    desc: 'Misleading employer, fee requirement, or fraudulent posting.',
  },
  {
    value: 'misclassified',
    label: 'Incorrect Details',
    desc: 'Wrong company, title, workplace type, or location data.',
  },
  {
    value: 'spam',
    label: 'Spam / Advertising',
    desc: 'Repetitive advertising or non-job content.',
  },
];

export function ReportModal({ jobId, jobTitle, isOpen, onClose, onReportSuccess }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('dead_link');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await reportJob(jobId, selectedReason, details);
      setSubmitted(true);
      onReportSuccess?.();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={() => !isSubmitting && onClose()} />
      <div className="relative bg-card border border-border shadow-xl rounded-xl max-w-md w-full p-5 sm:p-6 z-10">
        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-semibold text-foreground">Report Submitted</h3>
            <p className="text-xs text-muted-foreground">
              Thank you for keeping CareerAgent clean. Our review system will verify this posting.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-foreground">Report Posting</h3>
                <p className="text-xs text-muted-foreground truncate">{jobTitle}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Select Reason (Strict OpenAPI Taxonomy):
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedReason === value
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={value}
                      checked={selectedReason === value}
                      onChange={() => setSelectedReason(value)}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-semibold text-foreground block">{label}</span>
                      <span className="text-[11px] text-muted-foreground">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Additional Details (Optional, max 512 chars):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 512))}
                placeholder="E.g. Link gives 404, position filled on company website..."
                rows={2}
                className="w-full text-xs bg-background border border-border rounded-lg p-2 text-foreground placeholder:text-muted-foreground outline-hidden focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isSubmitting}
                className="text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
