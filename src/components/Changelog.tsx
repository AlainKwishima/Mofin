import React from 'react';
import { VersionRelease } from '../types';

const releases: VersionRelease[] = [
  {
    version: 'v1.0.0',
    label: 'MVP Release',
    isLatest: true,
    date: 'August 2026',
    features: [
      'M-Pesa transaction detection',
      'On-device AI categorization',
      'Offline-first dashboard & reports',
      'Budget tracking with alerts',
      'PDF export',
    ],
  },
  {
    version: 'v0.9.0',
    label: 'Beta',
    isLatest: false,
    date: 'July 2026',
    features: [
      'Internal testing release',
      'Core SMS parser engine',
    ],
  },
];

export const Changelog: React.FC = () => {
  return (
    <section id="changelog" className="changelog reveal">
      <div className="container-sm">
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-sm">What's New</h2>
          <p className="body text-steel" style={{ marginTop: 'var(--spacing-12)' }}>Track our progress as we build Mofin together.</p>
        </div>

        <div className="changelog-list">
          {releases.map((rel) => (
            <div key={rel.version} className={`version-card ${rel.isLatest ? 'latest' : ''}`}>
              <div className="version-header">
                <h3 className="subheading" style={{ color: rel.isLatest ? undefined : 'var(--color-iron)' }}>
                  {rel.version} — {rel.label}
                </h3>
                {rel.isLatest && <span className="badge-green">Current</span>}
              </div>
              <div className="caption text-fog">{rel.date}</div>
              <ul className="version-list">
                {rel.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
