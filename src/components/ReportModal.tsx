import { useState } from 'react';
import { AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';
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
    label: 'Dead Link / 404',
    desc: 'Posting link is broken, expired, or leads to a page not found.',
  },
  {
    value: 'already_closed',
    label: 'Position Closed',
    desc: 'The role has been filled or is no longer accepting new applications.',
  },
  {
    value: 'spam_or_scam',
    label: 'Fake / Scam / Spam',
    desc: 'Fraudulent company, fee requirement, deceptive or spam listing.',
  },
  {
    value: 'incorrect_metadata',
    label: 'Incorrect Details',
    desc: 'Wrong company, title, workplace type, salary, or location information.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-50">
      <div className="fixed inset-0" onClick={() => !isSubmitting && onClose()} />
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl max-w-lg w-full p-5 sm:p-6 z-10">
        {/* Close Button on top right */}
        <button
          type="button"
          onClick={() => !isSubmitting && onClose()}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">Report Submitted</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Thank you for keeping CareerAgent accurate. This posting will be automatically reviewed and verified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 text-destructive mt-0.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-foreground leading-snug">Report Posting</h3>
                <p className="text-xs text-muted-foreground truncate">{jobTitle}</p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Reason Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Reason for reporting
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map(({ value, label, desc }) => {
                  const isSelected = selectedReason === value;
                  return (
                    <div
                      key={value}
                      onClick={() => setSelectedReason(value)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-primary ring-1 ring-primary/40 bg-primary/5 text-foreground'
                          : 'border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {/* Custom Radio Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground block text-xs">
                          {label}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5 leading-normal">
                          {desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
                  Additional Details <span className="font-normal normal-case">(optional)</span>
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {details.length}/512
                </span>
              </div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 512))}
                placeholder="Provide any additional context (e.g. ATS link returns 404, fee asked on application)..."
                rows={2}
                className="w-full text-xs bg-background border border-border/80 rounded-xl p-2.5 text-foreground placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-primary/40 focus:border-primary resize-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-8 px-4 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer"
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
