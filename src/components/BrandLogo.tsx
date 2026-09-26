export type LogoConcept = 'wordmark' | 'prompt-arrow' | 'launch-vector' | 'target-crosshair' | 'hexagon' | 'monogram';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'wordmark',
    name: '1. Minimalist Wordmark + Pulse',
    description: 'Clean typographic brand mark with an active live AI pulse dot',
  },
  {
    id: 'launch-vector',
    name: '2. Stealth Launch Vector (↗)',
    description: 'Minimalist supersonic dart / paper plane launching your career forward',
  },
  {
    id: 'prompt-arrow',
    name: '3. Terminal Prompt & Vector (> ↗)',
    description: 'Developer command prompt evolving into an upward career vector',
  },
  {
    id: 'target-crosshair',
    name: '4. Precision Job Crosshair',
    description: 'Laser radar scanning & locking onto verified ATS job postings',
  },
  {
    id: 'hexagon',
    name: '5. Interlocking Aperture / Hexagon',
    description: 'Precision autonomous radar lens (Linear & Ashby style)',
  },
  {
    id: 'monogram',
    name: '6. Obsidian CA Badge',
    description: 'Razor-sharp geometric monogram for favicon and app icons',
  },
];

export function BrandLogo({ concept = 'wordmark', className = 'h-6 w-6' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'wordmark':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-foreground/90 dark:fill-card" />
          <rect width="24" height="24" rx="6.5" stroke="currentColor" strokeWidth="1.2" className="stroke-border/80" />
          <path
            d="M14 8C13.2 7.3 12.2 7 11 7C8.2 7 6.5 9.2 6.5 12C6.5 14.8 8.2 17 11 17C12.2 17 13.2 16.7 14 16"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-foreground dark:stroke-primary-foreground"
          />
          <circle cx="15.5" cy="12" r="2.2" className="fill-primary animate-pulse" />
        </svg>
      );

    case 'launch-vector':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-primary/10 border border-primary/20" />
          {/* Origami Stealth Jet */}
          <path
            d="M5 19L19 5M19 5H10M19 5V14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
          <path
            d="M5 19L11.5 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="stroke-muted-foreground"
          />
        </svg>
      );

    case 'prompt-arrow':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-primary/10 border border-primary/20" />
          <path
            d="M6.5 8.5L10.5 12L6.5 15.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-muted-foreground"
          />
          <path
            d="M13 15.5L17.5 11M17.5 11H13.5M17.5 11V15"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
        </svg>
      );

    case 'target-crosshair':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" className="stroke-primary/40" />
          <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-primary" />
          <circle cx="12" cy="12" r="3" className="fill-primary" />
        </svg>
      );

    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <polygon
            points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="stroke-primary"
          />
          <polygon
            points="12,7 16.5,9.5 16.5,14.5 12,17 7.5,14.5 7.5,9.5"
            className="fill-primary/25 stroke-primary/50"
            strokeWidth="1.2"
          />
          <circle cx="12" cy="12" r="2" className="fill-primary" />
        </svg>
      );

    case 'monogram':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-foreground text-background" />
          <path
            d="M8.5 8C7.5 8.8 7 10.2 7 12C7 13.8 7.5 15.2 8.5 16"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-background"
          />
          <path
            d="M13 16L15.5 8L18 16M14 13.5H17"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
        </svg>
      );
  }
}
