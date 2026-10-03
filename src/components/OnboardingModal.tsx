import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, Sparkles, MapPin, X } from 'lucide-react';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [roles, setRoles] = useState('');
  const [keywords, setKeywords] = useState('');
  const [excludes, setExcludes] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('careeragent_onboarded');
    if (!hasOnboarded) {
      setIsOpen(true);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Tell extension to process the resume (stub for now)
    window.postMessage({ type: 'CAREER_AGENT_AI', action: 'parse_resume_for_filters', fileName: file.name }, '*');
    
    // Simulate AI delay for UX
    setTimeout(() => {
      setRoles('Frontend Engineer, Full Stack Developer, UI/UX Architect');
      setKeywords('React, TypeScript, Node.js');
      setExcludes('Senior, Manager, Director, Java, .NET');
      setIsProcessing(false);
    }, 2000);
  };

  const handleSave = () => {
    const config = { roles, keywords, excludes, location };
    localStorage.setItem('careeragent_global_filters', JSON.stringify(config));
    localStorage.setItem('careeragent_onboarded', 'true');
    setIsOpen(false);
    window.location.reload();
  };

  const handleSkip = () => {
    localStorage.setItem('careeragent_onboarded', 'skipped');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl p-6 relative">
        <button onClick={handleSkip} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Seed Your Agent Intelligence
          </h2>
          <p className="text-sm text-muted-foreground pt-1.5">
            Uploading your resume allows our AI to automatically extract your core skills, target roles, and exclusions to perfectly filter your job feed.
          </p>
        </div>

        <div className="space-y-6">
          {/* AI Auto-Seed Block */}
          <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Upload Resume (PDF)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                The extension will securely process this locally to configure your agent.
              </p>
            </div>
            <div className="relative inline-block">
              <Input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <Button disabled={isProcessing} className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-none">
                {isProcessing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    AI is analyzing...
                  </>
                ) : (
                  'Run Onboarding Setup'
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Or configure manually</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Manual Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Roles to find</label>
              <Input 
                placeholder="e.g. Software Engineer, Product Manager..." 
                value={roles}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoles(e.target.value)}
                className="h-9 bg-background/50 border-border/80 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">Seeded from your profile — edit freely.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex justify-between">
                <span>Exact search keywords</span>
                <span className="text-muted-foreground font-normal italic">Additional precise ATS filtering keywords</span>
              </label>
              <Input 
                placeholder="e.g. TypeScript, Next.js, Python..." 
                value={keywords}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
                className="h-9 bg-background/50 border-border/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Exclude</label>
              <Input 
                placeholder="e.g. Clearance, Senior, Lead, .NET..." 
                value={excludes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExcludes(e.target.value)}
                className="h-9 bg-background/50 border-border/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Location & Scope
              </label>
              <Input 
                placeholder="e.g. Remote, San Francisco, London..." 
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                className="h-9 bg-background/50 border-border/80 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
            Skip for now
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold">
            Discover (free)
          </Button>
        </div>
      </div>
    </div>
  );
}

