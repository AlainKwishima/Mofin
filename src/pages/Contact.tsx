import React, { useEffect, useState } from 'react';
import { Mail, MapPin, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../admin/services/adminApi';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ ticketId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setError(null);
    try {
      const res = await adminApi.submitComplaint({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'Support Inquiry',
        category: 'General Inquiry',
        message: message.trim(),
      });

      setSuccessInfo({ ticketId: res.ticketId });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit support request. Please try again.');
    } finally {
      setSending(false);
    }
  };

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

            {successInfo ? (
              <div style={{ padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontWeight: 700, fontSize: '16px' }}>
                  <CheckCircle2 size={20} />
                  <span>Message Sent Successfully</span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#065f46', lineHeight: 1.5 }}>
                  Your support ticket has been created with ID <strong style={{ fontFamily: 'monospace' }}>#{successInfo.ticketId}</strong>. Our team will review your inquiry promptly.
                </p>
                <button
                  onClick={() => setSuccessInfo(null)}
                  className="btn-neutral"
                  style={{ marginTop: '16px', height: '36px', fontSize: '13px', padding: '0 14px' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }} onSubmit={handleSubmit}>
                {error && (
                  <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }}
                    placeholder="What is this about? (e.g. Pass code inquiry)"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="body" style={{ fontWeight: 500, color: 'var(--color-obsidian)', display: 'block', marginBottom: 'var(--spacing-8)' }}>Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%', padding: 'var(--spacing-16)', border: '1px solid var(--color-cloud)', borderRadius: 'var(--radius-inputs)', backgroundColor: 'var(--color-paper)', outline: 'none', color: 'var(--color-obsidian)' }}
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary"
                  style={{ marginTop: 'var(--spacing-8)', width: '100%' }}
                >
                  {sending ? 'Sending Ticket...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
