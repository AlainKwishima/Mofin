import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  X,
  Database,
  RefreshCw,
} from 'lucide-react';
import { PaymentRecord, PaymentStatus } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminPayments: React.FC = () => {
  const { user, canExportAllPayments } = useAdminAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [featureFilter, setFeatureFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-21');

  const [selectedUnclaimed, setSelectedUnclaimed] = useState<PaymentRecord | null>(null);
  const [claimUsername, setClaimUsername] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPayments = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getPayments();
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL payments:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(() => {
      fetchPayments();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.mpesaRef.toLowerCase().includes(term) ||
        p.payerPhone.includes(term) ||
        p.maskedPhone.includes(term) ||
        (p.username && p.username.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesFeature = featureFilter === 'All' || p.feature === featureFilter;
      return matchesSearch && matchesStatus && matchesFeature;
    });
  }, [payments, searchTerm, statusFilter, featureFilter]);

  const filteredSum = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return payments
      .filter((p) => p.date && p.date.startsWith(todayStr))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const thisMonthRevenue = useMemo(() => {
    const monthStr = new Date().toISOString().slice(0, 7);
    return payments
      .filter((p) => p.date && p.date.startsWith(monthStr))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const allTimeRevenue = totalAmount;
  const unclaimedCount = payments.filter((p) => p.status === 'Unclaimed').length;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnclaimed || !claimUsername) return;

    try {
      const targetId = selectedUnclaimed.dbId || selectedUnclaimed.id;
      const res = await adminApi.claimPayment(
        targetId,
        claimUsername,
        claimPhone || selectedUnclaimed.payerPhone,
        selectedUnclaimed.feature
      );

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedUnclaimed.id ? { ...p, status: 'Paid', username: claimUsername } : p
        )
      );
      setSelectedUnclaimed(null);
      setClaimUsername('');
      setClaimPhone('');
      showToast(`Payment ${selectedUnclaimed.mpesaRef} claimed! Code ${res.code} assigned to ${claimUsername} in PostgreSQL`);
    } catch (err: any) {
      showToast(`Error claiming payment: ${err.message}`);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Payer Number', 'M-Pesa Ref', 'Amount KSH', 'Pass Code', 'Feature', 'Status', 'User'];
    const rows = filteredPayments.map((p) => [
      p.displayTime,
      p.maskedPhone,
      p.mpesaRef,
      p.amount,
      p.passCode || '-',
      p.feature,
      p.status,
      p.username || 'Unclaimed',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mofin_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (user) {
      adminApi.logAudit({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorEmail: user.email,
        actorRole: user.role,
        action: 'EXPORT_DATA',
        targetType: 'PAYMENT',
        targetId: 'FILTERED',
        details: `Exported ${filteredPayments.length} payment records to CSV`,
      }).catch(console.error);
    }
    showToast(`Exported ${filteredPayments.length} payment records`);
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
            Payments Desk
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Lipa na M-Pesa Buy Goods Till 4549332 settlements and access pass licensing ({payments.length} records)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchPayments(true)}
            className="admin-btn-secondary"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            title="Refresh payments from database"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={!canExportAllPayments && user?.role === 'VIEWER'}
            className="admin-btn-emerald"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Unified Stat Metric Strip */}
      <div className="admin-stat-strip">
        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Today (KSH)</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            KSH {todayRevenue.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Settled today</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>This Month (MTD)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#047857' }}>
            KSH {thisMonthRevenue.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Current month volume</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>All Time Gross</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            KSH {allTimeRevenue.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Gross Till 4549332 pass receipts</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Unclaimed Receipts</span>
            {unclaimedCount > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                Requires Match
              </span>
            )}
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: unclaimedCount > 0 ? '#b45309' : '#09090b' }}>
            {unclaimedCount}
          </div>
          <div className="admin-stat-sub">Pending manual user matching</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a' }}>
            <span style={{ fontWeight: 600 }}>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="admin-select"
              style={{ height: '38px', padding: '0 10px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a' }}>
            <span style={{ fontWeight: 600 }}>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="admin-select"
              style={{ height: '38px', padding: '0 10px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a' }}>
            <span style={{ fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="admin-select"
              style={{ height: '38px' }}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unclaimed">Unclaimed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a' }}>
            <span style={{ fontWeight: 600 }}>Feature:</span>
            <select
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              className="admin-select"
              style={{ height: '38px' }}
            >
              <option value="All">All Features</option>
              <option value="Events Pro">Events Pro</option>
              <option value="PDF Export & History">PDF Export & History</option>
              <option value="Annual Pass">Annual Pass</option>
            </select>
          </div>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ref or phone..."
            className="admin-input"
            style={{ height: '38px', paddingLeft: '34px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Date</th>
                <th className="admin-th">Payer number</th>
                <th className="admin-th">M-Pesa ref</th>
                <th className="admin-th">Feature</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>KSH</th>
                <th className="admin-th">Pass code</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="admin-tr">
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
                  <td className="admin-td tabular-nums" style={{ textAlign: 'right', fontWeight: 700, color: '#09090b' }}>
                    {p.amount.toLocaleString()}
                  </td>
                  <td className="admin-td tabular-nums" style={{ fontFamily: 'monospace', color: '#52525b' }}>
                    {p.passCode || '—'}
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
                  <td className="admin-td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {p.status === 'Unclaimed' ? (
                      <button
                        onClick={() => {
                          setSelectedUnclaimed(p);
                          setClaimPhone(p.payerPhone);
                        }}
                        className="admin-btn-secondary"
                        style={{ height: '32px', padding: '0 10px', fontSize: '11px', color: '#b45309', borderColor: '#fde68a', backgroundColor: '#fffbeb' }}
                      >
                        <UserCheck size={13} />
                        <span>Match & Claim</span>
                      </button>
                    ) : (
                      <span style={{ color: '#a1a1aa' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Total */}
        <div style={{ padding: '16px 24px', backgroundColor: '#fafafa', borderTop: '1px solid #ececee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#52525b' }}>
            Displaying <strong style={{ color: '#09090b' }}>{filteredPayments.length}</strong> transactions
          </span>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
            Total shown:{' '}
            <span className="tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>
              KSH {filteredSum.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {selectedUnclaimed && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #ececee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: 0 }}>Match Unclaimed Receipt</h3>
              <button onClick={() => setSelectedUnclaimed(null)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Receipt <strong>{selectedUnclaimed.mpesaRef}</strong> (KSH {selectedUnclaimed.amount}) will be linked to the customer below and a fresh pass code will be issued.
            </p>

            <form onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Username</label>
                <input
                  type="text"
                  required
                  value={claimUsername}
                  onChange={(e) => setClaimUsername(e.target.value)}
                  placeholder="e.g. wanjiku_k"
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Phone Number</label>
                <input
                  type="text"
                  required
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedUnclaimed(null)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-emerald">
                  Issue Pass Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
