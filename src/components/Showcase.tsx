import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import homeLight from '../assets/screenshots/home-light.png';
import homeDark from '../assets/screenshots/home-dark.png';
import transactionsLight from '../assets/screenshots/transactions-light.png';
import transactionsDark from '../assets/screenshots/transactions-dark.png';
import analyticsLight from '../assets/screenshots/analytics-light.png';
import analyticsDark from '../assets/screenshots/analytics-dark.png';
import budgetLight from '../assets/screenshots/budget-light.png';
import budgetDark from '../assets/screenshots/budget-dark.png';
import eventsLight from '../assets/screenshots/events-light.png';
import eventsDark from '../assets/screenshots/events-dark.png';
import createEventLight from '../assets/screenshots/create-event-light.png';
import createEventDark from '../assets/screenshots/create-event-dark.png';
import statementsLight from '../assets/screenshots/statements-light.png';
import statementsDark from '../assets/screenshots/statements-dark.png';
import categoriesLight from '../assets/screenshots/categories-light.png';
import categoriesDark from '../assets/screenshots/categories-dark.png';
import profileLight from '../assets/screenshots/profile-light.png';
import profileDark from '../assets/screenshots/profile-dark.png';
import { useScreenshotTheme } from '../context/ScreenshotThemeContext';
import { ScreenshotThemeToggle } from './ScreenshotThemeToggle';

interface AppScreenItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  light: string;
  dark: string;
}

const screens: AppScreenItem[] = [
  {
    id: 'home',
    title: 'Home Dashboard',
    subtitle: 'Real-time balance breakdown, multi-account view & automated cashflow curve.',
    badge: 'Core',
    light: homeLight,
    dark: homeDark,
  },
  {
    id: 'transactions',
    title: 'Transactions Ledger',
    subtitle: 'Instant mobile money SMS tracking, search filters & categorized entries.',
    badge: 'Auto-Track',
    light: transactionsLight,
    dark: transactionsDark,
  },
  {
    id: 'analytics',
    title: 'Visual Analytics',
    subtitle: 'Income vs. expense trend curves, breakdown charts & high-spending alerts.',
    badge: 'Insights',
    light: analyticsLight,
    dark: analyticsDark,
  },
  {
    id: 'budget',
    title: 'Smart Budgeting',
    subtitle: 'Set custom spending caps with automated recurring renewal periods.',
    badge: 'Planning',
    light: budgetLight,
    dark: budgetDark,
  },
  {
    id: 'events',
    title: 'Event Tracking',
    subtitle: 'Isolated event ledgers for trips, weddings, projects & special occasions.',
    badge: 'New Feature',
    light: eventsLight,
    dark: eventsDark,
  },
  {
    id: 'create-event',
    title: 'Create & Fund Events',
    subtitle: 'Allocate caps and fund events from existing balance or fresh cash deposits.',
    badge: 'New Feature',
    light: createEventLight,
    dark: createEventDark,
  },
  {
    id: 'statements',
    title: 'Financial Statements',
    subtitle: 'One-click export of clean, print-ready PDF and CSV reports with receipts.',
    badge: 'Statements',
    light: statementsLight,
    dark: statementsDark,
  },
  {
    id: 'categories',
    title: 'Custom Categories',
    subtitle: 'Tailor your expense and income buckets with distinct icons and custom colors.',
    badge: 'Customization',
    light: categoriesLight,
    dark: categoriesDark,
  },
  {
    id: 'profile',
    title: 'Profile & Security',
    subtitle: 'Biometric app lock, subscriptions, statement archives & theme settings.',
    badge: 'Settings',
    light: profileLight,
    dark: profileDark,
  },
];

export const Showcase: React.FC = () => {
  const { theme } = useScreenshotTheme();
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<'normal' | 'reverse'>('normal');

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleDirection = (dir: 'normal' | 'reverse') => {
    setDirection(dir);
    if (!isPlaying) setIsPlaying(true);
  };

  const renderScreenCard = (screen: AppScreenItem, groupKey: string) => {
    const imgSrc = theme === 'dark' ? screen.dark : screen.light;

    return (
      <div key={`${groupKey}-${screen.id}`} className="carousel-item">
        <div className="carousel-card">
          <div className="phone-frame">
            <img
              key={`${screen.id}-${theme}`}
              src={imgSrc}
              alt={`${screen.title} - ${theme === 'light' ? 'Light' : 'Dark'} Mode`}
              className="phone-screenshot-img"
            />
          </div>

          <div className="carousel-card-details">
            <div className="carousel-card-header">
              <h3 className="carousel-card-title">{screen.title}</h3>
              {screen.badge && (
                <span className="carousel-card-badge">{screen.badge}</span>
              )}
            </div>
            <p className="carousel-card-subtitle">{screen.subtitle}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="showcase" className="showcase reveal">
      <div className="container">
        <div className="section-header showcase-header">
          <span className="uppercase-label">APP SHOWCASE</span>
          <h2 className="heading-sm" style={{ marginBottom: 'var(--spacing-12)' }}>
            Every Screen, Thoughtfully Designed
          </h2>
          <p className="body-lg text-steel" style={{ maxWidth: '640px', margin: '0 auto var(--spacing-20)' }}>
            Clean, modern interface built for offline speed and clarity. Preview the app in Light or Dark theme.
          </p>

          <div className="showcase-controls-bar">
            <div className="showcase-theme-switch">
              <span className="showcase-switch-label">App Theme:</span>
              <ScreenshotThemeToggle size="md" />
            </div>

            <div className="showcase-flow-controls">
              <button
                type="button"
                onClick={togglePlay}
                className={`showcase-flow-btn ${!isPlaying ? 'is-paused' : ''}`}
                aria-label={isPlaying ? 'Pause endless slide' : 'Resume endless slide'}
                title={isPlaying ? 'Pause flow' : 'Resume flow'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              <div className="showcase-nav-buttons" aria-label="Slide direction">
                <button
                  type="button"
                  onClick={() => handleDirection('reverse')}
                  className={`showcase-arrow-btn ${direction === 'reverse' && isPlaying ? 'is-active-dir' : ''}`}
                  aria-label="Slide towards right"
                  title="Slide right"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDirection('normal')}
                  className={`showcase-arrow-btn ${direction === 'normal' && isPlaying ? 'is-active-dir' : ''}`}
                  aria-label="Slide towards left"
                  title="Slide left"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="showcase-marquee-container">
        <div className="showcase-marquee-track">
          <div
            className={`showcase-marquee-group ${direction === 'reverse' ? 'direction-reverse' : ''}`}
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          >
            {screens.map(screen => renderScreenCard(screen, 'group-1'))}
          </div>
          <div
            className={`showcase-marquee-group ${direction === 'reverse' ? 'direction-reverse' : ''}`}
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            aria-hidden="true"
          >
            {screens.map(screen => renderScreenCard(screen, 'group-2'))}
          </div>
        </div>
      </div>
    </section>
  );
};
