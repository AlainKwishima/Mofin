import React, { useEffect } from 'react';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section style={{ padding: 'var(--spacing-80) 0' }}>
      <div className="container">
        <div className="section-header" style={{ alignItems: 'flex-start' }}>
          <span className="uppercase-label">GET IN TOUCH</span>
          <h1 className="heading">Contact Us</h1>
          <p className="body-lg text-steel" style={{ maxWidth: '600px' }}>
            We'd love to hear from you. Whether you have a question about the app, need technical support, or just want to share feedback, our team is ready to help.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-32)', marginTop: 'var(--spacing-48)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Mail size={24} color="var(--color-ember)" />
              </div>
              <div>
                <h3 className="subheading">Email Support</h3>
                <p className="body text-steel" style={{ marginTop: 'var(--spacing-4)' }}>For general inquiries and technical support:</p>
                <a href="mailto:micodan24@gmail.com" className="body" style={{ color: 'var(--color-ember)', fontWeight: 500, display: 'inline-block', marginTop: 'var(--spacing-8)' }}>micodan24@gmail.com</a>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <MessageSquare size={24} color="var(--color-ember)" />
              </div>
              <div>
                <h3 className="subheading">Social Media</h3>
                <p className="body text-steel" style={{ marginTop: 'var(--spacing-4)' }}>Follow us for updates and tips:</p>
                <a href="#" className="body" style={{ color: 'var(--color-ember)', fontWeight: 500, display: 'inline-block', marginTop: 'var(--spacing-8)' }}>@MofinApp on Twitter/X</a>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <MapPin size={24} color="var(--color-ember)" />
              </div>
              <div>
                <h3 className="subheading">Office</h3>
                <p className="body text-steel" style={{ marginTop: 'var(--spacing-4)' }}>Global Support</p>
              </div>
            </div>
          </div>

          <div className="feature-card" style={{ padding: 'var(--spacing-40)' }}>
            <h2 className="heading-sm" style={{ marginBottom: 'var(--spacing-24)' }}>Send a Message</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }} onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Name</label>
                <input type="text" id="name" style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Email</label>
                <input type="email" id="email" style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }} placeholder="your@email.com" />
              </div>
              <div>
                <label htmlFor="message" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Message</label>
                <textarea id="message" rows={4} style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }} placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: 'var(--spacing-8)', width: '100%' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
