import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, ArrowLeft, ShieldCheck, Activity, Globe } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminCurrencyProvider, useAdminCurrency } from '../context/AdminCurrencyContext';
import { AdminSidebar } from './AdminSidebar';
import '../admin.css';

const AdminLayoutInner: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const { currency, setCurrency } = useAdminCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Derive title from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const sectionRaw = pathParts[1] || 'dashboard';
  const sectionTitle =
    sectionRaw === 'dashboard'
      ? 'Overview'
      : sectionRaw === 'telemetry'
      ? 'Telemetry & Analytics'
      : sectionRaw === 'providers'
      ? 'Financial Providers'
      : sectionRaw === 'accounts'
      ? 'User Accounts'
      : sectionRaw === 'ledgers'
      ? 'Events & Ledgers'
      : sectionRaw === 'payments'
      ? 'Payment Ledger'
      : sectionRaw === 'codes'
      ? 'Access Codes'
      : sectionRaw === 'complaints'
      ? 'Complaints Inbox'
      : sectionRaw === 'settings'
      ? 'Security & Audit'
      : sectionRaw;

  return (
    <div className="admin-shell">
      {/* Sidebar (Persistent on desktop, drawer on mobile) */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Panel Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-toggle"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span className="header-breadcrumb-root" style={{ color: '#52525b', fontWeight: 500 }}>Mofin Operations</span>
              <span className="header-breadcrumb-root" style={{ color: '#d4d4d8' }}>/</span>
              <span style={{ color: '#09090b', fontWeight: 700 }}>{sectionTitle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Global Currency Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f4f4f5',
                borderRadius: '9999px',
                padding: '3px',
                border: '1px solid #ececee',
              }}
            >
              <button
                onClick={() => setCurrency('ALL')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: currency === 'ALL' ? 700 : 500,
                  borderRadius: '9999px',
                  backgroundColor: currency === 'ALL' ? '#ffffff' : 'transparent',
                  color: currency === 'ALL' ? '#09090b' : '#71717a',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: currency === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                All
              </button>
              <button
                onClick={() => setCurrency('KES')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: currency === 'KES' ? 700 : 500,
                  borderRadius: '9999px',
                  backgroundColor: currency === 'KES' ? '#ffffff' : 'transparent',
                  color: currency === 'KES' ? '#09090b' : '#71717a',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: currency === 'KES' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                🇰🇪 KES
              </button>
              <button
                onClick={() => setCurrency('RWF')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: currency === 'RWF' ? 700 : 500,
                  borderRadius: '9999px',
                  backgroundColor: currency === 'RWF' ? '#ffffff' : 'transparent',
                  color: currency === 'RWF' ? '#09090b' : '#71717a',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: currency === 'RWF' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                🇷🇼 RWF
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#52525b', padding: '4px 8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              <span className="header-status-text" style={{ fontWeight: 500 }}>Live Operations</span>
            </div>

            <Link
              to="/"
              className="header-public-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#52525b',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />
              <span>Public Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <AdminCurrencyProvider>
      <AdminLayoutInner />
    </AdminCurrencyProvider>
  );
};
