const fs = require('fs');
let code = fs.readFileSync('src/pages/SecurityCheck.tsx', 'utf8');

// Add API_BASE_URL import
code = code.replace("import { ShieldCheck } from 'lucide-react';", "import { ShieldCheck } from 'lucide-react';\nimport { API_BASE_URL } from '../lib/api';");

// Replace the placeholder inside the useEffect
const oldEffect = `      // In the future, we will send this token to career-agent-api here to get a JWT.
      // For now, we just let them into the app.
      sessionStorage.setItem('turnstile_passed', 'true');
      sessionStorage.setItem('turnstile_token', token);
      
      const from = (location.state as any)?.from?.pathname || '/jobs';
      setTimeout(() => navigate(from, { replace: true }), 800);`;

const newEffect = `      const exchangeToken = async () => {
        try {
          const res = await fetch(\`\${API_BASE_URL}/v1/auth/session\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          
          if (!res.ok) throw new Error('Verification failed');
          const data = await res.json();
          
          if (data.session_token) {
            // Store the JWT
            sessionStorage.setItem('turnstile_passed', 'true');
            sessionStorage.setItem('careeragent_session_jwt', data.session_token);
            
            // TODO: In the future, pass this JWT to the extension via window.postMessage
            // so the extension can authenticate its crowdsourcing API calls!
            
            const from = (location.state as any)?.from?.pathname || '/jobs';
            setTimeout(() => navigate(from, { replace: true }), 800);
          } else {
            setStatus('error');
          }
        } catch (error) {
          setStatus('error');
        }
      };
      
      exchangeToken();`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync('src/pages/SecurityCheck.tsx', code);
