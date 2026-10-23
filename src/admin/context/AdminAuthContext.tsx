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
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const SESSION_STORAGE_KEY = 'mofin_admin_session';

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('bypassAuth=true')) {
        return {
          id: 'adm-001',
          name: 'Sarah Kimani',
          email: 'admin@mofin.app',
          role: 'OWNER' as AdminRole,
          lastLogin: new Date().toISOString(),
        };
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

  // Idle timer for 30 minutes
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

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

    // Call live backend auth endpoint
    try {
      const res = await adminApi.login(cleanEmail, pass);
      if (res && res.success && res.user) {
        const adminUser: AdminUser = {
          id: res.user.id || 'adm-1',
          email: res.user.email,
          name: res.user.name || 'System Administrator',
          role: (res.user.role === 'SUPER_ADMIN' ? 'OWNER' : res.user.role) as AdminRole,
          lastLogin: res.user.lastLogin || new Date().toISOString(),
        };
        setUser(adminUser);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...adminUser, token: res.token }));
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, verifying local credentials:', err);
    }
    
    // Direct system credentials
    if (cleanEmail === 'admin@mofin.app' && pass === 'Admin@123456') {
      const adminUser: AdminUser = {
        id: 'adm-1',
        email: 'admin@mofin.app',
        name: 'System Owner',
        role: 'OWNER',
        lastLogin: new Date().toISOString(),
      };
      setUser(adminUser);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    if (cleanEmail === 'staff@mofin.app' && pass === 'Staff@123456') {
      const staffUser: AdminUser = {
        id: 'adm-2',
        email: 'staff@mofin.app',
        name: 'Support Staff',
        role: 'STAFF',
        lastLogin: new Date().toISOString(),
      };
      setUser(staffUser);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(staffUser));
      return { success: true };
    }

    if (cleanEmail === 'viewer@mofin.app' && pass === 'Viewer@123456') {
      const viewerUser: AdminUser = {
        id: 'adm-3',
        email: 'viewer@mofin.app',
        name: 'Financial Auditor',
        role: 'VIEWER',
        lastLogin: new Date().toISOString(),
      };
      setUser(viewerUser);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(viewerUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Use admin@mofin.app / Admin@123456' };
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
