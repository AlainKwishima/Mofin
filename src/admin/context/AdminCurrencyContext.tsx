import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyFilter = 'ALL' | 'KES' | 'RWF';

interface AdminCurrencyContextType {
  currency: CurrencyFilter;
  setCurrency: (c: CurrencyFilter) => void;
  formatMoney: (amount: number, userCurrency?: string) => string;
}

const AdminCurrencyContext = createContext<AdminCurrencyContextType | undefined>(undefined);

export const AdminCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyFilter>(() => {
    return (localStorage.getItem('mofin_admin_currency') as CurrencyFilter) || 'ALL';
  });

  const setCurrency = (c: CurrencyFilter) => {
    setCurrencyState(c);
    localStorage.setItem('mofin_admin_currency', c);
  };

  const formatMoney = (amount: number, userCurrency?: string): string => {
    const symbol = userCurrency === 'RWF' ? 'RWF' : 'KSH';
    return `${symbol} ${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <AdminCurrencyContext.Provider value={{ currency, setCurrency, formatMoney }}>
      {children}
    </AdminCurrencyContext.Provider>
  );
};

export const useAdminCurrency = () => {
  const context = useContext(AdminCurrencyContext);
  if (!context) {
    throw new Error('useAdminCurrency must be used within AdminCurrencyProvider');
  }
  return context;
};
