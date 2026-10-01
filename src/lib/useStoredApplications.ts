import { useEffect, useState } from 'react';
import { getStoredApplications, SYNC_EVENT } from './profileStorage';
import type { TrackedApplication } from '../types/tracker';

/** Reads the tracker and re-reads whenever this tab or the extension changes it. */
export function useStoredApplications(): [TrackedApplication[], () => void] {
  const [apps, setApps] = useState<TrackedApplication[]>(getStoredApplications);
  const refresh = () => setApps(getStoredApplications());
  useEffect(() => {
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return [apps, refresh];
}
