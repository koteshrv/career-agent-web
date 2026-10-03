import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function SecurityCheck() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      setStatus('success');
      // In the future, we will send this token to career-agent-api here to get a JWT.
      // For now, we just let them into the app.
      sessionStorage.setItem('turnstile_passed', 'true');
      sessionStorage.setItem('turnstile_token', token);
      
      const from = (location.state as any)?.from?.pathname || '/jobs';
      setTimeout(() => navigate(from, { replace: true }), 1000);
    }
  }, [token, navigate, location]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md bg-card border border-border/50 shadow-2xl rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          {status === 'success' ? (
            <ShieldCheck className="h-8 w-8 text-green-500 animate-in zoom-in duration-300" />
          ) : (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Verifying your connection</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Career Agent is protecting its crowdsourced ATS database from automated bots. Please complete the security check below.
        </p>

        <div className="min-h-[100px] flex items-center justify-center">
          <Turnstile 
            siteKey="3x00000000000000000000FF" 
            onSuccess={setToken}
            onError={() => setStatus('error')}
            options={{ 
              theme: 'auto',
              size: 'normal'
            }}
          />
        </div>

        {status === 'error' && (
          <p className="text-destructive text-sm mt-4">Verification failed. Please try again.</p>
        )}
      </div>
    </div>
  );
}
