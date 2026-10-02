import { Link } from 'react-router-dom';
import { Logo } from './Logo';

/** Phone-only top bar; desktop uses the Sidebar. */
export function Header() {
  return (
    <header className="md:hidden shrink-0 z-30 flex h-14 w-full items-center border-b border-border bg-card px-4">
      <Link to="/" aria-label="CareerAgent home">
        <Logo />
      </Link>
    </header>
  );
}
