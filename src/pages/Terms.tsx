import React, { useEffect } from 'react';

export const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section style={{ padding: 'var(--spacing-80) 0' }}>
      <div className="container-sm">
        <div style={{ marginBottom: 'var(--spacing-48)' }}>
          <span className="uppercase-label">LEGAL</span>
          <h1 className="heading" style={{ marginTop: 'var(--spacing-8)' }}>Terms and Conditions</h1>
          <p className="body-lg text-steel" style={{ marginTop: 'var(--spacing-16)' }}>Last updated: August 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32)' }}>
          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>1. Acceptance of Terms</h2>
            <p className="body text-iron">By downloading, installing, and using Mofin ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the App.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>2. Use of the App</h2>
            <p className="body text-iron">Mofin is a personal finance tool designed to read transactional SMS notifications (from supported mobile money services) stored locally on your device for the purpose of tracking and categorizing your expenses.</p>
            <ul className="body text-iron" style={{ listStyleType: 'disc', paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You grant the App permission to read your SMS notifications locally to function correctly.</li>
              <li>You are responsible for the security of your device and the data stored within the App.</li>
              <li>The App does not initiate any transactions on your behalf.</li>
            </ul>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>3. Privacy and Data Security</h2>
            <p className="body text-iron">Your privacy is our primary concern. Mofin operates primarily offline. We do not collect, transmit, or store your SMS data or transaction history on external servers unless you explicitly opt-in to a cloud backup feature. For full details, please refer to our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>4. Limitations of Liability</h2>
            <p className="body text-iron">Mofin is provided "as is" without any warranties of any kind. We do not guarantee the absolute accuracy of auto-categorizations or financial summaries. We shall not be held liable for any financial decisions made based on the data presented by the App.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>5. Changes to Terms</h2>
            <p className="body text-iron">We reserve the right to modify these terms at any time. We will notify users of any significant changes via the App or our website. Continued use of the App after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
    </section>
  );
};
