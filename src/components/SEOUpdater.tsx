import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeConfig: Record<string, { title: string }> = {
  '/jobs': { title: 'Jobs | CareerAgent' },
  '/matches': { title: 'Matched Jobs | CareerAgent' },
  '/portals': { title: 'Company Portals | CareerAgent' },
  '/about': { title: 'About | CareerAgent' },
  '/drafts': { title: 'Drafts | CareerAgent' },
  '/pipeline': { title: 'Pipeline | CareerAgent' },
  '/profile': { title: 'Profile | CareerAgent' },
  '/settings': { title: 'Settings | CareerAgent' },
  '/security': { title: 'Security | CareerAgent' },
};

export function SEOUpdater() {
  const location = useLocation();

  useEffect(() => {
    const config = routeConfig[location.pathname] || { title: 'CareerAgent — Real-Time Verified Jobs' };
    
    // Update title
    document.title = config.title;
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://careeragent.fyi${location.pathname === '/' ? '' : location.pathname}`;
    
  }, [location.pathname]);

  return null;
}
