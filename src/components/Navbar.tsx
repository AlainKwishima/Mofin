import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (targetId === '#') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

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
    <>
      <nav className="navbar" id="top-nav">
        <div className="container nav-inner">
          <Link to="/" onClick={(e) => handleScroll(e as any, '#')} className="nav-logo">
            Mofin<span className="nav-logo-dot"></span>
          </Link>
          <div className="nav-links">
            <a href="/#features" onClick={(e) => handleScroll(e, '#features')}>Features</a>
            <a href="/#how-it-works" onClick={(e) => handleScroll(e, '#how-it-works')}>How It Works</a>
            <a href="/#download" onClick={(e) => handleScroll(e, '#download')}>Download</a>
            <a href="/#changelog" onClick={(e) => handleScroll(e, '#changelog')}>Changelog</a>
          </div>
          <div className="nav-actions">
            <a href="/#download" onClick={(e) => handleScroll(e, '#download')} className="btn-primary" style={{ padding: '12px 16px' }}>
              <Download size={16} />
              Download APK
            </a>
          </div>
          <button 
            className="hamburger" 
            onClick={() => setMobileMenuOpen(true)} 
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} id="mobile-menu">
        <div className="mobile-menu-header">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-logo">
            Mofin<span className="nav-logo-dot"></span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            aria-label="Close Menu" 
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={24} color="#09090b" />
          </button>
        </div>
        <div className="mobile-nav-links">
          <a href="/#features" onClick={(e) => handleScroll(e, '#features')}>Features</a>
          <a href="/#how-it-works" onClick={(e) => handleScroll(e, '#how-it-works')}>How It Works</a>
          <a href="/#download" onClick={(e) => handleScroll(e, '#download')}>Download</a>
          <a href="/#changelog" onClick={(e) => handleScroll(e, '#changelog')}>Changelog</a>
        </div>
        <a 
          href="/#download" 
          onClick={(e) => handleScroll(e, '#download')} 
          className="btn-primary" 
          style={{ marginTop: 'auto', justifyContent: 'center' }}
        >
          <Download size={18} />
          Download APK
        </a>
      </div>
    </>
  );
};
