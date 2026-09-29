import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Tracker } from './pages/Tracker';
import { Portals } from './pages/Portals';
import { Settings } from './pages/Settings';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <AuthProvider>
        <Router>
          <div className="h-screen h-[100dvh] flex flex-col font-sans bg-background text-foreground overflow-hidden">
            <Header />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Navigate to="/" replace />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/portals" element={<Portals />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
            <AuthModal />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
