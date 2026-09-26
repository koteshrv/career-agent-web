import { 
  Sparkle, 
  ArrowUpRight, 
  Navigation, 
  Focus, 
  Compass,
  Command
} from 'lucide-react';

export type LogoConcept = 
  | 'career-climber'
  | 'career-png'
  | 'sparkle' 
  | 'arrow-up-right' 
  | 'navigation' 
  | 'focus' 
  | 'compass' 
  | 'command';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'career-climber',
    name: '1. Career Climber (SVG Vector)',
    description: 'Crisp vector version of your career climber planting the flag on the summit',
  },
  {
    id: 'career-png',
    name: '2. Career PNG (Your Original Icon)',
    description: 'Direct render of your uploaded career.png icon file',
  },
  {
    id: 'sparkle',
    name: '3. The Sparkle ✦ (Simplify style)',
    description: 'The exact minimalist 4-point star used by Simplify.jobs for AI autofill',
  },
  {
    id: 'arrow-up-right',
    name: '4. Arrow Up Right ↗ (Linear style)',
    description: 'Ultra-clean single-stroke diagonal arrow for upward career momentum',
  },
  {
    id: 'navigation',
    name: '5. Navigation Dart ▲ (Cursor style)',
    description: 'Minimalist sleek navigation cursor representing the autonomous agent',
  },
  {
    id: 'focus',
    name: '6. Focus Reticle ⌖',
    description: 'Minimalist camera corners locking onto verified job opportunities',
  },
  {
    id: 'compass',
    name: '7. Career Compass 🧭',
    description: 'Minimal geometric circle with a clean directional needle',
  },
  {
    id: 'command',
    name: '8. Command ⌘ (Apple / Raycast style)',
    description: 'Clean developer command icon representing automated workflows',
  },
];

export function BrandLogo({ concept = 'career-climber', className = 'h-5 w-5' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'career-climber':
      // Razor-sharp vector translation of Flaticon Goal Climber
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Base Steps */}
          <path
            d="M3 20.5H21"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="stroke-muted-foreground/60"
          />
          <path
            d="M4 20.5V17H7.5V13.5H11V10H14.5V6.5H18V20.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            className="stroke-primary/80 fill-primary/10"
          />
          {/* Climber Head */}
          <circle cx="10" cy="8" r="1.4" className="fill-foreground stroke-foreground" strokeWidth="0.4" />
          {/* Climber Torso & Leading Arm holding flagpole */}
          <path
            d="M9 10L11.5 11.5L14.5 8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
          {/* Climber Legs climbing steps */}
          <path
            d="M7.8 17L9.5 13.5L11.5 11.5L13 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-foreground"
          />
          {/* Summit Flagpole */}
          <line
            x1="14.5"
            y1="2.5"
            x2="14.5"
            y2="6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="stroke-foreground"
          />
          {/* Goal Flag */}
          <path
            d="M14.5 2.5H19.5L18 4.5L19.5 6.5H14.5V2.5Z"
            className="fill-primary stroke-primary"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'career-png':
      // Render the exact career.png file
      return (
        <img 
          src="/career.png" 
          alt="CareerAgent Icon" 
          className={`${className} object-contain rounded-xs filter dark:invert`} 
        />
      );

    case 'sparkle':
      return (
        <Sparkle 
          className={`${className} text-primary fill-primary`} 
        />
      );

    case 'arrow-up-right':
      return (
        <div className="p-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ArrowUpRight className={`${className} text-primary stroke-[2.5]`} />
        </div>
      );

    case 'navigation':
      return (
        <Navigation 
          className={`${className} text-primary fill-primary rotate-45`} 
        />
      );

    case 'focus':
      return (
        <Focus 
          className={`${className} text-primary stroke-[2.2]`} 
        />
      );

    case 'compass':
      return (
        <Compass 
          className={`${className} text-primary stroke-[2]`} 
        />
      );

    case 'command':
      return (
        <div className="p-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Command className={`${className} text-primary stroke-[2.2]`} />
        </div>
      );
  }
}
