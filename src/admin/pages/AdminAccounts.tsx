import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Eye,
  Smartphone,
  Ban,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';
import {
  AdminSubscriptionPlan,
  ManagedAccount,
  PlanTierCode,
  SubscriptionAuditItem,
  SubscriptionStatus,
} from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

const PLAN_BADGE_STYLES: Record<PlanTierCode, { bg: string; color: string; border: string }> = {
  FREE: { bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' },
  LITE: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  PLUS: { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
  PRO: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  INFINITE: { bg: '#18181b', color: '#fbbf24', border: '#27272a' },
};

const QUICK_REASONS = [
  'Manual M-Pesa/MoMo confirmation',
  'Customer support grant',
  'Subscription upgrade adjustment',
  'Downgrade / cancellation',
];

function isRwfCurrency(currency?: string | null): boolean {
  const norm = (currency || 'KSH').trim().toUpperCase();
  return norm === 'RWF' || norm === 'FRW';
}

export const AdminAccounts: React.FC = () => {
  const { user, revealPhone, revealedPhones, canDeleteAccount, canManageSubscriptions } = useAdminAuth();
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | PlanTierCode>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SubscriptionStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const [selectedAccount, setSelectedAccount] = useState<ManagedAccount | null>(null);
  const [modalMode, setModalMode] = useState<'profile' | 'subscription' | 'delete' | 'resetDevice' | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manage Subscription Form State
  const [subPlanCode, setSubPlanCode] = useState<PlanTierCode>('PRO');
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [subBillingCycle, setSubBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [subPresetDays, setSubPresetDays] = useState<number | null>(30);
  const [subExpiresDate, setSubExpiresDate] = useState<string>('');
  const [subResetCycleUsage, setSubResetCycleUsage] = useState<boolean>(false);
  const [subReason, setSubReason] = useState<string>('');
  const [subSaving, setSubSaving] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subHistory, setSubHistory] = useState<SubscriptionAuditItem[]>([]);
  const [subHistoryLoading, setSubHistoryLoading] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [accountsData, plansData] = await Promise.all([
        adminApi.getAccounts(),
        adminApi.getSubscriptionPlans().catch(() => null),
      ]);
      if (Array.isArray(accountsData)) {
        setAccounts(accountsData);
      }
      if (Array.isArray(plansData)) {
        setPlans(plansData);
      }
    } catch (err: any) {
      console.error('Failed to fetch real PostgreSQL accounts:', err);
      if (isManual) {
        showToast(`Error: ${err.message || 'Failed to sync accounts'}`);
      }
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        acc.username.toLowerCase().includes(term) ||
        (acc.email && acc.email.toLowerCase().includes(term)) ||
        acc.phone.includes(term) ||
        acc.maskedPhone.includes(term);

      const subPlan = acc.subscription?.planCode || 'FREE';
      const subSt = acc.subscription?.status || 'ACTIVE';
      const matchesPlan = planFilter === 'All' || subPlan === planFilter;
      const matchesStatus = statusFilter === 'All' || subSt === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [accounts, searchTerm, planFilter, statusFilter]);

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage) || 1;
  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openSubscriptionModal = async (acc: ManagedAccount) => {
    setSelectedAccount(acc);
    setModalMode('subscription');
    setSubError(null);
    setSubReason('');
    setSubResetCycleUsage(false);

    const currentSub = acc.subscription;
    const initPlan = currentSub?.planCode || 'FREE';
    const initStatus = currentSub?.status || 'ACTIVE';
    const initCycle = (currentSub?.billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY') as 'MONTHLY' | 'YEARLY';

    setSubPlanCode(initPlan);
    setSubStatus(initStatus);
    setSubBillingCycle(initCycle);

    if (currentSub?.expiresAt && new Date(currentSub.expiresAt) > new Date()) {
      setSubExpiresDate(currentSub.expiresAt.slice(0, 10));
      setSubPresetDays(null);
    } else {
      const defaultDays = initCycle === 'YEARLY' ? 365 : 30;
      setSubPresetDays(defaultDays);
      setSubExpiresDate(new Date(Date.now() + defaultDays * 86400000).toISOString().slice(0, 10));
    }

    setSubHistoryLoading(true);
    try {
      const targetId = acc.dbId || acc.id;
      const history = await adminApi.getUserSubscriptionHistory(targetId);
      setSubHistory(Array.isArray(history) ? history : []);
    } catch {
      setSubHistory([]);
    } finally {
      setSubHistoryLoading(false);
    }
  };

  const applyDurationPreset = (days: number) => {
    setSubPresetDays(days);
    setSubExpiresDate(new Date(Date.now() + days * 86400000).toISOString().slice(0, 10));
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (!canManageSubscriptions) {
      setSubError('Permission denied: OWNER or STAFF role required to update user subscriptions.');
      return;
    }

    if (!subReason.trim()) {
      setSubError('Mandatory audit justification reason is required.');
      return;
    }

    setSubSaving(true);
    setSubError(null);

    try {
      const targetId = selectedAccount.dbId || selectedAccount.id;
      const useDate = subStatus === 'ACTIVE' || subStatus === 'GRACE';
      const updatedSummary = await adminApi.updateUserSubscription(targetId, {
        planCode: subPlanCode,
        status: subStatus,
        billingCycle: subBillingCycle,
        durationDays: useDate && subPresetDays !== null ? subPresetDays : undefined,
        expiresAt: useDate && subPresetDays === null && subExpiresDate ? subExpiresDate : undefined,
        resetCycleUsage: subResetCycleUsage,
        reason: subReason.trim(),
      });

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === selectedAccount.id ? { ...a, subscription: updatedSummary } : a
        )
      );
      showToast(
        `Updated ${selectedAccount.username} to ${updatedSummary.planName} (${updatedSummary.status}).`
      );
      setModalMode(null);
    } catch (err: any) {
      setSubError(err.message || 'Failed to update subscription in PostgreSQL.');
    } finally {
      setSubSaving(false);
    }
  };

  const handleRevealPhone = (acc: ManagedAccount) => {
    if (revealedPhones.has(acc.id)) return;
    revealPhone(acc.id, acc.username, acc.phone, 'Admin viewed unmasked phone in Accounts directory');
    showToast(`Unmasked phone logged in audit trail for ${acc.username}`);
  };

  const handleSuspend = async (acc: ManagedAccount) => {
    if (!canManageSubscriptions) return;
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
    if (!selectedAccount || !selectedAccount.boundCodeId) return;
    try {
      await adminApi.unlinkDevice(selectedAccount.boundCodeId);
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
    const headers = [
      'ID',
      'Username',
      'Email',
      'Currency',
      'Phone',
      'Joined Date',
      'Subscription Plan',
      'Subscription Status',
      'Billing Cycle',
      'Expires At',
      'Suspended',
    ];
    const rows = filteredAccounts.map((a) => [
      a.id,
      a.username,
      a.email || '',
      a.currency || 'KSH',
      revealedPhones.has(a.id) ? a.phone : a.maskedPhone,
      a.joinedDate,
      a.subscription?.planCode || 'FREE',
      a.subscription?.status || 'ACTIVE',
      a.subscription?.billingCycle || 'MONTHLY',
      a.subscription?.expiresAt ? a.subscription.expiresAt.slice(0, 10) : 'None',
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
            zIndex: 60,
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
              Accounts & Subscriptions
            </h1>
            <span
              className="pill-badge pill-active"
              style={{ fontSize: '12px', padding: '3px 12px' }}
            >
              {loading ? 'Loading...' : `Total: ${totalCountDisplay.toLocaleString()} users`}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Registered PostgreSQL users, live subscription plans, manual plan overrides, and provider telemetry
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchData(true)}
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
      <div className="admin-card admin-toolbar" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search username, email, or phone (e.g. wanjiku or 0712)..."
            className="admin-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717a' }}>Tier:</span>
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="admin-select"
          >
            <option value="All">All Tiers</option>
            <option value="FREE">Free</option>
            <option value="LITE">Lite</option>
            <option value="PLUS">Plus</option>
            <option value="PRO">Pro</option>
            <option value="INFINITE">Infinite</option>
          </select>

          <span style={{ fontSize: '13px', fontWeight: 600, color: '#71717a' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="admin-select"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="GRACE">GRACE</option>
            <option value="LAPSED">LAPSED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th" style={{ width: '56px' }}>#</th>
                <th className="admin-th">User Profile</th>
                <th className="admin-th">Phone</th>
                <th className="admin-th">Account Providers</th>
                <th className="admin-th">Joined</th>
                <th className="admin-th" style={{ textAlign: 'center' }}>Subscription</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#71717a', fontSize: '13px' }}>
                    No accounts matching current filters
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((acc, index) => {
                  const isRevealed = revealedPhones.has(acc.id);
                  const displayPhone = isRevealed ? acc.phone : acc.maskedPhone;
                  const sub = acc.subscription;
                  const planCode = sub?.planCode || 'FREE';
                  const subSt = sub?.status || 'ACTIVE';
                  const badgeStyle = PLAN_BADGE_STYLES[planCode] || PLAN_BADGE_STYLES.FREE;

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
                              flexShrink: 0,
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
                                  backgroundColor: isRwfCurrency(acc.currency) ? '#eff6ff' : '#ecfdf5',
                                  color: isRwfCurrency(acc.currency) ? '#1d4ed8' : '#047857',
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

                      {/* Live Subscription Badge + Days Remaining */}
                      <td className="admin-td" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: badgeStyle.bg,
                                color: badgeStyle.color,
                                border: `1px solid ${badgeStyle.border}`,
                              }}
                            >
                              {planCode}
                            </span>
                            <span
                              className={`pill-badge ${
                                subSt === 'ACTIVE'
                                  ? 'pill-active'
                                  : subSt === 'GRACE'
                                  ? 'pill-pending'
                                  : 'pill-expired'
                              }`}
                              style={{ fontSize: '10px', padding: '1px 7px' }}
                            >
                              {subSt}
                            </span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#71717a' }} className="tabular-nums">
                            {!sub?.hasRecord && planCode === 'FREE'
                              ? 'Default Free tier'
                              : subSt === 'ACTIVE' || subSt === 'GRACE'
                              ? `${sub?.daysRemaining ?? 0}d left · ${sub?.billingCycle || 'MONTHLY'} · ${sub?.eventsUsedThisCycle ?? 0}/${
                                  (sub?.maxEventsPerMonth ?? 0) >= 9999 ? '∞' : sub?.maxEventsPerMonth ?? 0
                                } ev`
                              : `Ended ${sub?.expiresAt ? sub.expiresAt.slice(0, 10) : '—'}`}
                          </div>
                        </div>
                      </td>

                      <td className="admin-td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => openSubscriptionModal(acc)}
                            title={canManageSubscriptions ? 'Manage Subscription Plan & Expiry' : 'View Subscription Details'}
                            className="admin-btn-secondary"
                            style={{
                              height: '32px',
                              padding: '0 10px',
                              gap: '5px',
                              fontSize: '11px',
                              color: '#047857',
                              borderColor: '#a7f3d0',
                              backgroundColor: '#ecfdf5',
                            }}
                          >
                            <Sliders size={12} />
                            <span>{canManageSubscriptions ? 'Subscription' : 'Inspect Sub'}</span>
                          </button>

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
                            disabled={!canManageSubscriptions || !acc.boundCodeId}
                            title={
                              !acc.boundCodeId
                                ? 'No access pass bound to this user'
                                : 'Reset Device Binding'
                            }
                            className="admin-btn-secondary"
                            style={{
                              height: '32px',
                              width: '32px',
                              padding: 0,
                              opacity: !canManageSubscriptions || !acc.boundCodeId ? 0.45 : 1,
                            }}
                          >
                            <Smartphone size={14} />
                          </button>

                          <button
                            onClick={() => handleSuspend(acc)}
                            disabled={!canManageSubscriptions}
                            title={acc.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            className="admin-btn-secondary"
                            style={{
                              height: '32px',
                              width: '32px',
                              padding: 0,
                              color: acc.isSuspended ? '#e11d48' : '#71717a',
                              opacity: !canManageSubscriptions ? 0.45 : 1,
                            }}
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
            Showing <strong style={{ color: '#09090b' }}>{filteredAccounts.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</strong> to{' '}
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

      {/* Modal: Manage User Subscription */}
      {modalMode === 'subscription' && selectedAccount && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '580px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              border: '1px solid #ececee',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <button
              onClick={() => setModalMode(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: '0 0 4px 0' }}>
                Manage Subscription — {selectedAccount.username}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#71717a' }}>
                <span>{selectedAccount.email}</span>
                <span>·</span>
                <span style={{ fontWeight: 700, color: isRwfCurrency(selectedAccount.currency) ? '#1d4ed8' : '#047857' }}>
                  {selectedAccount.currency || 'KSH'}
                </span>
                <span>·</span>
                <span className="tabular-nums">
                  Cycle usage: <strong>{selectedAccount.subscription?.eventsUsedThisCycle ?? 0}</strong> /{' '}
                  {(selectedAccount.subscription?.maxEventsPerMonth ?? 0) >= 9999
                    ? '∞'
                    : selectedAccount.subscription?.maxEventsPerMonth ?? 0}{' '}
                  events
                </span>
              </div>
            </div>

            {!canManageSubscriptions && (
              <div
                style={{
                  backgroundColor: '#fefce8',
                  border: '1px solid #fde047',
                  color: '#854d0e',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Lock size={14} className="shrink-0" />
                <span>Read-only Viewer mode — OWNER or STAFF role required to modify user subscriptions.</span>
              </div>
            )}

            {subError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{subError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                    Plan Tier
                  </label>
                  <select
                    disabled={!canManageSubscriptions}
                    value={subPlanCode}
                    onChange={(e) => setSubPlanCode(e.target.value as PlanTierCode)}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    {(['FREE', 'LITE', 'PLUS', 'PRO', 'INFINITE'] as PlanTierCode[]).map((code) => {
                      const plan = plans.find((p) => p.code === code);
                      const useRwf = isRwfCurrency(selectedAccount.currency);
                      const rateText = plan
                        ? useRwf
                          ? `${(plan.priceRwf ?? 0).toLocaleString()} RWF/mo`
                          : `KSH ${plan.price.toLocaleString()}/mo`
                        : '';
                      return (
                        <option key={code} value={code}>
                          {plan ? `${plan.name} (${rateText})` : code}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    disabled={!canManageSubscriptions}
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value as SubscriptionStatus)}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="GRACE">GRACE (Grace Period)</option>
                    <option value="LAPSED">LAPSED (Access Locked)</option>
                    <option value="EXPIRED">EXPIRED (Ended)</option>
                  </select>
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                  Billing Cycle
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {(['MONTHLY', 'YEARLY'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      disabled={!canManageSubscriptions}
                      onClick={() => setSubBillingCycle(cycle)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: subBillingCycle === cycle ? '1px solid #10b981' : '1px solid #e4e4e7',
                        backgroundColor: subBillingCycle === cycle ? '#ecfdf5' : '#ffffff',
                        color: subBillingCycle === cycle ? '#047857' : '#52525b',
                        cursor: canManageSubscriptions ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {cycle === 'MONTHLY' ? 'Monthly (3d grace)' : 'Yearly (7d grace)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Custom Expiry */}
              {(subStatus === 'ACTIVE' || subStatus === 'GRACE') ? (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#fafafa', border: '1px solid #ececee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
                      {subStatus === 'GRACE' ? 'Grace Window Ends On' : 'Subscription Expiry Date'}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: '+7d', days: 7 },
                        { label: '+30d', days: 30 },
                        { label: '+90d', days: 90 },
                        { label: '+1yr', days: 365 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          disabled={!canManageSubscriptions}
                          onClick={() => applyDurationPreset(preset.days)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: subPresetDays === preset.days ? '1px solid #10b981' : '1px solid #e4e4e7',
                            backgroundColor: subPresetDays === preset.days ? '#ecfdf5' : '#ffffff',
                            color: subPresetDays === preset.days ? '#047857' : '#52525b',
                            cursor: canManageSubscriptions ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="date"
                    disabled={!canManageSubscriptions}
                    value={subExpiresDate}
                    onChange={(e) => {
                      setSubExpiresDate(e.target.value);
                      setSubPresetDays(null);
                    }}
                    className="admin-input tabular-nums"
                  />
                  <div style={{ fontSize: '11px', color: '#71717a' }}>
                    {subStatus === 'GRACE'
                      ? 'Server sets expiresAt to past and extends graceUntil to the selected date/duration.'
                      : `Automatic ${subBillingCycle === 'YEARLY' ? '7-day' : '3-day'} grace window is added after expiry.`}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', fontSize: '12px', color: '#9f1239' }}>
                  Setting status to <strong>{subStatus}</strong> immediately locks paid event creation and receipt exports by expiring active & grace dates.
                </div>
              )}

              {/* Reset Cycle Usage Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: canManageSubscriptions ? 'pointer' : 'not-allowed',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ececee',
                  backgroundColor: '#fafafa',
                }}
              >
                <input
                  type="checkbox"
                  disabled={!canManageSubscriptions}
                  checked={subResetCycleUsage}
                  onChange={(e) => setSubResetCycleUsage(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#10b981', marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                    Reset current 30-day cycle event quota
                  </div>
                  <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                    Starts a fresh 30-day cycle from right now so the user gets their full plan event allowance.
                  </div>
                </div>
              </label>

              {/* Audit Justification */}
              {canManageSubscriptions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#09090b' }}>
                      Audit Reason
                    </label>
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600 }}>* Required</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={subReason}
                    onChange={(e) => setSubReason(e.target.value)}
                    placeholder="Why is this subscription being changed?"
                    className="admin-input"
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSubReason(r)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: '1px solid #e4e4e7',
                          backgroundColor: '#f4f4f5',
                          color: '#52525b',
                          cursor: 'pointer',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f4f4f5' }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="admin-btn-secondary"
                >
                  {canManageSubscriptions ? 'Cancel' : 'Close'}
                </button>
                {canManageSubscriptions && (
                  <button
                    type="submit"
                    disabled={subSaving}
                    className="admin-btn-emerald"
                  >
                    {subSaving && <RefreshCw size={13} className="animate-spin" />}
                    <span>{subSaving ? 'Applying...' : 'Save Subscription'}</span>
                  </button>
                )}
              </div>
            </form>

            {/* Recent Audit History */}
            <div style={{ borderTop: '1px solid #ececee', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#09090b', marginBottom: '10px' }}>
                <Clock size={13} />
                <span>Recent Subscription Audit History</span>
              </div>
              {subHistoryLoading ? (
                <div style={{ fontSize: '12px', color: '#71717a' }}>Loading audit history...</div>
              ) : subHistory.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#71717a' }}>No subscription transitions recorded yet for this account.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {subHistory.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #f4f4f5',
                        backgroundColor: '#fafafa',
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#09090b' }}>
                          {item.previousPlanCode ? `${item.previousPlanCode} (${item.previousStatus})` : 'NONE'} →{' '}
                          {item.newPlanCode} ({item.newStatus})
                        </div>
                        <div style={{ color: '#52525b', marginTop: '2px' }}>{item.reason}</div>
                      </div>
                      <div style={{ textAlign: 'right', color: '#71717a', whiteSpace: 'nowrap' }}>
                        <div>{item.actor}</div>
                        <div className="tabular-nums">{item.createdAt.slice(0, 10)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 20px 0' }}>Identity metadata, subscription state, and provider registry</p>

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
                <span style={{ color: '#71717a' }}>Subscription:</span>
                <span style={{ fontWeight: 700, color: '#047857' }}>
                  {selectedAccount.subscription?.planName || 'Mofin Free'} ({selectedAccount.subscription?.status || 'ACTIVE'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <span style={{ color: '#71717a' }}>Base Currency:</span>
                <span style={{ fontWeight: 700, color: isRwfCurrency(selectedAccount.currency) ? '#1d4ed8' : '#047857' }}>
                  {isRwfCurrency(selectedAccount.currency) ? '🇷🇼 Rwandan Franc (RWF)' : '🇰🇪 Kenyan Shilling (KSH)'}
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
                    <div style={{ fontWeight: 700, color: '#09090b', marginTop: '2px' }}>{isRwfCurrency(selectedAccount.currency) ? 'RWF' : 'KSH'} {(selectedAccount.providers?.airtel || 0).toLocaleString()}</div>
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

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                onClick={() => openSubscriptionModal(selectedAccount)}
                className="admin-btn-emerald"
              >
                <Sliders size={13} />
                <span>{canManageSubscriptions ? 'Manage Subscription' : 'View Subscription'}</span>
              </button>
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
