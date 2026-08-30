import React, { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { TrustStrip } from '../components/TrustStrip';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Showcase } from '../components/Showcase';
import { DownloadSection } from '../components/DownloadSection';
import { Installation } from '../components/Installation';
import { Changelog } from '../components/Changelog';
import { FAQ } from '../components/FAQ';

export const Home: React.FC = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    return () => {
      revealElements.forEach(el => revealObserver.unobserve(el));
    };
  }, []);

  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Showcase />
      <DownloadSection />
      <Installation />
      <Changelog />
      <FAQ />
    </>
  );
};
