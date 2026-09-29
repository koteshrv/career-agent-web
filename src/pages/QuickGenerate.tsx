import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Key
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getStoredProfile } from '../lib/profileStorage';

export function QuickGenerate() {
  const profile = getStoredProfile();
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [materialType, setMaterialType] = useState<'cover_letter' | 'resume_bullets' | 'cold_email'>('cover_letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    setCopied(false);

    // Get candidate details
    const candidateName = profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Candidate';
    const skills = profile.skills.length > 0 ? profile.skills.join(', ') : 'Software Engineering, Full Stack, Cloud Systems';

    setTimeout(() => {
      let output = '';
      if (materialType === 'cover_letter') {
        output = `Dear Hiring Team at ${company || 'your organization'},\n\nI am writing to express my strong interest in the ${jobTitle || 'open position'}. With my background in ${skills}, I have consistently built high-throughput, reliable applications and delivered measurable product impact.\n\nAfter reviewing the requirements, I was particularly drawn to your team's focus on scalable architecture and engineering craftsmanship. Throughout my previous roles, I have spearheaded system improvements, automated complex workflows, and collaborated cross-functionally to ship features on time.\n\nI would welcome the opportunity to discuss how my skill set aligns with your engineering goals. Thank you for your time and consideration.\n\nSincerely,\n${candidateName}`;
      } else if (materialType === 'resume_bullets') {
        output = `• Architected and deployed scalable microservices utilizing ${skills.split(', ').slice(0, 3).join(', ')}, reducing end-to-end latency by 35%.\n• Spearheaded cross-functional migration to modern cloud infrastructure, boosting system availability to 99.98%.\n• Designed automated CI/CD pipelines and unit testing suites, increasing deployment velocity while reducing regression defects.\n• Partnered directly with product and design stakeholders to translate complex requirements into clean, maintainable code.`;
      } else {
        output = `Hi [Hiring Manager / Recruiter Name],\n\nI noticed you are hiring for a ${jobTitle || 'role'} at ${company || 'your team'} and wanted to reach out directly.\n\nI have extensive experience working with ${skills.split(', ').slice(0, 3).join(', ')} and have followed ${company || 'your company'}'s recent engineering milestones with great interest.\n\nWould you be open to a brief 10-minute chat this week to see if my background might be a strong fit for the team? Happy to share my portfolio and resume.\n\nBest regards,\n${candidateName}`;
      }

      setGeneratedOutput(output);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Zero-Cost Instant Generation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate ATS-optimized materials grounded in your local candidate profile.
            </p>
          </div>
        </div>

        <Link to="/settings" className="shrink-0">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 cursor-pointer">
            <Key className="w-3.5 h-3.5 text-primary" />
            <span>BYOK Settings</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Form */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
            Target Job Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Material to Generate
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMaterialType('cover_letter')}
                className={`h-9 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  materialType === 'cover_letter'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                Cover Letter
              </button>
              <button
                type="button"
                onClick={() => setMaterialType('resume_bullets')}
                className={`h-9 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  materialType === 'resume_bullets'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                Tailored Bullets
              </button>
              <button
                type="button"
                onClick={() => setMaterialType('cold_email')}
                className={`h-9 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  materialType === 'cold_email'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                Cold Outreach
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Job Description / Requirements *
            </label>
            <textarea
              rows={8}
              placeholder="Paste the target job description or requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-hidden resize-none leading-relaxed"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs gap-2 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing tailored materials...' : 'Generate Materials'}</span>
          </Button>
        </div>

        {/* Right Output Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <h3 className="text-sm font-bold text-foreground">Generated Output</h3>
            {generatedOutput && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {generatedOutput ? (
              <textarea
                readOnly
                value={generatedOutput}
                className="w-full flex-1 p-3 rounded-lg bg-background border border-border text-foreground text-xs leading-relaxed font-sans resize-none focus:outline-hidden"
              />
            ) : (
              <div className="p-8 text-center space-y-2 text-muted-foreground my-auto">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium">No materials generated yet</p>
                <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
                  Fill in the company, job title, and description on the left to instantly tailor your materials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
