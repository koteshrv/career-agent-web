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
 * The single source of status presentation: a pastel pill with a saturated dot, ink text always.
 */
export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; dot: string; text: string; bar: string; pill: string }> = {
  SAVED: { label: 'Saved', dot: 'bg-dot-yellow', text: 'text-foreground', bar: 'bg-dot-yellow', pill: 'bg-tint-yellow' },
  APPLIED: { label: 'Applied', dot: 'bg-dot-blue', text: 'text-foreground', bar: 'bg-dot-blue', pill: 'bg-tint-blue' },
  INTERVIEWING: { label: 'Interviewing', dot: 'bg-dot-lavender', text: 'text-foreground', bar: 'bg-dot-lavender', pill: 'bg-tint-lavender' },
  OFFER: { label: 'Offer', dot: 'bg-dot-green', text: 'text-foreground', bar: 'bg-dot-green', pill: 'bg-tint-green' },
  ARCHIVED: { label: 'Archived', dot: 'bg-line-strong', text: 'text-muted-foreground', bar: 'bg-line-strong', pill: 'bg-muted' },
};
