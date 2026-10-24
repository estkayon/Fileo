import { useSyncExternalStore } from 'react';

const SCROLL_THRESHOLD = 8;

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

function isScrolled() {
  return window.scrollY > SCROLL_THRESHOLD;
}

/** True once the page has scrolled down a little. */
export function useScrolled(): boolean {
  return useSyncExternalStore(subscribe, isScrolled);
}
