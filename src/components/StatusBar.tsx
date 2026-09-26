export function StatusBar() {
  return (
    <footer className="h-7 border-t border-border bg-card/75 backdrop-blur-xs px-3 sm:px-4 text-[11px] text-muted-foreground flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Live Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-medium text-foreground/80">Feed: Real-Time</span>
        <span className="text-muted-foreground/30 hidden md:inline">•</span>
        <span className="hidden md:inline text-muted-foreground/70">Verified ATS Only (Greenhouse, Lever, Ashby, Workday)</span>
      </div>

      {/* Right: Essential Utility Links */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-[11px]">
        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          llms.txt
        </a>
        <span className="text-muted-foreground/30">•</span>
        <a
          href="https://github.com/koteshrv/career-agent-web"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors hidden sm:inline"
        >
          GitHub
        </a>
        <span className="text-muted-foreground/30 hidden sm:inline">•</span>
        <a
          href="https://api.careeragent.fyi/health"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <span>API</span>
          <span className="text-emerald-500 font-medium">Online</span>
        </a>
        <span className="text-muted-foreground/30">•</span>
        <span>© {new Date().getFullYear()} CareerAgent</span>
      </div>
    </footer>
  );
}
