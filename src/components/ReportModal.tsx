import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { reportJob, type ReportReason } from '../lib/api';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Field, Textarea } from './ui/field';
import { cn } from '../lib/utils';

interface ReportModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess?: () => void;
}

const REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'dead_link', label: 'Dead link', desc: 'The posting link is broken, expired, or leads nowhere.' },
  { value: 'already_closed', label: 'Position closed', desc: 'The role has been filled or stopped accepting applications.' },
  { value: 'spam_or_scam', label: 'Scam or spam', desc: 'Fake company, fee required, or a deceptive listing.' },
  { value: 'incorrect_metadata', label: 'Wrong details', desc: 'Company, title, workplace type, salary or location is wrong.' },
];

export function ReportModal({ jobId, jobTitle, isOpen, onClose, onReportSuccess }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('dead_link');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = 'report-form';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await reportJob(jobId, reason, details);
      setSubmitted(true);
      onReportSuccess?.();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send the report. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !submitting && onClose()}
      title="Report this posting"
      description={jobTitle}
      footer={
        !submitted && (
          <>
            <Button onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form={formId} disabled={submitting}>
              {submitting ? 'Sending' : 'Send report'}
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="size-8 text-success" />
          <p className="mt-2 text-base font-medium text-foreground">Report sent</p>
          <p className="mt-1 text-sm text-muted-foreground">Three independent reports hide a posting from everyone.</p>
        </div>
      ) : (
        <form id={formId} onSubmit={submit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">What is wrong?</legend>
            <div className="space-y-2">
              {REASONS.map((r) => {
                const checked = reason === r.value;
                return (
                  <label
                    key={r.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                      checked ? 'border-primary bg-primary-soft/60' : 'border-border hover:bg-muted'
                    )}
                  >
                    <input type="radio" name="reason" value={r.value} checked={checked} onChange={() => setReason(r.value)} className="mt-1 size-4 accent-primary" />
                    <span>
                      <span className="block text-base font-medium text-foreground">{r.label}</span>
                      <span className="block text-sm text-muted-foreground">{r.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <Field label="Anything else" hint={`Optional · ${details.length}/512`}>
            <Textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value.slice(0, 512))} placeholder="The link returns 404, the form asks for a fee…" />
          </Field>
        </form>
      )}
    </Dialog>
  );
}
