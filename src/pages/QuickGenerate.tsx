import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Field, Input, Textarea } from '../components/ui/field';
import { SegmentedControl } from '../components/ui/segmented';
import { Page, PageHeader } from '../components/ui/page';
import { useToast } from '../components/ui/toast';
import { getStoredProfile } from '../lib/profileStorage';

type Material = 'cover_letter' | 'resume_bullets' | 'cold_email';

export function QuickGenerate() {
  const [params] = useSearchParams();
  const profile = getStoredProfile();
  const toast = useToast();
  const [company, setCompany] = useState(params.get('company') || '');
  const [jobTitle, setJobTitle] = useState(params.get('title') || '');
  const [jobDescription, setJobDescription] = useState('');
  const [material, setMaterial] = useState<Material>('cover_letter');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (!jobDescription.trim()) return;
    const candidateName = profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Candidate';
    const skills = profile.skills.length > 0 ? profile.skills.join(', ') : 'software engineering';
    const top3 = skills.split(', ').slice(0, 3).join(', ');
    let text = '';
    if (material === 'cover_letter') {
      text = `Dear Hiring Team at ${company || 'your organization'},\n\nI am writing to express my interest in the ${jobTitle || 'open position'}. With my background in ${skills}, I have built reliable, high-throughput systems and delivered measurable product impact.\n\nReading the requirements, I was drawn to the team's focus on scalable architecture and engineering craft. In previous roles I have led system improvements, automated complex workflows and shipped on time with product and design partners.\n\nI would welcome the chance to discuss how my experience fits your goals. Thank you for your time.\n\nSincerely,\n${candidateName}`;
    } else if (material === 'resume_bullets') {
      text = `• Architected and deployed scalable services using ${top3}, reducing end-to-end latency by 35%.\n• Led a cross-functional migration to modern cloud infrastructure, raising availability to 99.98%.\n• Built CI/CD pipelines and test suites that increased deployment velocity while cutting regressions.\n• Partnered with product and design to turn ambiguous requirements into maintainable code.`;
    } else {
      text = `Hi [Name],\n\nI noticed you are hiring for a ${jobTitle || 'role'} at ${company || 'your team'} and wanted to reach out directly.\n\nI have deep experience with ${top3} and have followed ${company || 'your company'}'s recent engineering work with interest.\n\nWould you be open to a short call this week to see whether my background is a fit? Happy to share my resume and portfolio.\n\nBest regards,\n${candidateName}`;
    }
    setOutput(text);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast('Copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy', 'error');
    }
  };

  return (
    <Page width="wide">
      <PageHeader
        title="Drafts"
        description={
          <>
            Starter text built from your profile and a job description. These are templates to edit, not AI.{' '}
            {!profile.firstName && (
              <Link to="/profile" className="text-primary-text underline-offset-2 hover:underline">
                Fill in your profile first.
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
            </Field>
            <Field label="Job title">
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">What to draft</p>
            <SegmentedControl
              ariaLabel="Material"
              value={material}
              onChange={setMaterial}
              options={[
                { value: 'cover_letter', label: 'Cover letter' },
                { value: 'resume_bullets', label: 'Resume bullets' },
                { value: 'cold_email', label: 'Cold email' },
              ]}
            />
          </div>
          <Field label="Job description" hint="Paste the posting. Required.">
            <Textarea rows={10} required value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" disabled={!jobDescription.trim()}>
            Build draft
          </Button>
        </form>

        <div className="flex min-h-[320px] flex-col rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-base font-semibold text-foreground">Draft</h2>
            {output && (
              <Button size="sm" onClick={copy}>
                {copied ? <Check className="text-success" /> : <Copy />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
          {output ? (
            <Textarea aria-label="Draft text" value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-[280px] flex-1 rounded-none border-0 focus:ring-0" />
          ) : (
            <p className="m-auto max-w-xs p-6 text-center text-sm text-muted-foreground">Fill in the job on the left and build a draft. You can edit it here before copying.</p>
          )}
        </div>
      </div>
    </Page>
  );
}
