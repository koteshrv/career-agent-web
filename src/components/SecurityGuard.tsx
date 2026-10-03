import { Navigate, useLocation } from 'react-router-dom';

export function SecurityGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const passed = sessionStorage.getItem('turnstile_passed');

  if (!passed && location.pathname !== '/security') {
    return <Navigate to="/security" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
