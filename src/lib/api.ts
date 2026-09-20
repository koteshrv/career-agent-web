export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string | null;
  url: string;
  created_at: string;
}

export interface JobsResponse {
  success: boolean;
  jobs: Job[];
  has_more: boolean;
}

export interface Company {
  name: string;
  company: string;
  job_count: number;
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
}

export const fetcher = async (url: string) => {
  const res = await fetch(API_BASE_URL + url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export async function reportJob(jobId: string, reason: string = 'Spam/Dead Link') {
  const res = await fetch(`${API_BASE_URL}/v1/jobs/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ job_id: jobId, reason }),
  });
  if (!res.ok) {
    throw new Error('Failed to report job');
  }
  return res.json();
}

