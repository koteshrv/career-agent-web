import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Orbit, 
  ChevronRight,
  Bell,
  Copy,
  Check,
  Terminal,
  Zap,
  ShieldCheck,
  Send,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { getStoredProfile, saveStoredProfile } from '../lib/profileStorage';

const POPULAR_SEARCHES = [
  'React',
  'Go / Distributed',
  'Python / AI',
  'Staff Engineer',
  'Fullstack',
  'Remote (US)',
  'Remote (India)',
];

interface JobCockpitPreset {
  id: string;
  company: string;
  role: string;
  salary: string;
  location: string;
  postedTime: string;
  portalType: string;
  score: number;
  matched: string[];
  missing: string[];
  bullet: string;
  outreach: string;
}

const COCKPIT_JOBS: JobCockpitPreset[] = [
  {
    id: 'stripe-infra',
    company: 'Stripe',
    role: 'Staff Infrastructure Engineer',
    salary: '$240,000 – $320,000',
    location: 'Remote / San Francisco',
    postedTime: '14m ago',
    portalType: 'Ashby Direct',
    score: 95,
    matched: ['Go', 'Distributed Systems', 'PostgreSQL', 'High Concurrency', 'Kafka'],
    missing: ['eBPF'],
    bullet: 'Architected distributed event-streaming services processing 14M+ daily transactions at 99.995% uptime, reducing p99 API latency from 120ms to 38ms.',
    outreach: "Hi Sarah — noticed Stripe opened the Staff Infrastructure req 14m ago. Having scaled distributed microservices handling 14M+ tx/day in Go, I'd love to share how our caching patterns align with Stripe's payments reliability goals.",
  },
  {
    id: 'datadog-frontend',
    company: 'Datadog',
    role: 'Senior Frontend Engineer (Core UI)',
    salary: '$180,000 – $235,000',
    location: 'Remote / New York',
    postedTime: '32m ago',
    portalType: 'Greenhouse Direct',
    score: 92,
    matched: ['React', 'TypeScript', 'Web Performance', 'Next.js', 'State Machines'],
    missing: ['WebGL'],
    bullet: 'Spearheaded design system overhaul across 45+ telemetry surfaces, reducing bundle payload by 38% and elevating Lighthouse score from 68 to 97.',
    outreach: "Hi Alex — saw Datadog's Senior Frontend opening today. I recently led our frontend telemetry architecture, cutting render cycles by 40% in React/TS. Would love to connect on your team's UI performance roadmap.",
  },
  {
    id: 'anthropic-systems',
    company: 'Anthropic',
    role: 'Systems & Inference Engineer',
    salary: '$260,000 – $340,000',
    location: 'San Francisco, CA (Hybrid)',
    postedTime: '58m ago',
    portalType: 'Custom Portal Direct',
    score: 89,
    matched: ['Python', 'PyTorch', 'Model Serving', 'CUDA', 'Distributed Training'],
    missing: ['Triton Server'],
    bullet: 'Engineered high-throughput GPU model serving pipeline using TensorRT and vLLM, doubling batch utilization and slashing inference compute costs by 35%.',
    outreach: "Hi Marcus — saw Anthropic's new Systems req. I built GPU serving pipelines handling 6M daily embeddings with sub-50ms TTFT. Would love to chat about your inference scaling challenges.",
  },
  {
    id: 'vercel-platform',
    company: 'Vercel',
    role: 'Platform Infrastructure Engineer',
    salary: '$190,000 – $250,000',
    location: '100% Remote',
    postedTime: '1h 12m ago',
    portalType: 'Lever Direct',
    score: 87,
    matched: ['Next.js', 'Node.js', 'Edge Compute', 'TypeScript', 'Docker'],
    missing: ['Rust'],
    bullet: 'Designed serverless edge routing proxy handling 250M monthly requests, minimizing cold starts by 55% via localized WASM worker caches.',
    outreach: "Hi Elena — saw Vercel's Platform Infra req. Having engineered edge micro-proxies serving 250M+ requests with zero downtime, I'd love to connect on your serverless runtime initiatives.",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobCockpitPreset>(COCKPIT_JOBS[0]);
  const [copiedBullet, setCopiedBullet] = useState(false);
  const [copiedOutreach, setCopiedOutreach] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillDone, setAutofillDone] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleCopyBullet = () => {
    navigator.clipboard.writeText(selectedJob.bullet);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2000);
  };

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(selectedJob.outreach);
    setCopiedOutreach(true);
    setTimeout(() => setCopiedOutreach(false), 2000);
  };

  const handleSimulateAutofill = () => {
    setIsAutofilling(true);
    setAutofillDone(false);
    setTimeout(() => {
      setIsAutofilling(false);
      setAutofillDone(true);
      setTimeout(() => setAutofillDone(false), 3000);
    }, 1500);
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processResumeUpload(file.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processResumeUpload(file.name);
    }
  };

  const processResumeUpload = (fileName: string) => {
    setIsUploading(true);
    setTimeout(() => {
      const current = getStoredProfile();
      saveStoredProfile({
        ...current,
        firstName: current.firstName || 'Alex',
        lastName: current.lastName || 'Morgan',
        headline: current.headline || 'Senior Fullstack Engineer',
        skills: Array.from(new Set([...current.skills, 'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'])),
        resumeFileName: fileName,
        keyAccomplishments: current.keyAccomplishments.length > 0 ? current.keyAccomplishments : [
          'Architected high-throughput services scaling to 10M+ daily events',
          'Reduced cloud compute expenditure by 35% through container optimization'
        ],
      });
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        navigate('/jobs');
      }, 1000);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth font-sans">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/60 bg-dot-grid overflow-hidden">
        {/* Subtle Dark Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 text-center">
          {/* Linear-Style Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-card/80 backdrop-blur-md text-foreground text-xs font-mono font-medium shadow-2xs mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-muted-foreground">8,420+ LIVE DIRECT ROLES</span>
            <span className="text-border">|</span>
            <span className="text-primary font-semibold">APPLY IN HOUR 1–2</span>
          </div>

          {/* Headline with Craft Negative Tracking */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.035em] text-foreground leading-[1.08] max-w-4xl mx-auto mb-6">
            The command center for your tech job search.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Direct employer postings without recruiter middlemen. Score your resume across 10 jobs free, generate tailored outreach, and get instant drop alerts before the applicant pile hits 500.
          </p>

          {/* Raycast / Linear Style Command Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative flex items-center bg-card/90 backdrop-blur-md border border-border rounded-2xl p-1.5 shadow-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
            >
              <div className="pl-3 pr-2 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or stack (e.g. Go, React, Stripe)..."
                className="w-full py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-sans"
              />
              <div className="flex items-center gap-1.5 pr-1">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/80 rounded-md">
                  ⌘K
                </kbd>
                <Button 
                  type="submit" 
                  className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-sm cursor-pointer"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground font-mono">
              <span className="font-semibold text-foreground/70 uppercase text-[10px] tracking-wider">Fast Filters:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-muted text-foreground/90 transition-colors cursor-pointer text-[11px]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={openAuthModal}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-md gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {user ? 'View Your 10 Matched Roles' : 'Upload Resume & Get 10 Matches Free'}
            </Button>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs shadow-2xs gap-2 cursor-pointer"
              >
                Browse All 8,420+ Direct Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* LINEAR-STYLE PRODUCT COCKPIT WINDOW (Interactive Real-Time Preview) */}
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 mt-12 relative z-20">
          <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
            {/* Window Chrome Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="ml-3 font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-primary" />
                  careeragent.fyi / interactive-live-inspector
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE STREAMING ATS FEED
              </div>
            </div>

            {/* Split Screen Cockpit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
              {/* Left Column: Live Verified Job Stream (5 cols) */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border/70 p-3 sm:p-4 space-y-2 bg-muted/10">
                <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <span>Live Requisition Queue</span>
                  <span>Fit Score</span>
                </div>

                <div className="space-y-1.5">
                  {COCKPIT_JOBS.map((job) => {
                    const isSelected = selectedJob.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-card border-primary/50 shadow-sm ring-1 ring-primary/30'
                            : 'bg-background/60 border-border/60 hover:bg-card hover:border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground truncate">{job.company}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">• {job.postedTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{job.role}</p>
                            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">{job.salary}</p>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {job.score}%
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground mt-1">{job.portalType}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2 text-center pt-3">
                  <Link 
                    to="/jobs" 
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    View all 8,420+ verified roles <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Deep Real-Time Inspector (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-card">
                <div>
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-border/70 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">{selectedJob.company}</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                          {selectedJob.portalType}
                        </Badge>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">{selectedJob.role}</h4>
                      <p className="text-[11px] font-mono text-muted-foreground">{selectedJob.location} • {selectedJob.salary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-muted-foreground">Compatibility</div>
                      <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {selectedJob.score}% MATCH
                      </div>
                    </div>
                  </div>

                  {/* Matched & Missing Skills Telemetry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Matched Stack</span>
                        <span>100%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.matched.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                        <span className="flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> Skill Gap</span>
                        <span>Addressed in Bullet</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.missing.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tailored Resume Bullet with 1-Click Copy */}
                  <div className="mt-3.5 p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-primary">
                      <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Tailored Resume Bullet (Metrics-Engineered)</span>
                      <button
                        onClick={handleCopyBullet}
                        className="hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedBullet ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedBullet ? 'Copied to Clipboard!' : 'Copy Bullet'}
                      </button>
                    </div>
                    <p className="text-xs text-foreground italic leading-relaxed">
                      "{selectedJob.bullet}"
                    </p>
                  </div>

                  {/* Recruiter Outreach with 1-Click Copy */}
                  <div className="mt-3 p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-primary">
                      <span className="flex items-center gap-1.5"><Send className="h-3 w-3" /> 3-Sentence Recruiter Outreach Pitch</span>
                      <button
                        onClick={handleCopyOutreach}
                        className="hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedOutreach ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedOutreach ? 'Copied Pitch!' : 'Copy Email'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "{selectedJob.outreach}"
                    </p>
                  </div>
                </div>

                {/* Bottom Action Strip: Companion Autofill Simulator */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Companion Extension: Autofills Greenhouse/Lever/Ashby</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleSimulateAutofill}
                    disabled={isAutofilling}
                    className="h-8 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm cursor-pointer gap-1.5 shrink-0"
                  >
                    {isAutofilling ? (
                      <>
                        <span className="w-3 h-3 rounded-full border border-primary-foreground border-t-transparent animate-spin" />
                        Autofilling 14 Form Fields...
                      </>
                    ) : autofillDone ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        Form Populated in 1.4s!
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Simulate 1-Click Autofill
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAYCAST-STYLE DROP ALERT SHOWCASE: "Be Applicant #6, Not #412" */}
      <section className="py-16 sm:py-22 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-mono font-semibold mb-3">
              <Bell className="h-3.5 w-3.5 text-primary" />
              REAL-TIME DROP ALERTS
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
              Apply in the first 2 hours.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Recruiters manage 20 open reqs and stop reviewing applications once their first 5 phone screens are booked. 
              Our bot pings your Telegram or Email within 5 minutes of a job dropping on official employer career pages.
            </p>
          </div>

          {/* Hyper-realistic Telegram / macOS Alert Card Mockup */}
          <div className="max-w-xl mx-auto bg-card border border-border/80 rounded-2xl shadow-xl p-5 sm:p-6 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Orbit className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">CareerAgent Alert Bot</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">Telegram & Email Direct Notification</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Just now</span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">⚡ Stripe dropped: Staff Infrastructure Engineer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                  95% Match
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Timing advantage:</span> Dropped 11 minutes ago on Ashby. Only 6 applicants in the pipeline so far.
              </p>
              <p className="text-[11px] font-mono text-foreground/80">
                Skills: Go • Distributed Systems • High Concurrency • PostgreSQL
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(COCKPIT_JOBS[0])}
                className="h-9 rounded-xl border-border bg-background hover:bg-muted text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Preview Tailored Bullets
              </Button>
              <Link to="/jobs?q=Stripe">
                <Button
                  size="sm"
                  className="w-full h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Apply Early (Top 10)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LINEAR-STYLE BENTO GRID: Core Engine Features */}
      <section className="py-16 sm:py-24 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
              Engineered with extreme craft.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything built for high-conviction tech engineers and product managers who respect their time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento 1: Direct ATS Indexing */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Zero Recruiter Spam</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  We scrape directly from employer career endpoints and custom ATS platforms. No stale aggregators, expired ghost jobs, or third-party recruiters.
                </p>
              </div>
              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Verified First-Party</span>
                <span className="text-emerald-500 font-semibold">100% Direct</span>
              </div>
            </div>

            {/* Bento 2: 1-Click Form Fill Extension */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">3-Second Form Fill</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Fill your background once. Our companion Chrome extension maps contact info, links, work authorization, and customized essay responses in 3 seconds.
                </p>
              </div>
              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Greenhouse, Ashby, Lever</span>
                <span className="text-primary font-semibold">1-Click</span>
              </div>
            </div>

            {/* Bento 3: 3-Day Follow-Up Alert Queue */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">3-Day Follow-Up Nudges</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Never get ghosted in the ATS black hole. The integrated Kanban board automatically generates polished recruiter follow-up check-in emails after 3 days.
                </p>
              </div>
              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Automated Queue</span>
                <span className="text-amber-500 font-semibold">Snooze 3d / 7d</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 FREE MATCHES RESUME DROPZONE */}
      <section className="py-14 sm:py-18 border-b border-border/60 bg-muted/10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto mb-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
              Ready to see your top 10 matched jobs?
            </h3>
            <p className="text-xs text-muted-foreground">
              Drop your resume below. Our parsing engine extracts your tech stack and calculates instant 0–100% fit scores across 8,420+ verified roles.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-card border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-2xl p-7 text-center transition-colors shadow-sm">
            {uploadSuccess ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Profile Analyzed Successfully</h4>
                <p className="text-xs text-muted-foreground">
                  Extracted stack: React, TypeScript, Node.js, Python, AWS. Loading your matched roles...
                </p>
              </div>
            ) : isUploading ? (
              <div className="space-y-3 py-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-foreground">Parsing resume skills and experience...</p>
                <p className="text-[11px] text-muted-foreground font-mono">Running secure parsing engine via CareerAgent</p>
              </div>
            ) : (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleResumeDrop}
                className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    Drop your resume to unlock your 10 Free AI Matches
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports PDF, DOCX, or TXT. Synced securely to your candidate profile.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-xs font-semibold rounded-lg border-border bg-background hover:bg-muted pointer-events-none mt-2"
                >
                  Select File
                </Button>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* COFFEE-PRICE SAAS PRICING (USD $ / INR ₹ SWITCHER) */}
      <section id="pricing" className="py-16 sm:py-24 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-mono font-semibold mb-3">
              Coffee-Price SaaS
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
              Affordable pricing for serious engineers.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5">
              Free to search and match your first 10 roles. Upgrade to Pro for the price of a coffee to unlock instant drop alerts and unlimited scoring.
            </p>

            {/* Currency Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border shadow-2xs">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-7 bg-card border border-border rounded-2xl shadow-2xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-foreground">Free Tier</h3>
                  <Badge variant="outline" className="text-[10px] font-mono font-semibold">Forever Free</Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-mono font-black text-foreground">
                    {currency === 'USD' ? '$0' : '₹0'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Everything you need to search direct tech jobs and match your top roles.
                </p>

                <div className="space-y-3 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Search all 8,420+ direct employer career portals</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Company Portals Directory access</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>10 Free AI-matched jobs scored against your resume</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Kanban Application Tracker & 3d Nudges</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Encrypted profile sync across devices</span>
                  </div>
                </div>
              </div>

              <Link to="/jobs" className="w-full">
                <Button variant="outline" className="w-full h-11 rounded-xl border-border bg-background hover:bg-muted text-xs font-semibold cursor-pointer">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-7 bg-card border-2 border-primary rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative ring-4 ring-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Recommended for Active Seekers
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-foreground">Pro Pass</h3>
                  <Badge className="text-[10px] font-mono font-semibold bg-primary/15 text-primary border-primary/20">
                    {currency === 'USD' ? 'Just $4.99/mo' : 'Just ₹299/mo'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-mono font-black text-foreground">
                    {currency === 'USD' ? '$4.99' : '₹299'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The price of a single coffee. Apply in the first 2 hours and stand out from the 500-resume pile.
                </p>

                <div className="space-y-3 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-primary">
                    <Bell className="h-4 w-4 text-primary shrink-0" />
                    <span>Instant Company Drop Alerts (Telegram / Email)</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited AI Fit & Gap Scoring on every role</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited Tailored Resume Bullets</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited Recruiter Cold Outreach Emails</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Companion Extension 1-Click Form Autofill</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>3-Month Season Pass Option ({currency === 'USD' ? '$12 one-time' : '₹699 one-time'})</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={openAuthModal}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-md cursor-pointer"
              >
                Get Started with Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Orbit className="h-5 w-5 text-primary stroke-[2.2]" />
              <span className="font-bold text-sm tracking-tight text-foreground">
                careeragent<span className="text-primary font-semibold">.fyi</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground font-mono">
              <Link to="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
              <Link to="/portals" className="hover:text-foreground transition-colors">Portals</Link>
              <Link to="/tracker" className="hover:text-foreground transition-colors">Tracker</Link>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <Link to="/profile" className="hover:text-foreground transition-colors">Profile</Link>
              <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
            </div>

            <p className="text-xs text-muted-foreground font-mono">
              &copy; {new Date().getFullYear()} careeragent.fyi. Encrypted candidate profile sync & verified direct job engine.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
