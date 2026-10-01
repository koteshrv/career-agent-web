import type { CandidateProfile } from '../types/profile';
import type { TrackedApplication } from '../types/tracker';

/**
 * Bridge to the companion extension over chrome.runtime.sendMessage(extensionId, ...).
 * Chrome exposes chrome.runtime on this page only because the extension lists careeragent.fyi
 * in externally_connectable; no content script and no window.postMessage are involved, so
 * other scripts and other sites cannot observe or forge these messages.
 */
export type BridgeRequest =
  | { action: 'ping' }
  | { action: 'get_state' }
  | { action: 'save_profile'; payload: CandidateProfile }
  | { action: 'upsert_application'; payload: TrackedApplication }
  | { action: 'delete_application'; payload: { id: string } }
  | { action: 'parse_resume_for_filters'; payload: { fileName: string; fileData: string } }
  | { action: 'parse_resume'; payload: { fileName: string; fileData: string } };

export interface ResumeFilters {
  roles: string;
  keywords: string;
  excludes: string;
  location: string;
}

export interface ResumeImport {
  profile: Partial<CandidateProfile>;
  filters: ResumeFilters;
}

export interface ExtensionState {
  profile: CandidateProfile;
  applications: TrackedApplication[];
}

const EXTENSION_ID_KEY = 'careeragent_extension_id';

/** Web Store id from the build env; a localStorage override lets developers point at an unpacked build. */
export function getExtensionId(): string {
  try {
    return localStorage.getItem(EXTENSION_ID_KEY) || import.meta.env.VITE_EXTENSION_ID || '';
  } catch {
    return import.meta.env.VITE_EXTENSION_ID || '';
  }
}

export function setExtensionIdOverride(id: string): void {
  if (id.trim()) localStorage.setItem(EXTENSION_ID_KEY, id.trim());
  else localStorage.removeItem(EXTENSION_ID_KEY);
}

type ChromeRuntime = {
  sendMessage: (extensionId: string, message: unknown, callback: (response: unknown) => void) => void;
  lastError?: { message?: string };
};

export function isExtensionApiAvailable(): boolean {
  return Boolean((globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime?.sendMessage);
}

export function sendExtensionMessage<T = unknown>(request: BridgeRequest, timeoutMs = 15_000): Promise<T> {
  const runtime = (globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
  const extensionId = getExtensionId();
  if (!runtime?.sendMessage || !extensionId) {
    return Promise.reject(new Error('EXTENSION_NOT_INSTALLED'));
  }

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('EXTENSION_TIMEOUT')), timeoutMs);
    try {
      runtime.sendMessage(extensionId, request, (response: unknown) => {
        clearTimeout(timer);
        if (runtime.lastError || response === undefined) {
          return reject(new Error('EXTENSION_NOT_INSTALLED'));
        }
        const res = response as { data?: T; error?: string };
        if (res.error) return reject(new Error(res.error));
        resolve(res.data as T);
      });
    } catch {
      clearTimeout(timer);
      reject(new Error('EXTENSION_NOT_INSTALLED'));
    }
  });
}

export async function pingExtension(): Promise<boolean> {
  try {
    const res = await sendExtensionMessage<{ status: string }>({ action: 'ping' }, 1500);
    return res?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Helper to convert a File object to a Base64 string for IPC transfer
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:application/pdf;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
