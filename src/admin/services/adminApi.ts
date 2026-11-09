// Real Backend API Client for Mofin Admin Panel - Connecting directly to PostgreSQL
import type {
  AdminSubscriptionPlan,
  SubscriptionAuditItem,
  UpdateUserSubscriptionPayload,
  UserSubscriptionSummary,
} from '../types/admin';

const DEFAULT_API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000/v1'
  : 'https://mofin-backend-production.up.railway.app/v1';

const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

// Immediately purge any stale mock data keys in localStorage
try {
  ['mofin_admin_accounts', 'mofin_admin_payments', 'mofin_admin_codes', 'mofin_admin_complaints', 'mofin_admin_ledgers', 'mofin_admin_audit_logs'].forEach((key) => {
    localStorage.removeItem(key);
  });
} catch {
  // Ignore in non-browser env
}

class AdminApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const session = sessionStorage.getItem('mofin_admin_session') || localStorage.getItem('mofin_admin_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch {
        // ignore parse error
      }
    }
    return headers;
  }

  private async throwIfNotOk(res: Response, fallbackPrefix: string, isAuthEndpoint = false): Promise<void> {
    if (res.ok) return;

    if (res.status === 401 && !isAuthEndpoint) {
      try {
        sessionStorage.removeItem('mofin_admin_session');
        localStorage.removeItem('mofin_admin_session');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mofin-admin-unauthorized'));
        }
      } catch {
        // ignore storage errors
      }
    }

    let message = `${fallbackPrefix}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      const extracted =
        errJson?.error?.message ||
        (Array.isArray(errJson?.message) ? errJson.message.join(', ') : errJson?.message) ||
        (typeof errJson?.error === 'string' ? errJson.error : undefined);
      if (extracted) message = String(extracted);
    } catch {
      // ignore non-json error body
    }

    if (res.status === 404 && /route not found|cannot (get|patch|post|delete)/i.test(message)) {
      message = `Endpoint not found on ${API_BASE} (404). Redeploy Mofin-Backend so the latest API routes are live.`;
    }

    throw new Error(message);
  }

  // --- DASHBOARD ---
  async getDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Dashboard API error');
    return res.json();
  }

  // --- TELEMETRY ---
  async getBudgetTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/budgets`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Budget telemetry API error');
    return res.json();
  }

  async getCategoryTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/categories`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Category telemetry API error');
    return res.json();
  }

  async getProviderTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/providers`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Provider telemetry API error');
    return res.json();
  }

  // --- ACCOUNTS & USER SUBSCRIPTIONS ---
  async getAccounts(search?: string) {
    const url = new URL(`${API_BASE}/admin/accounts`);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Accounts API error');
    return res.json();
  }

  async getUserSubscriptionHistory(id: number | string): Promise<SubscriptionAuditItem[]> {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}/subscription-history`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Subscription history API error');
    return res.json();
  }

  async updateUserSubscription(
    id: number | string,
    payload: UpdateUserSubscriptionPayload
  ): Promise<UserSubscriptionSummary> {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}/subscription`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    await this.throwIfNotOk(res, 'Subscription update error');
    return res.json();
  }

  async updateAccountStatus(id: number | string, status: 'ACTIVE' | 'INACTIVE') {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    await this.throwIfNotOk(res, 'Account status update error');
    return res.json();
  }

  async deleteAccount(id: number | string, reason?: string) {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    await this.throwIfNotOk(res, 'Delete account error');
    return res.json();
  }

  // --- LEDGERS ---
  async getLedgers() {
    const res = await fetch(`${API_BASE}/admin/ledgers`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Ledgers API error');
    return res.json();
  }

  async archiveLedger(id: number | string, status: 'ACTIVE' | 'ARCHIVED') {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('led-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/ledgers/${numId}/archive`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    await this.throwIfNotOk(res, 'Archive ledger error');
    return res.json();
  }

  // --- PAYMENTS ---
  async getPayments() {
    const res = await fetch(`${API_BASE}/admin/payments`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Payments API error');
    return res.json();
  }

  async claimPayment(paymentId: string | number, username: string, phone: string, feature: string) {
    const res = await fetch(`${API_BASE}/admin/payments/claim`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentId, username, phone, feature }),
    });
    await this.throwIfNotOk(res, 'Claim payment error');
    return res.json();
  }

  // --- ACCESS CODES ---
  async getCodes() {
    const res = await fetch(`${API_BASE}/admin/codes`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Codes API error');
    return res.json();
  }

  async issueCode(data: { phone?: string; username?: string; feature: string; validDays?: number; deviceLimit?: number }) {
    const res = await fetch(`${API_BASE}/admin/codes/issue`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    await this.throwIfNotOk(res, 'Issue code error');
    return res.json();
  }

  async revokeCode(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/revoke`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Revoke code error');
    return res.json();
  }

  async extendCode(id: string | number, days = 30) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/extend`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ days }),
    });
    await this.throwIfNotOk(res, 'Extend code error');
    return res.json();
  }

  async unlinkDevice(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/unlink`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Unlink device error');
    return res.json();
  }

  // --- COMPLAINTS ---
  async getComplaints() {
    const res = await fetch(`${API_BASE}/admin/complaints`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Complaints API error');
    return res.json();
  }

  async updateComplaintStatus(id: string | number, status: 'New' | 'In Progress' | 'Resolved') {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    await this.throwIfNotOk(res, 'Update complaint error');
    return res.json();
  }

  async replyComplaint(id: string | number, text: string, author?: string) {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/reply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, author }),
    });
    await this.throwIfNotOk(res, 'Reply complaint error');
    return res.json();
  }

  async submitComplaint(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    category?: string;
    message: string;
    priority?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/complaints/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await this.throwIfNotOk(res, 'Submit complaint error', true);
    return res.json();
  }

  async deleteComplaint(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Delete complaint error');
    return res.json();
  }

  // --- SUBSCRIPTION PLANS (Dynamic Tier Configurator & Pricing Governance) ---
  async getSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Subscription plans API error');
    return res.json();
  }

  async updateSubscriptionPlan(
    id: number,
    data: Partial<AdminSubscriptionPlan>,
    reason: string
  ): Promise<AdminSubscriptionPlan> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...data, reason }),
    });
    await this.throwIfNotOk(res, 'Plan update API error');
    return res.json();
  }

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: this.getHeaders(),
    });
    await this.throwIfNotOk(res, 'Audit logs API error');
    return res.json();
  }

  async logAudit(entry: {
    timestamp: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    details: string;
    reason?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    await this.throwIfNotOk(res, 'Log audit error');
    return res.json();
  }

  // --- AUTH ---
  async login(email: string, pass: string) {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg =
        data?.error?.message ||
        data?.message ||
        data?.error ||
        `Authentication failed (${res.status})`;
      return { success: false, error: String(errorMsg) };
    }
    return data;
  }
}

export const adminApi = new AdminApiClient();
