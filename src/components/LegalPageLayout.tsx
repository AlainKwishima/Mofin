import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section style={{ padding: 'var(--spacing-80) 0' }}>
      <div className="container-sm">
        <div style={{ marginBottom: 'var(--spacing-48)' }}>
          <span className="uppercase-label">LEGAL</span>
          <h1 className="heading" style={{ marginTop: 'var(--spacing-8)' }}>{title}</h1>
          <p className="body-lg text-steel" style={{ marginTop: 'var(--spacing-16)' }}>Last updated: {lastUpdated}</p>
        </div>

        <div
          className="legal-content"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-32)' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="subheading" style={{ marginBottom: 'var(--spacing-12)' }}>{title}</h2>
    {children}
  </section>
);

export const LegalSubsection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <>
    <h3
      className="body-lg"
      style={{
        fontWeight: 600,
        color: 'var(--color-obsidian)',
        marginTop: 'var(--spacing-16)',
        marginBottom: 'var(--spacing-8)',
      }}
    >
      {title}
    </h3>
    {children}
  </>
);

export const LegalParagraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="body text-iron">{children}</p>
);

export const LegalList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul
    className="body text-iron"
    style={{
      listStyleType: 'disc',
      paddingLeft: '24px',
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}
  >
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

export const LegalLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} style={{ color: 'var(--color-ember)', fontWeight: 500 }}>
    {children}
  </Link>
);

export const LegalEmail: React.FC<{ email: string }> = ({ email }) => (
  <a href={`mailto:${email}`} style={{ color: 'var(--color-ember)', fontWeight: 500 }}>
    {email}
  </a>
);
