import { Link } from 'react-router-dom';
import { 
  Orbit, 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export function Landing() {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Direct ATS Indexing — Zero Recruiter Spam</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6">
            The intelligent job engine & <br className="hidden sm:inline" />
            <span className="text-primary">1-click application companion.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Stop filling the same forms 50 times. Discover fresh, verified roles indexed directly from Greenhouse, Lever, Ashby, and Workday, then autofill applications with our browser extension.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 px-7 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 cursor-pointer">
                <Search className="h-4 w-4" />
                Browse 50,000+ Jobs
              </Button>
            </Link>

            {!isAuthenticated ? (
              <Button
                variant="outline"
                size="lg"
                onClick={loginWithGoogle}
                className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-xl border-border bg-card hover:bg-muted shadow-2xs gap-2 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Sign in with Google
              </Button>
            ) : (
              <Link to="/tracker" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-xl border-border bg-card hover:bg-muted shadow-2xs gap-2 cursor-pointer">
                  <Layers className="h-4 w-4 text-primary" />
                  View Application Tracker
                </Button>
              </Link>
            )}
          </div>

          {/* Interactive Feature Mockup Preview */}
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl overflow-hidden text-left relative p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-border gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  <Orbit className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">CareerAgent Companion Extension</h3>
                  <p className="text-xs text-muted-foreground">Detected active application on Greenhouse (Datadog)</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Autofill Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <span className="text-muted-foreground font-medium">1. Instant Form Fill</span>
                <p className="text-foreground font-semibold">12 fields populated</p>
                <p className="text-[11px] text-muted-foreground">Name, Email, Phone, LinkedIn, Resume PDF & Work Auth</p>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <span className="text-muted-foreground font-medium">2. AI Essay Drafter</span>
                <p className="text-foreground font-semibold">"Why Datadog?" Answered</p>
                <p className="text-[11px] text-muted-foreground">Grounded in your real metrics and past engineering wins</p>
              </div>

              <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                <span className="text-muted-foreground font-medium">3. Automatic Tracking</span>
                <p className="text-foreground font-semibold">Added to Kanban</p>
                <p className="text-[11px] text-muted-foreground">Applied status logged + 3-day follow-up reminder scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Why tech workers choose CareerAgent
            </h2>
            <p className="text-sm text-muted-foreground">
              Built by engineers who were tired of ghost job boards, outdated aggregators, and re-typing work history 100 times.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Zero Recruiter Spam</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We index straight from employer ATS endpoints (Greenhouse, Lever, Ashby, Workday). No fake recruiter listings.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">1-Click ATS Autofill</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fill your background once. Our companion extension maps and populates entire job applications in 3 seconds.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">3-Day Follow-Up Alerts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never let an application slip through the cracks. Get automatic nudges when it’s time to reach out to recruiters.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Unified Kanban Board</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track your applications across Saved, Applied, Interview, and Offer stages without messy spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20 text-center">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to find your next career move?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Discover thousands of active, verified engineering and product positions right now.
          </p>
          <div className="pt-2">
            <Link to="/jobs">
              <Button size="lg" className="h-11 px-8 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 cursor-pointer">
                Explore Open Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
