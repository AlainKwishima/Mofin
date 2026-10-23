import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Clock,
  Eye,
  Search,
  RotateCcw,
  CheckCircle2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AuditLogEntry } from '../types/admin';
import '../admin.css';

export const AdminSettings: React.FC = () => {
  const { user } = useAdminAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAuditLogs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getAuditLogs();
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL audit logs:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
    const interval = setInterval(() => {
      fetchAuditLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAuditLogs]);

  const handleClearLocalCache = () => {
    try {
      ['mofin_admin_accounts', 'mofin_admin_payments', 'mofin_admin_codes', 'mofin_admin_complaints', 'mofin_admin_ledgers', 'mofin_admin_audit_logs'].forEach((k) => {
        localStorage.removeItem(k);
      });
      showToast('Client-side cache cleared. Sourcing live directly from PostgreSQL.');
      fetchAuditLogs(true);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.actorEmail.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      (log.reason && log.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            backgroundColor: '#09090b',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
            Security & Audit Trail
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Real-time PostgreSQL administrative compliance log ({auditLogs.length} events recorded)
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs(true)}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          title="Refresh audit logs from database"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 3 Security Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
              <Clock size={18} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>Idle Session Policy</h2>
            </div>
            <p style={{ fontSize: '13px', color: '#52525b', lineHeight: 1.5, margin: 0 }}>
              Automatic sign out after <strong>30 minutes</strong> of inactivity. User activity (clicks, keystrokes, scroll) continuously resets the countdown.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#71717a' }}>Policy Status:</span>
            <span className="pill-badge pill-active" style={{ fontSize: '11px', padding: '1px 8px' }}>
              Active (30 min)
            </span>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '8px' }}>
              <Shield size={18} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>Role Hierarchy</h2>
            </div>
            <ul style={{ fontSize: '12px', color: '#52525b', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
              <li><strong>Owner</strong>: Full deletion, export all payments, code authority.</li>
              <li><strong>Staff</strong>: Manage accounts, complaints, and pass codes.</li>
              <li><strong>Viewer</strong>: Read-only dashboards and financial ledgers.</li>
            </ul>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#71717a' }}>Current Role:</span>
            <span style={{ fontWeight: 700, color: '#09090b' }}>{user?.role}</span>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
              <Eye size={18} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>Phone Privacy Masking</h2>
            </div>
            <p style={{ fontSize: '13px', color: '#52525b', lineHeight: 1.5, margin: 0 }}>
              All customer and payer numbers are masked by default (<code style={{ backgroundColor: '#f4f4f5', padding: '2px 4px', borderRadius: '4px' }}>0712***345</code>). Every manual click to unmask is logged below.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#71717a' }}>Compliance:</span>
            <span className="pill-badge pill-pending" style={{ fontSize: '11px', padding: '1px 8px' }}>
              Audit Guarded
            </span>
          </div>
        </div>
      </div>

      {/* Central Audit Trail Table */}
      <div className="admin-table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #ececee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Central Audit Trail
            </h2>
            <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
              Log of actions: revoking, re-issuing, extending, unlinking, suspending, and unmasking
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit actions..."
                className="admin-input"
                style={{ height: '36px', paddingLeft: '34px', fontSize: '12px' }}
              />
            </div>

            <button
              onClick={handleClearLocalCache}
              title="Clear any cached browser data and re-fetch directly from PostgreSQL"
              className="admin-btn-secondary"
              style={{ height: '36px', padding: '0 12px', fontSize: '12px' }}
            >
              <RotateCcw size={14} />
              <span>Purge Local Cache</span>
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Timestamp</th>
                <th className="admin-th">Actor</th>
                <th className="admin-th">Action</th>
                <th className="admin-th">Target</th>
                <th className="admin-th">Details</th>
                <th className="admin-th">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="admin-tr">
                  <td className="admin-td tabular-nums" style={{ color: '#52525b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>

                  <td className="admin-td" style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600, color: '#09090b' }}>{log.actorEmail}</span>
                    <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f4f4f5', fontWeight: 700, color: '#52525b' }}>
                      {log.actorRole}
                    </span>
                  </td>

                  <td className="admin-td" style={{ whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor:
                          log.action.includes('DELETE') || log.action.includes('REVOKE')
                            ? '#fef2f2'
                            : log.action.includes('CREATE') || log.action.includes('REISSUE')
                            ? '#ecfdf5'
                            : log.action.includes('REVEAL')
                            ? '#fffbeb'
                            : '#eff6ff',
                        color:
                          log.action.includes('DELETE') || log.action.includes('REVOKE')
                            ? '#991b1b'
                            : log.action.includes('CREATE') || log.action.includes('REISSUE')
                            ? '#065f46'
                            : log.action.includes('REVEAL')
                            ? '#92400e'
                            : '#1e40af',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="admin-td tabular-nums" style={{ color: '#52525b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {log.targetType} #{log.targetId}
                  </td>

                  <td className="admin-td" style={{ color: '#18181b', maxWidth: '300px' }}>
                    {log.details}
                  </td>

                  <td className="admin-td" style={{ color: '#71717a', fontSize: '12px', fontStyle: 'italic' }}>
                    {log.reason || 'None provided'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
