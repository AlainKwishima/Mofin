import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  User,
} from 'lucide-react';
import { ComplaintRecord, ComplaintStatus, ManagedAccount } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../admin.css';

export const AdminComplaints: React.FC = () => {
  const { user } = useAdminAuth();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [usersList, setUsersList] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | ComplaintStatus>('All');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusDraft, setStatusDraft] = useState<ComplaintStatus>('In progress');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // New Ticket Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logUsername, setLogUsername] = useState('');
  const [logEmail, setLogEmail] = useState('');
  const [logPhone, setLogPhone] = useState('');
  const [logSubject, setLogSubject] = useState('');
  const [logCategory, setLogCategory] = useState('Payments');
  const [logPriority, setLogPriority] = useState('Medium');
  const [logMessage, setLogMessage] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchComplaints = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await adminApi.getComplaints();
      if (Array.isArray(data)) {
        setComplaints(data);
        if (!selectedComplaintId && data.length > 0) {
          setSelectedComplaintId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch real PostgreSQL complaints:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  }, [selectedComplaintId]);

  useEffect(() => {
    fetchComplaints();
    adminApi.getAccounts().then((accs) => {
      if (Array.isArray(accs)) setUsersList(accs);
    }).catch(() => {});

    const interval = setInterval(() => {
      fetchComplaints();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const allCount = complaints.length;
  const newCount = complaints.filter((c) => c.status === 'New').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In progress' || (c.status as any) === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'In progress') return c.status === 'In progress' || (c.status as any) === 'In Progress';
    return c.status === activeTab;
  });

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) || filteredComplaints[0];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !replyText.trim()) return;

    try {
      const targetId = selectedComplaint.dbId || selectedComplaint.id;
      await adminApi.replyComplaint(targetId, replyText.trim(), user?.email || 'Mofin Staff');
      if (statusDraft && statusDraft !== selectedComplaint.status) {
        await adminApi.updateComplaintStatus(targetId, statusDraft);
      }

      await fetchComplaints();
      setReplyText('');
      showToast(`Reply dispatched to ${selectedComplaint.username}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteComplaint = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this complaint ticket?')) return;
    try {
      await adminApi.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id && c.dbId !== id));
      setSelectedComplaintId(null);
      showToast('Complaint ticket deleted.');
    } catch (err: any) {
      showToast(`Error deleting ticket: ${err.message}`);
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logUsername.trim() || !logMessage.trim()) return;

    setSubmittingLog(true);
    try {
      const res = await adminApi.submitComplaint({
        name: logUsername.trim(),
        email: logEmail.trim(),
        phone: logPhone.trim(),
        subject: logSubject.trim() || 'Direct Inquiry',
        category: logCategory,
        priority: logPriority,
        message: logMessage.trim(),
      });

      await fetchComplaints();
      setShowLogModal(false);
      setLogUsername('');
      setLogEmail('');
      setLogPhone('');
      setLogSubject('');
      setLogMessage('');
      showToast(`Support ticket #${res.ticketId} logged successfully in PostgreSQL!`);
    } catch (err: any) {
      showToast(`Error creating ticket: ${err.message}`);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleSelectExistingUser = (username: string) => {
    const found = usersList.find((u) => u.username === username);
    if (found) {
      setLogUsername(found.username);
      setLogEmail(found.email || '');
      setLogPhone(found.phone || '');
    } else {
      setLogUsername(username);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            backgroundColor: '#09090b',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', margin: 0 }}>
            Complaints Inbox
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
            Live customer support tickets, issues, and inquiries ({complaints.length} tickets)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchComplaints(true)}
            className="admin-btn-secondary"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
            title="Refresh complaints from database"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="admin-btn-emerald"
            style={{ height: '36px', fontSize: '12px', padding: '0 14px', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Log Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('All')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'All' ? '1px solid #09090b' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'All' ? '#09090b' : '#ffffff',
            color: activeTab === 'All' ? '#ffffff' : '#52525b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>All</span>
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: activeTab === 'All' ? '#27272a' : '#f4f4f5' }}>
            {allCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('New')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'New' ? '1px solid #9d174d' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'New' ? '#9d174d' : '#ffffff',
            color: activeTab === 'New' ? '#ffffff' : '#52525b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>New</span>
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: activeTab === 'New' ? '#be185d' : '#fdf2f8', color: activeTab === 'New' ? '#ffffff' : '#9d174d' }}>
            {newCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('In progress')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'In progress' ? '1px solid #92400e' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'In progress' ? '#92400e' : '#ffffff',
            color: activeTab === 'In progress' ? '#ffffff' : '#52525b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>In progress</span>
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: activeTab === 'In progress' ? '#b45309' : '#fef3c7', color: activeTab === 'In progress' ? '#ffffff' : '#92400e' }}>
            {inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Resolved')}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: activeTab === 'Resolved' ? '1px solid #047857' : '1px solid #e4e4e7',
            backgroundColor: activeTab === 'Resolved' ? '#047857' : '#ffffff',
            color: activeTab === 'Resolved' ? '#ffffff' : '#52525b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Resolved</span>
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: activeTab === 'Resolved' ? '#065f46' : '#ecfdf5', color: activeTab === 'Resolved' ? '#ffffff' : '#065f46' }}>
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Two-Pane Inbox Layout */}
      <div
        className="admin-split-pane"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', minHeight: '560px' }}
      >
        {/* Left Pane: Ticket List */}
        <div className={`inbox-left-pane ${mobileShowThread ? 'inbox-mobile-hide' : ''}`} style={{ borderRight: '1px solid #ececee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ececee', backgroundColor: '#fafafa', fontSize: '12px', fontWeight: 700, color: '#52525b' }}>
            Tickets ({filteredComplaints.length})
          </div>

          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '540px' }}>
            {filteredComplaints.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', fontSize: '13px', color: '#71717a' }}>
                <MessageSquare size={32} style={{ margin: '0 auto 12px auto', color: '#d4d4d8' }} />
                <div style={{ fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>No Complaints in this View</div>
                <p style={{ margin: 0, fontSize: '12px', color: '#71717a', lineHeight: 1.5 }}>
                  Support tickets submitted via the public contact desk, the mobile app, or logged by support staff will appear here.
                </p>
              </div>
            ) : (
              filteredComplaints.map((comp) => {
                const isSelected = selectedComplaint?.id === comp.id;
                const lastMsg = comp.messages[comp.messages.length - 1]?.text || comp.messages[comp.messages.length - 1]?.message || '';

                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedComplaintId(comp.id);
                      setStatusDraft(comp.status === 'Resolved' ? 'Resolved' : 'In progress');
                      setMobileShowThread(true);
                    }}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f4f4f5',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fafafa' : 'transparent',
                      borderLeft: isSelected ? '3px solid #09090b' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>{comp.username}</span>
                      <span
                        className={`pill-badge ${
                          comp.status === 'New'
                            ? 'pill-pending'
                            : comp.status === 'In progress' || (comp.status as any) === 'In Progress'
                            ? 'pill-unclaimed'
                            : 'pill-active'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#27272a', marginBottom: '4px' }}>
                      {comp.subject}
                    </div>

                    <div style={{ fontSize: '12px', color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                      {lastMsg}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#71717a', marginTop: '8px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f4f4f5', color: '#52525b', fontWeight: 500 }}>
                        {comp.category}
                      </span>
                      <span>{comp.displayTime || comp.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation & Reply */}
        <div className={`inbox-right-pane ${!mobileShowThread ? 'inbox-mobile-hide' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
          {selectedComplaint ? (
            <>
              {/* Thread Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #ececee', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="complaint-back-btn"
                  style={{
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f4f4f5',
                    border: '1px solid #e4e4e7',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#09090b',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to tickets</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                        {selectedComplaint.username}
                      </h2>
                      <span className="tabular-nums" style={{ fontSize: '12px', color: '#71717a' }}>
                        {selectedComplaint.maskedPhone || selectedComplaint.userPhone}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
                      {selectedComplaint.subject} · Ticket #{selectedComplaint.ticketId}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#52525b', backgroundColor: '#f4f4f5', padding: '3px 8px', borderRadius: '4px' }}>
                      {selectedComplaint.category}
                    </span>

                    <button
                      onClick={() => handleDeleteComplaint(selectedComplaint.dbId || selectedComplaint.id)}
                      className="admin-btn-secondary"
                      style={{ height: '30px', padding: '0 8px', color: '#b91c1c' }}
                      title="Delete this ticket"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedComplaint.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#09090b' }}>{m.author || (isAdmin ? 'Support Staff' : 'Customer')}</span>
                        <span>·</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <div
                        style={{
                          maxWidth: '520px',
                          padding: '12px 16px',
                          borderRadius: isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          fontSize: '13px',
                          lineHeight: 1.5,
                          backgroundColor: isAdmin ? '#09090b' : '#f4f4f5',
                          color: isAdmin ? '#ffffff' : '#09090b',
                        }}
                      >
                        {m.text || m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} style={{ padding: '16px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #ececee', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official response to this ticket..."
                  className="admin-textarea"
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#71717a' }}>Status:</span>
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as any)}
                      className="admin-select"
                      style={{ height: '34px', fontSize: '12px' }}
                    >
                      <option value="In progress">In progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="New">New</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="admin-btn-emerald"
                    style={{ height: '34px', fontSize: '12px', padding: '0 16px' }}
                  >
                    <Send size={13} />
                    <span>Send reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', fontSize: '13px' }}>
              Select a complaint ticket to inspect the thread
            </div>
          )}
        </div>
      </div>

      {/* Log Real Ticket Modal */}
      {showLogModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#09090b' }}>
                  Log Real Complaint / Ticket
                </h3>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '4px 0 0 0' }}>
                  Record a support issue from WhatsApp, phone, or customer report
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>
                  User Name
                </label>
                <input
                  type="text"
                  required
                  list="real-users-list"
                  value={logUsername}
                  onChange={(e) => handleSelectExistingUser(e.target.value)}
                  placeholder="Select or enter registered user name..."
                  className="admin-input"
                />
                <datalist id="real-users-list">
                  {usersList.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username} ({u.phone || u.email})
                    </option>
                  ))}
                </datalist>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={logPhone}
                    onChange={(e) => setLogPhone(e.target.value)}
                    placeholder="e.g. 0710022379"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value)}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="Payments">Payments (Till 4549332)</option>
                    <option value="Pass Code">Pass Code & Device</option>
                    <option value="Bug">Technical Bug</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={logSubject}
                  onChange={(e) => setLogSubject(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52525b', marginBottom: '4px' }}>
                  Complaint / Message Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={logMessage}
                  onChange={(e) => setLogMessage(e.target.value)}
                  placeholder="Enter the customer's problem or description..."
                  className="admin-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="admin-btn-secondary"
                  style={{ height: '36px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="admin-btn-emerald"
                  style={{ height: '36px', fontSize: '12px' }}
                >
                  {submittingLog ? 'Logging Ticket...' : 'Save Ticket in Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
