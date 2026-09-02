import React from 'react';
import { Download, Check, Sparkles, Shield } from 'lucide-react';
import homeImg from '../assets/home.png';
import { useLaunchCountdown } from '../hooks/useLaunchCountdown';

export const Hero: React.FC = () => {
  const { isLive } = useLaunchCountdown();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero reveal">
      <div className="container hero-inner">
        <div className="hero-content">
          <span className="badge-green">{isLive ? 'Now Available for Android' : 'Launching Soon for Android'}</span>
          <h1 className="display hero-title">
            <span>Track Your Spendings</span>
            <span><span className="text-ember">Automatically.</span></span>
          </h1>
          <p className="body-lg text-steel">
            Mofin reads your mobile money messages to track every coin you spend or receive. No manual entry. Offline Friendly. Completely private.
          </p>
          <div className="hero-actions">
            {isLive && (
              <a
                href="#download"
                onClick={(e) => handleScroll(e, '#download')}
                className="btn-primary btn-primary-large"
              >
                <Download size={20} />
                Download APK
              </a>
            )}
            <a
              href="#how-it-works"
              onClick={(e) => handleScroll(e, '#how-it-works')}
              className="btn-neutral"
            >
              How It Works
            </a>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-item">
              <Check size={16} color="#09090b" />
              100% Offline
            </div>
            <div className="hero-trust-item">
              <Sparkles size={16} color="#09090b" />
              Algorithmically Categorized
            </div>
            <div className="hero-trust-item">
              <Shield size={16} color="#09090b" />
              Bank-Level Security
            </div>
          </div>
        </div>
        <div className="phone-mockup-wrapper">
          <div className="badge-green phone-mockup-badge">v1.0 — MVP Release</div>
          <div className="phone-frame">
            <img src={homeImg} alt="Mofin Home Screen" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
      </div>
    </section>
  );
};
