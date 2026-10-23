import {
  ManagedAccount,
  PaymentRecord,
  AccessCodeRecord,
  ComplaintRecord,
  LedgerRecord,
  AuditLogEntry,
  AdminRole,
} from '../types/admin';

const STORAGE_KEYS = {
  ACCOUNTS: 'mofin_admin_accounts',
  PAYMENTS: 'mofin_admin_payments',
  CODES: 'mofin_admin_codes',
  COMPLAINTS: 'mofin_admin_complaints',
  LEDGERS: 'mofin_admin_ledgers',
  AUDIT_LOGS: 'mofin_admin_audit_logs',
};

// Character set excluding 0, O, 1, I to eliminate ambiguity
const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generatePassCode(): string {
  const getRandomPart = (len: number) => {
    let result = '';
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * CODE_CHARS.length);
      result += CODE_CHARS[idx];
    }
    return result;
  };
  return `${getRandomPart(4)}-${getRandomPart(4)}`;
}

class AdminStorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- ACCOUNTS ---
  getAccounts(): ManagedAccount[] {
    return this.get<ManagedAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
  }

  updateAccount(id: string, partial: Partial<ManagedAccount>, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): ManagedAccount | null {
    const list = this.getAccounts();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...partial };
    this.set(STORAGE_KEYS.ACCOUNTS, list);
    return list[idx];
  }

  suspendAccount(id: string, reason?: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    const list = this.getAccounts();
    const acc = list.find((a) => a.id === id);
    if (!acc) return false;
    acc.isSuspended = !acc.isSuspended;
    this.set(STORAGE_KEYS.ACCOUNTS, list);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'SUSPEND_ACCOUNT',
      targetType: 'ACCOUNT',
      targetId: id,
      details: `${acc.isSuspended ? 'Suspended' : 'Reactivated'} account for ${acc.username}`,
      reason: reason || 'Administrative policy enforcement',
    });
    return true;
  }

  deleteAccount(id: string, reason?: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    let list = this.getAccounts();
    const acc = list.find((a) => a.id === id);
    if (!acc) return false;
    list = list.filter((a) => a.id !== id);
    this.set(STORAGE_KEYS.ACCOUNTS, list);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'DELETE_ACCOUNT',
      targetType: 'ACCOUNT',
      targetId: id,
      details: `Permanently deleted account for ${acc.username}`,
      reason: reason || 'User requested account removal or GDPR deletion',
    });
    return true;
  }

  resetDevice(id: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    const list = this.getAccounts();
    const acc = list.find((a) => a.id === id);
    if (!acc) return false;
    const oldDevice = acc.deviceId;
    acc.deviceId = undefined;
    this.set(STORAGE_KEYS.ACCOUNTS, list);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'UNLINK_DEVICE',
      targetType: 'ACCOUNT',
      targetId: id,
      details: `Unlinked hardware device binding (${oldDevice || 'None'}) for ${acc.username}`,
      reason: 'User lost/upgraded phone device',
    });
    return true;
  }

  // --- LEDGERS ---
  getLedgers(): LedgerRecord[] {
    return this.get<LedgerRecord[]>(STORAGE_KEYS.LEDGERS, []);
  }

  toggleArchiveLedger(id: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): LedgerRecord | null {
    const list = this.getLedgers();
    const ledger = list.find((l) => l.id === id);
    if (!ledger) return null;

    if (ledger.status === 'ACTIVE') {
      ledger.status = 'ARCHIVED';
      ledger.archivedAt = new Date().toISOString();
      ledger.closingBalance = ledger.currentBalance;
    } else {
      ledger.status = 'ACTIVE';
      ledger.archivedAt = undefined;
      ledger.closingBalance = undefined;
    }

    this.set(STORAGE_KEYS.LEDGERS, list);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'ARCHIVE_LEDGER',
      targetType: 'LEDGER',
      targetId: id,
      details: `${ledger.status === 'ARCHIVED' ? 'Archived' : 'Restored'} ledger "${ledger.name}" (Closing balance KSH ${ledger.currentBalance})`,
      reason: 'Ledger end-date expired / Manual event closure',
    });

    return ledger;
  }

  // --- PAYMENTS ---
  getPayments(): PaymentRecord[] {
    return this.get<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  claimPayment(paymentId: string, username: string, phone: string, feature = 'Events Pro', actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): AccessCodeRecord | null {
    const payments = this.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'Unclaimed') return null;

    const newCodeString = generatePassCode();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const expiresFormatted = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    payment.status = 'Paid';
    payment.username = username;
    payment.passCode = newCodeString;
    payment.feature = feature;
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    const codes = this.getCodes();
    const newCodeRecord: AccessCodeRecord = {
      id: `code-${Date.now()}`,
      code: newCodeString,
      username,
      paidWithPhone: phone,
      maskedPhone: `${phone.slice(0, 4)}***${phone.slice(-3)}`,
      issuedAt: todayFormatted,
      expiresAt: expiresFormatted,
      status: 'Active',
      paymentId: payment.id,
      feature,
    };
    codes.unshift(newCodeRecord);
    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'CREATE_CODE',
      targetType: 'PAYMENT',
      targetId: payment.id,
      details: `Matched unclaimed payment ${payment.mpesaRef} to ${username} and issued code ${newCodeString}`,
      reason: 'Manual customer reconciliation',
    });

    return newCodeRecord;
  }

  // --- ACCESS CODES ---
  getCodes(): AccessCodeRecord[] {
    return this.get<AccessCodeRecord[]>(STORAGE_KEYS.CODES, []);
  }

  issueCode(data: { username: string; phone: string; feature: string; durationDays: number }, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): AccessCodeRecord {
    const codes = this.getCodes();
    const newCode = generatePassCode();
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + data.durationDays);

    const codeRecord: AccessCodeRecord = {
      id: `code-${Date.now()}`,
      code: newCode,
      username: data.username,
      paidWithPhone: data.phone,
      maskedPhone: `${data.phone.slice(0, 4)}***${data.phone.slice(-3)}`,
      issuedAt: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiresAt: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      feature: data.feature,
    };

    codes.unshift(codeRecord);
    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'CREATE_CODE',
      targetType: 'CODE',
      targetId: codeRecord.id,
      details: `Issued pass code ${newCode} for ${data.username} (${data.feature}, valid ${data.durationDays} days)`,
      reason: 'Direct administrative code issue / promotional pass',
    });

    return codeRecord;
  }

  revokeCode(id: string, reason: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    const codes = this.getCodes();
    const code = codes.find((c) => c.id === id);
    if (!code) return false;
    code.status = 'Revoked';
    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'REVOKE_CODE',
      targetType: 'CODE',
      targetId: id,
      details: `Revoked code ${code.code} for user ${code.username || 'Unclaimed'}`,
      reason: reason || 'Violation of terms or duplicate payment issue',
    });

    return true;
  }

  reissueCode(id: string, reason: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): AccessCodeRecord | null {
    const codes = this.getCodes();
    const oldCode = codes.find((c) => c.id === id);
    if (!oldCode) return null;

    oldCode.status = 'Revoked';
    const newCodeString = generatePassCode();
    const newCodeRecord: AccessCodeRecord = {
      ...oldCode,
      id: `code-${Date.now()}`,
      code: newCodeString,
      issuedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      deviceId: undefined, // reset device on reissue
    };

    codes.unshift(newCodeRecord);
    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'REISSUE_CODE',
      targetType: 'CODE',
      targetId: newCodeRecord.id,
      details: `Replaced revoked code ${oldCode.code} with newly issued code ${newCodeString} for ${oldCode.username}`,
      reason: reason || 'Customer lost previous code or phone failure',
    });

    return newCodeRecord;
  }

  extendExpiry(id: string, extraDays: number, reason: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    const codes = this.getCodes();
    const code = codes.find((c) => c.id === id);
    if (!code) return false;

    // Parse existing expiry date or use today
    const currentExpiry = new Date();
    currentExpiry.setDate(currentExpiry.getDate() + extraDays);
    code.expiresAt = currentExpiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (code.status === 'Expired') code.status = 'Active';

    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'EXTEND_EXPIRY',
      targetType: 'CODE',
      targetId: id,
      details: `Extended code ${code.code} expiry by +${extraDays} days (New expiry: ${code.expiresAt})`,
      reason: reason || 'Customer courtesy compensation',
    });

    return true;
  }

  unlinkCodeDevice(id: string, reason: string, actorEmail = 'admin@mofin.app', actorRole: AdminRole = 'OWNER'): boolean {
    const codes = this.getCodes();
    const code = codes.find((c) => c.id === id);
    if (!code) return false;
    const oldDev = code.deviceId;
    code.deviceId = undefined;
    this.set(STORAGE_KEYS.CODES, codes);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'UNLINK_DEVICE',
      targetType: 'CODE',
      targetId: id,
      details: `Unlinked device hardware ID (${oldDev || 'None'}) from code ${code.code}`,
      reason: reason || 'Customer migrated to a new mobile phone',
    });

    return true;
  }

  // --- COMPLAINTS ---
  getComplaints(): ComplaintRecord[] {
    return this.get<ComplaintRecord[]>(STORAGE_KEYS.COMPLAINTS, []);
  }

  replyToComplaint(
    complaintId: string,
    message: string,
    newStatus: ComplaintRecord['status'],
    actorName = 'Mofin Support',
    actorEmail = 'admin@mofin.app',
    actorRole: AdminRole = 'OWNER',
  ): ComplaintRecord | null {
    const list = this.getComplaints();
    const comp = list.find((c) => c.id === complaintId);
    if (!comp) return null;

    comp.status = newStatus;
    comp.unreadAdmin = false;
    comp.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'admin',
      senderName: actorName,
      message,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });

    this.set(STORAGE_KEYS.COMPLAINTS, list);

    this.logAudit({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorEmail,
      actorRole,
      action: 'REPLY_COMPLAINT',
      targetType: 'COMPLAINT',
      targetId: complaintId,
      details: `Replied to complaint from ${comp.username} and set status to ${newStatus.toUpperCase()}`,
    });

    return comp;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLogEntry[] {
    return this.get<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  logAudit(entry: AuditLogEntry): void {
    const list = this.getAuditLogs();
    list.unshift(entry);
    this.set(STORAGE_KEYS.AUDIT_LOGS, list);
  }
}

export const adminStorage = new AdminStorageService();
