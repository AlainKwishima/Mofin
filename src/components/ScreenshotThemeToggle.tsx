import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useScreenshotTheme } from '../context/ScreenshotThemeContext';

interface ScreenshotThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ScreenshotThemeToggle: React.FC<ScreenshotThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, setTheme } = useScreenshotTheme();

  return (
    <div
      className={`screenshot-theme-toggle-container ${size === 'sm' ? 'toggle-sm' : ''} ${className}`}
      role="group"
      aria-label="App screenshot theme toggle"
    >
      <button
        type="button"
        className={`screenshot-theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        title="View app in Light Mode"
      >
        <Sun size={size === 'sm' ? 14 : 16} className="toggle-icon" />
        <span>Light</span>
      </button>
      <button
        type="button"
        className={`screenshot-theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        title="View app in Dark Mode"
      >
        <Moon size={size === 'sm' ? 14 : 16} className="toggle-icon" />
        <span>Dark</span>
      </button>
    </div>
  );
};
