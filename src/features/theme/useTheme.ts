import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Also read by the small script in index.html that applies the theme before the first paint. */
const STORAGE_KEY = 'fileo-theme';

function readSavedTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked. The theme then only lasts for this visit.
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
  };
}
