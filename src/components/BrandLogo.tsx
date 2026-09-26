import { 
  Sparkle, 
  ArrowUpRight, 
  Navigation, 
  Focus, 
  Compass,
  Command
} from 'lucide-react';

export type LogoConcept = 
  | 'sparkle' 
  | 'arrow-up-right' 
  | 'navigation' 
  | 'focus' 
  | 'compass' 
  | 'command';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'sparkle',
    name: '1. The Sparkle ✦ (Simplify style)',
    description: 'The exact minimalist 4-point star used by Simplify.jobs for AI autofill',
  },
  {
    id: 'arrow-up-right',
    name: '2. Arrow Up Right ↗ (Linear style)',
    description: 'Ultra-clean single-stroke diagonal arrow for upward career momentum',
  },
  {
    id: 'navigation',
    name: '3. Navigation Dart ▲ (Cursor style)',
    description: 'Minimalist sleek navigation cursor representing the autonomous agent',
  },
  {
    id: 'focus',
    name: '4. Focus Reticle ⌖',
    description: 'Minimalist camera corners locking onto verified job opportunities',
  },
  {
    id: 'compass',
    name: '5. Career Compass 🧭',
    description: 'Minimal geometric circle with a clean directional needle',
  },
  {
    id: 'command',
    name: '6. Command ⌘ (Apple / Raycast style)',
    description: 'Clean developer command icon representing automated workflows',
  },
];

export function BrandLogo({ concept = 'sparkle', className = 'h-5 w-5' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'sparkle':
      // The classic Simplify.jobs 4-point AI sparkle (filled with electric indigo)
      return (
        <Sparkle 
          className={`${className} text-primary fill-primary`} 
        />
      );

    case 'arrow-up-right':
      // Ultra-clean single-stroke diagonal arrow
      return (
        <div className="p-1 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <ArrowUpRight className={`${className} text-primary stroke-[2.5]`} />
        </div>
      );

    case 'navigation':
      // Sleek Minimalist Navigation Dart
      return (
        <Navigation 
          className={`${className} text-primary fill-primary rotate-45`} 
        />
      );

    case 'focus':
      // Minimalist Focus Corners
      return (
        <Focus 
          className={`${className} text-primary stroke-[2.2]`} 
        />
      );

    case 'compass':
      // Clean geometric compass
      return (
        <Compass 
          className={`${className} text-primary stroke-[2]`} 
        />
      );

    case 'command':
      // Apple / Raycast developer command symbol
      return (
        <div className="p-1 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Command className={`${className} text-primary stroke-[2.2]`} />
        </div>
      );
  }
}
