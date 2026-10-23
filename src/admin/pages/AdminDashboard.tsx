import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Activity,
  Smartphone,
  RefreshCw,
  Layers,
  Users,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminCurrency } from '../context/AdminCurrencyContext';
import { DashboardStats } from '../types/admin';
import '../admin.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currency } = useAdminCurrency();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminApi.getDashboard();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Real-time dashboard fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const recentPayments = stats?.recentPayments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
              Operations Overview
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: currency === 'KES' ? '#ecfdf5' : currency === 'RWF' ? '#eff6ff' : '#f4f4f5',
                color: currency === 'KES' ? '#047857' : currency === 'RWF' ? '#1d4ed8' : '#52525b',
                border: '1px solid currentColor',
              }}
            >
              {currency === 'ALL' ? 'Multi-Currency' : currency === 'KES' ? 'KES View' : 'RWF View'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Lipa na M-Pesa Till 4549332 pass licensing, customer support, and platform operations
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          title="Sync with database"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Unified Stat Metric Strip (Replaces 4 chunky cards) */}
      <div className="admin-stat-strip">
        <div
          onClick={() => navigate('/admin/payments')}
          className="admin-stat-segment admin-stat-segment-clickable"
          title="Click to view payments desk"
        >
          <div className="admin-stat-label">
            <span>Pass Revenue (Till 4549332)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#047857' }}>
            {loading ? '...' : `KSH ${(stats?.companyRevenue || 0).toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">Confirmed pass sales via Lipa na M-Pesa</div>
        </div>

        <div
          onClick={() => navigate('/admin/codes')}
          className="admin-stat-segment admin-stat-segment-clickable"
          title="Click to manage access codes"
        >
          <div className="admin-stat-label">
            <span>Active Pass Licenses</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : (stats?.activePassesCount || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Valid 8-character codes in force</div>
        </div>

        <div
          onClick={() => navigate('/admin/complaints')}
          className="admin-stat-segment admin-stat-segment-clickable"
          title="Click to review complaints inbox"
        >
          <div className="admin-stat-label">
            <span>Open Complaints</span>
            {(stats?.openComplaintsCount || 0) > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9d174d', backgroundColor: '#fdf2f8', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fbcfe8' }}>
                Action Needed
              </span>
            )}
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: (stats?.openComplaintsCount || 0) > 0 ? '#9d174d' : '#09090b' }}>
            {loading ? '...' : stats?.openComplaintsCount || 0}
          </div>
          <div className="admin-stat-sub">In-app tickets requiring resolution</div>
        </div>

        <div
          onClick={() => navigate('/admin/accounts')}
          className="admin-stat-segment admin-stat-segment-clickable"
          title="Click to view user accounts directory"
        >
          <div className="admin-stat-label">
            <span>Registered Accounts</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : (stats?.totalAccountsCount || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Registered user mobile profiles</div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/admin/codes')}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', gap: '6px' }}
        >
          <KeyRound size={13} color="#52525b" />
          <span>Issue Pass Code</span>
        </button>

        <button
          onClick={() => navigate('/admin/payments')}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', gap: '6px' }}
        >
          <CreditCard size={13} color="#52525b" />
          <span>Payments Desk</span>
        </button>

        <button
          onClick={() => navigate('/admin/complaints')}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', gap: '6px' }}
        >
          <MessageSquare size={13} color="#52525b" />
          <span>Complaints Inbox</span>
        </button>

        <button
          onClick={() => navigate('/admin/telemetry')}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', gap: '6px' }}
        >
          <Activity size={13} color="#52525b" />
          <span>Platform Telemetry</span>
        </button>

        <button
          onClick={() => navigate('/admin/providers')}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', gap: '6px' }}
        >
          <Smartphone size={13} color="#52525b" />
          <span>Financial Channels</span>
        </button>
      </div>

      {/* Recent Lipa na M-Pesa Pass Payments Table */}
      <div className="admin-table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ececee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Recent Lipa na M-Pesa Pass Payments
            </h2>
            <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
              Buy Goods Till 4549332 settlements for feature activation
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/payments')}
            className="admin-btn-secondary"
            style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
          >
            <span>All Payments</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Time</th>
                <th className="admin-th">Payer Phone</th>
                <th className="admin-th">M-Pesa Ref</th>
                <th className="admin-th">Feature Purchased</th>
                <th className="admin-th">Pass Code</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Amount</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#71717a', fontSize: '13px' }}>
                    Loading real pass payments from database...
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="admin-tr"
                    onClick={() => navigate('/admin/payments')}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="admin-td" style={{ fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap' }}>
                      {p.displayTime}
                    </td>
                    <td className="admin-td tabular-nums" style={{ color: '#52525b' }}>
                      {p.maskedPhone}
                    </td>
                    <td className="admin-td tabular-nums" style={{ fontWeight: 700, color: '#09090b' }}>
                      {p.mpesaRef}
                    </td>
                    <td className="admin-td" style={{ color: '#52525b' }}>
                      {p.feature}
                    </td>
                    <td className="admin-td tabular-nums" style={{ fontWeight: 600, color: p.passCode ? '#047857' : '#71717a' }}>
                      {p.passCode || '—'}
                    </td>
                    <td className="admin-td tabular-nums" style={{ textAlign: 'right', fontWeight: 700, color: '#09090b', whiteSpace: 'nowrap' }}>
                      KSH {p.amount.toLocaleString()}
                    </td>
                    <td className="admin-td" style={{ textAlign: 'center' }}>
                      <span
                        className={`pill-badge ${
                          p.status === 'Paid'
                            ? 'pill-active'
                            : p.status === 'Unclaimed'
                            ? 'pill-unclaimed'
                            : 'pill-pending'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
