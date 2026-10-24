import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function readHash() {
  return window.location.hash;
}

/** The page shown is kept in the URL hash (#/pdf-to-word), so links and the back button work. */
export function useHashRoute(): string {
  return useSyncExternalStore(subscribe, readHash).replace(/^#\/?/, '');
}

export const HOME_HREF = '#/';

export function toolHref(toolId: string): string {
  return `#/${toolId}`;
}
