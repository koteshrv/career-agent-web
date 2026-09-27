import type { CandidateProfile } from '../types/profile';
import { DEFAULT_PROFILE } from '../types/profile';
import type { TrackedApplication, ApplicationStatus } from '../types/tracker';

const PROFILE_KEY = 'careeragent_candidate_profile';
const TRACKER_KEY = 'careeragent_tracked_applications';

export function getStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to read profile from localStorage:', err);
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: CandidateProfile): void {
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    broadcastSync('SYNC_PROFILE', updated);
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
  }
}

export function getStoredApplications(): TrackedApplication[] {
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read applications from localStorage:', err);
    return [];
  }
}

export function saveStoredApplications(apps: TrackedApplication[]): void {
  try {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(apps));
    broadcastSync('SYNC_APPLICATIONS', apps);
  } catch (err) {
    console.error('Failed to save applications to localStorage:', err);
  }
}

export function addTrackedApplication(
  app: Omit<TrackedApplication, 'id' | 'appliedDate' | 'updatedAt' | 'followUpDate'> & {
    appliedDate?: string;
    followUpDate?: string;
  }
): TrackedApplication {
  const current = getStoredApplications();
  const now = new Date();
  const appliedDate = app.appliedDate || now.toISOString();

  // Compute 3-day follow-up reminder
  const followUp = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const newApp: TrackedApplication = {
    ...app,
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    appliedDate,
    followUpDate: app.followUpDate || followUp,
    followedUp: false,
    updatedAt: now.toISOString(),
  };

  const updatedList = [newApp, ...current];
  saveStoredApplications(updatedList);
  return newApp;
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): void {
  const current = getStoredApplications();
  const updated = current.map((app) =>
    app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
  );
  saveStoredApplications(updated);
}

export function updateApplicationFollowUp(id: string, followedUp: boolean): void {
  const current = getStoredApplications();
  const updated = current.map((app) => {
    if (app.id !== id) return app;
    // If marking as followed up, push next follow-up out another 4 days
    const nextDate = followedUp
      ? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      : app.followUpDate;
    return { ...app, followedUp, followUpDate: nextDate, updatedAt: new Date().toISOString() };
  });
  saveStoredApplications(updated);
}

export function deleteTrackedApplication(id: string): void {
  const current = getStoredApplications();
  saveStoredApplications(current.filter((a) => a.id !== id));
}

/**
 * Broadcast updates to CareerAgent Browser Extension via window.postMessage
 */
export function broadcastSync(type: 'SYNC_PROFILE' | 'SYNC_APPLICATIONS', payload: unknown): void {
  try {
    window.postMessage(
      {
        source: 'CAREERAGENT_WEB',
        type,
        payload,
        timestamp: Date.now(),
      },
      '*'
    );
  } catch (e) {
    // Ignore cross-origin broadcast restrictions
  }
}
