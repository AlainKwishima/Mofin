import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@mofin.app');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Ensure whole document background stays deep obsidian while in the admin login view
  useEffect(() => {
    const originalBodyBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#09090b';
    document.documentElement.style.backgroundColor = '#09090b';

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('An unexpected error occurred while communicating with the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-shell"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(16, 185, 129, 0.12), transparent)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        color: '#ffffff',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '420px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#a1a1aa',
              }}
            >
              Restricted Gateway
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: '#ffffff' }}>
              MOFIN
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                display: 'inline-block',
              }}
            />
          </div>

          <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7', margin: 0, letterSpacing: '-0.01em' }}>
            Operations & Admin Terminal
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '6px 0 0 0' }}>
            Enter credentials to access telemetry, passcodes, and pricing
          </p>
        </div>

        {/* Obsidian Authentication Card */}
        <div
          style={{
            backgroundColor: '#111114',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.02)',
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                lineHeight: '1.4',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                htmlFor="admin-email-input"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#a1a1aa',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Admin Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717a',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mofin.app"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 16px 0 42px',
                    borderRadius: '10px',
                    border: '1px solid #27272a',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#27272a';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  htmlFor="admin-password-input"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717a',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 42px 0 42px',
                    borderRadius: '10px',
                    border: '1px solid #27272a',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#27272a';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e4e4e7')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: loading ? '#065f46' : '#059669',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                marginTop: '4px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / Audit Info & Back Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#52525b' }}>
            <span>TLS 1.3 Encrypted</span>
            <span>·</span>
            <span>Immutable PostgreSQL Audit Logs</span>
          </div>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#71717a',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
          >
            <ArrowLeft size={14} />
            <span>Return to Mofin Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
