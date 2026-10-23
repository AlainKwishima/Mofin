import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Banknote,
  RefreshCw,
  ArrowRight,
  Users,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdminCurrency } from '../context/AdminCurrencyContext';
import { DashboardStats } from '../types/admin';
import '../admin.css';

interface ProviderRowProps {
  name: string;
  subtitle: string;
  country: string;
  currencyLabel: string;
  balance: number;
  accountsCount: number;
  onViewAccounts: () => void;
}

const ProviderChannelRow: React.FC<ProviderRowProps> = ({
  name,
  subtitle,
  country,
  currencyLabel,
  balance,
  accountsCount,
  onViewAccounts,
}) => (
  <div
    style={{
      padding: '20px 24px',
      borderBottom: '1px solid #f4f4f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>{name}</span>
          <span style={{ fontSize: '11px', color: '#71717a' }}>{country}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{subtitle}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#71717a' }}>Linked Accounts</div>
        <div className="tabular-nums" style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', marginTop: '2px' }}>
          {accountsCount}
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '140px' }}>
        <div style={{ fontSize: '11px', color: '#71717a' }}>Circulating Balance</div>
        <div className="tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', marginTop: '2px' }}>
          {currencyLabel} {Math.round(balance).toLocaleString()}
        </div>
      </div>

      <button
        onClick={onViewAccounts}
        className="admin-btn-secondary"
        style={{ height: '32px', fontSize: '11px', padding: '0 12px', gap: '4px' }}
      >
        <span>Accounts</span>
        <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

export const AdminProviders: React.FC = () => {
  const navigate = useNavigate();
  const { currency } = useAdminCurrency();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchProvidersData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminApi.getDashboard();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Providers fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchProvidersData();
    const interval = setInterval(() => {
      fetchProvidersData();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchProvidersData]);

  const providers = stats?.providerDistribution || {
    MTN: { count: 0, balance: 0 },
    'M-Pesa': { count: 0, balance: 0 },
    Airtel: { count: 0, balance: 0 },
    Equitel: { count: 0, balance: 0 },
    Cash: { count: 0, balance: 0 },
  };

  const totalLinked =
    providers.MTN.count +
    providers['M-Pesa'].count +
    providers.Airtel.count +
    providers.Equitel.count +
    providers.Cash.count;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
            Financial Providers & Channels
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Live channel telemetry across MTN MoMo, Safaricom M-Pesa, Airtel Money, Equitel, and Physical Cash
          </p>
        </div>

        <button
          onClick={() => fetchProvidersData(true)}
          className="admin-btn-secondary"
          style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
          title="Sync channel data"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>
      </div>

      {/* Unified Stat Metric Strip (Replaces 4 chunky cards) */}
      <div className="admin-stat-strip">
        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Total Linked Accounts</span>
          </div>
          <div className="admin-stat-value tabular-nums">
            {loading ? '...' : totalLinked}
          </div>
          <div className="admin-stat-sub">Across 5 supported channels</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>M-Pesa Volume (KES)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#047857' }}>
            {loading ? '...' : `KSH ${Math.round(providers['M-Pesa'].balance).toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">{providers['M-Pesa'].count} linked wallets</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>MTN MoMo Volume (RWF)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#854d0e' }}>
            {loading ? '...' : `RWF ${Math.round(providers.MTN.balance).toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">{providers.MTN.count} linked wallets</div>
        </div>

        <div className="admin-stat-segment">
          <div className="admin-stat-label">
            <span>Cash in Hand (KES)</span>
          </div>
          <div className="admin-stat-value tabular-nums" style={{ color: '#059669' }}>
            {loading ? '...' : `KSH ${Math.round(providers.Cash.balance).toLocaleString()}`}
          </div>
          <div className="admin-stat-sub">{providers.Cash.count} cash accounts</div>
        </div>
      </div>

      {/* Financial Channels Table / Matrix */}
      <div className="admin-table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ececee' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
            Provider Channels Matrix
          </h2>
          <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
            Active circulating balance and account counts by provider
          </p>
        </div>

        <div>
          <ProviderChannelRow
            name="Safaricom M-Pesa"
            subtitle="Mobile Money & Paybill STK Integration"
            country="🇰🇪 Kenya"
            currencyLabel="KSH"
            balance={providers['M-Pesa'].balance}
            accountsCount={providers['M-Pesa'].count}
            onViewAccounts={() => navigate('/admin/accounts')}
          />

          <ProviderChannelRow
            name="MTN Mobile Money"
            subtitle="MTN MoMo Rwanda Push/Pull Channel"
            country="🇷🇼 Rwanda"
            currencyLabel="RWF"
            balance={providers.MTN.balance}
            accountsCount={providers.MTN.count}
            onViewAccounts={() => navigate('/admin/accounts')}
          />

          <ProviderChannelRow
            name="Airtel Money"
            subtitle="Airtel Money Telecommunications Channel"
            country="🇰🇪 Kenya"
            currencyLabel="KSH"
            balance={providers.Airtel.balance}
            accountsCount={providers.Airtel.count}
            onViewAccounts={() => navigate('/admin/accounts')}
          />

          <ProviderChannelRow
            name="Equitel"
            subtitle="Equity Bank MVNO SIM Channel"
            country="🇰🇪 Kenya"
            currencyLabel="KSH"
            balance={providers.Equitel.balance}
            accountsCount={providers.Equitel.count}
            onViewAccounts={() => navigate('/admin/accounts')}
          />

          <ProviderChannelRow
            name="Physical Cash"
            subtitle="Manual Cash in Hand Entries"
            country="🌍 Multi-Country"
            currencyLabel="KSH"
            balance={providers.Cash.balance}
            accountsCount={providers.Cash.count}
            onViewAccounts={() => navigate('/admin/accounts')}
          />
        </div>
      </div>
    </div>
  );
};
