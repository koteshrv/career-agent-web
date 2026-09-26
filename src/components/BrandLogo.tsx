import { 
  Sparkles, 
  BadgeCheck, 
  SendHorizontal, 
  Layers, 
  Orbit, 
  Terminal, 
  TrendingUp, 
  Briefcase 
} from 'lucide-react';

export type LogoConcept = 
  | 'sparkles' 
  | 'badge-check' 
  | 'paper-plane' 
  | 'layers' 
  | 'orbit' 
  | 'terminal' 
  | 'trending-up' 
  | 'briefcase';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'sparkles',
    name: '1. Dual Sparkles ✨ (Simplify & Notion AI)',
    description: 'The universal modern tech mark for autonomous AI intelligence',
  },
  {
    id: 'badge-check',
    name: '2. Verified ATS Badge 🛡️ (Trust & Quality)',
    description: 'Signifies 100% verified postings straight from employer portals',
  },
  {
    id: 'paper-plane',
    name: '3. 1-Click Send ✈️ (Auto-Apply)',
    description: 'Aerodynamic paper dart representing 1-click application dispatch',
  },
  {
    id: 'layers',
    name: '4. Tech Layers ▤ (Linear & Modern Stack)',
    description: 'Geometric stacked layers representing engineering & modern stacks',
  },
  {
    id: 'orbit',
    name: '5. Autonomous Orbit 🪐 (Agent Scanning)',
    description: 'Planetary orbital ring symbolizing continuous background scanning',
  },
  {
    id: 'terminal',
    name: '6. Developer Terminal >_ (Developer-First)',
    description: 'Minimalist command prompt badge for engineers and tech candidates',
  },
  {
    id: 'trending-up',
    name: '7. Career Trajectory 📈 (Level Up)',
    description: 'Clean upward-surging line for career advancement and salary growth',
  },
  {
    id: 'briefcase',
    name: '8. Minimalist Briefcase 💼 (Classic Reimagined)',
    description: 'Ultra-clean geometric portfolio badge without unnecessary noise',
  },
];

export function BrandLogo({ concept = 'sparkles', className = 'h-5 w-5' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'sparkles':
      return (
        <Sparkles 
          className={`${className} text-primary fill-primary/20 stroke-[2]`} 
        />
      );

    case 'badge-check':
      return (
        <BadgeCheck 
          className={`${className} text-primary fill-primary/15 stroke-[2]`} 
        />
      );

    case 'paper-plane':
      return (
        <SendHorizontal 
          className={`${className} text-primary stroke-[2.2]`} 
        />
      );

    case 'layers':
      return (
        <Layers 
          className={`${className} text-primary stroke-[2]`} 
        />
      );

    case 'orbit':
      return (
        <Orbit 
          className={`${className} text-primary stroke-[2]`} 
        />
      );

    case 'terminal':
      return (
        <div className="p-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Terminal className={`${className} text-primary stroke-[2.2]`} />
        </div>
      );

    case 'trending-up':
      return (
        <div className="p-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <TrendingUp className={`${className} text-primary stroke-[2.4]`} />
        </div>
      );

    case 'briefcase':
      return (
        <Briefcase 
          className={`${className} text-primary stroke-[2]`} 
        />
      );
  }
}
