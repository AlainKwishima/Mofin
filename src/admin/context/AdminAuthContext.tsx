import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdminUser, AdminRole } from '../types/admin';
import { adminApi } from '../services/adminApi';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  revealPhone: (accountId: string, username: string, fullPhone: string, reason?: string) => void;
  revealedPhones: Set<string>;
  canDeleteAccount: boolean;
  canExportAllPayments: boolean;
  canModifyCodes: boolean;
  canManageSubscriptions: boolean;
  canEditPricing: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const SESSION_STORAGE_KEY = 'mofin_admin_session';

function isSignedJwt(token: unknown): boolean {
  return typeof token === 'string' && token.split('.').length === 3;
}

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isSignedJwt(parsed?.token)) {
          return parsed;
        }
        // Purge pre-JWT legacy sessions cleanly so admin signs in once to get a verified token
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setRevealedPhones(new Set());
  }, []);

  // Automatically log out if any admin API request returns 401 Unauthorized
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('mofin-admin-unauthorized', onUnauthorized);
    return () => window.removeEventListener('mofin-admin-unauthorized', onUnauthorized);
  }, [logout]);

  // Idle timer for 30 minutes
  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn('Admin session expired due to 30 minutes of inactivity');
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    resetTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await adminApi.login(cleanEmail, pass);
      if (res && res.success && res.token && res.user) {
        const adminUser: AdminUser = {
          id: res.user.id || 'adm-001',
          email: res.user.email,
          name: res.user.name || 'System Administrator',
          role: (res.user.role === 'SUPER_ADMIN' ? 'OWNER' : res.user.role) as AdminRole,
          lastLogin: res.user.lastLogin || new Date().toISOString(),
        };
        setUser(adminUser);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...adminUser, token: res.token }));
        return { success: true };
      }

      return {
        success: false,
        error: res?.error || 'Invalid credentials. Please verify your email and password.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Unable to reach backend authentication server.',
      };
    }
  };

  const revealPhone = (accountId: string, username: string, fullPhone: string, reason = 'Administrative verification') => {
    setRevealedPhones((prev) => new Set(prev).add(accountId));

    if (user) {
      adminApi.logAudit({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorEmail: user.email,
        actorRole: user.role,
        action: 'REVEAL_PHONE',
        targetType: 'ACCOUNT',
        targetId: accountId,
        details: `Revealed unmasked phone (${fullPhone}) for ${username}`,
        reason,
      }).catch((e) => console.warn('Could not log audit to PostgreSQL:', e));
    }
  };

  const role: AdminRole = user?.role || 'VIEWER';
  const canDeleteAccount = role === 'OWNER';
  const canExportAllPayments = role === 'OWNER';
  const canModifyCodes = role === 'OWNER' || role === 'STAFF';
  const canManageSubscriptions = role === 'OWNER' || role === 'STAFF';
  const canEditPricing = role === 'OWNER';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        revealPhone,
        revealedPhones,
        canDeleteAccount,
        canExportAllPayments,
        canModifyCodes,
        canManageSubscriptions,
        canEditPricing,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
