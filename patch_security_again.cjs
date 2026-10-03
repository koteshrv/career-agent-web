const fs = require('fs');
let code = fs.readFileSync('src/pages/SecurityCheck.tsx', 'utf8');

if (!code.includes('import { API_BASE_URL }')) {
  code = code.replace("import { Logo } from '../components/Logo';", "import { Logo } from '../components/Logo';\nimport { API_BASE_URL } from '../lib/api';");
}

const oldEffect = `  useEffect(() => {
    if (!token) return;
    setStatus('success');
    // Until career-agent-api verifies this token and issues a session, it only unlocks the SPA client-side.
    sessionStorage.setItem('turnstile_passed', 'true');
    sessionStorage.setItem('turnstile_token', token);
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/jobs';
    const timer = setTimeout(() => navigate(from, { replace: true }), 500);
    return () => clearTimeout(timer);
  }, [token, navigate, location]);`;

const newEffect = `  useEffect(() => {
    if (!token) return;
    
    let isCancelled = false;
    
    const exchangeToken = async () => {
      try {
        const res = await fetch(\`\${API_BASE_URL}/v1/auth/session\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (isCancelled) return;
        if (!res.ok) throw new Error('Verification failed');
        
        const data = await res.json();
        if (data.session_token) {
          setStatus('success');
          sessionStorage.setItem('turnstile_passed', 'true');
          sessionStorage.setItem('careeragent_session_jwt', data.session_token);
          
          const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/jobs';
          setTimeout(() => navigate(from, { replace: true }), 500);
        } else {
          setStatus('error');
        }
      } catch (err) {
        if (!isCancelled) setStatus('error');
      }
    };
    
    exchangeToken();
    return () => { isCancelled = true; };
  }, [token, navigate, location]);`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/pages/SecurityCheck.tsx', code);
