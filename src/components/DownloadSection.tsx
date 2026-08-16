import React from 'react';
import { Download, Check } from 'lucide-react';

export const DownloadSection: React.FC = () => {
  return (
    <section id="download" className="download-section reveal">
      <div className="container-sm download-inner">
        <span className="badge-green">Free Download — No Play Store Required</span>
        <h2 className="heading-lg">Get Mofin on Your Phone</h2>
        <p className="body-lg text-steel">Download the APK file and install it directly. It takes less than 2 minutes.</p>
        
        <div style={{ marginTop: 'var(--spacing-24)' }}>
          <a href="#" className="btn-primary btn-primary-large" style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '16px' }}>
            <Download size={24} />
            Download APK
          </a>
          <div className="caption text-fog" style={{ marginTop: 'var(--spacing-12)' }}>v1.0.0 — 8.5 MB — Android 8.0+</div>
        </div>

        <div className="download-features">
          <span className="body text-steel" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Check size={16} /> No registration required
          </span>
          <span className="body text-steel" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Check size={16} /> 100% free, no ads
          </span>
          <span className="body text-steel" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Check size={16} /> Open source
          </span>
        </div>
      </div>
    </section>
  );
};
