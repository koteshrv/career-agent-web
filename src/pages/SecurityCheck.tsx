import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { Check } from 'lucide-react';
import { Logo } from '../components/Logo';
import { API_BASE_URL } from '../lib/api';

/**
 * The front door: a bot check before the app loads, not a copy of Cloudflare's own interstitial. Says what it's
 * for and what happens next, carries our mark, and gets out of the way the moment it passes.
 */
export function SecurityCheck() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) return;
    
    let isCancelled = false;
    
    const exchangeToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/auth/session`, {
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
  }, [token, navigate, location]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="flex w-full max-w-[320px] flex-col items-center text-center">
        <Logo markSize={28} />

        <h1 className="mt-9 text-xl font-medium tracking-tight text-foreground">
          {status === 'success' ? 'You’re in' : 'One quick check'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {status === 'success'
            ? 'Taking you to the jobs.'
            : 'Verifying a secure connection to the Career Agent platform.'}
        </p>

        <div className="mt-7 flex min-h-[65px] w-full items-center justify-center">
          {status === 'success' ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="size-4" />
              Verified
            </span>
          ) : (
            <Turnstile
              siteKey="3x00000000000000000000FF"
              onSuccess={setToken}
              onError={() => setStatus('error')}
              options={{ theme: 'auto', size: 'normal' }}
            />
          )}
        </div>

        {status === 'error' && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-red-500">Connection verification failed</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
