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

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; dot: string; color: string }> = {
  SAVED: { label: 'Saved', dot: 'bg-amber-500', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  APPLIED: { label: 'Applied', dot: 'bg-blue-500', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  INTERVIEWING: { label: 'Interviewing', dot: 'bg-purple-500', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  OFFER: { label: 'Offer', dot: 'bg-emerald-500', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ARCHIVED: { label: 'Archived', dot: 'bg-muted-foreground', color: 'text-muted-foreground bg-muted border-border' },
};
