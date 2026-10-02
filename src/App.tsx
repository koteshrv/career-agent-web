import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { BottomTabs } from './components/BottomTabs';
import { Home } from './pages/Home';
import { Pipeline } from './pages/Pipeline';
import { Drafts } from './pages/Drafts';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Portals } from './pages/Portals';
import { Logs } from './pages/Logs';
import { ThemeProvider } from './components/ThemeProvider';
import { ResumeImportDialog } from './components/ResumeImportDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/toast';
import { hydrateFromExtension } from './lib/profileStorage';

function App() {
  // Pull the extension's copy of profile + tracker on load and whenever the tab regains focus.
  useEffect(() => {
    hydrateFromExtension();
    const onVisible = () => {
      if (document.visibilityState === 'visible') hydrateFromExtension();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="careeragent-theme">
      <ToastProvider>
        <Router>
          <div className="h-[100dvh] flex flex-col bg-background text-foreground">
            <Header />
            <ResumeImportDialog />
            <ErrorBoundary>
              <div className="flex-1 min-h-0 flex flex-col">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Navigate to="/" replace />} />
                  <Route path="/explore" element={<Navigate to="/" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/portals" element={<Portals />} />
                  <Route path="/drafts" element={<Drafts />} />
                  <Route path="/quick-generate" element={<Navigate to="/drafts" replace />} />

                  <Route path="/pipeline" element={<Pipeline tab="board" />} />
                  <Route path="/pipeline/followups" element={<Pipeline tab="followups" />} />
                  <Route path="/pipeline/stats" element={<Pipeline tab="stats" />} />
                  <Route path="/tracker" element={<Navigate to="/pipeline" replace />} />
                  <Route path="/applications" element={<Navigate to="/pipeline" replace />} />
                  <Route path="/followups" element={<Navigate to="/pipeline/followups" replace />} />
                  <Route path="/analytics" element={<Navigate to="/pipeline/stats" replace />} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/activity" element={<Logs />} />
                  <Route path="/logs" element={<Navigate to="/settings/activity" replace />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </ErrorBoundary>
            <BottomTabs />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
