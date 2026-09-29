import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Tracker } from './pages/Tracker';
import { Followups } from './pages/Followups';
import { QuickGenerate } from './pages/QuickGenerate';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Portals } from './pages/Portals';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <Router>
        <div className="h-screen h-[100dvh] flex flex-col font-sans bg-background text-foreground overflow-hidden">
          <Header />
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

