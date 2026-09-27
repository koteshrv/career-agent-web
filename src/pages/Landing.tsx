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
  Send,
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { getStoredProfile, saveStoredProfile } from '../lib/profileStorage';

const POPULAR_SEARCHES = [
  'React',
  'Frontend',
  'Backend',
  'Fullstack',
  'AI / ML',
  'Python',
  'Remote',
  'Staff Engineer',
];

const RECENT_VERIFIED_DROPS = [
  { company: 'Stripe', role: 'Staff Infrastructure Engineer', time: '18m ago', type: 'Direct Portal', badge: 'Active' },
  { company: 'Datadog', role: 'Senior Frontend Engineer', time: '34m ago', type: 'Direct ATS', badge: 'Early' },
  { company: 'Anthropic', role: 'Systems & Reliability Engineer', time: '1h ago', type: 'Direct Portal', badge: 'High Match' },
  { company: 'Vercel', role: 'Fullstack Platform Engineer', time: '1h 20m ago', type: 'Direct ATS', badge: 'Active' },
];

const SIMULATOR_PRESETS = {
  backend: {
    title: 'Staff Backend Engineer (Distributed Systems)',
    company: 'Stripe',
    score: 94,
    matched: ['Go', 'Distributed Systems', 'PostgreSQL', 'High Concurrency', 'gRPC'],
    missing: ['Kafka'],
    bullet: 'Architected event-driven microservices processing 12M+ transactions daily with 99.99% availability, reducing p99 latency from 140ms to 42ms.',
    outreach: "Hi Sarah — noticed Stripe opened the Staff Infrastructure req. Having scaled distributed microservices handling 12M+ tx/day, I'd love to share how our caching patterns align with your payments reliability roadmap.",
  },
  frontend: {
    title: 'Senior Frontend Engineer (Design Systems)',
    company: 'Figma',
    score: 91,
    matched: ['React', 'TypeScript', 'Tailwind CSS', 'Web Performance', 'Next.js'],
    missing: ['WebGL'],
    bullet: 'Spearheaded design system overhaul across 40+ production surfaces, cutting layout shift to zero and improving Lighthouse performance from 71 to 96.',
    outreach: "Hi Alex — saw Figma's new Senior Frontend role. I recently rebuilt our core design system across 40+ components, cutting render times by 35%. Would love to chat about the team's upcoming UI roadmap.",
  },
  ai: {
    title: 'AI / ML Systems Engineer',
    company: 'Scale AI',
    score: 88,
    matched: ['Python', 'PyTorch', 'Model Serving', 'Docker', 'Kubernetes'],
    missing: ['Triton Server'],
    bullet: 'Built high-throughput model serving pipeline using TensorRT and Docker, slashing inference inference cost by 40% while maintaining sub-50ms latency.',
    outreach: "Hi Marcus — saw the AI Systems opening at Scale. I built a sub-50ms model serving cluster serving 5M daily embeddings. Would love to connect regarding your inference infrastructure challenges.",
  },
};

export function Landing() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [activePreset, setActivePreset] = useState<'backend' | 'frontend' | 'ai'>('backend');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleQuickSearch = (term: string) => {
    navigate(`/jobs?q=${encodeURIComponent(term)}`);
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

  const currentPresetData = SIMULATOR_PRESETS[activePreset];

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-22 border-b border-border/60 overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/7 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 text-center">
          {/* Tagline Badge with Live Pulse */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Direct Employer Portals & Real-Time Job Index
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-5">
            Apply in the first 2 hours.<br />
            <span className="text-muted-foreground font-semibold">Before the recruiter pile hits </span>
            <span className="text-primary italic">500.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Verified tech jobs indexed straight from official employer career pages and custom ATS endpoints.
            Score your resume across 10 jobs for free, generate tailored pitches, and get real-time drop alerts the minute dream companies hire.
          </p>

          {/* Hero Search Box */}
          <div className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg rounded-2xl bg-card border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="pl-4 pr-2 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, tech stack, or company (e.g. React, Python, Stripe)..."
                className="w-full py-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              <div className="pr-2">
                <Button 
                  type="submit" 
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-sm cursor-pointer"
                >
                  Search Jobs
                </Button>
              </div>
            </form>

            {/* Popular quick searches */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Trending:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-2.5 py-0.5 rounded-full border border-border bg-card hover:bg-muted text-foreground/90 transition-colors cursor-pointer text-xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Live Recent Drops Ticker Banner */}
          <div className="max-w-3xl mx-auto mb-8 bg-card/60 backdrop-blur-xs border border-border rounded-xl p-3 shadow-2xs text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-[11px]">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Live Verified Job Drops</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Direct from employer portals)</span>
              </div>
              <Link to="/jobs" className="text-primary hover:underline font-semibold flex items-center gap-0.5">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {RECENT_VERIFIED_DROPS.map((drop, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(drop.company)}`)}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/80 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-foreground truncate">{drop.company} • <span className="font-normal text-muted-foreground">{drop.role}</span></p>
                    <p className="text-[10px] text-muted-foreground">{drop.type} • {drop.time}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {drop.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={openAuthModal}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-md gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {user ? 'Update Profile & Match 10 Jobs' : 'Upload Resume & Match 10 Jobs Free'}
            </Button>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs shadow-2xs gap-2 cursor-pointer"
              >
                Browse All Direct Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Recruiter Pipeline Reality: 2 Hours vs 48 Hours */}
      <section className="py-14 sm:py-18 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-semibold mb-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              The Recruiter Reality
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
              Why Speed Determines 80% of Interview Callbacks
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Most recruiters manage 20 open reqs simultaneously. They review applications first-in, first-out — and stop as soon as their first 5 screens are booked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* The 48-Hour Black Hole */}
            <div className="p-6 rounded-2xl bg-card border border-destructive/25 shadow-2xs space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold text-destructive flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  The Typical 48-Hour Applicant
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">Applicant #412</span>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Hour 36:</span> Discovers posting on a stale job board aggregator.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Hour 38:</span> Spends 45 minutes retyping work history into a lengthy ATS form.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Hour 48:</span> Recruiter has already filled their 5 phone screen slots from early applicants.
                </li>
                <li className="flex items-start gap-2 text-destructive font-medium">
                  Result: Resume sits unread in the ATS backlog. Automated rejection 3 weeks later.
                </li>
              </ul>
            </div>

            {/* The CareerAgent Advantage */}
            <div className="p-6 rounded-2xl bg-card border-2 border-primary shadow-sm space-y-4 relative ring-4 ring-primary/10">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  The CareerAgent Edge
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">Applicant #6</span>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Minute 10:</span> Instant Drop Alert fires via Telegram/Email as the role goes live on the employer portal.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Minute 15:</span> AI match score (92%) and tailored resume bullets generated instantly.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">Minute 20:</span> Companion Extension populates 100% of application fields in 3 seconds.
                </li>
                <li className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Result: Recruiter opens your application first thing tomorrow morning. Screen booked by Thursday.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Match & Tailored Material Simulator */}
      <section className="py-16 sm:py-20 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              See How the AI Match Engine Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select a sample engineering discipline below to preview real-time 0–100% fit scoring, matched skills breakdown, and tailored materials.
            </p>

            {/* Role Preset Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border mt-5">
              <button
                onClick={() => setActivePreset('backend')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePreset === 'backend' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Backend Engineer
              </button>
              <button
                onClick={() => setActivePreset('frontend')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePreset === 'frontend' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Frontend Engineer
              </button>
              <button
                onClick={() => setActivePreset('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activePreset === 'ai' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                AI / ML Systems
              </button>
            </div>
          </div>

          {/* Interactive Simulator Card Preview */}
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-lg space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
              <div>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">{currentPresetData.company}</span>
                <h3 className="font-bold text-base text-foreground">{currentPresetData.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Match Score:</span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {currentPresetData.score}% Fit
                </span>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Matched Skills & Stack
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentPresetData.matched.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" /> Gap to Address in Outreach
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentPresetData.missing.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tailored Bullet Point */}
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Generated Tailored Resume Bullet (1-Click Copy)
              </span>
              <p className="text-foreground leading-relaxed italic">
                "{currentPresetData.bullet}"
              </p>
            </div>

            {/* Recruiter Outreach Cold DM */}
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                <Send className="h-3 w-3" /> 3-Sentence Recruiter Check-In Template
              </span>
              <p className="text-muted-foreground leading-relaxed">
                "{currentPresetData.outreach}"
              </p>
            </div>

            <div className="pt-2 text-center">
              <Button
                onClick={openAuthModal}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm gap-2 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Your Resume to Score Live Roles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Step Flow: Upload Resume -> 10 Free Matches -> Boom */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              How CareerAgent Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct employer data, zero recruiter spam, and immediate personalized job matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs flex flex-col space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <Badge variant="outline" className="text-[10px] font-medium border-border">
                  Quick Start
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">Sign In or Guest Mode</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect via Google SSO or continue instantly as a Guest. Your candidate profile syncs securely across the web app and companion extension.
              </p>
              <div className="pt-2 mt-auto">
                <button
                  onClick={openAuthModal}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Quick Sign In <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-card border border-primary/40 rounded-2xl shadow-sm flex flex-col space-y-4 relative ring-2 ring-primary/10">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <Badge className="text-[10px] font-medium bg-primary text-primary-foreground">
                  AI Parsing
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">Drop Resume (10 Free Matches)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload your resume. Our parsing engine extracts your tech stack, years of experience, and target roles, calculating 0–100% fit scores across live roles.
              </p>
              <div className="pt-2 mt-auto">
                <label className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                  Drop Resume Below <ChevronRight className="h-3.5 w-3.5" />
                </label>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs flex flex-col space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                  Boom!
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">Apply & Track with Nudges</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply in seconds via the companion extension, track applications on the Kanban board, and get automatic 3-day recruiter follow-up check-in nudges.
              </p>
              <div className="pt-2 mt-auto">
                <Link
                  to="/jobs"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Explore Feed <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Resume Dropzone Card */}
          <div className="mt-10 max-w-2xl mx-auto bg-card border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-2xl p-7 text-center transition-colors shadow-sm">
            {uploadSuccess ? (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-base text-foreground">Boom! Profile Analyzed Successfully</h4>
                <p className="text-xs text-muted-foreground">
                  Extracted skills: React, TypeScript, Node.js, Python, AWS. Loading your 10 free AI-matched roles...
                </p>
              </div>
            ) : isUploading ? (
              <div className="space-y-3 py-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-foreground">Parsing resume skills and experience...</p>
                <p className="text-[11px] text-muted-foreground">Running secure parsing engine via CareerAgent</p>
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
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    Drop your resume here to unlock your 10 Free AI Matches
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports PDF, DOCX, or TXT. Parsed securely and synced to your profile.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-xs font-semibold rounded-lg border-border bg-background hover:bg-muted pointer-events-none mt-2"
                >
                  Select Resume File
                </Button>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section with Global + India PPP Toggle */}
      <section id="pricing" className="py-16 sm:py-24 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-semibold mb-3">
              Coffee-Price SaaS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Affordable Pricing for Serious Tech Job Seekers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5">
              Free to search and match your first 10 roles. Upgrade to Pro for the price of a coffee to unlock instant drop alerts and unlimited scoring.
            </p>

            {/* Currency Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
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
                  <Badge variant="outline" className="text-[10px] font-semibold">Forever Free</Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-foreground">
                    {currency === 'USD' ? '$0' : '₹0'}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Everything you need to search direct tech jobs and match your top roles.
                </p>

                <div className="space-y-3 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Search all direct employer career portals</span>
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
            <div className="p-7 bg-card border-2 border-primary rounded-2xl shadow-lg flex flex-col justify-between space-y-6 relative ring-4 ring-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Recommended for Active Seekers
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-foreground">Pro Pass</h3>
                  <Badge className="text-[10px] font-semibold bg-primary/15 text-primary border-primary/20">
                    {currency === 'USD' ? 'Just $4.99/mo' : 'Just ₹299/mo'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-foreground">
                    {currency === 'USD' ? '$4.99' : '₹299'}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The cost of a single coffee. Apply in the first 2 hours and stand out from the 500-resume pile.
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
                careeragent<span className="text-primary">.fyi</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
              <Link to="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
              <Link to="/portals" className="hover:text-foreground transition-colors">Portals</Link>
              <Link to="/tracker" className="hover:text-foreground transition-colors">Tracker</Link>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <Link to="/profile" className="hover:text-foreground transition-colors">Profile</Link>
              <Link to="/settings" className="hover:text-foreground transition-colors">Settings</Link>
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} careeragent.fyi. Encrypted candidate profile sync & verified direct job engine.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
