import { useState, useEffect } from 'react';

/**
 * Custom hook for light/dark theme management.
 * Persists theme preference in localStorage and applies it via DaisyUI data-theme attribute.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage first, fall back to 'dark'
    return localStorage.getItem('cp-theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme to html element (DaisyUI reads data-theme)
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cp-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return { theme, toggleTheme, isDark };
}

export default useTheme;
