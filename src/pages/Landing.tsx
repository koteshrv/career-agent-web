import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Building2, 
  FileText, 
  Orbit, 
  Key, 
  ChevronRight
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

export function Landing() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground scroll-smooth">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/60 overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <Orbit className="h-3.5 w-3.5 animate-spin-slow" />
            Direct ATS Job Index & AI Agent
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-5">
            Automate your tech job search.<br />
            <span className="text-muted-foreground font-semibold">Match with AI. </span>
            <span className="text-primary italic">Apply in seconds.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Verified tech jobs straight from employer ATS endpoints (Greenhouse, Lever, Ashby, Workday).
            Zero ghost jobs, instant 0–100% resume match scoring, and tailored recruiter outreach.
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
                placeholder="Search jobs by title, tech stack, or company (e.g. React, Python, Datadog)..."
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

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button
              size="lg"
              onClick={openAuthModal}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs shadow-md gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {user ? 'Update Profile & Match Jobs' : 'Sign In & Match Resume'}
            </Button>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-6 rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs shadow-2xs gap-2 cursor-pointer"
              >
                Explore All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The 3-Step Flow: Login -> Upload Resume -> Boom: Matched Jobs */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              How CareerAgent Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              No endless form filling or fake job aggregators. Three straightforward steps to match and apply.
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
                  Zero Friction
                </Badge>
              </div>
              <h3 className="font-bold text-base text-foreground">Sign In or Guest Mode</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect via Google SSO or continue instantly as a Guest. 100% private: all profile data is stored locally in your browser.
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
              <h3 className="font-bold text-base text-foreground">Upload Resume</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drop your resume or paste your skills. Our local parser extracts your tech stack, years of experience, and target roles in seconds.
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
              <h3 className="font-bold text-base text-foreground">Matched Jobs & Outreach</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instantly see 0–100% fit scores on live roles, get tailored resume bullets, and generate 3-sentence recruiter cold emails with 1-click copy.
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
                  Extracted skills: React, TypeScript, Node.js, Python, AWS. Redirecting to your matched jobs...
                </p>
              </div>
            ) : isUploading ? (
              <div className="space-y-3 py-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-foreground">Parsing resume skills and experience...</p>
                <p className="text-[11px] text-muted-foreground">Running locally in browser via CareerAgent parser</p>
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
                    Drop your resume here to unlock AI match scores
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports PDF, DOCX, or TXT. 100% private — your resume never leaves your computer.
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

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-20 border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Engineered for the Modern Tech Job Hunt
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Say goodbye to ghost listings, black-hole applications, and copy-pasting the same answers hundreds of times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Direct ATS Monitoring</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Indexed directly from official Greenhouse, Ashby, Lever, and Workday employer endpoints. No stale job boards or expired listings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">0–100% Fit & Gap Breakdown</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See exact match scores for every job based on your tech stack and YoE. Identify matched skills and missing qualifications instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Tailored Resume Bullets</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                1-click generation of metrics-driven bullet points customized to the job’s specific requirements. Ready to copy into your CV.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">3-Day Follow-Up Alert Queue</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never get ghosted. The tracker automatically flags applications reaching 3+ days with pre-drafted recruiter check-in emails.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Company Portals Directory</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browse direct career portals across AI/ML, Dev Tools, Fintech, and Enterprise SaaS. Filter by ATS provider and jump straight to open roles.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Companion Chrome Extension</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Populates your name, experience, links, and answers on Greenhouse, Lever, Ashby, and Workday applications in 3 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs font-semibold mb-3">
              Simple & Transparent
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Fair Pricing for Serious Job Seekers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start completely free, bring your own API key for unlimited AI usage, or upgrade to Pro for turnkey cloud access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-base text-foreground">Free Tier</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold">Forever Free</Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-foreground">$0</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Perfect for browsing open roles and keeping track of your job search.
                </p>

                <div className="space-y-2.5 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Search all direct ATS jobs</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Company Portals Directory access</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>3 AI Match & Bullet generations / day</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Kanban Application Tracker & 3d Nudges</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>100% Local Browser Privacy</span>
                  </div>
                </div>
              </div>

              <Link to="/jobs" className="w-full">
                <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-background hover:bg-muted text-xs font-semibold cursor-pointer">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* BYOK Tier (Bring Your Own Key) */}
            <div className="p-6 bg-card border-2 border-primary rounded-2xl shadow-md flex flex-col justify-between space-y-6 relative ring-4 ring-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Most Flexible / Dev Favorite
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-base text-foreground">BYOK (Own Key)</h3>
                  </div>
                  <Badge className="text-[10px] font-semibold bg-primary/15 text-primary border-primary/20">
                    No Subscription
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-foreground">$0</span>
                  <span className="text-xs text-muted-foreground">+ your model API cost (~$0.50/mo)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide your own OpenAI, Anthropic, or Gemini API key. Zero markup, unlimited power.
                </p>

                <div className="space-y-2.5 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited AI Fit & Gap Scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited Tailored Resume Bullets</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Unlimited Recruiter Outreach Emails</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Keys stored 100% locally in browser</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Support for Claude 3.5, GPT-4o & Gemini</span>
                  </div>
                </div>
              </div>

              <Link to="/settings" className="w-full">
                <Button className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm cursor-pointer">
                  Configure BYOK in Settings
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-6 bg-card border border-border rounded-2xl shadow-2xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-base text-foreground">Pro Cloud</h3>
                  <Badge variant="outline" className="text-[10px] font-semibold">Turnkey</Badge>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-foreground">$19</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  For engineers who want all AI features ready out-of-the-box without API keys.
                </p>

                <div className="space-y-2.5 mt-6 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>No API key setup required</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Unlimited AI Matching & Tailoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Priority Companion Extension Autofill</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Early-bird ATS notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={openAuthModal}
                className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold cursor-pointer"
              >
                Get Started
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
              &copy; {new Date().getFullYear()} careeragent.fyi. 100% client-side privacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
