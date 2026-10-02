import { sendExtensionMessage } from './extensionBridge';
import { hydrateFromExtension } from './profileStorage';

/**
 * One JSON file with everything the user has, since there is no account to recover from: the extension's data
 * (profile, pipeline, resumes, saved answers, settings minus the API key) plus this browser's dashboard state.
 */
const WEB_KEYS = ['careeragent_global_filters', 'careeragent_evaluations', 'careeragent_foryou_pins', 'careeragent_drafts', 'careeragent-theme', 'careeragent-palette', 'careeragent_onboarded', 'careeragent_telemetry'] as const;

export interface Backup {
  format: 'careeragent-backup';
  version: 1;
  exportedAt: string;
  extension: unknown | null;
  web: Record<string, string>;
}

export async function buildBackup(): Promise<Backup> {
  let extension: unknown | null = null;
  try {
    extension = await sendExtensionMessage({ action: 'export_data' }, 15_000);
  } catch {
    extension = null;
  }
  const web: Record<string, string> = {};
  for (const k of WEB_KEYS) {
    const v = localStorage.getItem(k);
    if (v !== null) web[k] = v;
  }
  return { format: 'careeragent-backup', version: 1, exportedAt: new Date().toISOString(), extension, web };
}

export function downloadBackup(b: Backup) {
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `careeragent-backup-${b.exportedAt.slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function parseBackup(text: string): Backup {
  const b = JSON.parse(text) as Backup;
  if (b?.format !== 'careeragent-backup' || typeof b.web !== 'object') throw new Error('Not a CareerAgent backup file.');
  return b;
}

export async function restoreBackup(b: Backup, mode: 'replace' | 'merge'): Promise<string> {
  const parts: string[] = [];
  if (b.extension) {
    const r = await sendExtensionMessage<{ applications: number; resumes: number; answers: number }>({ action: 'import_data', payload: { bundle: b.extension, mode } }, 30_000);
    parts.push(`${r.applications} pipeline entries`, `${r.resumes} resumes`, `${r.answers} saved answers`);
  }
  for (const [k, v] of Object.entries(b.web)) {
    if (!(WEB_KEYS as readonly string[]).includes(k)) continue;
    if (mode === 'merge' && (k === 'careeragent_evaluations' || k === 'careeragent_drafts')) {
      try {
        const cur = JSON.parse(localStorage.getItem(k) || '{}');
        localStorage.setItem(k, JSON.stringify({ ...JSON.parse(v), ...cur }));
        continue;
      } catch {}
    }
    if (mode === 'merge' && k === 'careeragent_foryou_pins') {
      try {
        const cur = JSON.parse(localStorage.getItem(k) || '[]') as string[];
        localStorage.setItem(k, JSON.stringify([...new Set([...cur, ...(JSON.parse(v) as string[])])]));
        continue;
      } catch {}
    }
    localStorage.setItem(k, v);
  }
  await hydrateFromExtension().catch(() => false);
  return parts.length ? parts.join(', ') : 'dashboard settings';
}
