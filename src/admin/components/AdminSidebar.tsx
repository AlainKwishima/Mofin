import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  KeyRound,
  MessageSquare,
  Layers,
  Settings,
  LogOut,
  Shield,
  X,
  Activity,
  Smartphone,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../services/adminApi';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAdminAuth();
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const checkComplaints = () => {
      adminApi.getComplaints()
        .then((data) => {
          if (!mounted || !Array.isArray(data)) return;
          const openCount = data.filter((c) => c.status === 'New').length;
          setOpenComplaintsCount(openCount);
        })
        .catch(() => {});
    };

    checkComplaints();
    const interval = setInterval(checkComplaints, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navSections = [
    {
      title: 'Operations',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/payments', label: 'Payments', icon: CreditCard },
        { to: '/admin/codes', label: 'Access Codes', icon: KeyRound },
        {
          to: '/admin/complaints',
          label: 'Complaints',
          icon: MessageSquare,
          badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
        },
      ],
    },
    {
      title: 'Platform & Users',
      items: [
        { to: '/admin/telemetry', label: 'Telemetry & Analytics', icon: Activity },
        { to: '/admin/providers', label: 'Financial Providers', icon: Smartphone },
        { to: '/admin/accounts', label: 'Accounts', icon: Users },
        { to: '/admin/ledgers', label: 'Events & Ledgers', icon: Layers },
      ],
    },
    {
      title: 'System',
      items: [
        { to: '/admin/settings', label: 'Settings & Audit', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="admin-backdrop"
          aria-label="Close navigation overlay"
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>MOFIN</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a1a1aa', marginTop: '2px', fontWeight: 600 }}>
              Admin Operating System
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#a1a1aa',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '8px' }}>
              <div className="admin-nav-section-title">{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        color: isActive ? '#ffffff' : '#a1a1aa',
                        backgroundColor: isActive ? '#18181b' : 'transparent',
                        borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          style={{
                            padding: '2px 7px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            backgroundColor: '#9d174d',
                            color: '#ffffff',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile & Session Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid #27272a', backgroundColor: '#0c0d10' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0,
                }}
              >
                <Shield size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: '#a1a1aa', lineHeight: 1 }}>Session:</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'admin@mofin.app'}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#18181b',
                color: '#34d399',
                border: '1px solid #27272a',
              }}
            >
              {user?.role || 'OWNER'}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#a1a1aa',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
