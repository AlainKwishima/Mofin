import React from 'react';

export const Footer: React.FC = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer reveal">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="nav-logo" style={{ color: 'var(--color-snow)' }}>
              Mofin<span className="nav-logo-dot"></span>
            </div>
            <p style={{ marginTop: 'var(--spacing-12)', fontSize: '14px', color: 'var(--color-ash)' }}>
              Track every shilling.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <div className="footer-links">
              <a href="#features" onClick={(e) => handleScroll(e, '#features')}>Features</a>
              <a href="#how-it-works" onClick={(e) => handleScroll(e, '#how-it-works')}>How It Works</a>
              <a href="#download" onClick={(e) => handleScroll(e, '#download')}>Download</a>
              <a href="#changelog" onClick={(e) => handleScroll(e, '#changelog')}>Changelog</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <a href="#download" onClick={(e) => handleScroll(e, '#download')}>Installation Guide</a>
              <a href="#faq" onClick={(e) => handleScroll(e, '#faq')}>FAQ</a>
              <a href="#">Report a Bug</a>
              <a href="#">Send Feedback</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="footer-links">
              <a href="mailto:hello@mofin.app">hello@mofin.app</a>
              <a href="#">Twitter / X</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Mofin. Built in Kenya.</div>
          <div>Privacy Policy | Terms of Use</div>
        </div>
      </div>
    </footer>
  );
};
