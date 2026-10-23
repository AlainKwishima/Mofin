import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Eye,
  Smartphone,
  Ban,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ManagedAccount, PassStatus } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminAccounts: React.FC = () => {
  const { user, revealPhone, revealedPhones, canDeleteAccount } = useAdminAuth();
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PassStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const [selectedAccount, setSelectedAccount] = useState<ManagedAccount | null>(null);
  const [modalMode, setModalMode] = useState<'profile' | 'delete' | 'resetDevice' | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAccounts = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getAccounts();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL accounts:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(() => {
      fetchAccounts();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        acc.username.toLowerCase().includes(term) ||
        acc.phone.includes(term) ||
        acc.maskedPhone.includes(term);
      const matchesStatus = statusFilter === 'All' || acc.passStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage) || 1;
  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleRevealPhone = (acc: ManagedAccount) => {
    if (revealedPhones.has(acc.id)) return;
    revealPhone(acc.id, acc.username, acc.phone, 'Admin viewed unmasked phone in Accounts directory');
    showToast(`Unmasked phone logged in audit trail for ${acc.username}`);
  };

  const handleSuspend = async (acc: ManagedAccount) => {
    const nextSuspended = !acc.isSuspended;
    const targetId = acc.dbId || parseInt(acc.id.replace('usr-', ''), 10);
    try {
      await adminApi.updateAccountStatus(targetId, nextSuspended ? 'INACTIVE' : 'ACTIVE');
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, isSuspended: nextSuspended } : a))
      );
      showToast(`${acc.username} ${nextSuspended ? 'suspended' : 'reactivated'} in PostgreSQL database`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleResetDevice = async () => {
    if (!selectedAccount) return;
    try {
      if (selectedAccount.dbId) {
        await adminApi.unlinkDevice(selectedAccount.dbId);
      }
      setAccounts((prev) =>
        prev.map((a) => (a.id === selectedAccount.id ? { ...a, deviceId: undefined } : a))
      );
      showToast(`Device binding unlinked for ${selectedAccount.username}`);
      setModalMode(null);
    } catch (err: any) {
      showToast(`Error unlinking device: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    const targetId = selectedAccount.dbId || parseInt(selectedAccount.id.replace('usr-', ''), 10);
    try {
      await adminApi.deleteAccount(targetId, deleteReason);
      setAccounts((prev) => prev.filter((a) => a.id !== selectedAccount.id));
      showToast(`Account ${selectedAccount.username} soft deleted in PostgreSQL`);
      setModalMode(null);
      setDeleteReason('');
    } catch (err: any) {
      showToast(`Error deleting account: ${err.message}`);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Username', 'Phone', 'Joined Date', 'Pass Status', 'Device ID', 'Suspended'];
    const rows = filteredAccounts.map((a) => [
      a.id,
      a.username,
      revealedPhones.has(a.id) ? a.phone : a.maskedPhone,
      a.joinedDate,
      a.passStatus,
      a.deviceId || 'Unbound',
      a.isSuspended ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mofin_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (user) {
      adminApi.logAudit({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorEmail: user.email,
        actorRole: user.role,
        action: 'EXPORT_DATA',
        targetType: 'ACCOUNT',
        targetId: 'ALL',
        details: `Exported ${filteredAccounts.length} user accounts to CSV`,
      }).catch(console.error);
    }
    showToast(`Exported ${filteredAccounts.length} accounts to CSV`);
  };

  const totalCountDisplay = accounts.length;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
              Accounts
            </h1>
            <span
              className="pill-badge pill-active"
              style={{ fontSize: '12px', padding: '3px 12px' }}
            >
              {loading ? 'Loading...' : `Total: ${totalCountDisplay.toLocaleString()} users`}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Registered PostgreSQL mobile app users, real device bindings, and access pass statuses (Requirement A1)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchAccounts(true)}
            className="admin-btn-secondary"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            title="Refresh accounts from database"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="admin-btn-emerald"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card admin-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search username or phone (e.g. wanji or 0712)..."
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717a' }}>Pass:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="admin-select"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th" style={{ width: '60px' }}>#</th>
                <th className="admin-th">User Profile</th>
                <th className="admin-th">Phone</th>
                <th className="admin-th">Account Providers</th>
                <th className="admin-th">Joined</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Pass</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#71717a', fontSize: '13px' }}>
                    No accounts matching &quot;{searchTerm}&quot;
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((acc, index) => {
                  const isRevealed = revealedPhones.has(acc.id);
                  const displayPhone = isRevealed ? acc.phone : acc.maskedPhone;

                  return (
                    <tr
                      key={acc.id}
                      className="admin-tr"
                      style={{ backgroundColor: acc.isSuspended ? 'rgba(225, 29, 72, 0.04)' : undefined }}
                    >
                      <td className="admin-td tabular-nums" style={{ color: '#71717a' }}>
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="admin-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e4e4e7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#18181b',
                            }}
                          >
                            {acc.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: '#09090b' }}>{acc.username}</span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: acc.currency === 'RWF' ? '#eff6ff' : '#ecfdf5',
                                  color: acc.currency === 'RWF' ? '#1d4ed8' : '#047857',
                                  border: '1px solid currentColor',
                                }}
                              >
                                {acc.currency || 'KSH'}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#71717a' }}>{acc.email}</div>
                            {acc.isSuspended && (
                              <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: 600 }}>Suspended</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="admin-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tabular-nums" style={{ color: '#52525b', fontWeight: isRevealed ? 600 : 400 }}>
                            {displayPhone}
                          </span>
                          {!isRevealed && (
                            <button
                              onClick={() => handleRevealPhone(acc)}
                              title="Click to reveal full phone number (will log in audit trail)"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#71717a',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex',
                              }}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="admin-td">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {(acc.providers?.mtn || 0) > 0 && (
                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef9c3', color: '#854d0e', fontWeight: 600 }}>
                              MTN: {acc.providers?.mtn.toLocaleString()}
                            </span>
                          )}
                          {(acc.providers?.mpesa || 0) > 0 && (
                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: 600 }}>
                              M-Pesa: {acc.providers?.mpesa.toLocaleString()}
                            </span>
                          )}
                          {(acc.providers?.cash || 0) > 0 && (
                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f4f4f5', color: '#3f3f46', fontWeight: 600 }}>
                              Cash: {acc.providers?.cash.toLocaleString()}
                            </span>
                          )}
                          {!acc.providers?.mtn && !acc.providers?.mpesa && !acc.providers?.cash && (
                            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>0 balance</span>
                          )}
                        </div>
                      </td>

                      <td className="admin-td tabular-nums" style={{ color: '#52525b', whiteSpace: 'nowrap' }}>
                        {acc.joinedDate}
                      </td>

                      <td className="admin-td" style={{ textAlign: 'center' }}>
                        <span
                          className={`pill-badge ${
                            acc.passStatus === 'Active'
                              ? 'pill-active'
                              : acc.passStatus === 'Expired'
                              ? 'pill-expired'
                              : acc.passStatus === 'Pending'
                              ? 'pill-pending'
                              : 'pill-neutral'
                          }`}
                        >
                          {acc.passStatus}
                        </span>
                      </td>

                      <td className="admin-td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedAccount(acc);
                              setModalMode('profile');
                            }}
                            title="View Profile"
                            className="admin-btn-secondary"
                            style={{ height: '32px', width: '32px', padding: 0 }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAccount(acc);
                              setModalMode('resetDevice');
                            }}
                            title="Reset Device Binding"
                            className="admin-btn-secondary"
                            style={{ height: '32px', width: '32px', padding: 0 }}
                          >
                            <Smartphone size={14} />
                          </button>

                          <button
                            onClick={() => handleSuspend(acc)}
                            title={acc.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            className="admin-btn-secondary"
                            style={{ height: '32px', width: '32px', padding: 0, color: acc.isSuspended ? '#e11d48' : '#71717a' }}
                          >
                            <Ban size={14} />
                          </button>

                          {canDeleteAccount && (
                            <button
                              onClick={() => {
                                setSelectedAccount(acc);
                                setModalMode('delete');
                              }}
                              title="Delete Account"
                              className="admin-btn-secondary"
                              style={{ height: '32px', width: '32px', padding: 0, color: '#e11d48' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #ececee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#71717a' }}>
          <div>
            Showing <strong style={{ color: '#09090b' }}>{(currentPage - 1) * rowsPerPage + 1}</strong> to{' '}
            <strong style={{ color: '#09090b' }}>{Math.min(currentPage * rowsPerPage, filteredAccounts.length)}</strong> of{' '}
            <strong style={{ color: '#09090b' }}>{filteredAccounts.length}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="admin-btn-secondary"
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
            >
              Previous
            </button>
            <span style={{ fontWeight: 600, color: '#09090b' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="admin-btn-secondary"
              style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal: View Profile */}
      {modalMode === 'profile' && selectedAccount && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', border: '1px solid #ececee', position: 'relative' }}>
            <button
              onClick={() => setModalMode(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 4px 0' }}>User Profile Details</h3>
            <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 20px 0' }}>Identity metadata and device binding registry</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Username:</span>
                <span style={{ fontWeight: 600, color: '#09090b' }}>{selectedAccount.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Email:</span>
                <span style={{ fontWeight: 600, color: '#09090b' }}>{selectedAccount.email || 'None'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Phone Number:</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: '#09090b' }}>{selectedAccount.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Joined Date:</span>
                <span style={{ fontWeight: 600, color: '#09090b' }}>{selectedAccount.joinedDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Pass Status:</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{selectedAccount.passStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Base Currency:</span>
                <span style={{ fontWeight: 700, color: selectedAccount.currency === 'RWF' ? '#1d4ed8' : '#047857' }}>
                  {selectedAccount.currency === 'RWF' ? '🇷🇼 Rwandan Franc (RWF)' : '🇰🇪 Kenyan Shilling (KSH)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Device Identifier:</span>
                <span className="tabular-nums" style={{ fontSize: '11px', color: '#52525b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedAccount.device || selectedAccount.deviceId || 'Android App (Dalvik/Compose)'}
                </span>
              </div>

              {/* Provider-Specific Balances Breakdown */}
              <div style={{ marginTop: '8px', padding: '14px', backgroundColor: '#f4f4f5', borderRadius: '12px', border: '1px solid #ececee' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', color: '#09090b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Provider Balances (MTN / M-Pesa / Airtel / Equitel / Cash)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ececee' }}>
                    <span style={{ color: '#854d0e', fontWeight: 600 }}>MTN Money:</span>
                    <div style={{ fontWeight: 700, color: '#09090b', marginTop: '2px' }}>RWF {(selectedAccount.providers?.mtn || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ececee' }}>
                    <span style={{ color: '#065f46', fontWeight: 600 }}>Safaricom M-Pesa:</span>
                    <div style={{ fontWeight: 700, color: '#09090b', marginTop: '2px' }}>KSH {(selectedAccount.providers?.mpesa || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ececee' }}>
                    <span style={{ color: '#991b1b', fontWeight: 600 }}>Airtel Money:</span>
                    <div style={{ fontWeight: 700, color: '#09090b', marginTop: '2px' }}>KSH {(selectedAccount.providers?.airtel || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ececee' }}>
                    <span style={{ color: '#5b21b6', fontWeight: 600 }}>Equitel:</span>
                    <div style={{ fontWeight: 700, color: '#09090b', marginTop: '2px' }}>KSH {(selectedAccount.providers?.equitel || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ececee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#3f3f46', fontWeight: 600 }}>Physical Cash:</span>
                    <span style={{ fontWeight: 700, color: '#09090b' }}>{selectedAccount.currency || 'KSH'} {(selectedAccount.providers?.cash || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalMode(null)} className="admin-btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Device */}
      {modalMode === 'resetDevice' && selectedAccount && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #ececee' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 8px 0' }}>Reset Device Binding</h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Unlinking hardware device for <strong>{selectedAccount.username}</strong> permits them to activate their pass code on a new smartphone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalMode(null)} className="admin-btn-secondary">
                Cancel
              </button>
              <button onClick={handleResetDevice} className="admin-btn-emerald">
                Confirm Unlink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Account */}
      {modalMode === 'delete' && selectedAccount && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #e11d48' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#be123c', margin: '0 0 8px 0' }}>Delete Account Permanently</h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{selectedAccount.username}</strong>? This will permanently remove all associated transactions, ledgers, and access codes.
            </p>
            <input
              type="text"
              required
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for audit log (e.g. GDPR erasure)..."
              className="admin-input"
              style={{ marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalMode(null)} className="admin-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="admin-btn-primary"
                style={{ backgroundColor: '#e11d48', borderColor: '#be123c' }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
