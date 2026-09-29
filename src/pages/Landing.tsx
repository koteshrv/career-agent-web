import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Orbit, 
  ChevronRight,
  ChevronDown,
  Bell,
  Copy,
  Check,
  Terminal,
  Zap,
  Send,
  SlidersHorizontal,
  Globe,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { getStoredProfile, saveStoredProfile } from '../lib/profileStorage';
import { 
  type Currency, 
  getInitialCurrency, 
  detectCountryFromIP, 
  savePreferredCurrency 
} from '../lib/geoPricing';

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

const MONITORED_LOGOS = [
  { name: 'Stripe', domain: 'Fintech & Payments' },
  { name: 'Vercel', domain: 'Cloud & Edge Runtime' },
  { name: 'Datadog', domain: 'Observability & Telemetry' },
  { name: 'Anthropic', domain: 'Frontier AI Research' },
  { name: 'Notion', domain: 'Productivity Systems' },
  { name: 'OpenAI', domain: 'Applied Deep Learning' },
  { name: 'Cloudflare', domain: 'Global Edge Network' },
  { name: 'Linear', domain: 'Engineering Workflows' },
  { name: 'Figma', domain: 'Collaborative Design' },
  { name: 'Supabase', domain: 'Developer Data Stack' },
];

const FAQS = [
  {
    q: 'How is CareerAgent different from LinkedIn, Indeed, or Jobright?',
    a: 'Traditional aggregators scrape stale feeds, re-post expired roles, and encourage 1,000+ applicants to hit identical "Easy Apply" buttons. CareerAgent directly monitors 150+ official employer ATS endpoints (Greenhouse, Lever, Ashby, Workday) and indexes jobs within minutes of being posted. You apply before recruiters hit their resume cap.',
  },
  {
    q: 'How does the 10 free AI matches policy work?',
    a: 'You can search and view all 8,420+ direct jobs completely free. When you upload or paste your resume, our parsing engine evaluates your tech stack and provides detailed 0–100% compatibility scores, skill gap analysis, and tailored bullets for your first 10 matched jobs at zero cost.',
  },
  {
    q: 'Can I set up instant drop alerts on Telegram or Email?',
    a: 'Yes. Pro subscribers can configure real-time company or stack watchlists. When a company like Stripe or Anthropic publishes a matching requisition, CareerAgent dispatches an alert to your Telegram or Email within 2–5 minutes with pre-scored compatibility.',
  },
  {
    q: 'How does the companion browser extension work with ATS portals?',
    a: 'The companion extension reads your encrypted candidate master profile and autofills lengthy application forms (contact info, portfolio links, work authorization, custom questions) across Greenhouse, Lever, Ashby, and Workday in 3 seconds.',
  },
  {
    q: 'How is my candidate data stored and protected?',
    a: 'Your candidate profile, resume data, and tracked applications sync over encrypted HTTPS channels between your web session and the browser extension. We do not sell your data or share your personal profile with third-party data brokers.',
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic IP-Based Currency & Geo Pricing
  const [currency, setCurrency] = useState<Currency>(() => getInitialCurrency().currency);
  const [detectedCountry, setDetectedCountry] = useState<string>(() => getInitialCurrency().country);
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    let isMounted = true;
    detectCountryFromIP().then((res) => {
      if (isMounted && res) {
        setCurrency(res.currency);
        setDetectedCountry(res.country);
        setIsAutoDetected(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCurrencyChange = (newCur: Currency) => {
    setCurrency(newCur);
    setIsAutoDetected(false);
    savePreferredCurrency(newCur);
  };

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
      {/* 1. HERO SECTION (Tsenta-style Clean SaaS Hero) */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/70 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-card/80 backdrop-blur-md text-foreground text-xs font-mono shadow-2xs mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-muted-foreground">8,420+ live direct roles</span>
            <span className="text-border">·</span>
            <span className="text-foreground font-medium">Scraped directly from employer portals</span>
          </div>

          {/* Headline - Editorial, bold, confident */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] max-w-4xl mx-auto mb-6">
            Be the first to apply to every job that fits you. Automatically.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            CareerAgent monitors 150+ direct employer career pages across Greenhouse, Lever, Ashby, Workday, and custom ATS platforms. Get 10 free AI-matched roles, instant drop alerts, and tailored materials before applications hit 500.
          </p>

          {/* Dual Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Button
              size="lg"
              onClick={openAuthModal}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-sm gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {user ? 'View Your 10 Matched Roles' : 'Get 10 Free AI Matches'}
            </Button>
            <a href="#workflow">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs shadow-2xs gap-1.5 cursor-pointer"
              >
                See How It Works
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          <div className="text-xs text-muted-foreground mb-8">
            Free to start · No card required · 100% direct employer listings
          </div>

          {/* Search Command Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative flex items-center bg-card border border-border rounded-xl p-1.5 shadow-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
            >
              <div className="pl-3 pr-2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, company, or stack (e.g. Go, React, Distributed Systems)..."
                className="w-full py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-sans"
              />
              <div className="flex items-center gap-1.5 pr-1">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted border border-border/80 rounded-md">
                  ⌘K
                </kbd>
                <Button 
                  type="submit" 
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-xs cursor-pointer"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground font-mono">
              <span className="text-muted-foreground text-[11px]">Quick filters:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-md border border-border bg-card/60 hover:bg-muted text-foreground transition-colors cursor-pointer text-[11px]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. LIVE INTERACTIVE COCKPIT WINDOW (Tsenta-style Live Product Preview) */}
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 mt-12 relative z-20">
          <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
            {/* Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
                </div>
                <span className="ml-3 font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-primary" />
                  live-dispatch-console
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live streaming feed
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
              {/* Left Column: Requisition Queue */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border/70 p-3 sm:p-4 space-y-2 bg-muted/10">
                <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-mono text-muted-foreground">
                  <span>Direct requisition queue</span>
                  <span>Fit score</span>
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
                              <span className="text-[10px] font-mono text-muted-foreground">· {job.postedTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{job.role}</p>
                            <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">{job.salary}</p>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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

              {/* Right Column: Real-Time Fit Inspector */}
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
                      <p className="text-[11px] font-mono text-muted-foreground">{selectedJob.location} · {selectedJob.salary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-muted-foreground">Compatibility</div>
                      <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedJob.score}% match
                      </div>
                    </div>
                  </div>

                  {/* Matched & Missing Skills Telemetry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Matched stack</span>
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
                        <span className="flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> Skill gap</span>
                        <span>Addressed in bullet</span>
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

                  {/* Tailored Resume Bullet */}
                  <div className="mt-3.5 p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono font-medium text-primary">
                      <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Tailored resume bullet</span>
                      <button
                        onClick={handleCopyBullet}
                        className="hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedBullet ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        {copiedBullet ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      "{selectedJob.bullet}"
                    </p>
                  </div>

                  {/* Recruiter Outreach */}
                  <div className="mt-3 p-3 rounded-xl bg-background border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono font-medium text-primary">
                      <span className="flex items-center gap-1.5"><Send className="h-3 w-3" /> 3-sentence recruiter note</span>
                      <button
                        onClick={handleCopyOutreach}
                        className="hover:underline flex items-center gap-1 cursor-pointer text-[10px]"
                      >
                        {copiedOutreach ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                        {copiedOutreach ? 'Copied note' : 'Copy note'}
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
                    <span>Autofill companion: Fills direct application fields in 3 seconds</span>
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
                        Populating form fields...
                      </>
                    ) : autofillDone ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        Form populated in 1.4s
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Simulate 1-click autofill
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOGOS TICKER / SOCIAL PROOF (Tsenta-style "Where users get hired / Monitored ATS Portals") */}
      <section className="py-12 border-b border-border/60 bg-muted/10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-center text-xs font-medium text-muted-foreground mb-6">
            Directly indexing live career pages from premier engineering teams & custom ATS portals
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MONITORED_LOGOS.map((company) => (
              <div 
                key={company.name}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-card/60 text-center"
              >
                <span className="text-xs font-bold text-foreground">{company.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{company.domain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOUR STAGES WORKFLOW (Tsenta Signature Section: "Four stages. One engine. Zero spreadsheets.") */}
      <section id="workflow" className="py-20 sm:py-28 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Four stages. One engine. Zero spreadsheets.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything built for high-conviction tech engineers and product managers who value their time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1 */}
            <div className="p-8 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    STAGE 01
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500 font-medium">Sub-5m ingestion</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Be the first qualified applicant on the job
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Recruiters manage 20 open requisitions and stop reviewing applications once the first 50–75 candidates arrive. CareerAgent scrapes directly from employer career endpoints and custom ATS platforms—bypassing stale aggregators and ghost jobs.
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Greenhouse · Lever · Ashby · Custom</span>
                <span className="text-foreground font-semibold">100% Direct</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-8 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    STAGE 02
                  </span>
                  <span className="text-[11px] font-mono text-primary font-medium">0–100% Fit Scoring</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  A resume bullet and pitch, tailored per role
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Evaluate your background against the exact required technical stack. CareerAgent flags matched skills, highlights critical gaps, and drafts metrics-engineered accomplishment bullets and 3-sentence recruiter cold pitches in 1 click.
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>10 Free AI Matches Included</span>
                <span className="text-emerald-500 font-semibold">No Hallucinations</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-8 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    STAGE 03
                  </span>
                  <span className="text-[11px] font-mono text-primary font-medium">1-Click Chrome Extension</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Populate application forms in 3 seconds
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Fill your master profile once. When you land on any Greenhouse, Lever, Ashby, or Workday application page, the CareerAgent companion extension maps your contact details, portfolio links, work authorization, and customized essay responses automatically.
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Native DOM Input Dispatch</span>
                <span className="text-primary font-semibold">Zero Re-Typing</span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-8 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    STAGE 04
                  </span>
                  <span className="text-[11px] font-mono text-amber-500 font-medium">3-Day Follow-Up Alert</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Replies and recruiter check-ins auto-routed
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Never get ghosted in an ATS queue. The integrated Kanban board tracks your application timeline and alerts you on day 3 with an automated, customized recruiter follow-up message ready to copy and send.
                </p>
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Kanban Pipeline</span>
                <span className="text-amber-500 font-semibold">Smart Follow-Ups</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLATFORMS & INTERFACES (Tsenta Signature Section: "One agent. Any screen.") */}
      <section id="platforms" className="py-20 sm:py-26 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              One engine. Any workflow.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Built to operate smoothly across your desktop browser, mobile notifications, and direct employer portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Web Command Center</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full-screen search across 8,420+ direct roles with workplace, country, and date filters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Chrome Companion</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                1-click form autofill directly on Greenhouse, Lever, Ashby, and Workday application pages.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Telegram & Email Alerts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time webhooks dispatching newly opened engineering requisitions within 5 minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Direct Portals Index</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Directory of 150+ verified employer career endpoints filtered by technical domain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DROP ALERT SHOWCASE MOCKUP */}
      <section className="py-16 sm:py-20 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Apply in the first two hours
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              When a company opens a role, our alert dispatcher pushes a notification directly to your Telegram or Email before other candidates even know the role exists.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-card border border-border rounded-xl shadow-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Orbit className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">CareerAgent Alert Dispatcher</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">Telegram · Email webhook</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Just now</span>
            </div>

            <div className="p-3.5 rounded-lg bg-background border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Stripe opened: Staff Infrastructure Engineer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                  95% match
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Timing window:</span> Published 11 minutes ago on employer portal. Applicant count under 10.
              </p>
              <p className="text-[11px] font-mono text-foreground/80">
                Stack: Go · Distributed Systems · High Concurrency · PostgreSQL
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(COCKPIT_JOBS[0])}
                className="h-9 rounded-lg border-border bg-background hover:bg-muted text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Preview tailored bullets
              </Button>
              <Link to="/jobs?q=Stripe">
                <Button
                  size="sm"
                  className="w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap className="h-3.5 w-3.5" />
                  View live posting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 10 FREE MATCHES RESUME DROPZONE */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-muted/10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto mb-6">
            <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
              Ready to review your top 10 matches?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Drop your resume below. Our parsing engine extracts your tech stack and calculates instant 0–100% fit scores across 8,420+ direct roles.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-card border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-7 text-center transition-colors shadow-2xs">
            {uploadSuccess ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">Resume parsed successfully</h4>
                <p className="text-xs text-muted-foreground">
                  Extracted stack: React, TypeScript, Node.js, Python, AWS. Loading your matched roles...
                </p>
              </div>
            ) : isUploading ? (
              <div className="space-y-3 py-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-foreground">Extracting experience and technical stack...</p>
                <p className="text-[11px] text-muted-foreground font-mono">Encrypted sync with your candidate profile</p>
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
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    Drop resume to unlock 10 free AI matches
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
                  Select file
                </Button>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* 8. PRICING SECTION (Tsenta-style with Dynamic IP Geo Pricing) */}
      <section id="pricing" className="py-20 sm:py-28 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Pay for results. Not empty subscriptions.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Every tier is the full product. Free to search all direct jobs and score your first 10 roles. Upgrade to Pro for the price of a single coffee.
            </p>

            {/* Dynamic IP Region Notification */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-mono mb-6">
              <span className={`w-2 h-2 rounded-full inline-block ${isAutoDetected ? 'bg-emerald-500' : 'bg-primary'}`} />
              <span>
                {isAutoDetected
                  ? (detectedCountry === 'IN' 
                      ? 'Region auto-detected from IP: India (₹ INR) · PPP adjusted' 
                      : `Region auto-detected from IP: Global (${detectedCountry}) · USD ($)`)
                  : (currency === 'INR' 
                      ? 'Region manually set: India (₹ INR)' 
                      : 'Region manually set: USD ($)')}
              </span>
            </div>

            {/* Controls: Currency Toggle + Billing Cycle Toggle */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Currency Selector */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-primary text-primary-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('INR')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    currency === 'INR' ? 'bg-primary text-primary-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  INR (₹)
                </button>
              </div>

              {/* Billing Cycle Selector */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-card border border-border shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('quarterly')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    billingCycle === 'quarterly' ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Season Pass</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Save 20%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 bg-card border border-border rounded-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xl text-foreground">Free</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">No card required</Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-mono font-bold text-foreground">
                    {currency === 'USD' ? '$0' : '₹0'}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ forever</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Everything you need to search direct tech jobs and match your top roles.
                </p>

                <div className="space-y-3 mt-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Search all 8,420+ direct employer career portals</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Company Portals Directory access</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>10 free AI-matched roles scored against resume</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Kanban application tracker with 3-day follow-up nudges</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Encrypted cloud profile sync across devices</span>
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
            <div className="p-8 bg-card border-2 border-primary rounded-2xl shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xl text-foreground">Pro Pass</h3>
                  <Badge className="text-[10px] font-mono font-medium bg-primary/15 text-primary border-primary/20">
                    Full Product
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-mono font-bold text-foreground">
                    {billingCycle === 'monthly'
                      ? (currency === 'USD' ? '$4.99' : '₹299')
                      : (currency === 'USD' ? '$12' : '₹699')}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {billingCycle === 'monthly' ? '/ month' : '/ 3-month season pass'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Apply in the first two hours and stand out before applications pile up.
                </p>

                <div className="space-y-3 mt-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-foreground font-medium text-primary">
                    <Bell className="h-4 w-4 text-primary shrink-0" />
                    <span>Instant company drop alerts via Telegram and Email</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited AI fit and gap scoring on all roles</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited tailored resume bullet points</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited recruiter outreach pitch drafting</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Companion extension 1-click form autofill</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Cancel anytime in 1-click with zero friction</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={openAuthModal}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-md cursor-pointer"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION (Tsenta-style "What people ask before signing up") */}
      <section id="faq" className="py-20 sm:py-26 border-b border-border/60">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about direct job indexing, AI scoring, and drop alerts.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={faq.q} 
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-foreground cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. BOTTOM CTA BANNER (Tsenta-style "Get the next 10 applications off your plate by tonight.") */}
      <section className="py-20 sm:py-24 bg-primary/5 border-b border-border/60">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto">
            Get your next 10 tailored applications out tonight.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Stop waiting for jobs to hit 500 applicants on LinkedIn. Score your background across verified employer requisitions and apply within minutes of drop.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={openAuthModal}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-md gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Get 10 Free AI Matches
            </Button>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs shadow-2xs gap-1.5 cursor-pointer"
              >
                Browse All Direct Roles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
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
              <a href="#workflow" className="hover:text-foreground transition-colors">How it works</a>
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
