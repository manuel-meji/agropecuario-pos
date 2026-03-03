import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return <>{children}</>;
};

export default ThemeProvider;
