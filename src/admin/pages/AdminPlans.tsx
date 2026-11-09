import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Edit3,
  Info,
  MoreHorizontal,
  Lock,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminCurrency } from '../context/AdminCurrencyContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminSubscriptionPlan } from '../types/admin';
import '../admin.css';

export const AdminPlans: React.FC = () => {
  const { currency } = useAdminCurrency();
  const { canEditPricing } = useAdminAuth();
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredTierId, setHoveredTierId] = useState<number | null>(null);

  // Slide-over Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminSubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editPriceRwf, setEditPriceRwf] = useState<number>(0);
  const [editMaxEvents, setEditMaxEvents] = useState<number>(1);
  const [editMaxMoney, setEditMaxMoney] = useState<number>(3500);
  const [editMaxMoneyRwf, setEditMaxMoneyRwf] = useState<number>(0);
  const [editReceiptPrinting, setEditReceiptPrinting] = useState<boolean>(false);
  const [editCustomCategories, setEditCustomCategories] = useState<boolean>(true);
  const [editFullAnalytics, setEditFullAnalytics] = useState<boolean>(false);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editReason, setEditReason] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPlans = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getSubscriptionPlans();
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch subscription plans from PostgreSQL:', err);
      showToast('Error fetching plans: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    const interval = setInterval(() => {
      fetchPlans();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchPlans]);

  const handleOpenDrawer = (plan: AdminSubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPrice(plan.price ?? 0);
    setEditPriceRwf(plan.priceRwf ?? 0);
    setEditMaxEvents(plan.maxEventsPerMonth ?? 0);
    setEditMaxMoney(plan.maxMoneyPerEvent ?? 0);
    setEditMaxMoneyRwf(plan.maxMoneyPerEventRwf ?? 0);
    setEditReceiptPrinting(plan.receiptPrinting);
    setEditCustomCategories(plan.customCategories);
    setEditFullAnalytics(plan.fullAnalytics);
    setEditIsActive(plan.isActive);
    setEditReason('');
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingPlan(null);
    setDrawerError(null);
  };

  const handleEstimateRwfFromKes = () => {
    if (!canEditPricing) return;
    setEditPriceRwf(Math.round(editPrice * 10));
    setEditMaxMoneyRwf(editMaxMoney >= 9999999 ? 99999999 : Math.round(editMaxMoney * 10));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!canEditPricing) {
      setDrawerError('Permission denied: Only OWNER accounts can modify plan pricing.');
      return;
    }

    if (!editReason.trim()) {
      setDrawerError('Mandatory audit justification reason is required.');
      return;
    }

    if (editPrice < 0 || editPriceRwf < 0) {
      setDrawerError('KES and RWF prices cannot be negative.');
      return;
    }

    if (editMaxEvents < 0) {
      setDrawerError('Max events quota cannot be negative.');
      return;
    }

    if (editMaxMoney < 0 || editMaxMoneyRwf < 0) {
      setDrawerError('KES and RWF per-event caps cannot be negative.');
      return;
    }

    setSaving(true);
    setDrawerError(null);

    try {
      const updated = await adminApi.updateSubscriptionPlan(
        editingPlan.id,
        {
          price: Number(editPrice),
          priceRwf: Number(editPriceRwf),
          maxEventsPerMonth: Number(editMaxEvents),
          maxMoneyPerEvent: Number(editMaxMoney),
          maxMoneyPerEventRwf: Number(editMaxMoneyRwf),
          receiptPrinting: editReceiptPrinting,
          customCategories: editCustomCategories,
          fullAnalytics: editFullAnalytics,
          isActive: editIsActive,
        },
        editReason.trim()
      );

      setPlans((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      showToast(`Successfully updated ${updated.name} (${updated.code}) KES & RWF parameters.`);
      handleCloseDrawer();
    } catch (err: any) {
      setDrawerError(err.message || 'Failed to update plan in PostgreSQL.');
    } finally {
      setSaving(false);
    }
  };

  // Accurate Multi-Currency Metrics from PostgreSQL Active/Grace Subscribers
  const totalSubscribers = useMemo(
    () => plans.reduce((acc, p) => acc + (p.activeSubscribersCount || 0), 0),
    [plans]
  );

  const payingSubscribers = useMemo(
    () =>
      plans.reduce(
        (acc, p) => (p.price > 0 || (p.priceRwf ?? 0) > 0 ? acc + (p.activeSubscribersCount || 0) : acc),
        0
      ),
    [plans]
  );

  const payingSubscribersKes = useMemo(
    () =>
      plans.reduce(
        (acc, p) => (p.price > 0 ? acc + (p.activeSubscribersKesCount ?? p.activeSubscribersCount ?? 0) : acc),
        0
      ),
    [plans]
  );

  const payingSubscribersRwf = useMemo(
    () =>
      plans.reduce(
        (acc, p) => ((p.priceRwf ?? 0) > 0 ? acc + (p.activeSubscribersRwfCount ?? 0) : acc),
        0
      ),
    [plans]
  );

  const estimatedMRRKES = useMemo(
    () =>
      plans.reduce(
        (acc, p) => acc + (p.activeSubscribersKesCount ?? p.activeSubscribersCount ?? 0) * p.price,
        0
      ),
    [plans]
  );

  const estimatedMRRRWF = useMemo(
    () =>
      plans.reduce(
        (acc, p) => acc + (p.activeSubscribersRwfCount ?? 0) * (p.priceRwf ?? 0),
        0
      ),
    [plans]
  );

  const arpuKES = useMemo(
    () => (payingSubscribersKes > 0 ? Math.round(estimatedMRRKES / payingSubscribersKes) : 0),
    [estimatedMRRKES, payingSubscribersKes]
  );

  const arpuRWF = useMemo(
    () => (payingSubscribersRwf > 0 ? Math.round(estimatedMRRRWF / payingSubscribersRwf) : 0),
    [estimatedMRRRWF, payingSubscribersRwf]
  );

  const hasDiff = useMemo(() => {
    if (!editingPlan) return false;
    return (
      editPrice !== editingPlan.price ||
      editPriceRwf !== (editingPlan.priceRwf ?? 0) ||
      editMaxEvents !== editingPlan.maxEventsPerMonth ||
      editMaxMoney !== editingPlan.maxMoneyPerEvent ||
      editMaxMoneyRwf !== (editingPlan.maxMoneyPerEventRwf ?? 0) ||
      editReceiptPrinting !== editingPlan.receiptPrinting ||
      editCustomCategories !== editingPlan.customCategories ||
      editFullAnalytics !== editingPlan.fullAnalytics ||
      editIsActive !== editingPlan.isActive
    );
  }, [
    editingPlan,
    editPrice,
    editPriceRwf,
    editMaxEvents,
    editMaxMoney,
    editMaxMoneyRwf,
    editReceiptPrinting,
    editCustomCategories,
    editFullAnalytics,
    editIsActive,
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#09090b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #27272a',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
              Plans & Pricing Governance
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
              {currency === 'ALL' ? 'Dual Currency (KES + RWF)' : currency === 'KES' ? 'KES View' : 'RWF View'}
            </span>
            {!canEditPricing && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#fefce8',
                  color: '#854d0e',
                  border: '1px solid #fde047',
                }}
              >
                <Lock size={11} />
                Read-Only (OWNER required to edit)
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Independent KES & RWF pricing, event quotas, and spending caps synced with Android and public /pricing
          </p>
        </div>

        <button
          onClick={() => fetchPlans(true)}
          disabled={refreshing}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px', gap: '6px' }}
          title="Sync with database"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Stat Metric Strip */}
      <div className="admin-stat-strip">
        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Configured Tiers</span>
          </div>
          <div className="admin-stat-value tabular-nums">{plans.length}</div>
          <div className="admin-stat-sub">Free, Lite, Plus, Pro, Infinite</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Active Paying Subscribers</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#047857' }}>
            {currency === 'KES'
              ? payingSubscribersKes
              : currency === 'RWF'
              ? payingSubscribersRwf
              : payingSubscribers}
          </div>
          <div className="admin-stat-sub">
            {currency === 'ALL'
              ? `${payingSubscribersKes} KES · ${payingSubscribersRwf} RWF (${totalSubscribers} total)`
              : `${totalSubscribers} total subscribed accounts`}
          </div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Estimated Monthly Run-Rate</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {currency === 'RWF'
              ? `${estimatedMRRRWF.toLocaleString()} RWF`
              : `KSH ${estimatedMRRKES.toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">
            {currency === 'ALL'
              ? `+ ${estimatedMRRRWF.toLocaleString()} RWF (Rwanda subscribers)`
              : currency === 'RWF'
              ? `${payingSubscribersRwf} paying RWF accounts`
              : `${payingSubscribersKes} paying KES accounts`}
          </div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Average Revenue / Sub</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {currency === 'RWF'
              ? `${arpuRWF.toLocaleString()} RWF`
              : `KSH ${arpuKES.toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">
            {currency === 'ALL'
              ? `RWF ARPU: ${arpuRWF.toLocaleString()} RWF`
              : 'Weighted paying ARPU'}
          </div>
        </div>
      </div>

      {/* Subscription Tier Governance Matrix Table */}
      <div className="admin-split-pane" style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #ececee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
              Subscription Tier Matrix
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
              Authoritative PostgreSQL rates, caps, and entitlement rules enforced across Android clients and web pricing
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#f4f4f5',
              color: '#52525b',
              border: '1px solid #e4e4e7',
            }}
          >
            {plans.filter((p) => p.isActive).length} of {plans.length} Active
          </span>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th" style={{ width: '170px' }}>Subscription Tier</th>
                <th className="admin-th" style={{ width: '190px' }}>Monthly Price (KES / RWF)</th>
                <th className="admin-th" style={{ width: '130px' }}>Events / Month</th>
                <th className="admin-th" style={{ width: '210px' }}>Per-Event Cap (KES / RWF)</th>
                <th className="admin-th" style={{ width: '110px', textAlign: 'center' }}>Entitlements</th>
                <th className="admin-th" style={{ width: '120px', textAlign: 'center' }}>Active Users</th>
                <th className="admin-th" style={{ width: '150px', textAlign: 'right' }}>MRR Breakdown</th>
                <th className="admin-th" style={{ width: '100px', textAlign: 'center' }}>Status</th>
                <th className="admin-th" style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '56px 24px', color: '#71717a' }}>
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-zinc-400" />
                    Loading tier parameters from PostgreSQL database...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '56px 24px', color: '#71717a' }}>
                    No subscription plans found in PostgreSQL database.
                  </td>
                </tr>
              ) : (
                plans.map((plan, index) => {
                  const rwfPrice = plan.priceRwf ?? 0;
                  const capKes = plan.maxMoneyPerEvent ?? 0;
                  const capRwf = plan.maxMoneyPerEventRwf ?? 0;
                  const kesCount = plan.activeSubscribersKesCount ?? plan.activeSubscribersCount ?? 0;
                  const rwfCount = plan.activeSubscribersRwfCount ?? 0;
                  const tierMRRKes = kesCount * plan.price;
                  const tierMRRRwf = rwfCount * rwfPrice;
                  const mrrSharePercentKes =
                    estimatedMRRKES > 0 ? Math.round((tierMRRKes / estimatedMRRKES) * 100) : 0;
                  const mrrSharePercentRwf =
                    estimatedMRRRWF > 0 ? Math.round((tierMRRRwf / estimatedMRRRWF) * 100) : 0;

                  return (
                    <tr key={plan.id} className="admin-tr" style={{ height: '64px' }}>
                      {/* Tier Identity */}
                      <td className="admin-td">
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                            {plan.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#71717a', marginTop: '1px' }}>
                            {plan.subtitle || plan.code}
                          </div>
                        </div>
                      </td>

                      {/* Monthly Price */}
                      <td className="admin-td">
                        {currency === 'RWF' ? (
                          <>
                            <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8' }}>
                              {rwfPrice.toLocaleString()} RWF
                              <span style={{ fontSize: '11px', fontWeight: 400, color: '#71717a', marginLeft: '3px' }}>
                                / mo
                              </span>
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                              KSH {plan.price.toLocaleString()} / mo
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                              KSH {plan.price.toLocaleString()}
                              <span style={{ fontSize: '11px', fontWeight: 400, color: '#71717a', marginLeft: '3px' }}>
                                / mo
                              </span>
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, marginTop: '2px' }}>
                              {rwfPrice.toLocaleString()} RWF / mo
                            </div>
                          </>
                        )}
                      </td>

                      {/* Quota */}
                      <td className="admin-td">
                        <span
                          className="font-semibold tabular-nums text-[13px]"
                          style={{ color: '#09090b' }}
                        >
                          {plan.maxEventsPerMonth >= 9999
                            ? 'Unlimited (∞)'
                            : `${plan.maxEventsPerMonth} event${plan.maxEventsPerMonth === 1 ? '' : 's'}/mo`}
                        </span>
                      </td>

                      {/* Per-Event Cap */}
                      <td className="admin-td">
                        {currency === 'RWF' ? (
                          <>
                            <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 700, color: '#1d4ed8' }}>
                              {capRwf >= 9999999 ? 'Unlimited (∞)' : `${capRwf.toLocaleString()} RWF`}
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                              {capKes >= 9999999 ? 'Unlimited (∞)' : `KSH ${capKes.toLocaleString()}`}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="tabular-nums" style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                              {capKes >= 9999999 ? 'Unlimited (∞)' : `KSH ${capKes.toLocaleString()}`}
                            </div>
                            <div className="tabular-nums" style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, marginTop: '2px' }}>
                              {capRwf >= 9999999 ? 'Unlimited (∞)' : `${capRwf.toLocaleString()} RWF`}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Feature Entitlements */}
                      <td className="admin-td" style={{ textAlign: 'center' }}>
                        <div
                          style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center' }}
                          onMouseEnter={() => setHoveredTierId(plan.id)}
                          onMouseLeave={() => setHoveredTierId(null)}
                        >
                          <button
                            type="button"
                            aria-label={`View ${plan.name} feature entitlements`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #e4e4e7',
                              backgroundColor: hoveredTierId === plan.id ? '#09090b' : '#ffffff',
                              color: hoveredTierId === plan.id ? '#ffffff' : '#52525b',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {hoveredTierId === plan.id && (
                            <div
                              style={{
                                position: 'absolute',
                                [index >= 3 ? 'bottom' : 'top']: 'calc(100% + 8px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '280px',
                                backgroundColor: '#ffffff',
                                borderRadius: '10px',
                                border: '1px solid #e4e4e7',
                                boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.15), 0 6px 12px -4px rgba(0, 0, 0, 0.08)',
                                padding: '14px 16px',
                                zIndex: 80,
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f4f4f5' }}>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                                    {plan.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#71717a' }}>
                                    Allowed Entitlements
                                  </div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                                  {plan.code}
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                  {plan.customCategories ? (
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <X size={14} className="text-zinc-300 shrink-0" />
                                  )}
                                  <span style={{ color: plan.customCategories ? '#09090b' : '#a1a1aa', fontWeight: plan.customCategories ? 500 : 400 }}>
                                    Custom Categories & Icons
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                  {plan.fullAnalytics ? (
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <X size={14} className="text-zinc-300 shrink-0" />
                                  )}
                                  <span style={{ color: plan.fullAnalytics ? '#09090b' : '#a1a1aa', fontWeight: plan.fullAnalytics ? 500 : 400 }}>
                                    Full Analytics & PDF Export
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                  {plan.receiptPrinting ? (
                                    <Check size={14} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <X size={14} className="text-zinc-300 shrink-0" />
                                  )}
                                  <span style={{ color: plan.receiptPrinting ? '#09090b' : '#a1a1aa', fontWeight: plan.receiptPrinting ? 500 : 400 }}>
                                    Receipt Attachments & Slips
                                  </span>
                                </div>
                              </div>

                              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: '#71717a' }}>
                                <div>
                                  Quota: <strong style={{ color: '#09090b' }}>{plan.maxEventsPerMonth >= 9999 ? '∞' : `${plan.maxEventsPerMonth}/mo`}</strong>
                                </div>
                                <div>
                                  Caps: <strong style={{ color: '#09090b' }}>{capKes >= 9999999 ? '∞' : `KSH ${capKes.toLocaleString()}`}</strong> ·{' '}
                                  <strong style={{ color: '#1d4ed8' }}>{capRwf >= 9999999 ? '∞' : `${capRwf.toLocaleString()} RWF`}</strong>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Users */}
                      <td className="admin-td" style={{ textAlign: 'center' }}>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums"
                          style={{
                            backgroundColor: plan.activeSubscribersCount ? '#ecfdf5' : '#f4f4f5',
                            color: plan.activeSubscribersCount ? '#047857' : '#71717a',
                            border: plan.activeSubscribersCount ? '1px solid #a7f3d0' : '1px solid #e4e4e7',
                          }}
                        >
                          {plan.activeSubscribersCount || 0}
                        </span>
                        {(kesCount > 0 || rwfCount > 0) && (
                          <div style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }}>
                            {kesCount} KES · {rwfCount} RWF
                          </div>
                        )}
                      </td>

                      {/* MRR Share */}
                      <td className="admin-td" style={{ textAlign: 'right' }}>
                        {currency === 'RWF' ? (
                          <>
                            <div className="tabular-nums font-semibold text-[13px]" style={{ color: '#1d4ed8' }}>
                              {tierMRRRwf.toLocaleString()} RWF
                            </div>
                            {estimatedMRRRWF > 0 && (
                              <div style={{ fontSize: '11px', color: '#71717a' }}>
                                {mrrSharePercentRwf}% share
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="tabular-nums font-semibold text-[13px]" style={{ color: '#09090b' }}>
                              KSH {tierMRRKes.toLocaleString()}
                              {currency === 'KES' && estimatedMRRKES > 0 && (
                                <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 400, marginLeft: '4px' }}>
                                  ({mrrSharePercentKes}%)
                                </span>
                              )}
                            </div>
                            {currency === 'ALL' && (
                              <div className="tabular-nums" style={{ fontSize: '11px', color: '#1d4ed8' }}>
                                {tierMRRRwf.toLocaleString()} RWF
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Status */}
                      <td className="admin-td" style={{ textAlign: 'center' }}>
                        {plan.isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#047857',
                              backgroundColor: '#ecfdf5',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#71717a',
                              backgroundColor: '#f4f4f5',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              border: '1px solid #e4e4e7',
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="admin-td" style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenDrawer(plan)}
                          className="admin-btn-secondary"
                          style={{
                            height: '30px',
                            fontSize: '11px',
                            padding: '0 10px',
                            gap: '4px',
                          }}
                        >
                          {canEditPricing ? <Edit3 size={11} /> : <Lock size={11} />}
                          <span>{canEditPricing ? 'Configure' : 'View Config'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Slide-Over Configuration Drawer */}
      {drawerOpen && editingPlan && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(9, 9, 11, 0.45)',
              backdropFilter: 'blur(3px)',
              transition: 'opacity 0.2s ease',
            }}
          />

          {/* Slide-Over Panel */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.12)',
              borderLeft: '1px solid #e4e4e7',
              zIndex: 1010,
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #ececee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', margin: 0 }}>
                  {canEditPricing ? `Configure ${editingPlan.name}` : `${editingPlan.name} Configuration`}
                </h2>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
                  Independent KES & RWF pricing, caps, and quotas · Tier #{editingPlan.id} ({editingPlan.code})
                </div>
              </div>

              <button
                onClick={handleCloseDrawer}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleSavePlan} style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {!canEditPricing && (
                <div
                  style={{
                    backgroundColor: '#fefce8',
                    border: '1px solid #fde047',
                    color: '#854d0e',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Lock size={15} className="shrink-0" />
                  <span>Read-only mode: Editing pricing and plan caps requires the OWNER role.</span>
                </div>
              )}

              {drawerError && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{drawerError}</span>
                </div>
              )}

              {/* Dual-Currency Monthly Pricing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                    Dual-Currency Monthly Price
                  </div>
                  {canEditPricing && (
                    <button
                      type="button"
                      onClick={handleEstimateRwfFromKes}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1d4ed8',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={11} />
                      <span>Prefill RWF (×10 from KES)</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#047857', marginBottom: '6px' }}>
                      🇰🇪 Monthly Price (KSH)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={!canEditPricing}
                      value={editPrice}
                      onChange={(e) => setEditPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="admin-input tabular-nums"
                      style={{ height: '40px', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1d4ed8', marginBottom: '6px' }}>
                      🇷🇼 Monthly Price (RWF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={!canEditPricing}
                      value={editPriceRwf}
                      onChange={(e) => setEditPriceRwf(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="admin-input tabular-nums"
                      style={{ height: '40px', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ paddingTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: canEditPricing ? 'pointer' : 'not-allowed', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      disabled={!canEditPricing}
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                    />
                    <span style={{ fontWeight: 500, color: '#09090b' }}>
                      Tier active & visible on /pricing and Android paywall
                    </span>
                  </label>
                </div>
              </div>

              {/* Quotas & Independent Spending Caps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                  Event Quotas & Dual-Currency Spending Caps
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
                      Monthly Active Events Allowance
                    </label>
                    {canEditPricing && (
                      <button
                        type="button"
                        onClick={() => setEditMaxEvents(9999)}
                        style={{ fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Set Unlimited (∞)
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!canEditPricing}
                    value={editMaxEvents}
                    onChange={(e) => setEditMaxEvents(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  {canEditPricing && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {[2, 3, 5, 9999].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditMaxEvents(val)}
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: editMaxEvents === val ? '1px solid #10b981' : '1px solid #e4e4e7',
                            backgroundColor: editMaxEvents === val ? '#ecfdf5' : '#ffffff',
                            color: editMaxEvents === val ? '#065f46' : '#71717a',
                            cursor: 'pointer',
                          }}
                        >
                          {val === 9999 ? '∞ Unlimited' : `${val} Events`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* KES Event Cap */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>
                      🇰🇪 Per-Event Spending Cap (KSH)
                    </label>
                    {canEditPricing && (
                      <button
                        type="button"
                        onClick={() => setEditMaxMoney(99999999)}
                        style={{ fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Set Unlimited (∞)
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    disabled={!canEditPricing}
                    value={editMaxMoney}
                    onChange={(e) => setEditMaxMoney(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  {canEditPricing && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {[5000, 35000, 150000, 99999999].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditMaxMoney(val)}
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: editMaxMoney === val ? '1px solid #10b981' : '1px solid #e4e4e7',
                            backgroundColor: editMaxMoney === val ? '#ecfdf5' : '#ffffff',
                            color: editMaxMoney === val ? '#065f46' : '#71717a',
                            cursor: 'pointer',
                          }}
                        >
                          {val === 99999999 ? '∞ Unlimited' : `KSH ${val.toLocaleString()}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RWF Event Cap */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>
                      🇷🇼 Per-Event Spending Cap (RWF)
                    </label>
                    {canEditPricing && (
                      <button
                        type="button"
                        onClick={() => setEditMaxMoneyRwf(99999999)}
                        style={{ fontSize: '11px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Set Unlimited (∞)
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    disabled={!canEditPricing}
                    value={editMaxMoneyRwf}
                    onChange={(e) => setEditMaxMoneyRwf(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  {canEditPricing && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {[50000, 350000, 1500000, 99999999].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditMaxMoneyRwf(val)}
                          style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: editMaxMoneyRwf === val ? '1px solid #2563eb' : '1px solid #e4e4e7',
                            backgroundColor: editMaxMoneyRwf === val ? '#eff6ff' : '#ffffff',
                            color: editMaxMoneyRwf === val ? '#1d4ed8' : '#71717a',
                            cursor: 'pointer',
                          }}
                        >
                          {val === 99999999 ? '∞ Unlimited' : `${val.toLocaleString()} RWF`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Entitlements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                  Feature Entitlements
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: canEditPricing ? 'pointer' : 'not-allowed',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEditPricing}
                      checked={editCustomCategories}
                      onChange={(e) => setEditCustomCategories(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Custom Categories</div>
                      <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                        Allow custom categories & user-defined icons
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: canEditPricing ? 'pointer' : 'not-allowed',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEditPricing}
                      checked={editFullAnalytics}
                      onChange={(e) => setEditFullAnalytics(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Full Analytics & PDF Export</div>
                      <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                        Enable PDF exports, charts, and deep spending telemetry
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: canEditPricing ? 'pointer' : 'not-allowed',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEditPricing}
                      checked={editReceiptPrinting}
                      onChange={(e) => setEditReceiptPrinting(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Receipt Attachments & Print</div>
                      <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                        Capture camera receipts and print physical expense slips
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Audit Justification */}
              {canEditPricing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                      Audit Justification
                    </div>
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600 }}>* Required</span>
                  </div>

                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Reason for modifying plan parameters (e.g. RWF tariff review)"
                    className="admin-input"
                    style={{ height: '40px', fontSize: '13px' }}
                    required
                  />
                </div>
              )}

              {/* Live Value Diff Preview */}
              {hasDiff && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '11px',
                    marginTop: '4px',
                  }}
                  className="space-y-1.5"
                >
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Info size={12} />
                    <span>Pending Changes:</span>
                  </div>
                  {editPrice !== editingPlan.price && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>KES Price:</span>
                      <span className="tabular-nums font-mono">
                        KSH {editingPlan.price.toLocaleString()} → <strong style={{ color: '#047857' }}>KSH {editPrice.toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                  {editPriceRwf !== (editingPlan.priceRwf ?? 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>RWF Price:</span>
                      <span className="tabular-nums font-mono">
                        {(editingPlan.priceRwf ?? 0).toLocaleString()} RWF → <strong style={{ color: '#1d4ed8' }}>{editPriceRwf.toLocaleString()} RWF</strong>
                      </span>
                    </div>
                  )}
                  {editMaxEvents !== editingPlan.maxEventsPerMonth && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Events / Mo:</span>
                      <span className="tabular-nums font-mono">
                        {editingPlan.maxEventsPerMonth} → <strong style={{ color: '#047857' }}>{editMaxEvents}</strong>
                      </span>
                    </div>
                  )}
                  {editMaxMoney !== editingPlan.maxMoneyPerEvent && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>KES Event Cap:</span>
                      <span className="tabular-nums font-mono">
                        KSH {editingPlan.maxMoneyPerEvent.toLocaleString()} → <strong style={{ color: '#047857' }}>KSH {editMaxMoney.toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                  {editMaxMoneyRwf !== (editingPlan.maxMoneyPerEventRwf ?? 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>RWF Event Cap:</span>
                      <span className="tabular-nums font-mono">
                        {(editingPlan.maxMoneyPerEventRwf ?? 0).toLocaleString()} RWF → <strong style={{ color: '#1d4ed8' }}>{editMaxMoneyRwf.toLocaleString()} RWF</strong>
                      </span>
                    </div>
                  )}
                  {editReceiptPrinting !== editingPlan.receiptPrinting && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Receipts:</span>
                      <span className="font-mono">
                        {editingPlan.receiptPrinting ? 'Enabled' : 'Disabled'} → <strong style={{ color: '#047857' }}>{editReceiptPrinting ? 'Enabled' : 'Disabled'}</strong>
                      </span>
                    </div>
                  )}
                  {editCustomCategories !== editingPlan.customCategories && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Custom Categories:</span>
                      <span className="font-mono">
                        {editingPlan.customCategories ? 'Enabled' : 'Disabled'} → <strong style={{ color: '#047857' }}>{editCustomCategories ? 'Enabled' : 'Disabled'}</strong>
                      </span>
                    </div>
                  )}
                  {editFullAnalytics !== editingPlan.fullAnalytics && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Full Analytics:</span>
                      <span className="font-mono">
                        {editingPlan.fullAnalytics ? 'Enabled' : 'Disabled'} → <strong style={{ color: '#047857' }}>{editFullAnalytics ? 'Enabled' : 'Disabled'}</strong>
                      </span>
                    </div>
                  )}
                  {editIsActive !== editingPlan.isActive && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>Visibility:</span>
                      <span className="font-mono">
                        {editingPlan.isActive ? 'Active' : 'Inactive'} → <strong style={{ color: '#047857' }}>{editIsActive ? 'Active' : 'Inactive'}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Drawer Footer Actions */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '20px',
                  borderTop: '1px solid #ececee',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: '#ffffff',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={saving}
                  className="admin-btn-secondary"
                  style={{ height: '38px', fontSize: '13px', padding: '0 16px' }}
                >
                  {canEditPricing ? 'Cancel' : 'Close'}
                </button>

                {canEditPricing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="admin-btn-primary"
                    style={{ height: '38px', fontSize: '13px', padding: '0 20px', gap: '6px' }}
                  >
                    {saving && <RefreshCw size={13} className="animate-spin" />}
                    <span>{saving ? 'Saving...' : 'Save & Commit to PostgreSQL'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
