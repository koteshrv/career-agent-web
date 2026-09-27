import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Tracker } from './pages/Tracker';
import { Settings } from './pages/Settings';
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
                <Route path="/" element={<Landing />} />
                <Route path="/jobs" element={<Home />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
