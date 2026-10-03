const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace("import { About } from './pages/About';", "import { About } from './pages/About';\nimport { SecurityCheck } from './pages/SecurityCheck';\nimport { SecurityGuard } from './components/SecurityGuard';");

// Replace the Router block
const oldRouter = `<Router>
          <div className="h-[100dvh] flex flex-col bg-background text-foreground">
            <Header />
            <ResumeImportDialog />
            <ErrorBoundary>
              <div className="flex-1 min-h-0 flex flex-col">
                <Routes>
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route path="/jobs" element={<Home mode="all" />} />
                  <Route path="/matches" element={<Home mode="matches" />} />
                  <Route path="/explore" element={<Navigate to="/jobs" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/jobs" replace />} />
                  <Route path="/home" element={<Navigate to="/jobs" replace />} />
                  <Route path="/portals" element={<Portals />} />
                  <Route path="/about" element={<About />} />
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

                  <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Routes>
              </div>
            </ErrorBoundary>
            <BottomTabs />
          </div>
        </Router>`;

const newRouter = `<Router>
          <Routes>
            <Route path="/security" element={<SecurityCheck />} />
            <Route path="*" element={
              <SecurityGuard>
                <div className="h-[100dvh] flex flex-col bg-background text-foreground">
                  <Header />
                  <ResumeImportDialog />
                  <ErrorBoundary>
                    <div className="flex-1 min-h-0 flex flex-col">
                      <Routes>
                        <Route path="/" element={<Navigate to="/jobs" replace />} />
                        <Route path="/jobs" element={<Home mode="all" />} />
                        <Route path="/matches" element={<Home mode="matches" />} />
                        <Route path="/explore" element={<Navigate to="/jobs" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/jobs" replace />} />
                        <Route path="/home" element={<Navigate to="/jobs" replace />} />
                        <Route path="/portals" element={<Portals />} />
                        <Route path="/about" element={<About />} />
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
                        
                        <Route path="*" element={<Navigate to="/jobs" replace />} />
                      </Routes>
                    </div>
                  </ErrorBoundary>
                  <BottomTabs />
                </div>
              </SecurityGuard>
            } />
          </Routes>
        </Router>`;

code = code.replace(oldRouter, newRouter);
fs.writeFileSync('src/App.tsx', code);
