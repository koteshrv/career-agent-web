const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const oldFetcher = `export const fetcher = async (url: string) => {
  const res = await fetch(API_BASE_URL + url);
  if (!res.ok) {
    const ra = Number(res.headers.get('retry-after'));
    throw new ApiError(res.status, Number.isFinite(ra) && ra > 0 ? ra : null);
  }
  return res.json();
};`;

const newFetcher = `export const fetcher = async (url: string) => {
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('careeragent_session_jwt') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }

  const res = await fetch(API_BASE_URL + url, { headers });
  if (!res.ok) {
    const ra = Number(res.headers.get('retry-after'));
    throw new ApiError(res.status, Number.isFinite(ra) && ra > 0 ? ra : null);
  }
  return res.json();
};`;

code = code.replace(oldFetcher, newFetcher);

const oldReport = `  const res = await fetch(\`\${API_BASE_URL}/v1/jobs/report\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      job_id: jobId, 
      reason,
      details: details?.trim() || undefined 
    }),
  });`;

const newReport = `  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('careeragent_session_jwt') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }

  const res = await fetch(\`\${API_BASE_URL}/v1/jobs/report\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      job_id: jobId, 
      reason,
      details: details?.trim() || undefined 
    }),
  });`;

code = code.replace(oldReport, newReport);

fs.writeFileSync('src/lib/api.ts', code);
