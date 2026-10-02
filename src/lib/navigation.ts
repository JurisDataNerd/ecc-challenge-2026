import { useEffect, useState } from 'react';

export function navigate(path: string, replace = false) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Navigation must stay within this app');
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useLocation() {
  const snapshot = () => window.location.pathname + window.location.search;
  const [location, setLocation] = useState(snapshot);
  useEffect(() => {
    const sync = () => setLocation(snapshot());
    window.addEventListener('popstate', sync);
    sync();
    return () => window.removeEventListener('popstate', sync);
  }, []);
  // Route and auth updates share React's queue, so logout cannot briefly render a stale signed-in route.
  return location;
}
