import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  Archive,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { LedgerRecord, LedgerStatus, LedgerType } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminLedgers: React.FC = () => {
  const { user } = useAdminAuth();
  const [ledgers, setLedgers] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LedgerStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | LedgerType>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLedgers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getLedgers();
      if (Array.isArray(data)) {
        setLedgers(data);
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL ledgers:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchLedgers();
    const interval = setInterval(() => {
      fetchLedgers();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchLedgers]);

  const activeEvents = ledgers.filter((l) => l.type === 'EVENT' && l.status === 'ACTIVE');
  const totalActiveEventMoney = activeEvents.reduce((sum, l) => sum + l.currentBalance, 0);

  const archivedEvents = ledgers.filter((l) => l.type === 'EVENT' && l.status === 'ARCHIVED');
  const totalArchivedEventFunds = archivedEvents.reduce((sum, l) => sum + (l.closingBalance || l.currentBalance), 0);

  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        l.name.toLowerCase().includes(term) ||
        l.ownerUsername.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchesType = typeFilter === 'All' || l.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [ledgers, searchTerm, statusFilter, typeFilter]);

  const handleToggleArchive = async (ledger: LedgerRecord) => {
    const nextStatus = ledger.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    const targetId = ledger.dbId || parseInt(ledger.id.replace('led-', ''), 10);
    try {
      await adminApi.archiveLedger(targetId, nextStatus);
      setLedgers((prev) =>
        prev.map((l) => (l.id === ledger.id ? { ...l, status: nextStatus } : l))
      );
      if (nextStatus === 'ARCHIVED') {
        showToast(`Archived "${ledger.name}". KSH ${ledger.currentBalance.toLocaleString()} excluded from active Event Money.`);
      } else {
        showToast(`Restored "${ledger.name}" to Active status in PostgreSQL.`);
      }
    } catch (err: any) {
      showToast(`Error updating ledger: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
              Events & Ledgers
            </h1>
            <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>
              {loading ? 'Loading...' : `(${ledgers.length} ledgers tracked)`}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            User wallets, business ledgers, and event money pools oversight
          </p>
        </div>

        <button
          onClick={() => fetchLedgers(true)}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          title="Refresh ledgers from database"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Unified Stat Metric Strip */}
      <div className="admin-stat-strip">
        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Active Event Money</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#047857' }}>
            KSH {totalActiveEventMoney.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Across {activeEvents.length} active events</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Archived Event Funds</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            KSH {totalArchivedEventFunds.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Across {archivedEvents.length} closed events</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Active Hubs</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {activeEvents.length}
          </div>
          <div className="admin-stat-sub">Receiving live transactions</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Archived Hubs</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {archivedEvents.length}
          </div>
          <div className="admin-stat-sub">Read-only historical archives</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card admin-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ledger name or owner username..."
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717a' }}>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="admin-select"
            >
              <option value="All">All Types</option>
              <option value="EVENT">Event</option>
              <option value="PERSONAL">Personal</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717a' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="admin-select"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledgers Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Ledger Name</th>
                <th className="admin-th">Owner</th>
                <th className="admin-th">Type</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Initial Budget</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Current / Closing</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="admin-th">Dates</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedgers.map((l) => (
                <tr key={l.id} className="admin-tr">
                  <td className="admin-td" style={{ fontWeight: 700, color: '#09090b' }}>
                    {l.name}
                  </td>
                  <td className="admin-td" style={{ color: '#52525b', fontWeight: 500 }}>
                    {l.ownerUsername}
                  </td>
                  <td className="admin-td">
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: l.type === 'EVENT' ? '#f3e8ff' : l.type === 'BUSINESS' ? '#eff6ff' : '#ecfdf5',
                        color: l.type === 'EVENT' ? '#6b21a8' : l.type === 'BUSINESS' ? '#1e40af' : '#065f46',
                      }}
                    >
                      {l.type}
                    </span>
                  </td>
                  <td className="admin-td tabular-nums" style={{ textAlign: 'right', color: '#52525b' }}>
                    {l.currency || 'KSH'} {l.initialBudget.toLocaleString()}
                  </td>
                  <td className="admin-td tabular-nums" style={{ textAlign: 'right', fontWeight: 700, color: '#09090b' }}>
                    {l.currency || 'KSH'} {l.currentBalance.toLocaleString()}
                  </td>
                  <td className="admin-td" style={{ textAlign: 'center' }}>
                    <span
                      className={`pill-badge ${l.status === 'ACTIVE' ? 'pill-active' : 'pill-neutral'}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="admin-td" style={{ color: '#71717a', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {l.startDate} {l.endDate ? `→ ${l.endDate}` : ''}
                  </td>
                  <td className="admin-td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleToggleArchive(l)}
                      className={l.status === 'ACTIVE' ? 'admin-btn-secondary' : 'admin-btn-emerald'}
                      style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                    >
                      {l.status === 'ACTIVE' ? (
                        <>
                          <Archive size={13} />
                          <span>End Event</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={13} />
                          <span>Restore</span>
                        </>
                      )}
                    </button>
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
