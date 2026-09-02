import React from 'react';
import { LAUNCH_DATE_LABEL } from '../constants/launch';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';

interface LaunchCountdownProps {
  variant?: 'default' | 'compact';
}

const pad = (value: number) => String(value).padStart(2, '0');

export const LaunchCountdown: React.FC<LaunchCountdownProps> = ({ variant = 'default' }) => {
  const { isLive, days, hours, minutes, seconds } = useLaunchCountdown();

  if (isLive) {
    return (
      <div className={`launch-countdown launch-countdown--${variant} launch-countdown--live`}>
        <span className="badge-green">Download now available</span>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: pad(days) },
    { label: 'Hours', value: pad(hours) },
    { label: 'Minutes', value: pad(minutes) },
    { label: 'Seconds', value: pad(seconds) },
  ];

  return (
    <div className={`launch-countdown launch-countdown--${variant}`}>
      <p className="launch-countdown-label">
        {variant === 'compact' ? 'Download opens' : 'Download opens on'} {LAUNCH_DATE_LABEL}
      </p>
      <div className="launch-countdown-grid" role="timer" aria-live="polite">
        {units.map((unit) => (
          <div key={unit.label} className="launch-countdown-unit">
            <span className="launch-countdown-value">{unit.value}</span>
            <span className="launch-countdown-unit-label">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
