import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Edit3,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  DollarSign,
  Layers,
  Info,
  MoreHorizontal,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminCurrency } from '../context/AdminCurrencyContext';
import { AdminSubscriptionPlan, PlanTierCode } from '../types/admin';
import '../admin.css';

export const AdminPlans: React.FC = () => {
  const { currency } = useAdminCurrency();
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredTierId, setHoveredTierId] = useState<number | null>(null);

  // Slide-over Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminSubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMaxEvents, setEditMaxEvents] = useState<number>(1);
  const [editMaxMoney, setEditMaxMoney] = useState<number>(3500);
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
    setEditPrice(plan.price);
    setEditMaxEvents(plan.maxEventsPerMonth);
    setEditMaxMoney(plan.maxMoneyPerEvent);
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

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!editReason.trim()) {
      setDrawerError('Mandatory audit justification reason is required.');
      return;
    }

    if (editPrice < 0) {
      setDrawerError('Price cannot be negative.');
      return;
    }

    if (editMaxEvents < 0) {
      setDrawerError('Max events quota cannot be negative.');
      return;
    }

    if (editMaxMoney < 0) {
      setDrawerError('Max money cap cannot be negative.');
      return;
    }

    setSaving(true);
    setDrawerError(null);

    try {
      const updated = await adminApi.updateSubscriptionPlan(
        editingPlan.id,
        {
          price: Number(editPrice),
          maxEventsPerMonth: Number(editMaxEvents),
          maxMoneyPerEvent: Number(editMaxMoney),
          receiptPrinting: editReceiptPrinting,
          customCategories: editCustomCategories,
          fullAnalytics: editFullAnalytics,
          isActive: editIsActive,
        },
        editReason.trim()
      );

      setPlans((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      showToast(`Successfully updated tier ${updated.name} (${updated.code}).`);
      handleCloseDrawer();
    } catch (err: any) {
      setDrawerError(err.message || 'Failed to update plan in PostgreSQL.');
    } finally {
      setSaving(false);
    }
  };

  // Metrics Calculations
  const totalSubscribers = useMemo(
    () => plans.reduce((acc, p) => acc + (p.activeSubscribersCount || 0), 0),
    [plans]
  );

  const payingSubscribers = useMemo(
    () => plans.reduce((acc, p) => (p.price > 0 ? acc + (p.activeSubscribersCount || 0) : acc), 0),
    [plans]
  );

  const estimatedMRRKES = useMemo(
    () => plans.reduce((acc, p) => acc + (p.activeSubscribersCount || 0) * p.price, 0),
    [plans]
  );

  const arpuKES = useMemo(
    () => (payingSubscribers > 0 ? Math.round(estimatedMRRKES / payingSubscribers) : 0),
    [estimatedMRRKES, payingSubscribers]
  );

  const hasDiff = useMemo(() => {
    if (!editingPlan) return false;
    return (
      editPrice !== editingPlan.price ||
      editMaxEvents !== editingPlan.maxEventsPerMonth ||
      editMaxMoney !== editingPlan.maxMoneyPerEvent ||
      editReceiptPrinting !== editingPlan.receiptPrinting ||
      editCustomCategories !== editingPlan.customCategories ||
      editFullAnalytics !== editingPlan.fullAnalytics ||
      editIsActive !== editingPlan.isActive
    );
  }, [
    editingPlan,
    editPrice,
    editMaxEvents,
    editMaxMoney,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              {currency === 'ALL' ? 'Multi-Currency' : currency === 'KES' ? 'KES View' : 'RWF View'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Authoritative parameters, quotas, and feature entitlements for Mofin subscription tiers
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

      {/* Stat Metric Strip (Operate Mode: Clean, Restrained, No Random Icons) */}
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
            {payingSubscribers}
          </div>
          <div className="admin-stat-sub">{totalSubscribers} registered platform accounts</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Estimated Monthly Run-Rate</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            KSH {estimatedMRRKES.toLocaleString()}
          </div>
          <div className="admin-stat-sub">
            {currency === 'RWF'
              ? `≈ ${(estimatedMRRKES * 9.6).toLocaleString()} RWF circulating`
              : 'Circulating monthly run-rate'}
          </div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Average Revenue / Sub</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            KSH {arpuKES.toLocaleString()}
          </div>
          <div className="admin-stat-sub">Weighted paying ARPU</div>
        </div>
      </div>

      {/* Subscription Tier Governance Matrix Table */}
      <div className="admin-split-pane" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Table Top Toolbar */}
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
              Live limits and entitlement rules enforced across connected Android mobile clients
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
            {plans.length} Tiers Active
          </span>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th" style={{ width: '180px' }}>Subscription Tier</th>
                <th className="admin-th" style={{ width: '160px' }}>Monthly Price</th>
                <th className="admin-th" style={{ width: '150px' }}>Events / Month</th>
                <th className="admin-th" style={{ width: '170px' }}>Per-Event Cap</th>
                <th className="admin-th" style={{ width: '130px', textAlign: 'center' }}>Entitlements</th>
                <th className="admin-th" style={{ width: '130px', textAlign: 'center' }}>Active Users</th>
                <th className="admin-th" style={{ width: '140px', textAlign: 'right' }}>MRR Share</th>
                <th className="admin-th" style={{ width: '110px', textAlign: 'center' }}>Status</th>
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
                  const rwfPrice = Math.round(plan.price * 9.6);
                  const tierMRR = (plan.activeSubscribersCount || 0) * plan.price;
                  const mrrSharePercent =
                    estimatedMRRKES > 0 ? Math.round((tierMRR / estimatedMRRKES) * 100) : 0;

                  return (
                    <tr key={plan.id} className="admin-tr" style={{ height: '60px' }}>
                      {/* Tier Identity without tag */}
                      <td className="admin-td">
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                            {plan.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#71717a', marginTop: '1px' }}>
                            {plan.subtitle || 'Standard Tier'}
                          </div>
                        </div>
                      </td>

                      {/* Monthly Price */}
                      <td className="admin-td">
                        <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                          KSH {plan.price.toLocaleString()}
                          <span style={{ fontSize: '11px', fontWeight: 400, color: '#71717a', marginLeft: '3px' }}>
                            / mo
                          </span>
                        </div>
                        {plan.price > 0 && (
                          <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                            ≈ {rwfPrice.toLocaleString()} RWF
                          </div>
                        )}
                      </td>

                      {/* Quota */}
                      <td className="admin-td">
                        <span
                          className="font-semibold tabular-nums text-[13px]"
                          style={{ color: '#09090b' }}
                        >
                          {plan.maxEventsPerMonth >= 9999 ? 'Unlimited (∞)' : `${plan.maxEventsPerMonth} event${plan.maxEventsPerMonth === 1 ? '' : 's'}/mo`}
                        </span>
                      </td>

                      {/* Spending Cap */}
                      <td className="admin-td">
                        <span
                          className="font-semibold tabular-nums text-[13px]"
                          style={{ color: '#09090b' }}
                        >
                          {plan.maxMoneyPerEvent >= 9999999
                            ? 'Unlimited'
                            : `KSH ${plan.maxMoneyPerEvent.toLocaleString()}`}
                        </span>
                      </td>

                      {/* Feature Entitlements with Triple Dots & Hover Container */}
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
                                width: '270px',
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

                              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#71717a' }}>
                                <span>Quota: <strong style={{ color: '#09090b' }}>{plan.maxEventsPerMonth >= 9999 ? '∞' : `${plan.maxEventsPerMonth}/mo`}</strong></span>
                                <span>Cap: <strong style={{ color: '#09090b' }}>{plan.maxMoneyPerEvent >= 9999999 ? '∞' : `KSH ${plan.maxMoneyPerEvent.toLocaleString()}`}</strong></span>
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
                      </td>

                      {/* MRR Share */}
                      <td className="admin-td" style={{ textAlign: 'right' }}>
                        <div className="tabular-nums font-semibold text-[13px]" style={{ color: '#09090b' }}>
                          KSH {tierMRR.toLocaleString()}
                        </div>
                        {estimatedMRRKES > 0 && (
                          <div style={{ fontSize: '11px', color: '#71717a' }}>
                            {mrrSharePercent}% share
                          </div>
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
                          <Edit3 size={11} />
                          <span>Configure</span>
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
              maxWidth: '480px',
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
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', margin: 0 }}>
                    Configure {editingPlan.name}
                  </h2>
                </div>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
                  Edit operational quotas and pricing for Tier #{editingPlan.id}
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

              {/* Pricing & Currency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                  Pricing & Currency
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#09090b', marginBottom: '6px' }}>
                    Monthly Price in KES (KSH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#71717a', marginTop: '6px' }}>
                    <span>Estimated RWF Equivalent:</span>
                    <span className="font-semibold tabular-nums text-zinc-900">
                      ≈ {Math.round(editPrice * 9.6).toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                    />
                    <span style={{ fontWeight: 500, color: '#09090b' }}>
                      Tier active for new subscriber registrations
                    </span>
                  </label>
                </div>
              </div>

              {/* Quotas & Spending Allowances */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                  Quotas & Spending Allowances
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
                      Monthly Active Events Allowance
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditMaxEvents(9999)}
                      style={{ fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Set Unlimited (∞)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editMaxEvents}
                    onChange={(e) => setEditMaxEvents(Math.max(0, parseInt(e.target.value) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[1, 2, 4, 9999].map((val) => (
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
                        {val === 9999 ? '∞ Unlimited' : `${val} Event${val === 1 ? '' : 's'}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#09090b' }}>
                      Per-Event Spending Cap (KSH)
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditMaxMoney(99999999)}
                      style={{ fontSize: '11px', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Set Unlimited (∞)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editMaxMoney}
                    onChange={(e) => setEditMaxMoney(Math.max(0, parseInt(e.target.value) || 0))}
                    className="admin-input tabular-nums"
                    style={{ height: '40px', fontSize: '14px' }}
                    required
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {[3500, 15000, 65000, 99999999].map((val) => (
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
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
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
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
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
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f4f4f5',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <input
                      type="checkbox"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                    Audit Justification
                  </div>
                  <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600 }}>* Required</span>
                </div>

                <div>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Reason for modifying plan parameters (e.g. Q4 pricing review)"
                    className="admin-input"
                    style={{ height: '40px', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

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
                      <span>Price:</span>
                      <span className="tabular-nums font-mono">
                        KSH {editingPlan.price} → <strong style={{ color: '#047857' }}>KSH {editPrice}</strong>
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
                      <span>Event Cap:</span>
                      <span className="tabular-nums font-mono">
                        KSH {editingPlan.maxMoneyPerEvent} → <strong style={{ color: '#047857' }}>KSH {editMaxMoney}</strong>
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
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary"
                  style={{ height: '38px', fontSize: '13px', padding: '0 20px', gap: '6px' }}
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save & Commit to PostgreSQL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
