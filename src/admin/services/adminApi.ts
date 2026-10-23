// Real Backend API Client for Mofin Admin Panel - Connecting directly to PostgreSQL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

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

  // --- DASHBOARD ---
  async getDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Dashboard API error: ${res.statusText}`);
    return res.json();
  }

  // --- TELEMETRY ---
  async getBudgetTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/budgets`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Budget telemetry API error: ${res.statusText}`);
    return res.json();
  }

  async getCategoryTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/categories`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Category telemetry API error: ${res.statusText}`);
    return res.json();
  }

  async getProviderTelemetry() {
    const res = await fetch(`${API_BASE}/admin/telemetry/providers`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Provider telemetry API error: ${res.statusText}`);
    return res.json();
  }

  // --- ACCOUNTS ---
  async getAccounts(search?: string) {
    const url = new URL(`${API_BASE}/admin/accounts`);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Accounts API error: ${res.statusText}`);
    return res.json();
  }

  async updateAccountStatus(id: number | string, status: 'ACTIVE' | 'INACTIVE') {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Account status update error: ${res.statusText}`);
    return res.json();
  }

  async deleteAccount(id: number | string, reason?: string) {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('usr-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/accounts/${numId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Delete account error: ${res.statusText}`);
    return res.json();
  }

  // --- LEDGERS ---
  async getLedgers() {
    const res = await fetch(`${API_BASE}/admin/ledgers`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Ledgers API error: ${res.statusText}`);
    return res.json();
  }

  async archiveLedger(id: number | string, status: 'ACTIVE' | 'ARCHIVED') {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace('led-', ''), 10);
    const res = await fetch(`${API_BASE}/admin/ledgers/${numId}/archive`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Archive ledger error: ${res.statusText}`);
    return res.json();
  }

  // --- PAYMENTS ---
  async getPayments() {
    const res = await fetch(`${API_BASE}/admin/payments`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Payments API error: ${res.statusText}`);
    return res.json();
  }

  async claimPayment(paymentId: string | number, username: string, phone: string, feature: string) {
    const res = await fetch(`${API_BASE}/admin/payments/claim`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentId, username, phone, feature }),
    });
    if (!res.ok) throw new Error(`Claim payment error: ${res.statusText}`);
    return res.json();
  }

  // --- ACCESS CODES ---
  async getCodes() {
    const res = await fetch(`${API_BASE}/admin/codes`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Codes API error: ${res.statusText}`);
    return res.json();
  }

  async issueCode(data: { phone?: string; username?: string; feature: string; validDays?: number; deviceLimit?: number }) {
    const res = await fetch(`${API_BASE}/admin/codes/issue`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Issue code error: ${res.statusText}`);
    return res.json();
  }

  async revokeCode(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/revoke`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Revoke code error: ${res.statusText}`);
    return res.json();
  }

  async extendCode(id: string | number, days = 30) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/extend`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ days }),
    });
    if (!res.ok) throw new Error(`Extend code error: ${res.statusText}`);
    return res.json();
  }

  async unlinkDevice(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/codes/${id}/unlink`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Unlink device error: ${res.statusText}`);
    return res.json();
  }

  // --- COMPLAINTS ---
  async getComplaints() {
    const res = await fetch(`${API_BASE}/admin/complaints`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Complaints API error: ${res.statusText}`);
    return res.json();
  }

  async updateComplaintStatus(id: string | number, status: 'New' | 'In Progress' | 'Resolved') {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Update complaint error: ${res.statusText}`);
    return res.json();
  }

  async replyComplaint(id: string | number, text: string, author?: string) {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/reply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, author }),
    });
    if (!res.ok) throw new Error(`Reply complaint error: ${res.statusText}`);
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
    if (!res.ok) throw new Error(`Submit complaint error: ${res.statusText}`);
    return res.json();
  }

  async deleteComplaint(id: string | number) {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Delete complaint error: ${res.statusText}`);
    return res.json();
  }

  // --- SUBSCRIPTION PLANS (Dynamic Tier Configurator & Pricing Governance) ---
  async getSubscriptionPlans(): Promise<import('../types/admin').AdminSubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Subscription plans API error: ${res.statusText}`);
    return res.json();
  }

  async updateSubscriptionPlan(
    id: number,
    data: Partial<import('../types/admin').AdminSubscriptionPlan>,
    reason: string
  ): Promise<import('../types/admin').AdminSubscriptionPlan> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...data, reason }),
    });
    if (!res.ok) {
      let errMsg = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson.message) errMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }
    return res.json();
  }

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Audit logs API error: ${res.statusText}`);
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
    if (!res.ok) throw new Error(`Log audit error: ${res.statusText}`);
    return res.json();
  }

  // --- AUTH ---
  async login(email: string, pass: string) {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });
    if (!res.ok) throw new Error(`Login API error: ${res.statusText}`);
    return res.json();
  }
}

export const adminApi = new AdminApiClient();
