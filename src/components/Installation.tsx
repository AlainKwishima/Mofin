import React from 'react';
import { InstallStep } from '../types';

const installSteps: InstallStep[] = [
  {
    number: 1,
    title: 'Download the APK',
    description: "Tap the green 'Download APK' button above. The file (mofin-v1.0.0.apk) will save to your Downloads folder.",
  },
  {
    number: 2,
    title: 'Allow Unknown Sources',
    description: "When prompted, tap 'Settings' and enable 'Allow from this source' or 'Install unknown apps.' This is safe, Mofin is verified and signed.",
  },
  {
    number: 3,
    title: 'Install the App',
    description: "Open the downloaded file and tap 'Install.' The process takes about 30 seconds.",
  },
  {
    number: 4,
    title: 'Start Tracking',
    description: 'Open Mofin, grant SMS/Notification permissions, and your first transaction will be detected automatically.',
  },
];

export const Installation: React.FC = () => {
  return (
    <section className="installation reveal">
      <div className="container-sm">
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-sm">How to Install Mofin</h2>
          <p className="body text-steel" style={{ marginTop: 'var(--spacing-12)' }}>Since Mofin is not on the Play Store, you need to allow 'Install from Unknown Sources' once.</p>
        </div>
        
        <div className="install-steps">
          {installSteps.map((step) => (
            <div key={step.number} className="install-step">
              <div className="install-number">{step.number}</div>
              <div>
                <h3 className="subheading">{step.title}</h3>
                <p className="body text-steel" style={{ marginTop: 'var(--spacing-8)' }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
