import { Link } from 'react-router-dom';
import { version as APP_VERSION } from '../../package.json';

const DISCORD_URL = import.meta.env.VITE_DISCORD_URL || '';
const item = 'hover:text-foreground transition-colors';

/**
 * One quiet row of site links at the bottom of scrolling pages, at the
 * header's width on every page. Jobs, For you and Pipeline are full-height
 * workspaces and skip it.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-5 sm:px-8">
        <span className="text-foreground">CareerAgent</span>
        <Link to="/about" className={item}>About</Link>
        <Link to="/about#privacy" className={item}>Privacy</Link>
        <Link to="/portals" className={item}>Companies we index</Link>
        <a href="https://github.com/koteshrv/career-agent-web" target="_blank" rel="noreferrer" className={item}>GitHub</a>
        {DISCORD_URL && <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={item}>Discord</a>}
        <span className="sm:ml-auto">Dashboard {APP_VERSION} &middot; Open source, MIT license</span>
      </div>
    </footer>
  );
}
