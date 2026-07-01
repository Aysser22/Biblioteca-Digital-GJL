import React, { useEffect, useState } from 'react';
import { applyThemeMode, getInitialThemeMode, type ThemeMode } from './theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const initial = getInitialThemeMode();
    setMode(initial);
    applyThemeMode(initial);
  }, []);

  return <>{children}</>;
}


