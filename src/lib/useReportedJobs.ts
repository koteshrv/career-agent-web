import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'careeragent_reported_jobs';

function getInitialReportedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// Global in-memory set and listeners for instant cross-component sync
const globalReportedIds: Set<string> = getInitialReportedIds();
const listeners = new Set<(ids: Set<string>) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(new Set(globalReportedIds)));
}

export function markJobAsReported(jobId: string) {
  globalReportedIds.add(jobId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(globalReportedIds)));
  } catch {
    // Ignore storage quota/permission errors
  }
  notifyListeners();
}

export function useReportedJobs() {
  const [reportedIds, setReportedIds] = useState<Set<string>>(() => new Set(globalReportedIds));

  useEffect(() => {
    const handleUpdate = (nextIds: Set<string>) => {
      setReportedIds(nextIds);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const markReported = useCallback((jobId: string) => {
    markJobAsReported(jobId);
  }, []);

  const isReported = useCallback(
    (jobId?: string | null) => {
      if (!jobId) return false;
      return reportedIds.has(jobId);
    },
    [reportedIds]
  );

  return { isReported, markReported };
}
