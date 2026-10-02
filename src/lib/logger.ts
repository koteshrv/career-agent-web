export type ApiLog = {
  id: string;
  timestamp: string;
  endpoint: string;
  action: string;
  requestBody: unknown;
  responseBody: unknown;
  status: number;
  /** Which model answered and how long it took, when the extension reports it. */
  meta?: { provider?: string; model?: string; durationMs?: number; systemPrompt?: string };
};

const LOG_STORAGE_KEY = 'careeragent_api_logs';

export function getLogs(): ApiLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLog(log: Omit<ApiLog, 'id'>) {
  if (typeof window === 'undefined') return;
  const logs = getLogs();
  const newLog = { ...log, id: crypto.randomUUID() };
  const nextLogs = [newLog, ...logs].slice(0, 200); // keep last 200 for performance
  sessionStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(nextLogs));
  window.dispatchEvent(new Event('careeragent_logs_updated'));
}

export function clearLogs() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LOG_STORAGE_KEY);
  window.dispatchEvent(new Event('careeragent_logs_updated'));
}
