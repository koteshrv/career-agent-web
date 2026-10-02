/** One place that turns the page's filters and the profile's search defaults into /v1/jobs parameters. */
export type SearchDefaults = { roles: string; keywords: string; excludes: string; location: string };

export function readSearchDefaults(): SearchDefaults {
  try {
    return { roles: '', keywords: '', excludes: '', location: '', ...JSON.parse(localStorage.getItem('careeragent_global_filters') || '{}') };
  } catch {
    return { roles: '', keywords: '', excludes: '', location: '' };
  }
}

const terms = (s: string) => s.split(',').map((t) => t.trim()).filter(Boolean);

export interface PageFilters {
  q: string;
  company: string;
  date: string;
  country: string;
  workplace: string;
}

/**
 * Jobs: the user's own search. For you: target roles as alternatives (each comma-separated role is one search
 * term, so "Backend Engineer, Cloud Engineer" finds either), falling back to keywords when no roles are set,
 * and excluded title words. The API reads at most five terms.
 */
export function jobsParams(mode: 'all' | 'matches', f: PageFilters, d: SearchDefaults): URLSearchParams {
  const p = new URLSearchParams();
  let q = f.q.trim();
  if (mode === 'matches' && !q) q = (terms(d.roles).length ? terms(d.roles) : terms(d.keywords)).slice(0, 5).join(', ');
  if (q) p.set('q', q);
  if (mode === 'matches') {
    const ex = terms(d.excludes).slice(0, 10).join(',');
    if (ex) p.set('exclude', ex);
  }
  if (f.company) p.set('company', f.company);
  const days = f.date === '24h' ? 1 : f.date === 'week' ? 7 : f.date === 'month' ? 30 : 0;
  if (days) p.set('posted_within_days', String(days));
  if (f.country) p.set('country', f.country);
  if (f.workplace) p.set('workplace_type', f.workplace);
  return p;
}

/** Title words to drop client-side too, for API versions that ignore `exclude`. */
export function excludeTerms(d: SearchDefaults): string[] {
  return terms(d.excludes).map((t) => t.toLowerCase());
}
