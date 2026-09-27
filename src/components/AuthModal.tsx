import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Orbit, 
  Mail, 
  ShieldCheck, 
  Upload, 
  ArrowRight, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { getStoredProfile, saveStoredProfile } from '../lib/profileStorage';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithEmail, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'auth' | 'upload'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), name.trim() || undefined);
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    setStep('upload');
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      extractFromFileName(file.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      extractFromFileName(file.name);
    }
  };

  const extractFromFileName = (fileName: string) => {
    setIsParsing(true);
    setTimeout(() => {
      const current = getStoredProfile();
      const parts = (name || 'Alex Morgan').split(' ');
      const updated = {
        ...current,
        firstName: current.firstName || parts[0] || 'Alex',
        lastName: current.lastName || parts.slice(1).join(' ') || 'Morgan',
        email: current.email || email || 'alex.morgan@example.com',
        headline: current.headline || 'Senior Fullstack Engineer',
        skills: Array.from(new Set([...current.skills, 'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'])),
        resumeFileName: fileName,
        keyAccomplishments: current.keyAccomplishments.length > 0 ? current.keyAccomplishments : [
          'Scaled distributed microservices architecture serving 10M+ daily active requests',
          'Reduced query latency by 45% through Redis caching and PostgreSQL query indexing'
        ],
      };
      saveStoredProfile(updated);
      setIsParsing(false);
      closeAuthModal();
      navigate('/jobs');
    }, 700);
  };

  const handleFinishOnboarding = () => {
    if (resumeText.trim()) {
      const current = getStoredProfile();
      const parts = (name || 'Alex Morgan').split(' ');
      const detectedSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'SQL'];
      saveStoredProfile({
        ...current,
        firstName: current.firstName || parts[0] || 'Alex',
        lastName: current.lastName || parts.slice(1).join(' ') || 'Morgan',
        email: current.email || email || 'alex.morgan@example.com',
        skills: Array.from(new Set([...current.skills, ...detectedSkills])),
        resumeText,
      });
    }
    closeAuthModal();
    navigate('/jobs');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {step === 'auth' ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1">
                <Orbit className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Welcome to careeragent<span className="text-primary">.fyi</span>
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Sign in to match your resume with verified direct ATS jobs and automate your applications.
              </p>
            </div>

            {/* Google SSO Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-10 rounded-xl border-border bg-card hover:bg-muted font-medium text-xs gap-3 shadow-2xs cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold relative">
                or with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Your full name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs gap-2 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                Sign In with Email
              </Button>
            </form>

            <div className="pt-2 border-t border-border/70 flex flex-col gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleGuestLogin}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted font-normal gap-1.5 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Continue as Guest Mode
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Secure & encrypted. Your profile syncs seamlessly with your companion extension.
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Upload Resume / Onboarding */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Step 2: Drop Your Resume
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                We'll extract your skills and experience to calculate 0–100% fit scores across thousands of direct ATS roles.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleResumeDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                isParsing 
                  ? 'border-primary bg-primary/5 animate-pulse' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/40'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
                disabled={isParsing}
              />
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">
                  {isParsing ? 'Analyzing skills & experience...' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PDF, DOCX, or TXT (Parsed 100% locally in browser)
                </p>
              </div>
            </label>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full"></div>
              <span className="bg-card px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold relative">
                or paste summary
              </span>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="E.g. Fullstack Engineer with 5 years in React, TypeScript, Node.js, Python, AWS..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-2.5 text-xs bg-background border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => {
                  closeAuthModal();
                  navigate('/jobs');
                }}
                className="flex-1 h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleFinishOnboarding}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
              >
                See Matched Jobs
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
