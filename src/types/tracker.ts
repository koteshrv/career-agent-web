export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'ARCHIVED';

export interface TrackedApplication {
  id: string;
  company: string;
  title: string;
  location?: string;
  url: string;
  salary?: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO date
  followUpDate?: string; // ISO date (typically appliedDate + 3 days)
  followedUp?: boolean;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  atsProvider?: string;
  updatedAt: string;
}

export const STATUS_ORDER: ApplicationStatus[] = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'ARCHIVED'];

/**
 * The single source of status presentation. Semantic, not a rainbow:
 * saved is quiet, applied is in play (accent), interviewing and offer are good, archived is dim.
 */
export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; dot: string; text: string; bar: string }> = {
  SAVED: { label: 'Saved', dot: 'bg-muted-foreground', text: 'text-muted-foreground', bar: 'bg-muted-foreground' },
  APPLIED: { label: 'Applied', dot: 'bg-primary', text: 'text-primary-text', bar: 'bg-primary' },
  INTERVIEWING: { label: 'Interviewing', dot: 'bg-success', text: 'text-success', bar: 'bg-success' },
  OFFER: { label: 'Offer', dot: 'bg-success ring-2 ring-success/30', text: 'text-success', bar: 'bg-success' },
  ARCHIVED: { label: 'Archived', dot: 'bg-border-strong', text: 'text-muted-foreground', bar: 'bg-border-strong' },
};
