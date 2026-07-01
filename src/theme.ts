export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'themeMode';

export function getInitialThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'dark' : 'light';
}

export function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light');
  root.classList.add(mode === 'light' ? 'theme-light' : 'theme-dark');

  window.localStorage.setItem(STORAGE_KEY, mode);
}

