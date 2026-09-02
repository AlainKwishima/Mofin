import React from 'react';
import homeImg from '../assets/home.jpeg';
import transactionsImg from '../assets/transactions.jpeg';
import txDetailImg from '../assets/transaction-detail.jpeg';
import analyticsImg from '../assets/analytics.jpeg';
import budgetImg from '../assets/budget.jpeg';
import exportImg from '../assets/export.jpeg';
import profileImg from '../assets/profile.jpeg';

export const Showcase: React.FC = () => {
  return (
    <section className="showcase reveal">
      <div className="container">
        <div className="section-header" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="uppercase-label">TAKE A LOOK</span>
          <h2 className="heading-sm" style={{ marginBottom: 'var(--spacing-16)' }}>Every Screen, Thoughtfully Designed</h2>
          <p className="body-lg text-steel">Clean, simple, and designed for all mobile users.</p>
        </div>
      </div>
      <div className="carousel">
        <div className="carousel-item" style={{ paddingLeft: 'max(var(--spacing-24), calc((100vw - 1200px) / 2))' }}>
          <div className="phone-frame">
            <img src={homeImg} alt="Home Dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item">
          <div className="phone-frame">
            <img src={transactionsImg} alt="Transaction List" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item">
          <div className="phone-frame">
            <img src={txDetailImg} alt="Transaction Detail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item">
          <div className="phone-frame">
            <img src={analyticsImg} alt="Analytics and Trends" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item">
          <div className="phone-frame">
            <img src={budgetImg} alt="Budget Screen" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item">
          <div className="phone-frame">
            <img src={exportImg} alt="Export Report" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
        <div className="carousel-item" style={{ paddingRight: 'max(var(--spacing-24), calc((100vw - 1200px) / 2))' }}>
          <div className="phone-frame">
            <img src={profileImg} alt="Profile and Settings" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
        </div>
      </div>
    </section>
  );
};
