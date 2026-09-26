export type LogoConcept = 
  | 'summit-flag'
  | 'ascent' 
  | 'nexus' 
  | 'command-c' 
  | 'briefcase-spark' 
  | 'launch-vector' 
  | 'wordmark';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'summit-flag',
    name: '★ Career Goal (Steps + Victory Flag)',
    description: 'Ascending career ladder steps with the goal flag planted at the summit',
  },
  {
    id: 'ascent',
    name: 'A. Career Ascent (Level Up)',
    description: '3 vertical stepping bars symbolizing career leveling & salary growth',
  },
  {
    id: 'nexus',
    name: 'B. Agentic Nexus (Connected)',
    description: 'Intersecting infinity loop connecting candidates directly to ATS portals',
  },
  {
    id: 'command-c',
    name: 'C. Command C (Career >_)',
    description: 'Geometric letter C with an embedded terminal prompt arrow',
  },
  {
    id: 'briefcase-spark',
    name: 'D. Briefcase + AI Spark',
    description: 'Minimalist modern career briefcase with an AI intelligence sparkle',
  },
  {
    id: 'launch-vector',
    name: 'E. Stealth Launch Vector (↗)',
    description: 'Origami supersonic arrow launching your career forward',
  },
  {
    id: 'wordmark',
    name: 'F. Minimalist Wordmark & Pulse',
    description: 'Clean typographic monogram badge with a live active pulse',
  },
];

export function BrandLogo({ concept = 'summit-flag', className = 'h-6 w-6' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'summit-flag':
      // Flaticon Goal translation: Ascending Steps + Summit Victory Flag
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-card border border-border/80" />
          {/* Ground baseline */}
          <line x1="3.5" y1="19.5" x2="20.5" y2="19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="stroke-muted-foreground/40" />
          
          {/* Ascending Career Steps */}
          <path
            d="M4.5 19.5V16H8V12.5H12V8.5H15.5V19.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary/70"
          />
          {/* Stepped block fills */}
          <path
            d="M4.5 16H8V19.5H4.5V16Z"
            className="fill-muted/80"
          />
          <path
            d="M8 12.5H12V19.5H8V12.5Z"
            className="fill-primary/20"
          />
          <path
            d="M12 8.5H15.5V19.5H12V8.5Z"
            className="fill-primary/35"
          />

          {/* Summit Flagpole */}
          <line
            x1="15.5"
            y1="3.5"
            x2="15.5"
            y2="19.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-foreground"
          />

          {/* Victory Goal Flag at Peak */}
          <path
            d="M15.5 3.5H21L19.2 6.5L21 9.5H15.5V3.5Z"
            className="fill-primary stroke-primary"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="3.5" r="1.2" className="fill-primary" />
        </svg>
      );

    case 'ascent':
      // 3 Stepping Vertical Bars (Junior -> Senior -> Staff)
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-card border border-border/80" />
          <rect x="5.5" y="13.5" width="3.2" height="6" rx="1.6" className="fill-muted-foreground/60" />
          <rect x="10.4" y="9" width="3.2" height="10.5" rx="1.6" className="fill-primary/70" />
          <rect x="15.3" y="4.5" width="3.2" height="15" rx="1.6" className="fill-primary" />
          <circle cx="16.9" cy="4.5" r="1.5" className="fill-primary animate-ping opacity-60" />
        </svg>
      );

    case 'nexus':
      // Overlapping Intersecting Nodes / Infinity Loop
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-card border border-border/80" />
          <circle cx="9" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.2" className="stroke-muted-foreground" />
          <circle cx="15" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.2" className="stroke-primary" />
          <circle cx="12" cy="12" r="2.2" className="fill-primary" />
        </svg>
      );

    case 'command-c':
      // Geometric C with an embedded terminal command prompt >
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-foreground text-background" />
          <path
            d="M10.5 7.5H8C6.6 7.5 5.5 8.6 5.5 10V14C5.5 15.4 6.6 16.5 8 16.5H10.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="stroke-background"
          />
          <path
            d="M13 9.5L16.5 12L13 14.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
        </svg>
      );

    case 'briefcase-spark':
      // Modern Career Briefcase with an AI Spark Cutout
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-card border border-border/80" />
          <path
            d="M9 7V5.5C9 4.7 9.7 4 10.5 4H13.5C14.3 4 15 4.7 15 5.5V7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="stroke-muted-foreground"
          />
          <rect x="4.5" y="7" width="15" height="12.5" rx="3" stroke="currentColor" strokeWidth="2" className="stroke-primary" />
          <path d="M4.5 11.5H19.5" stroke="currentColor" strokeWidth="1.5" className="stroke-border" />
          <circle cx="12" cy="11.5" r="1.8" className="fill-primary" />
        </svg>
      );

    case 'launch-vector':
      // Origami Supersonic Jet / Arrow
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6.5" className="fill-card border border-border/80" />
          <path
            d="M5.5 18.5L18.5 5.5M18.5 5.5H10.5M18.5 5.5V13.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
          <path
            d="M5.5 18.5L12 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="stroke-muted-foreground"
          />
        </svg>
      );

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
  }
}
