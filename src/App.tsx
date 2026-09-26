import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ThemeProvider } from './components/ThemeProvider';
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="careeragent-theme">
      <Router>
        <div className="h-screen h-[100dvh] flex flex-col font-sans bg-background text-foreground overflow-hidden">
          <Header />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
