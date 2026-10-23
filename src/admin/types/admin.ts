export type AdminRole = 'OWNER' | 'STAFF' | 'VIEWER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin: string;
}

export type PassStatus = 'Active' | 'Expired' | 'Pending' | 'None';

export interface ProviderBalances {
  mtn: number;
  mpesa: number;
  airtel: number;
  equitel: number;
  cash: number;
}

export interface ManagedAccount {
  id: string;
  dbId?: number;
  username: string;
  phone: string; // E.g. "0712345678"
  maskedPhone: string; // E.g. "0712***345"
  joinedDate: string;
  passStatus: PassStatus;
  deviceId?: string;
  device?: string;
  isSuspended?: boolean;
  avatar?: string;
  email?: string;
  currency?: string;
  balance?: number;
  activeLedgersCount?: number;
  totalTransactionsCount?: number;
  providers?: ProviderBalances;
}

export type LedgerType = 'PERSONAL' | 'EVENT' | 'BUSINESS';
export type LedgerStatus = 'ACTIVE' | 'ARCHIVED';

export interface LedgerRecord {
  id: string;
  dbId?: number;
  name: string;
  ownerUsername: string;
  ownerEmail?: string;
  ownerUserId?: string;
  currency?: string;
  type: LedgerType;
  initialBudget: number;
  currentBalance: number;
  closingBalance?: number;
  status: LedgerStatus;
  startDate: string;
  endDate?: string;
  archivedAt?: string;
  createdAt?: string;
  accountsCount?: number;
  transactionsCount?: number;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Unclaimed';

export interface PaymentRecord {
  id: string;
  dbId?: number;
  date?: string; // ISO date-time string
  time?: string;
  displayTime: string; // e.g. "Today 07:41", "20 Oct 07:41"
  payerPhone: string;
  maskedPhone: string;
  mpesaRef: string; // e.g. "SKX2A91B7"
  amount: number; // in KSH
  passCode?: string;
  feature: string; // e.g. "Unlimited Events", "Full Export", "Standard Pass"
  status: PaymentStatus;
  username?: string;
  userId?: string;
  matchedUser?: string;
  accountName?: string;
}

export type CodeStatus = 'Active' | 'Used' | 'Expired' | 'Revoked';

export interface AccessCodeRecord {
  id: string;
  dbId?: number;
  code: string; // e.g. "4FBK-29QD" (8 chars, XXXX-XXXX)
  username?: string;
  userId?: string;
  paidWithPhone?: string;
  phone?: string;
  maskedPhone: string;
  issuedAt: string;
  expiresAt: string;
  status: CodeStatus;
  deviceId?: string;
  boundDeviceId?: string;
  paymentId?: string;
  feature: string;
  validDays?: number;
  deviceLimit?: number;
}

export type ComplaintCategory = 'Payment' | 'Bug' | 'Account' | 'Other';
export type ComplaintStatus = 'New' | 'In progress' | 'Resolved';

export interface ComplaintMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName?: string;
  author?: string;
  message?: string;
  text?: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface ComplaintRecord {
  id: string;
  dbId?: number;
  ticketId?: string;
  username: string;
  userId?: string;
  phone?: string;
  userPhone?: string;
  maskedPhone: string;
  category: ComplaintCategory;
  subject: string;
  status: ComplaintStatus;
  priority?: string;
  createdAt: string;
  updatedAt?: string;
  displayTime?: string;
  messages: ComplaintMessage[];
  unreadAdmin?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: 'REVOKE_CODE' | 'REISSUE_CODE' | 'EXTEND_EXPIRY' | 'UNLINK_DEVICE' | 'SUSPEND_ACCOUNT' | 'DELETE_ACCOUNT' | 'REVEAL_PHONE' | 'EXPORT_DATA' | 'ARCHIVE_LEDGER' | 'REPLY_COMPLAINT' | 'CREATE_CODE';
  targetType: 'ACCOUNT' | 'CODE' | 'PAYMENT' | 'COMPLAINT' | 'LEDGER';
  targetId: string;
  details: string;
  reason?: string;
}

export interface BudgetHealth {
  totalBudgets: number;
  overspentBudgets: number;
  budgetAdherence: number;
}

export interface ProviderStat {
  count: number;
  balance: number;
}

export interface CategoryTelemetryItem {
  id: number;
  name: string;
  color: string;
  count: number;
  total: number;
}

export interface DashboardStats {
  totalAccountsCount: number;
  activePassesCount: number;
  companyRevenue: number;
  totalRevenue?: number;
  openComplaintsCount: number;
  totalLedgersCount: number;
  totalTransactionsCount: number;
  trackedVolumeKES: number;
  trackedVolumeRWF: number;
  totalTrackedVolume: number;
  budgetHealth: BudgetHealth;
  providerDistribution: {
    MTN: ProviderStat;
    'M-Pesa': ProviderStat;
    Airtel: ProviderStat;
    Equitel: ProviderStat;
    Cash: ProviderStat;
  };
  topCategories: CategoryTelemetryItem[];
  dailyData: Array<{ day: string; val: number; count: number }>;
  recentPayments: PaymentRecord[];
}

export interface BudgetTelemetry {
  totalBudgets: number;
  overspentCount: number;
  adherencePercent: number;
  totalLimit: number;
  totalSpent: number;
  budgets: Array<{
    id: number;
    username: string;
    email?: string;
    currency: string;
    ledgerName: string;
    limit: number;
    spent: number;
    percentSpent: number;
    period: string;
    type: string;
    status: string;
    isOverspent: boolean;
    startDate: string;
    endDate: string;
  }>;
}
