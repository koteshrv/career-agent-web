export const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://api.careeragent.fyi');

export interface StructuredMetadata {
  yoe_min?: number | null;
  yoe_max?: number | null;
  seniority?: string | null;
  tech_stack?: string[];
  required_skills?: string[];
  remote_policy?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  location_restrictions?: string[];
  clearance_required?: boolean | null;
  visa_sponsorship?: boolean | null;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string | null;
  url: string;
  apply_url?: string | null;
  ats_provider?: string;
  workplace_type?: string;
  country_code?: string | null;
  employment_type?: string;
  job_fingerprint?: string;
  cleaned_description?: string | null;
  raw_description?: string | null;
  structured_metadata?: StructuredMetadata;
  verification_count?: number;
  created_at: string;
  posted_at?: string | null;
  last_verified_at?: string | null;
}

export interface CountryFacet {
  code: string;
  name: string;
  count: number;
}

export interface CountriesResponse {
  success: boolean;
  countries: CountryFacet[];
}

export interface JobDetailResponse {
  success: boolean;
  job: Job;
}

export interface JobsResponse {
  success: boolean;
  jobs: Job[];
  limit: number;
  offset: number;
  has_more: boolean;
}

export const fetcher = async (url: string) => {
  const res = await fetch(API_BASE_URL + url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export type ReportReason = 'dead_link' | 'already_closed' | 'fake_posting' | 'misclassified' | 'spam';

export async function reportJob(jobId: string, reason: ReportReason = 'dead_link', details?: string) {
  const res = await fetch(`${API_BASE_URL}/v1/jobs/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      job_id: jobId, 
      reason,
      details: details?.trim() || undefined 
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to report job');
  }
  return res.json();
}
