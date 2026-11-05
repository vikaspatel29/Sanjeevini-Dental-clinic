import { useState, useEffect } from 'react';

// Custom event to coordinate programmatic pushState/replaceState
const ROUTE_CHANGE_EVENT = 'app_route_change';

export function navigate(to: string) {
  if (window.location.pathname !== to) {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export function redirect(to: string) {
  window.history.replaceState({}, '', to);
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
}

export function useCurrentPath(): string {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener(ROUTE_CHANGE_EVENT, handleLocationChange);
    };
  }, []);

  return currentPath;
}
