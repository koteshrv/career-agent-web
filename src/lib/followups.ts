import type { TrackedApplication } from '../types/tracker';

const DAY = 24 * 60 * 60 * 1000;

export function followUpTarget(app: TrackedApplication): number {
  return app.followUpDate ? new Date(app.followUpDate).getTime() : new Date(app.appliedDate).getTime() + 5 * DAY;
}

export function daysUntilFollowUp(app: TrackedApplication, now = Date.now()): number {
  return Math.round((followUpTarget(app) - now) / DAY);
}

export function needsFollowUp(app: TrackedApplication): boolean {
  return (app.status === 'APPLIED' || app.status === 'INTERVIEWING') && !app.followedUp;
}

/** One definition of the follow-up queue for the nav badge, the tab count and the list. */
export function groupFollowUps(apps: TrackedApplication[], now = Date.now()) {
  const overdue: TrackedApplication[] = [];
  const due: TrackedApplication[] = [];
  const upcoming: TrackedApplication[] = [];
  for (const app of apps) {
    if (!needsFollowUp(app)) continue;
    const d = daysUntilFollowUp(app, now);
    if (d < 0) overdue.push(app);
    else if (d <= 2) due.push(app);
    else upcoming.push(app);
  }
  return { overdue, due, upcoming, actionable: overdue.length + due.length };
}

export function nudgeEmail(app: TrackedApplication, profile: { firstName: string; lastName: string; linkedinUrl?: string; portfolioUrl?: string }): string {
  const candidateName = profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Candidate';
  const appliedFormatted = new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `Hi ${app.company} Recruiting Team,

I hope your week is going well. I am writing to follow up on my application for the ${app.title} role submitted on ${appliedFormatted}.

I remain very interested in ${app.company} and would welcome any update on the timeline or next steps. If additional materials or code samples would help, I am happy to share them.

Thank you for your time,

${candidateName}
${profile.linkedinUrl || profile.portfolioUrl || ''}`.trim();
}
