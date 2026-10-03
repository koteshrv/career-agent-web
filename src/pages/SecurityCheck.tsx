import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { Check } from 'lucide-react';
import { Logo } from '../components/Logo';

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
    setStatus('success');
    // Until career-agent-api verifies this token and issues a session, it only unlocks the SPA client-side.
    sessionStorage.setItem('turnstile_passed', 'true');
    sessionStorage.setItem('turnstile_token', token);
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/jobs';
    const timer = setTimeout(() => navigate(from, { replace: true }), 500);
    return () => clearTimeout(timer);
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
            : 'This keeps the job index free and open by stopping bots from scraping it.'}
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
          <div className="mt-3 text-sm">
            <p className="text-destructive">That didn’t go through.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1 cursor-pointer font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
