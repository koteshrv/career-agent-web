import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedRoute({
  children,
  title = 'Authentication Required',
  description = 'Sign in with your Google account to access your personalized candidate workspace.',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-xs text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-background">
        <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-1">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={loginWithGoogle}
              className="w-full h-11 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-muted shadow-2xs gap-2.5 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground pt-1">
            Free forever for job hunting. Your data is encrypted and synced to your private account.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
