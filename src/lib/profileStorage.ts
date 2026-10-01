import type { CandidateProfile } from '../types/profile';
import { DEFAULT_PROFILE } from '../types/profile';
import type { TrackedApplication, ApplicationStatus } from '../types/tracker';
import { sendExtensionMessage, type ExtensionState } from './extensionBridge';

/**
 * Local-first store. localStorage is the cache the pages read synchronously; the extension's
 * chrome.storage.local is the canonical copy. Every write here is pushed to the extension as a
 * per-record upsert/delete, and hydrateFromExtension() pulls and merges (last-write-wins per record
 * on updatedAt) on load and when the tab regains focus. Pages re-read on the `careeragent_sync` event.
 */
const PROFILE_KEY = 'careeragent_candidate_profile';
const TRACKER_KEY = 'careeragent_tracked_applications';
const DELETED_KEY = 'careeragent_deleted_application_ids';
export const SYNC_EVENT = 'careeragent_sync';

const ts = (iso?: string) => (iso ? Date.parse(iso) || 0 : 0);
const notifySync = () => window.dispatchEvent(new Event(SYNC_EVENT));
const push = (req: Parameters<typeof sendExtensionMessage>[0]) => sendExtensionMessage(req).catch(() => {});

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

function writeProfile(profile: CandidateProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function saveStoredProfile(profile: CandidateProfile): void {
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    writeProfile(updated);
    push({ action: 'save_profile', payload: updated });
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

function writeApplications(apps: TrackedApplication[]): void {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(apps));
}

function getDeletedIds(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function rememberDeleted(ids: Iterable<string>): void {
  const set = getDeletedIds();
  for (const id of ids) set.add(id);
  localStorage.setItem(DELETED_KEY, JSON.stringify([...set].slice(-500)));
}

export function saveStoredApplications(apps: TrackedApplication[]): void {
  try {
    const prev = new Map(getStoredApplications().map((a) => [a.id, a]));
    writeApplications(apps);

    // Push only what changed; deletes are remembered so a later hydrate cannot resurrect them.
    const nextIds = new Set(apps.map((a) => a.id));
    for (const app of apps) {
      const before = prev.get(app.id);
      if (!before || JSON.stringify(before) !== JSON.stringify(app)) {
        push({ action: 'upsert_application', payload: app });
      }
    }
    const removed = [...prev.keys()].filter((id) => !nextIds.has(id));
    if (removed.length) {
      rememberDeleted(removed);
      for (const id of removed) push({ action: 'delete_application', payload: { id } });
    }
  } catch (err) {
    console.error('Failed to save applications to localStorage:', err);
  }
}

/**
 * Pull the extension's copy and merge it with ours. Returns false when the extension is unreachable.
 */
export async function hydrateFromExtension(): Promise<boolean> {
  let remote: ExtensionState;
  try {
    remote = await sendExtensionMessage<ExtensionState>({ action: 'get_state' }, 3000);
  } catch {
    return false;
  }
  let changed = false;

  // Profile: newer updatedAt wins. An untouched side (no stored record) never wins.
  const hasLocalProfile = Boolean(localStorage.getItem(PROFILE_KEY));
  const remoteProfile = remote.profile ?? ({} as Partial<CandidateProfile>);
  const hasRemoteProfile = Boolean(remoteProfile.updatedAt || remoteProfile.firstName || remoteProfile.email);
  if (hasRemoteProfile && (!hasLocalProfile || ts(remoteProfile.updatedAt) > ts(getStoredProfile().updatedAt))) {
    writeProfile({ ...DEFAULT_PROFILE, ...remoteProfile });
    changed = true;
  } else if (hasLocalProfile && (!hasRemoteProfile || ts(getStoredProfile().updatedAt) > ts(remoteProfile.updatedAt))) {
    push({ action: 'save_profile', payload: getStoredProfile() });
  }

  // Applications: union by id, newer updatedAt wins, local tombstones honoured.
  const deleted = getDeletedIds();
  const local = getStoredApplications();
  const merged = new Map(local.map((a) => [a.id, a]));
  for (const r of remote.applications ?? []) {
    if (deleted.has(r.id)) {
      push({ action: 'delete_application', payload: { id: r.id } });
      continue;
    }
    const l = merged.get(r.id);
    if (!l || ts(r.updatedAt) > ts(l.updatedAt)) {
      merged.set(r.id, r);
      changed = true;
    }
  }
  const remoteById = new Map((remote.applications ?? []).map((a) => [a.id, a]));
  for (const l of local) {
    const r = remoteById.get(l.id);
    if (!r || ts(l.updatedAt) > ts(r.updatedAt)) push({ action: 'upsert_application', payload: merged.get(l.id)! });
  }

  if (changed) {
    writeApplications([...merged.values()].sort((a, b) => ts(b.appliedDate) - ts(a.appliedDate)));
    notifySync();
  }
  return true;
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

export function snoozeApplicationFollowUp(id: string, days: number): void {
  const current = getStoredApplications();
  const nextDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const updated = current.map((app) =>
    app.id === id
      ? { ...app, followUpDate: nextDate, followedUp: false, updatedAt: new Date().toISOString() }
      : app
  );
  saveStoredApplications(updated);
}

export function deleteTrackedApplication(id: string): void {
  const current = getStoredApplications();
  saveStoredApplications(current.filter((a) => a.id !== id));
}
