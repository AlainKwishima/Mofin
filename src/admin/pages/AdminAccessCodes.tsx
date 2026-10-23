import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Search,
  Plus,
  Ban,
  RefreshCw,
  Clock,
  Smartphone,
  CheckCircle2,
  X,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import { AccessCodeRecord } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminAccessCodes: React.FC = () => {
  const { user, canModifyCodes } = useAdminAuth();
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [actionModalType, setActionModalType] = useState<'revoke' | 'reissue' | 'extend' | 'unlink' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [extendDays, setExtendDays] = useState(30);

  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newFeature, setNewFeature] = useState('Events Pro (Unlimited)');
  const [newDuration, setNewDuration] = useState(30);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCodes = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getCodes();
      if (Array.isArray(data)) {
        setCodes(data);
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL access codes:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
    const interval = setInterval(() => {
      fetchCodes();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchCodes]);

  const selectedCode = codes.find((c) => c.id === selectedCodeId) || codes[0];

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const term = searchTerm.toLowerCase();
      const phoneStr = c.paidWithPhone || c.phone || '';
      return (
        c.code.toLowerCase().includes(term) ||
        (c.username && c.username.toLowerCase().includes(term)) ||
        phoneStr.includes(term) ||
        c.maskedPhone.includes(term)
      );
    });
  }, [codes, searchTerm]);

  const handleCopy = (codeText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    showToast(`Copied code ${codeText} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleIssueCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;

    try {
      const issued = await adminApi.issueCode({
        username: newUsername,
        phone: newPhone,
        feature: newFeature,
        validDays: newDuration,
      });

      await fetchCodes();
      setSelectedCodeId(issued.id);
      setShowIssueModal(false);
      setNewUsername('');
      setNewPhone('');
      showToast(`Pass Code ${issued.code} generated successfully in PostgreSQL for ${newUsername}!`);
    } catch (err: any) {
      showToast(`Error issuing code: ${err.message}`);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedCode) return;
    const targetId = selectedCode.dbId || selectedCode.id;

    try {
      if (actionModalType === 'revoke') {
        await adminApi.revokeCode(targetId);
        showToast(`Code ${selectedCode.code} has been REVOKED in PostgreSQL`);
      } else if (actionModalType === 'extend') {
        await adminApi.extendCode(targetId, extendDays);
        showToast(`Extended ${selectedCode.code} validity by +${extendDays} days in PostgreSQL`);
      } else if (actionModalType === 'unlink') {
        await adminApi.unlinkDevice(targetId);
        showToast(`Device unlinked from code ${selectedCode.code} in PostgreSQL`);
      }

      await fetchCodes();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }

    setActionModalType(null);
    setActionReason('');
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
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
            Access (Pass) Codes
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Activation pass codes stored and validated in PostgreSQL ({codes.length} codes)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchCodes(true)}
            className="admin-btn-secondary"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            title="Refresh codes from database"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {canModifyCodes && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="admin-btn-emerald"
              style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            >
              <Plus size={15} />
              <span>Issue Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="admin-card" style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, phone, or username (e.g. 4FBK or amina)..."
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Codes Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Pass code</th>
                <th className="admin-th">User</th>
                <th className="admin-th">Paid with</th>
                <th className="admin-th">Issued</th>
                <th className="admin-th">Expires</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((c) => {
                const isSelected = selectedCode?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    className="admin-tr"
                    onClick={() => setSelectedCodeId(c.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined,
                    }}
                  >
                    <td className="admin-td">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span className="tabular-nums" style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: '#09090b', letterSpacing: '0.05em' }}>
                          {c.code}
                        </span>
                        <button
                          onClick={(e) => handleCopy(c.code, e)}
                          title="Copy Code"
                          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '2px' }}
                        >
                          {copiedCode === c.code ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    <td className="admin-td" style={{ fontWeight: 600, color: '#09090b' }}>
                      {c.username || 'Unclaimed'}
                    </td>

                    <td className="admin-td tabular-nums" style={{ color: '#52525b' }}>
                      {c.maskedPhone}
                    </td>

                    <td className="admin-td" style={{ color: '#52525b', whiteSpace: 'nowrap' }}>
                      {c.issuedAt}
                    </td>

                    <td className="admin-td" style={{ color: '#52525b', whiteSpace: 'nowrap' }}>
                      {c.expiresAt}
                    </td>

                    <td className="admin-td" style={{ textAlign: 'center' }}>
                      <span
                        className={`pill-badge ${
                          c.status === 'Active'
                            ? 'pill-active'
                            : c.status === 'Revoked'
                            ? 'pill-expired'
                            : c.status === 'Expired'
                            ? 'pill-pending'
                            : 'pill-neutral'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Code Action Bar */}
      {selectedCode && (
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
                Selected Access Pass
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="tabular-nums" style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: '#09090b' }}>
                  {selectedCode.code}
                </span>
                <span style={{ fontSize: '13px', color: '#71717a' }}>
                  ({selectedCode.username || 'Unclaimed'} · {selectedCode.feature})
                </span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#71717a' }}>
              Bound Hardware: <span className="tabular-nums" style={{ fontWeight: 600, color: '#09090b' }}>{selectedCode.deviceId || 'None'}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <button
              onClick={() => setActionModalType('revoke')}
              disabled={!canModifyCodes || selectedCode.status === 'Revoked'}
              className="admin-btn-secondary"
              style={{ color: '#be123c', borderColor: '#fca5a5', backgroundColor: '#ffffff' }}
            >
              <Ban size={14} />
              <span>Revoke</span>
            </button>

            <button
              onClick={() => setActionModalType('reissue')}
              disabled={!canModifyCodes}
              className="admin-btn-secondary"
              style={{ backgroundColor: '#ffffff' }}
            >
              <RefreshCw size={14} />
              <span>Re-issue Code</span>
            </button>

            <button
              onClick={() => setActionModalType('extend')}
              disabled={!canModifyCodes}
              className="admin-btn-secondary"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Clock size={14} />
              <span>Extend (+30d)</span>
            </button>

            <button
              onClick={() => setActionModalType('unlink')}
              disabled={!canModifyCodes || !selectedCode.deviceId}
              className="admin-btn-secondary"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Smartphone size={14} />
              <span>Unlink Device</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Issue Code */}
      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #ececee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: 0 }}>Issue Pass Code</h3>
              <button onClick={() => setShowIssueModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Customer Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. wanjiku_k"
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Payer Phone Number</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="admin-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Feature Package</label>
                  <select
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Events Pro">Events Pro</option>
                    <option value="PDF Export & History">PDF Export & History</option>
                    <option value="Annual Pass">Annual Pass</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>Validity</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year (365d)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowIssueModal(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-emerald">
                  Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModalType && selectedCode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #ececee' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0', textTransform: 'capitalize' }}>
              {actionModalType === 'reissue' ? 'Re-issue Code' : `${actionModalType} Code`}
            </h3>
            <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 16px 0' }}>
              Target: <strong className="tabular-nums" style={{ fontFamily: 'monospace', color: '#09090b' }}>{selectedCode.code}</strong> ({selectedCode.username})
            </p>

            <input
              type="text"
              required
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Reason for audit log (e.g. Phone replacement)..."
              className="admin-input"
              style={{ marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActionModalType(null)} className="admin-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={!actionReason}
                className="admin-btn-primary"
              >
                Confirm & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
