import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  TrendingUp,
  PieChart,
  Layers,
  RefreshCw,
  Database,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminCurrency } from '../context/AdminCurrencyContext';
import { DashboardStats } from '../types/admin';
import '../admin.css';

export const AdminTelemetry: React.FC = () => {
  const { currency, formatMoney } = useAdminCurrency();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchTelemetry = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminApi.getDashboard();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const dailyData = stats?.dailyData || [];
  const maxVal = Math.max(...dailyData.map((d) => d.val), 1);
  const topCategories = stats?.topCategories || [];
  const maxCategoryTotal = Math.max(...topCategories.map((c) => c.total), 1);
  const budgetHealth = stats?.budgetHealth || { totalBudgets: 0, overspentBudgets: 0, budgetAdherence: 100 };

  const displayedTrackedVolume = () => {
    if (currency === 'KES') {
      return `KSH ${(stats?.trackedVolumeKES || 0).toLocaleString()}`;
    }
    if (currency === 'RWF') {
      return `RWF ${(stats?.trackedVolumeRWF || 0).toLocaleString()}`;
    }
    return `KSH ${(stats?.trackedVolumeKES || 0).toLocaleString()} + RWF ${(stats?.trackedVolumeRWF || 0).toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
              Platform Telemetry & Analytics
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
            Platform expense volume, daily transaction frequency, budget adherence, and categorization intelligence
          </p>
        </div>

        <button
          onClick={() => fetchTelemetry(true)}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          title="Sync telemetry data"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Unified Stat Metric Strip (Replaces 4 chunky cards) */}
      <div className="admin-stat-strip">
        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Tracked User Volume (GMV)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#1e3a8a' }}>
            {loading ? '...' : displayedTrackedVolume()}
          </div>
          <div className="admin-stat-sub">Total money tracked across Kenya & Rwanda</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Budget Adherence</span>
            {budgetHealth.overspentBudgets > 0 ? (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fef2f2', padding: '1px 6px', borderRadius: '4px' }}>
                {budgetHealth.overspentBudgets} Overspent
              </span>
            ) : (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                Healthy
              </span>
            )}
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : `${budgetHealth.budgetAdherence}%`}
          </div>
          <div className="admin-stat-sub">{budgetHealth.totalBudgets} active budgets monitored</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Active Ledgers</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : (stats?.totalLedgersCount || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">Personal, Event, and Business ledgers</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Tracked Transactions</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : (stats?.totalTransactionsCount || 0).toLocaleString()}
          </div>
          <div className="admin-stat-sub">SMS auto-tracked and manual entries</div>
        </div>
      </div>

      {/* Main Analytics: 14-Day Activity Chart + Top Spending Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* 14-Day Activity SVG Chart with Gridlines */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  14-Day Platform Transaction Volume
                </h2>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
                  Daily financial volume tracked across user ledgers
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a' }}>
                Daily aggregation
              </span>
            </div>

            {/* SVG Chart with Gridlines */}
            <div style={{ height: '220px', position: 'relative', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid #e4e4e7' }}>
              {/* Subtle Horizontal Gridlines */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                <div style={{ borderTop: '1px dashed #f4f4f5', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #f4f4f5', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #f4f4f5', width: '100%' }} />
                <div style={{ borderTop: '1px dashed #f4f4f5', width: '100%' }} />
              </div>

              {dailyData.length === 0 ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', fontSize: '13px' }}>
                  Loading daily transactions...
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', zIndex: 1 }}>
                  {dailyData.map((d, i) => {
                    const heightPct = Math.max(8, Math.round((d.val / maxVal) * 100));
                    const isToday = i === dailyData.length - 1;
                    return (
                      <div
                        key={d.day}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                        title={`${d.day}: ${d.val.toLocaleString()} (${d.count} txns)`}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${heightPct}%`,
                            backgroundColor: isToday ? '#10b981' : '#27272a',
                            borderRadius: '2px 2px 0 0',
                            transition: 'height 0.2s ease',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* X-axis date labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {dailyData.map((d, i) => {
                if (i % 2 !== 0 && i !== dailyData.length - 1) return null;
                return (
                  <span key={d.day} style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace' }}>
                    {d.day.split(' ')[0]}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#71717a' }}>
            <span>Peak Day: KSH {maxVal.toLocaleString()}</span>
            <span>14 days monitored</span>
          </div>
        </div>

        {/* Top Spending Categories Table */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Top Spending Categories
                </h2>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
                  Aggregated expense volume from PostgreSQL
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a' }}>
                {topCategories.length} categories
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topCategories.length === 0 ? (
                <div style={{ color: '#71717a', fontSize: '13px', padding: '24px 0', textAlign: 'center' }}>
                  No categorized transactions found.
                </div>
              ) : (
                topCategories.map((cat) => {
                  const pct = Math.max(4, Math.round((cat.total / maxCategoryTotal) * 100));
                  return (
                    <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: cat.color,
                              display: 'inline-block',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: '#18181b' }}>{cat.name}</span>
                          <span style={{ fontSize: '11px', color: '#71717a' }}>· {cat.count} txns</span>
                        </div>
                        <span className="tabular-nums" style={{ fontWeight: 700, color: '#09090b' }}>
                          {formatMoney(cat.total)}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#f4f4f5', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: cat.color,
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #f4f4f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#71717a' }}>
            <span>Auto-categorization active</span>
            <span>KeywordCategorizer Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
