import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { Tracker } from './pages/Tracker';
import { Followups } from './pages/Followups';
import { Portals } from './pages/Portals';
import { QuickGenerate } from './pages/QuickGenerate';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SidebarLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="home" element={<Dashboard />} />
              <Route path="explore" element={<Explore />} />
              <Route path="jobs" element={<Navigate to="/explore" replace />} />
              <Route path="pipeline" element={<Tracker />} />
              <Route path="applications" element={<Navigate to="/pipeline" replace />} />
              <Route path="tracker" element={<Navigate to="/pipeline" replace />} />
              <Route path="followups" element={<Followups />} />
              <Route path="portals" element={<Portals />} />
              <Route path="quick-generate" element={<QuickGenerate />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AuthModal />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
