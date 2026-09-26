export type LogoConcept = 'northstar' | 'radar' | 'ascend' | 'monogram';

export const LOGO_OPTIONS: { id: LogoConcept; name: string; description: string }[] = [
  {
    id: 'northstar',
    name: '1. North Star (AI Spark)',
    description: 'Autonomous intelligence & career guidance star',
  },
  {
    id: 'radar',
    name: '2. Job Radar / Compass',
    description: 'Precision targeting scanning ATS portals',
  },
  {
    id: 'ascend',
    name: '3. Ascend Vector',
    description: 'Upward career velocity & momentum chevron',
  },
  {
    id: 'monogram',
    name: '4. CA Monogram',
    description: 'Modern geometric tech brand mark',
  },
];

export function BrandLogo({ concept = 'northstar', className = 'h-6 w-6' }: { concept?: LogoConcept; className?: string }) {
  switch (concept) {
    case 'northstar':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path
            d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
            className="fill-primary"
          />
          <circle cx="12" cy="12" r="2.5" className="fill-background" />
        </svg>
      );

    case 'radar':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="12" cy="12" r="10" className="stroke-primary/30" />
          <path d="M12 2a10 10 0 0 1 10 10" className="stroke-primary" strokeWidth="2.5" />
          <polygon points="16.5 7.5 13.5 13.5 7.5 16.5 10.5 10.5 16.5 7.5" className="fill-primary stroke-primary" />
        </svg>
      );

    case 'ascend':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path
            d="M3 13.5L12 4.5L21 13.5L17.5 17L12 11.5L6.5 17L3 13.5Z"
            className="fill-primary"
          />
          <path
            d="M7 19.5L12 14.5L17 19.5L15 21.5L12 18.5L9 21.5L7 19.5Z"
            className="fill-primary/60"
          />
        </svg>
      );

    case 'monogram':
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="24" height="24" rx="6" className="fill-primary" />
          <path
            d="M11 7.5H8.5C7.4 7.5 6.5 8.4 6.5 9.5V14.5C6.5 15.6 7.4 16.5 8.5 16.5H11V14.5H8.5V9.5H11V7.5Z"
            className="fill-primary-foreground"
          />
          <path
            d="M15 16.5L17 7.5L19 16.5H17.5L17 14H15.5L15 16.5ZM16 12H16.8L16.4 9.5L16 12Z"
            className="fill-primary-foreground"
          />
        </svg>
      );
  }
}
