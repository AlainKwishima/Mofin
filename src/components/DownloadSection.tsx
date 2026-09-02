import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Check } from 'lucide-react';
import versionInfo from '../../version.json';
import { LAUNCH_DATE_LABEL } from '../constants/launch';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';
import { LaunchCountdown } from './LaunchCountdown';

export const DownloadSection: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const { isLive } = useLaunchCountdown();
  const canDownload = isLive && hasAgreed;

  return (
    <section id="download" className="download-section reveal">
      <div className="container-sm download-inner">
        <span className="badge-green">{isLive ? 'Free Download, No Play Store Required' : 'Coming Soon'}</span>
        <h2 className="heading-lg">Get Mofin on Your Phone</h2>
        <p className="body-lg text-steel">
          {isLive
            ? 'Download the APK file and install it directly. It takes less than 2 minutes.'
            : `The APK will be available for download on ${LAUNCH_DATE_LABEL}. Watch the demo above while you wait.`}
        </p>

        {!isLive && <LaunchCountdown variant="compact" />}
        <label
          htmlFor="download-agreement"
          className="download-agreement"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-12)',
            marginTop: 'var(--spacing-8)',
            maxWidth: '520px',
            textAlign: 'left',
            cursor: isLive ? 'pointer' : 'not-allowed',
            opacity: isLive ? 1 : 0.55,
          }}
        >
          <input
            id="download-agreement"
            type="checkbox"
            checked={hasAgreed}
            disabled={!isLive}
            onChange={(e) => setHasAgreed(e.target.checked)}
            style={{
              marginTop: '3px',
              width: '18px',
              height: '18px',
              accentColor: 'var(--color-ember)',
              flexShrink: 0,
              cursor: isLive ? 'pointer' : 'not-allowed',
            }}
          />
          <span className="body text-steel">
            I agree to the{' '}
            <Link to="/privacy" style={{ color: 'var(--color-ember)', fontWeight: 500 }}>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms" style={{ color: 'var(--color-ember)', fontWeight: 500 }}>
              Terms and Conditions
            </Link>
            .
          </span>
        </label>

        <div style={{ marginTop: 'var(--spacing-16)' }}>
          {canDownload ? (
            <a
              href="/mofin.apk"
              className="btn-primary btn-primary-large"
              style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '16px' }}
              download
            >
              <Download size={24} />
              Download APK
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="btn-primary btn-primary-large btn-primary-disabled"
              style={{ fontSize: '16px', padding: '16px 32px', borderRadius: '16px' }}
              aria-describedby="download-agreement"
            >
              <Download size={24} />
              {isLive ? 'Download APK' : 'Download Opens Soon'}
            </button>
          )}
          <div className="caption text-fog" style={{ marginTop: 'var(--spacing-12)' }}>
            v{versionInfo.version} - {versionInfo.file_size} - Android {versionInfo.min_android_version}+
          </div>
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
