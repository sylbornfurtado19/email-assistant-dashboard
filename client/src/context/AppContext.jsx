import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Current user and active role
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRoleState] = useState('assistant'); // 'assistant' | 'client'

  // Email threads and filters
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'confidence_desc' | 'confidence_asc' | 'priority'

  // KPIs and Stats
  const [stats, setStats] = useState({
    totalUnread: 0,
    actionRequired: 0,
    assistantToReply: 0,
    clientToReply: 0,
    needsReview: 0,
    upcomingMeetings: 0,
    waitingForResponse: 0,
    important: 0,
    noReplyNeeded: 0,
    totalActive: 0,
    completed: 0,
    snoozed: 0,
  });

  // UI modal / drawer state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch current user and active role
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.activeRole) {
          setActiveRoleState(data.user.activeRole);
        }
      }
    } catch (err) {
      console.error('Failed to fetch auth user:', err);
    }
  }, []);

  // Fetch email statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${API_BASE}/api/emails/stats`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch threads matching current filter & search
  const fetchThreads = useCallback(
    async (preserveSelectedId = null) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedSegment) params.append('segment', selectedSegment);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        const res = await fetch(`${API_BASE}/api/emails?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.threads) {
          setThreads(data.threads);

          // Update selection
          if (preserveSelectedId) {
            const found = data.threads.find((t) => t._id === preserveSelectedId);
            if (found) setSelectedThread(found);
          } else if (data.threads.length > 0) {
            setSelectedThread((prev) => {
              if (prev && data.threads.some((t) => t._id === prev._id)) {
                return data.threads.find((t) => t._id === prev._id);
              }
              return data.threads[0];
            });
          } else {
            setSelectedThread(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err);
        addToast('Failed to load email threads', 'error');
      } finally {
        setLoading(false);
      }
    },
    [selectedSegment, searchQuery, sortBy, addToast]
  );

  // Initial load
  useEffect(() => {
    fetchCurrentUser();
    fetchStats();
  }, [fetchCurrentUser, fetchStats]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Set active role and persist to backend
  const setActiveRole = async (role) => {
    setActiveRoleState(role);
    try {
      await fetch(`${API_BASE}/api/auth/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      addToast(
        role === 'assistant'
          ? 'Switched to Assistant View (Marcus Chen, EA)'
          : 'Switched to Executive Client View (Elena Vance, CEO)',
        'info'
      );
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  // Select a thread and mark read
  const selectThread = async (thread) => {
    setSelectedThread(thread);
    if (thread && !thread.isRead) {
      setThreads((prev) =>
        prev.map((t) => (t._id === thread._id ? { ...t, isRead: true } : t))
      );
      try {
        await fetch(`${API_BASE}/api/emails/${thread._id}`);
        fetchStats();
      } catch (err) {
        console.error('Error marking thread as read:', err);
      }
    }
  };

  // Manual classification override by assistant
  const overrideClassification = async (threadId, newClassification, reason = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classification: newClassification, aiReason: reason }),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        addToast(`Classification updated to ${newClassification.replace(/_/g, ' ')}`, 'success');
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? data.thread : t))
        );
        if (selectedThread?._id === threadId) {
          setSelectedThread(data.thread);
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Error overriding classification:', err);
      addToast('Failed to update classification', 'error');
    }
  };

  // Client delegates thread to Assistant
  const delegateThread = async (threadId, delegationNote = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/delegate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delegationNote }),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        addToast('Delegated to Assistant Marcus Chen with instructions', 'success');
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? data.thread : t))
        );
        if (selectedThread?._id === threadId) {
          setSelectedThread(data.thread);
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Error delegating thread:', err);
      addToast('Failed to delegate thread', 'error');
    }
  };

  // Toggle thread status flags (isCompleted, isRead, isImportant, isArchived)
  const toggleThreadStatus = async (threadId, field, value) => {
    try {
      const payload = { [field]: value };
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? data.thread : t))
        );
        if (selectedThread?._id === threadId) {
          setSelectedThread(data.thread);
        }
        fetchStats();
        if (field === 'isCompleted') {
          addToast(value ? 'Thread marked as handled' : 'Thread reopened', 'success');
        } else if (field === 'isArchived') {
          addToast(value ? 'Thread archived' : 'Thread unarchived', 'info');
        } else if (field === 'isRead') {
          addToast(value ? 'Marked as read' : 'Marked as unread', 'info');
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      addToast('Failed to update status', 'error');
    }
  };

  // Simulate brand new incoming email
  const simulateEmail = async (emailData) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        addToast(`New email received: classified as ${data.thread.classification.replace(/_/g, ' ')}`, 'success');
        fetchThreads(data.thread._id);
        fetchStats();
        setIsSimulateOpen(false);
        return data.thread;
      }
    } catch (err) {
      console.error('Error simulating email:', err);
      addToast('Failed to simulate email', 'error');
      throw err;
    }
  };

  // Append incoming reply message to an existing thread (dynamic AI reclassification)
  const appendMessageToThread = async (threadId, messageData) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        addToast(`New reply received: thread reclassified to ${data.thread.classification.replace(/_/g, ' ')} (${data.thread.confidence}% AI)`, 'success');
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? data.thread : t))
        );
        if (selectedThread?._id === threadId) {
          setSelectedThread(data.thread);
        }
        fetchStats();
        setIsSimulateOpen(false);
        return data.thread;
      }
    } catch (err) {
      console.error('Error appending message to thread:', err);
      addToast('Failed to append message to thread', 'error');
      throw err;
    }
  };

  // Generate AI Draft reply
  const generateDraft = async (threadId, { role = activeRole, instructions = '', tone = 'professional' }) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, instructions, tone }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        addToast('AI Draft generated successfully', 'success');
        if (selectedThread?._id === threadId) {
          setSelectedThread(data.thread);
        }
        return data.draft;
      }
    } catch (err) {
      console.error('Error generating draft:', err);
      addToast('Failed to generate draft', 'error');
      throw err;
    }
  };

  // Send reply (simulated sending)
  const sendReply = async (threadId, { body, markCompleted = true, senderName, senderEmail, isClient }) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          markCompleted,
          senderName: senderName || (activeRole === 'client' ? 'Elena Vance' : 'Marcus Chen'),
          senderEmail: senderEmail || (activeRole === 'client' ? 'elena.vance@vancetech.io' : 'marcus.chen@vancetech.io'),
          isClient: typeof isClient === 'boolean' ? isClient : activeRole === 'client',
        }),
      });
      const data = await res.json();
      if (data.success && data.thread) {
        addToast('Reply logged to thread history (Simulated Outbox)', 'success');
        setThreads((prev) =>
          prev.map((t) => (t._id === threadId ? data.thread : t))
        );
        setSelectedThread(data.thread);
        fetchStats();
        return data.thread;
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      addToast('Failed to send reply', 'error');
      throw err;
    }
  };

  // Connect provider account (simulated OAuth)
  const connectAccount = async (provider, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Connected ${provider.toUpperCase()} account (Simulated OAuth)`, 'success');
        fetchCurrentUser();
      }
    } catch (err) {
      console.error('Error connecting account:', err);
      addToast('Failed to connect account', 'error');
    }
  };

  // Disconnect provider account
  const disconnectAccount = async (provider) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Disconnected ${provider.toUpperCase()}`, 'info');
        fetchCurrentUser();
      }
    } catch (err) {
      console.error('Error disconnecting account:', err);
    }
  };

  // Reset workspace to pristine 12 seed threads
  const resetWorkspace = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-demo`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Workspace restored to pristine demo dataset', 'success');
        fetchCurrentUser();
        fetchStats();
        fetchThreads();
      }
    } catch (err) {
      console.error('Error resetting demo workspace:', err);
      addToast('Failed to reset workspace', 'error');
    }
  };

  // Fetch executive morning briefing
  const fetchExecutiveBrief = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/briefing`);
      const data = await res.json();
      if (data.success) {
        return data.brief;
      }
      return null;
    } catch (err) {
      console.error('Error fetching executive brief:', err);
      addToast('Failed to generate executive briefing', 'error');
      return null;
    }
  };

  // Refine draft (shorter, assertive, bulletize, warm)
  const refineDraft = async ({ originalDraft, refinementType, role, threadId }) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/refine-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalDraft, refinementType, role, threadId }),
      });
      const data = await res.json();
      if (data.success && data.refinedDraft) {
        addToast(`Draft polished: ${refinementType}`, 'success');
        return data.refinedDraft;
      }
      return originalDraft;
    } catch (err) {
      console.error('Error refining draft:', err);
      addToast('Failed to refine draft', 'error');
      return originalDraft;
    }
  };

  // Batch update threads
  const batchUpdateThreads = async (threadIds, action, newClassification) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/batch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadIds, action, newClassification }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Updated ${threadIds.length} threads (${action.replace(/_/g, ' ')})`, 'success');
        setSelectedThreadIds([]);
        fetchThreads();
        fetchStats();
      }
    } catch (err) {
      console.error('Error batch updating threads:', err);
      addToast('Batch action failed', 'error');
    }
  };

  // Snooze thread
  const snoozeThread = async (threadId, snoozedUntil) => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/${threadId}/snooze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snoozedUntil }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          snoozedUntil
            ? `Snoozed until ${new Date(snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Snooze cleared',
          'info'
        );
        fetchThreads();
        fetchStats();
      }
    } catch (err) {
      console.error('Error snoozing thread:', err);
      addToast('Failed to snooze thread', 'error');
    }
  };

  // Fetch deep analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/emails/analytics`);
      const data = await res.json();
      if (data.success) {
        return data.analytics;
      }
      return null;
    } catch (err) {
      console.error('Error fetching analytics:', err);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        API_BASE,
        user,
        activeRole,
        setActiveRole,
        threads,
        selectedThread,
        selectThread,
        selectedSegment,
        setSelectedSegment,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        stats,
        loading,
        statsLoading,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isSimulateOpen,
        setIsSimulateOpen,
        isAskAIOpen,
        setIsAskAIOpen,
        isBriefingOpen,
        setIsBriefingOpen,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        selectedThreadIds,
        setSelectedThreadIds,
        toasts,
        addToast,
        removeToast,
        overrideClassification,
        delegateThread,
        toggleThreadStatus,
        simulateEmail,
        appendMessageToThread,
        generateDraft,
        sendReply,
        connectAccount,
        disconnectAccount,
        resetWorkspace,
        fetchExecutiveBrief,
        refineDraft,
        batchUpdateThreads,
        snoozeThread,
        fetchAnalytics,
        fetchThreads,
        fetchStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
