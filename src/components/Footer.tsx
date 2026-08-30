import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(targetId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="nav-logo block" style={{ color: 'var(--color-snow)' }}>
              Mofin<span className="nav-logo-dot"></span>
            </Link>
            <p style={{ marginTop: 'var(--spacing-12)', fontSize: '14px', color: 'var(--color-ash)' }}>
              Track every expense.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <div className="footer-links">
              <a href="/#features" onClick={(e) => handleScroll(e, '#features')}>Features</a>
              <a href="/#how-it-works" onClick={(e) => handleScroll(e, '#how-it-works')}>How It Works</a>
              <a href="/#download" onClick={(e) => handleScroll(e, '#download')}>Download</a>
              <a href="/#changelog" onClick={(e) => handleScroll(e, '#changelog')}>Changelog</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <a href="/#download" onClick={(e) => handleScroll(e, '#download')}>Installation Guide</a>
              <a href="/#faq" onClick={(e) => handleScroll(e, '#faq')}>FAQ</a>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="footer-links">
              <a href="mailto:support@mofin.app">support@mofin.app</a>
              <a href="#">Twitter / X</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Mofin.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
