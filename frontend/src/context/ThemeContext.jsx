import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('klikpdf_theme_mode');
    if (saved) return saved;
    const oldTheme = localStorage.getItem('klikpdf_theme') || localStorage.getItem('sukapdf_theme');
    if (oldTheme) return oldTheme;
    return 'dark'; // Stitch default: obsidian dark theme
  });

  const [theme, setTheme] = useState(mode === 'light' ? 'light' : 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
        setTheme('dark');
      } else {
        root.classList.remove('dark');
        setTheme('light');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      const listener = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(mode === 'dark');
    }

    localStorage.setItem('klikpdf_theme_mode', mode);
    localStorage.setItem('klikpdf_theme', mode === 'dark' ? 'dark' : 'light');
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);