import { useEffect, useState } from 'react';

/** One AI verdict per posting, kept in this browser. Mirrors the extension's JobEvaluation plus when it was made. */
export interface JobEvaluation {
  id: string;
  score: number;
  verdict: 'PASS' | 'MARGINAL' | 'FAIL';
  reason: string;
  matches: string[];
  gaps: string[];
  evaluatedAt: string;
  model?: string;
}

const KEY = 'careeragent_evaluations';
const EVENT = 'careeragent_evaluations_updated';

export function getEvaluations(): Record<string, JobEvaluation> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveEvaluations(list: JobEvaluation[]) {
  const all = getEvaluations();
  for (const e of list) all[e.id] = e;
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
}

export function clearEvaluations() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useEvaluations(): Record<string, JobEvaluation> {
  const [all, setAll] = useState(getEvaluations);
  useEffect(() => {
    const update = () => setAll(getEvaluations());
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return all;
}

export const VERDICT_LABEL: Record<JobEvaluation['verdict'], string> = { PASS: 'Apply', MARGINAL: 'Maybe', FAIL: 'Skip' };
export const VERDICT_PILL: Record<JobEvaluation['verdict'], string> = { PASS: 'bg-tint-green', MARGINAL: 'bg-tint-yellow', FAIL: 'bg-muted text-muted-foreground' };
