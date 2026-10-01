import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Tracker } from './pages/Tracker';
import { Followups } from './pages/Followups';
import { QuickGenerate } from './pages/QuickGenerate';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Portals } from './pages/Portals';
import { Logs } from './pages/Logs';
import { ThemeProvider } from './components/ThemeProvider';
import { OnboardingModal } from './components/OnboardingModal';
import { setupLogListener } from './lib/logger';

import { debugLog } from './lib/extensionBridge';

function App() {
  useEffect(() => {
    const handleErr = (e: ErrorEvent) => debugLog('GLOBAL_ERROR', e.message, { stack: e.error?.stack });
    const handleRej = (e: PromiseRejectionEvent) => debugLog('UNHANDLED_REJECTION', String(e.reason));
    window.addEventListener('error', handleErr);
    window.addEventListener('unhandledrejection', handleRej);
    
    const cleanup = setupLogListener();
    return () => {
      cleanup?.();
      window.removeEventListener('error', handleErr);
      window.removeEventListener('unhandledrejection', handleRej);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <Router>
        <div className="h-screen h-[100dvh] flex flex-col font-sans bg-background text-foreground overflow-hidden">
          <Header />
          <OnboardingModal />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Routes>
              {/* Canonical Jobs Feed */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Navigate to="/" replace />} />
              <Route path="/explore" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/home" element={<Navigate to="/" replace />} />

              {/* Pipeline & Tracking */}
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/pipeline" element={<Navigate to="/tracker" replace />} />
              <Route path="/applications" element={<Navigate to="/tracker" replace />} />
              <Route path="/followups" element={<Followups />} />

              {/* Tools & Utilities */}
              <Route path="/quick-generate" element={<QuickGenerate />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/portals" element={<Portals />} />

              {/* Account & Preferences */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logs" element={<Logs />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

