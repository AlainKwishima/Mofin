import React from 'react';
import { MessageSquare, Sparkles, WifiOff, Activity, Target, FileText } from 'lucide-react';
import { Feature } from '../types';

const featuresData: Feature[] = [
  {
    id: 'auto-tracking',
    iconName: 'sms',
    title: 'Zero Manual Entry',
    description: 'Mofin detects mobile money transaction messages the moment they arrive. No typing, no screenshots, no hassle.',
    tag: 'Offline-First',
  },
  {
    id: 'algorithm',
    iconName: 'algorithm',
    title: 'An Algorithm That Learns Your Spending',
    description: "Mofin gets smarter over time. Just tag a 'Supermarket' as 'Groceries' once, and the algorithm will handle the rest automatically.",
    tag: 'Smart Algorithm',
  },
  {
    id: 'offline',
    iconName: 'offline',
    title: 'Works Without Internet',
    description: "No data? No problem. Every feature works offline. Your transactions, budgets, and reports are always available. Sync happens automatically when you're back online.",
    tag: 'Zero Data Cost',
  },
  {
    id: 'analytics',
    iconName: 'analytics',
    title: 'See Trends at a Glance',
    description: 'Daily spending, week-over-week comparisons, and beautiful trend charts. Spot where your money goes before it becomes a problem.',
    tag: 'Visual Analytics',
  },
  {
    id: 'budget',
    iconName: 'budget',
    title: 'Budgets That Actually Work',
    description: "Set limits for Groceries, Transport, Entertainment, and more. Get warned before you overspend. No more 'where did my money go?' moments.",
    tag: 'Smart Alerts',
  },
  {
    id: 'reports',
    iconName: 'reports',
    title: 'Export & Share Reports',
    description: 'Generate clean, printable Income & Expenditure statements with category breakdowns. Perfect for accountants, landlords, or your own records.',
    tag: 'Print-Ready',
  },
];

export const Features: React.FC = () => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sms': return <MessageSquare size={24} />;
      case 'algorithm': return <Sparkles size={24} />;
      case 'offline': return <WifiOff size={24} />;
      case 'analytics': return <Activity size={24} />;
      case 'budget': return <Target size={24} />;
      case 'reports': return <FileText size={24} />;
      default: return null;
    }
  };

  return (
    <section id="features" className="features reveal">
      <div className="container">
        <div className="section-header">
          <span className="uppercase-label">FEATURES</span>
          <h2 className="heading">Your Money, Understood</h2>
          <p className="body-lg text-steel">Everything you need to know about your spending, without the complexity.</p>
        </div>
        <div className="features-grid">
          {featuresData.map((item) => (
            <div key={item.id} className="feature-card">
              <div className="feature-icon-wrapper">
                {renderIcon(item.iconName)}
              </div>
              <h3 className="subheading">{item.title}</h3>
              <p className="body text-steel">{item.description}</p>
              <div style={{ marginTop: 'auto' }}>
                <span className="badge-tag">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
