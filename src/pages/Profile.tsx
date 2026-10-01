import { useState, useEffect } from 'react';
import { 
  Mail, 
  MapPin, 
  Link2, 
  Code2, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  Upload, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getStoredProfile, saveStoredProfile } from '../lib/profileStorage';
import type { CandidateProfile, WorkExperience, Education } from '../types/profile';

export function Profile() {
  const [profile, setProfile] = useState<CandidateProfile>(getStoredProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAccomplishment, setNewAccomplishment] = useState('');
  const [globalFilters, setGlobalFilters] = useState({
    roles: '',
    keywords: '',
    excludes: '',
    location: ''
  });

  useEffect(() => {
    setProfile(getStoredProfile());
    try {
      const raw = localStorage.getItem('careeragent_global_filters');
      if (raw) {
        setGlobalFilters(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const handleChange = (field: keyof CandidateProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleFilterChange = (field: keyof typeof globalFilters, value: string) => {
    setGlobalFilters((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('careeragent_global_filters', JSON.stringify(updated));
      return updated;
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    saveStoredProfile(profile);
    localStorage.setItem('careeragent_global_filters', JSON.stringify(globalFilters));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Skill Management
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const clean = newSkill.trim();
    if (!profile.skills.includes(clean)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, clean] }));
    }
    setNewSkill('');
    setIsSaved(false);
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
    setIsSaved(false);
  };

  // Accomplishment Management
  const addAccomplishment = () => {
    if (!newAccomplishment.trim()) return;
    setProfile((prev) => ({
      ...prev,
      keyAccomplishments: [...prev.keyAccomplishments, newAccomplishment.trim()],
    }));
    setNewAccomplishment('');
    setIsSaved(false);
  };

  const removeAccomplishment = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      keyAccomplishments: prev.keyAccomplishments.filter((_, i) => i !== index),
    }));
    setIsSaved(false);
  };

  // Experience Management
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setProfile((prev) => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
    setIsSaved(false);
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
    setIsSaved(false);
  };

  const removeExperience = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
    setIsSaved(false);
  };

  // Education Management
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationYear: '',
    };
    setProfile((prev) => ({ ...prev, education: [newEdu, ...prev.education] }));
    setIsSaved(false);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }));
    setIsSaved(false);
  };

  const removeEducation = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
    setIsSaved(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read plain text if text file, or store filename
    handleChange('resumeFileName', file.name);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('resumeText', event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-background px-4 sm:px-6 py-6 pb-24">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Candidate Master Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Fill your background once. The companion extension reads this to autofill applications on Greenhouse, Lever, and Workday.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('open_onboarding_modal'))}
              className="h-9 px-3.5 text-xs font-semibold rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Onboarding
            </Button>
            <Button
              onClick={handleSave}
              className={`h-9 px-4 text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all ${
                isSaved ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Synced to Extension!
                </>
              ) : (
                'Save & Sync to Extension'
              )}
            </Button>
          </div>
        </div>

        {/* Banner: Extension Requirement & 100% Local Privacy Notice */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground tracking-wider uppercase">
                FOSS Architecture
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-foreground">
                Requires Companion Extension &bull; 100% Stored Locally in Browser
              </h2>
            </div>
            <a
              href="https://github.com/koteshrv/career-agent-extension"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 transition-colors"
            >
              <span>career-agent-extension on GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-card border border-border/80 space-y-2">
              <p className="font-semibold text-foreground flex items-center justify-between">
                <span>1. Install Companion Extension</span>
                <span className="text-[10px] text-muted-foreground font-mono">Open Source</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                CareerAgent has zero central databases. All 1-click autofilling on Greenhouse, Lever, Ashby, and Workday runs securely inside your own browser through our companion extension.
              </p>
              <a
                href="https://github.com/koteshrv/career-agent-extension"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline pt-0.5"
              >
                <span>Get extension from github.com/koteshrv/career-agent-extension</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-lg bg-card border border-border/80 space-y-2">
              <p className="font-semibold text-foreground flex items-center justify-between">
                <span>2. Zero Server Storage & Zero Tracking</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">100% Private</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your resume, contact info, and job history are never sent to our servers. Everything stays encrypted in your browser's local storage and syncs directly to the extension.
              </p>
              <p className="text-[11px] text-muted-foreground italic">
                Telemetry to the community registry is strictly anonymous and opt-in via Settings.
              </p>
            </div>
          </div>
        </div>

        {/* AI Agent Onboarding & Target Job Preferences */}
        <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    Target Job Preferences & ATS Exclusions
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    Auto-Applied
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
                  These global criteria automatically filter your job feeds and configure your AI match scoring. Seed them automatically from your resume PDF, or edit manually anytime below.
                </p>
              </div>
            </div>

            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('open_onboarding_modal'))}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-xs font-semibold gap-1.5 shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              Seed with AI (PDF)
            </Button>
          </div>

          {/* Manual Preferences Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground text-xs">
                  Target Roles to Find
                </label>
                <input
                  type="text"
                  value={globalFilters.roles}
                  onChange={(e) => handleFilterChange('roles', e.target.value)}
                  placeholder="e.g. Software Engineer, Frontend Developer, Full Stack..."
                  className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
                <p className="text-[10px] text-muted-foreground">Comma-separated target titles.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground text-xs">
                  Exact Search Keywords
                </label>
                <input
                  type="text"
                  value={globalFilters.keywords}
                  onChange={(e) => handleFilterChange('keywords', e.target.value)}
                  placeholder="e.g. TypeScript, React, Next.js, Node.js..."
                  className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
                <p className="text-[10px] text-muted-foreground">Core tech stack terms to prioritize in matching.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground text-xs">
                  Exclusions & Negative Filters
                </label>
                <input
                  type="text"
                  value={globalFilters.excludes}
                  onChange={(e) => handleFilterChange('excludes', e.target.value)}
                  placeholder="e.g. Senior, Lead, Manager, Clearance, Java, .NET..."
                  className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
                <p className="text-[10px] text-muted-foreground">Jobs containing these keywords are automatically excluded from your feed.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Default Location / Scope
                </label>
                <input
                  type="text"
                  value={globalFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g. Remote, San Francisco, London..."
                  className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
                <p className="text-[10px] text-muted-foreground">Preferred work location or remote preference.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Contact Information */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Contact & Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-muted-foreground mb-1">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Alex"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Morgan"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="alex.morgan@gmail.com"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-muted-foreground mb-1">Current Location (City, State / Country)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="San Francisco, CA, USA"
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Online Presence & Links */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Online Profiles & Portfolios
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={profile.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/alexmorgan"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-foreground" />
                GitHub URL
              </label>
              <input
                type="url"
                value={profile.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                placeholder="https://github.com/alexmorgan"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                Portfolio / Website
              </label>
              <input
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                placeholder="https://alexmorgan.dev"
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Work Authorization & Sponsorship */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Work Authorization & Visa Status
          </h2>
          <p className="text-xs text-muted-foreground">
            The extension uses these answers to autofill mandatory legal questions on Greenhouse and Lever.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-medium text-muted-foreground mb-1">Work Eligibility Status</label>
              <select
                value={profile.workAuthorization}
                onChange={(e) => handleChange('workAuthorization', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden cursor-pointer"
              >
                <option value="US_CITIZEN">Citizen / National</option>
                <option value="PERMANENT_RESIDENT">Permanent Resident (Green Card)</option>
                <option value="STUDENT_VISA">F-1 OPT / Student Visa</option>
                <option value="NEED_SPONSORSHIP">Need Visa Sponsorship</option>
                <option value="OTHER">Other / Authorized without Sponsorship</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border cursor-pointer select-none w-full">
                <input
                  type="checkbox"
                  checked={profile.requiresSponsorship}
                  onChange={(e) => handleChange('requiresSponsorship', e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">
                  Will you now or in the future require visa sponsorship?
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: AI Context — Key Accomplishments */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Key Achievements & Project Highlights (Context for AI)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                When you click "Draft Answer with AI" on application essay questions, the AI cites these real metrics to produce authentic responses.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {profile.keyAccomplishments.map((acc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-background rounded-lg border border-border text-xs">
                <span className="font-bold text-primary mr-1">#{idx + 1}</span>
                <span className="flex-1 text-foreground">{acc}</span>
                <button
                  type="button"
                  onClick={() => removeAccomplishment(idx)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newAccomplishment}
                onChange={(e) => setNewAccomplishment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAccomplishment())}
                placeholder="e.g. Scaled PostgreSQL read-replicas from 2k to 15k QPS, cutting P99 latency by 45%"
                className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
              />
              <Button size="sm" onClick={addAccomplishment} variant="outline" className="h-9 px-3 text-xs gap-1 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Section 5: Core Skills & Tech Stack */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Core Skills & Technical Proficiencies
          </h2>

          <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-background rounded-lg border border-border">
            {profile.skills.length === 0 && (
              <span className="text-xs text-muted-foreground self-center px-1">
                No skills added yet. Type a skill below and press Enter or click Add.
              </span>
            )}
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1.5 rounded-md text-xs font-medium bg-secondary text-foreground border border-border"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. Go, React, Kubernetes, Distributed Systems"
              className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
            />
            <Button size="sm" onClick={addSkill} variant="outline" className="h-9 px-3 text-xs gap-1 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Add Skill
            </Button>
          </div>
        </div>

        {/* Section 6: Work Experiences */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Work History
            </h2>
            <Button size="sm" onClick={addExperience} variant="outline" className="h-8 px-2.5 text-xs gap-1 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Add Position
            </Button>
          </div>

          {profile.experiences.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
              No work experiences added. Click "Add Position" above to add your employment history.
            </p>
          )}

          <div className="space-y-4">
            {profile.experiences.map((exp, idx) => (
              <div key={exp.id} className="p-4 bg-background rounded-lg border border-border space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-semibold text-foreground">Position #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      placeholder="Stripe"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Title / Role</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      placeholder="Senior Software Engineer"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      placeholder="Jan 2022"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      placeholder="Present"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Education */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education
            </h2>
            <Button size="sm" onClick={addEducation} variant="outline" className="h-8 px-2.5 text-xs gap-1 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Add School
            </Button>
          </div>

          {profile.education.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
              No education entries added.
            </p>
          )}

          <div className="space-y-4">
            {profile.education.map((edu, idx) => (
              <div key={edu.id} className="p-4 bg-background rounded-lg border border-border space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-semibold text-foreground">Education #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Institution / University</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                      placeholder="University of California, Berkeley"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Degree & Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      placeholder="B.S. in Computer Science"
                      className="w-full h-8 px-2.5 rounded bg-card border border-border text-foreground text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Resume File Vault */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Resume Attachment Vault
          </h2>
          <p className="text-xs text-muted-foreground">
            The extension attaches your latest resume when filling Greenhouse and Lever application file upload inputs.
          </p>

          <div className="p-4 border-2 border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            {profile.resumeFileName ? (
              <div className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                Attached: {profile.resumeFileName}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Select your default resume file (.pdf, .docx, .txt)
              </span>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border file:border-border file:text-xs file:font-semibold file:bg-secondary file:text-foreground cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
