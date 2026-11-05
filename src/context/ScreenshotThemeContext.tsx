import React, { createContext, useContext, useState } from 'react';

export type ScreenshotTheme = 'dark' | 'light';

interface ScreenshotThemeContextType {
  theme: ScreenshotTheme;
  setTheme: (theme: ScreenshotTheme) => void;
  toggleTheme: () => void;
}

const ScreenshotThemeContext = createContext<ScreenshotThemeContextType | undefined>(undefined);

export const ScreenshotThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ScreenshotTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mofin_screenshot_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  const setTheme = (newTheme: ScreenshotTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mofin_screenshot_theme', newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ScreenshotThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ScreenshotThemeContext.Provider>
  );
};

export const useScreenshotTheme = (): ScreenshotThemeContextType => {
  const context = useContext(ScreenshotThemeContext);
  if (!context) {
    throw new Error('useScreenshotTheme must be used within a ScreenshotThemeProvider');
  }
  return context;
};
