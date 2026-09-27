import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Tracker } from './pages/Tracker';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <AuthProvider>
        <Router>
          <div className="h-screen h-[100dvh] flex flex-col font-sans bg-background text-foreground overflow-hidden">
            <Header />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <Routes>
                {/* 100% Public Unauthenticated Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/jobs" element={<Home />} />

                {/* Authenticated-Only Protected Routes */}
                <Route
                  path="/tracker"
                  element={
                    <ProtectedRoute
                      title="Application Tracker"
                      description="Sign in with Google to view and manage your job applications, interviews, and 3-day follow-up reminders."
                    >
                      <Tracker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute
                      title="Candidate Profile"
                      description="Sign in with Google to manage your master candidate profile, resume, and 1-click ATS autofill settings."
                    >
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute
                      title="Extension & Sync Settings"
                      description="Sign in with Google to connect your CareerAgent companion extension and sync applications."
                    >
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
