import React, { useEffect } from 'react';

export const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section style={{ padding: 'var(--spacing-80) 0' }}>
      <div className="container-sm">
        <div style={{ marginBottom: 'var(--spacing-48)' }}>
          <span className="uppercase-label">LEGAL</span>
          <h1 className="heading" style={{ marginTop: 'var(--spacing-8)' }}>Privacy Policy</h1>
          <p className="body-lg text-steel" style={{ marginTop: 'var(--spacing-16)' }}>Last updated: August 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32)' }}>
          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>Our Core Philosophy</h2>
            <p className="body text-iron">At Mofin, we believe your financial data belongs to you and you alone. Our app is built with an <strong>offline-first</strong> architecture, meaning the processing happens on your device, not on our servers.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>Information We Collect (and don't collect)</h2>
            <h3 className="body-lg" style={{ fontWeight: 600, color: 'var(--color-obsidian)', marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-8)' }}>1. SMS and Transaction Data</h3>
            <p className="body text-iron">Mofin requires access to your SMS messages to detect and track mobile money transactions (like M-Pesa). <strong>This data is read locally on your device and is never uploaded to our servers.</strong> We do not sell, share, or analyze your personal financial data.</p>
            
            <h3 className="body-lg" style={{ fontWeight: 600, color: 'var(--color-obsidian)', marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-8)' }}>2. Smart Algorithm Features</h3>
            <p className="body text-iron">If you use algorithmic categorization features, the specific text of the transaction and your provided label may be securely sent to the configured algorithm API (such as Google Gemini) strictly for categorization purposes. You can configure your own API keys for complete control.</p>

            <h3 className="body-lg" style={{ fontWeight: 600, color: 'var(--color-obsidian)', marginTop: 'var(--spacing-16)', marginBottom: 'var(--spacing-8)' }}>3. Cloud Backups (Optional)</h3>
            <p className="body text-iron">If you choose to enable cloud backups, your encrypted data will be stored securely. It remains encrypted and is inaccessible to us.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>Permissions We Request</h2>
            <ul className="body text-iron" style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>READ_SMS / RECEIVE_SMS:</strong> Required to parse mobile money messages and update your dashboard automatically.</li>
              <li><strong>INTERNET:</strong> Required only for optional cloud backups and fetching algorithmic categorizations.</li>
            </ul>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>Your Rights</h2>
            <p className="body text-iron">Since your data lives on your device, you have complete control over it. You can clear the app data or uninstall the app at any time, which will permanently delete all your Mofin data.</p>
          </section>

          <section>
            <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>Contact Us</h2>
            <p className="body text-iron">If you have any questions about this Privacy Policy, please contact us through the Contact Us page.</p>
          </section>
        </div>
      </div>
    </section>
  );
};
