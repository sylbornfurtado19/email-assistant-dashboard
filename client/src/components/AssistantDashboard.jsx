import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  UserCheck,
  User,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Star,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  Edit3,
  CalendarPlus,
  ShieldAlert,
  HelpCircle,
  FileText,
  Check,
  Trash2,
  RefreshCw,
  Loader2,
  Mail,
  Archive,
  ArrowUpDown,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function AssistantDashboard() {
  const {
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
    selectedThreadIds,
    setSelectedThreadIds,
    batchUpdateThreads,
    snoozeThread,
    refineDraft,
    overrideClassification,
    toggleThreadStatus,
    generateDraft,
    sendReply,
    addToast,
    user,
  } = useApp();

  // Composer states
  const [composerTone, setComposerTone] = useState('professional');
  const [composerInstructions, setComposerInstructions] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);
  const [overrideMenuOpen, setOverrideMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;
      if (!isInput && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync draftBody when selectedThread changes
  useEffect(() => {
    if (selectedThread?.replyDraft?.content) {
      setDraftBody(selectedThread.replyDraft.content);
      setDraftSubject(selectedThread.subject.startsWith('Re:') ? selectedThread.subject : `Re: ${selectedThread.subject}`);
    } else if (selectedThread) {
      setDraftBody('');
      setDraftSubject(selectedThread.subject.startsWith('Re:') ? selectedThread.subject : `Re: ${selectedThread.subject}`);
    }
    setSnoozeMenuOpen(false);
    setOverrideMenuOpen(false);
  }, [selectedThread?._id]);

  // Generate AI Draft
  const handleGenerateAIDraft = async () => {
    if (!selectedThread) return;
    try {
      setIsDrafting(true);
      const draft = await generateDraft(selectedThread._id, {
        role: 'assistant',
        instructions: composerInstructions,
        tone: composerTone,
      });
      if (draft) {
        setDraftBody(draft.replyBody);
        setDraftSubject(draft.subject || `Re: ${selectedThread.subject}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Send Reply
  const handleSendReply = async () => {
    if (!selectedThread || !draftBody.trim()) {
      addToast('Please enter or generate a reply draft before sending', 'error');
      return;
    }
    try {
      setIsSending(true);
      await sendReply(selectedThread._id, {
        body: draftBody,
        markCompleted: true,
        senderName: 'Marcus Chen',
        senderEmail: 'marcus.chen@vancetech.io',
        isClient: false,
      });
      setDraftBody('');
      setComposerInstructions('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Sidebar navigation segments
  const smartSegments = [
    { id: 'all', label: 'All Inboxes', icon: Inbox, count: stats.totalActive },
    { id: 'assistant_to_reply', label: 'Assistant to Reply', icon: UserCheck, count: stats.assistantToReply, color: 'text-indigo-600' },
    { id: 'client_to_reply', label: 'Client to Reply', icon: User, count: stats.clientToReply, color: 'text-amber-600' },
    { id: 'needs_review', label: 'Needs Review', icon: AlertCircle, count: stats.needsReview, color: 'text-rose-600' },
  ];

  const categorySegments = [
    { id: 'meetings', label: 'Meetings & Events', icon: Calendar, count: stats.upcomingMeetings, color: 'text-emerald-600' },
    { id: 'waiting_for_response', label: 'Waiting for Response', icon: Clock, count: stats.waitingForResponse, color: 'text-cyan-600' },
    { id: 'important', label: 'Important', icon: Star, count: stats.important, color: 'text-amber-500' },
    { id: 'snoozed', label: 'Snoozed', icon: Clock, count: stats.snoozed, color: 'text-purple-600' },
    { id: 'no_reply_needed', label: 'No Reply Needed', icon: CheckCircle2, count: stats.noReplyNeeded, color: 'text-slate-500' },
    { id: 'completed', label: 'Handled / Archive', icon: Check, count: stats.completed, color: 'text-teal-600' },
  ];

  const getBadgeStyle = (classification) => {
    switch (classification) {
      case 'client_to_reply':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'assistant_to_reply':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'needs_review':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'no_reply_needed':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getBadgeLabel = (classification) => {
    switch (classification) {
      case 'client_to_reply':
        return 'Client Action';
      case 'assistant_to_reply':
        return 'Assistant Reply';
      case 'needs_review':
        return 'Needs Review';
      case 'no_reply_needed':
        return 'No Reply';
      default:
        return classification?.replace(/_/g, ' ') || 'Unknown';
    }
  };

  return (
    <div className="flex-1 flex min-h-0 w-full overflow-hidden bg-white">
      {/* =========================================================================
          PANE 1: Left Navigation Sidebar (Desktop: visible; Mobile: hidden)
         ========================================================================= */}
      <aside className="hidden md:flex w-56 lg:w-60 flex-col border-r border-slate-200 bg-slate-50/70 shrink-0 select-none overflow-y-auto justify-between p-3">
        <div className="space-y-4">
          {/* Section: Inbox & Action */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Inbox & Triage
            </p>
            <div className="space-y-0.5">
              {smartSegments.map((seg) => {
                const Icon = seg.icon;
                const isActive = selectedSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : seg.color || 'text-slate-400'}`} />
                      <span className="truncate">{seg.label}</span>
                    </div>
                    {typeof seg.count === 'number' && seg.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {seg.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Categories */}
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Categories & Status
            </p>
            <div className="space-y-0.5">
              {categorySegments.map((seg) => {
                const Icon = seg.icon;
                const isActive = selectedSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : seg.color || 'text-slate-400'}`} />
                      <span className="truncate">{seg.label}</span>
                    </div>
                    {typeof seg.count === 'number' && seg.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {seg.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Connected User Badge */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center space-x-2.5 px-2 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              MC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">Marcus Chen</p>
              <p className="text-[10px] text-slate-500 truncate">Executive Assistant</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="AI Triage Engine Active"></span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          PANE 2: Middle Email List Pane
          (On mobile: hidden when a thread is selected, full-width otherwise)
         ========================================================================= */}
      <section
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden ${
          selectedThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search & Filter Header */}
        <div className="p-2.5 border-b border-slate-200 space-y-2 bg-slate-50/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, subject, body (/)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={threads.length > 0 && selectedThreadIds.length === threads.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedThreadIds(threads.map((t) => t._id));
                  } else {
                    setSelectedThreadIds([]);
                  }
                }}
                title="Select all threads in segment"
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-600">
                {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[11px] bg-transparent text-slate-600 font-medium border-0 focus:ring-0 py-0 pr-5 pl-1 cursor-pointer focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="confidence_desc">Highest confidence</option>
                <option value="confidence_asc">Lowest confidence</option>
                <option value="priority">Priority first</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Email Rows Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-600" />
              Loading email threads...
            </div>
          ) : threads.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs px-4">
              <Mail className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700">No emails in this segment</p>
              <p className="mt-1 text-slate-400">All caught up or try selecting another filter above.</p>
            </div>
          ) : (
            threads.map((thread) => {
              const isSelected = selectedThread?._id === thread._id;
              const isChecked = selectedThreadIds.includes(thread._id);
              const lastMsg = thread.messages?.[thread.messages.length - 1];

              return (
                <div
                  key={thread._id}
                  onClick={() => selectThread(thread)}
                  className={`p-3 cursor-pointer transition select-none flex items-start space-x-2.5 relative border-l-2 ${
                    isSelected
                      ? 'bg-slate-100/90 border-l-slate-900'
                      : !thread.isRead
                      ? 'bg-blue-50/20 border-l-blue-600 hover:bg-slate-50'
                      : 'border-l-transparent hover:bg-slate-50'
                  }`}
                >
                  {/* Row Checkbox & Unread Dot */}
                  <div className="pt-0.5 flex flex-col items-center space-y-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedThreadIds((prev) => [...prev, thread._id]);
                        } else {
                          setSelectedThreadIds((prev) => prev.filter((id) => id !== thread._id));
                        }
                      }}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    {!thread.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </div>

                  {/* Main Row Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {/* Header: Sender & Timestamp */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`truncate ${
                          !thread.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                        }`}
                      >
                        {lastMsg?.senderName || 'External Sender'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                        {new Date(lastMsg?.timestamp || thread.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Subject Line */}
                    <p
                      className={`text-xs truncate ${
                        !thread.isRead ? 'font-semibold text-slate-900' : 'font-normal text-slate-700'
                      }`}
                    >
                      {thread.subject}
                    </p>

                    {/* Snippet Preview */}
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                      {thread.summary || lastMsg?.body}
                    </p>

                    {/* Compact Metadata Badges */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${getBadgeStyle(thread.classification)}`}>
                        {getBadgeLabel(thread.classification)}
                      </span>

                      {thread.isOverridden && (
                        <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium rounded">
                          Overridden
                        </span>
                      )}

                      {thread.extractedEvent && (
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium rounded flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{thread.extractedEvent.date}</span>
                        </span>
                      )}

                      {thread.isSnoozed && (
                        <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium rounded flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Snoozed</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono ml-auto ${
                          thread.confidence >= 85
                            ? 'text-emerald-700'
                            : thread.confidence >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700 font-bold'
                        }`}
                      >
                        {thread.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Batch Actions Bar */}
        {selectedThreadIds.length > 0 && (
          <div className="p-2.5 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                {selectedThreadIds.length}
              </span>
              <span className="text-[11px] text-slate-300">selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => batchUpdateThreads(selectedThreadIds, 'mark_handled')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-[11px] transition flex items-center space-x-1"
                title="Mark all selected as handled"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Handled</span>
              </button>
              <button
                onClick={() => batchUpdateThreads(selectedThreadIds, 'archive')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-[11px] transition flex items-center space-x-1"
                title="Archive all selected"
              >
                <Archive className="w-3 h-3 text-slate-400" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => batchUpdateThreads(selectedThreadIds, 'mark_read')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-[11px] transition flex items-center space-x-1"
                title="Mark all selected as read"
              >
                <Mail className="w-3 h-3 text-blue-400" />
                <span>Read</span>
              </button>
              <button
                onClick={() => setSelectedThreadIds([])}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Deselect all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          PANE 3: Right Detail & Conversation Workspace
          (On mobile: full-screen with back button when a thread is selected)
         ========================================================================= */}
      <section
        className={`flex-1 min-w-0 flex flex-col bg-white overflow-hidden ${
          !selectedThread ? 'hidden md:flex items-center justify-center' : 'flex'
        }`}
      >
        {selectedThread ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Header: Subject, Participants & Quick Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => selectThread(null)}
                    className="md:hidden inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to inbox</span>
                  </button>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug tracking-tight">
                    {selectedThread.subject}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 flex-wrap gap-y-1">
                    <span className="font-medium text-slate-400">Participants:</span>
                    {selectedThread.participants?.map((p, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                          p.role === 'client'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : p.role === 'assistant'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => toggleThreadStatus(selectedThread._id, 'isImportant', !selectedThread.isImportant)}
                    className={`p-1.5 rounded-lg border transition ${
                      selectedThread.isImportant
                        ? 'bg-amber-50 text-amber-500 border-amber-200'
                        : 'text-slate-400 hover:text-slate-600 border-slate-200'
                    }`}
                    title={selectedThread.isImportant ? 'Unmark Important' : 'Mark Important'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => toggleThreadStatus(selectedThread._id, 'isRead', !selectedThread.isRead)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                    title={selectedThread.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleThreadStatus(selectedThread._id, 'isArchived', !selectedThread.isArchived)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                    title={selectedThread.isArchived ? 'Unarchive Thread' : 'Archive Thread'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  {/* Snooze Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSnoozeMenuOpen((prev) => !prev)}
                      className={`p-1.5 rounded-lg border transition ${
                        selectedThread.isSnoozed
                          ? 'bg-purple-50 text-purple-600 border-purple-200'
                          : 'text-slate-400 hover:text-slate-600 border-slate-200'
                      }`}
                      title={selectedThread.isSnoozed ? 'Thread Snoozed (Click to manage)' : 'Snooze Thread'}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    {snoozeMenuOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                        <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                          Snooze Until
                        </div>
                        <button
                          onClick={() => {
                            const d = new Date();
                            d.setHours(17, 0, 0, 0);
                            snoozeThread(selectedThread._id, d.toISOString());
                            setSnoozeMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                        >
                          <span>Later Today</span>
                          <span className="text-[10px] text-slate-400">5:00 PM</span>
                        </button>
                        <button
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 1);
                            d.setHours(9, 0, 0, 0);
                            snoozeThread(selectedThread._id, d.toISOString());
                            setSnoozeMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                        >
                          <span>Tomorrow</span>
                          <span className="text-[10px] text-slate-400">9:00 AM</span>
                        </button>
                        <button
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 7);
                            d.setHours(9, 0, 0, 0);
                            snoozeThread(selectedThread._id, d.toISOString());
                            setSnoozeMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                        >
                          <span>Next Week</span>
                          <span className="text-[10px] text-slate-400">Monday</span>
                        </button>
                        {selectedThread.isSnoozed && (
                          <button
                            onClick={() => {
                              snoozeThread(selectedThread._id, null);
                              setSnoozeMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 border-t border-slate-100 font-medium"
                          >
                            Clear Snooze
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mark Handled Toggle Button */}
                  <button
                    onClick={() => toggleThreadStatus(selectedThread._id, 'isCompleted', !selectedThread.isCompleted)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                      selectedThread.isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{selectedThread.isCompleted ? 'Handled' : 'Mark Handled'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Body & Intelligence */}
            <div className="p-4 space-y-4">
              {/* AI Triage Intelligence Card */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <span className="text-xs font-semibold text-slate-900">AI Triage Rationale</span>
                  </div>

                  {/* Classification Pill with Override Trigger */}
                  <div className="flex items-center space-x-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getBadgeStyle(selectedThread.classification)}`}>
                      {getBadgeLabel(selectedThread.classification)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {selectedThread.confidence}% AI
                    </span>

                    {/* Human Override Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOverrideMenuOpen((prev) => !prev)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded transition flex items-center space-x-1"
                        title="Manually override AI classification"
                      >
                        <span>Override</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {overrideMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                          <button
                            onClick={() => {
                              overrideClassification(selectedThread._id, 'assistant_to_reply');
                              setOverrideMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                          >
                            Assistant to Reply
                          </button>
                          <button
                            onClick={() => {
                              overrideClassification(selectedThread._id, 'client_to_reply');
                              setOverrideMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                          >
                            Client to Reply
                          </button>
                          <button
                            onClick={() => {
                              overrideClassification(selectedThread._id, 'no_reply_needed');
                              setOverrideMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                          >
                            No Reply Needed
                          </button>
                          <button
                            onClick={() => {
                              overrideClassification(selectedThread._id, 'needs_review');
                              setOverrideMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                          >
                            Needs Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedThread.aiReason || selectedThread.summary}
                </p>

                {/* Client Attention Requirement Callout */}
                {selectedThread.classification === 'client_to_reply' && selectedThread.whyClientNeeded && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-0.5">
                    <p className="font-semibold text-amber-900">Why Elena's Attention is Required:</p>
                    <p className="text-amber-800">{selectedThread.whyClientNeeded}</p>
                  </div>
                )}

                {/* Suggested Action */}
                {selectedThread.suggestedAction && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-700">Suggested Action:</span>
                    <span>{selectedThread.suggestedAction}</span>
                  </div>
                )}

                {/* Calendar Event Extraction Box */}
                {selectedThread.extractedEvent && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-emerald-900 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedThread.extractedEvent.title || 'Extracted Event'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        {selectedThread.extractedEvent.date} • {selectedThread.extractedEvent.time} ({selectedThread.extractedEvent.location || 'Virtual / TBD'})
                      </p>
                    </div>
                    <button
                      onClick={() => addToast(`Event synced to Google Calendar: ${selectedThread.extractedEvent.title}`, 'success')}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition shadow-sm"
                    >
                      Sync Calendar
                    </button>
                  </div>
                )}
              </div>

              {/* Message History Feed */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Conversation ({selectedThread.messages?.length || 0} messages)
                </p>

                {selectedThread.messages?.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`p-3 rounded-xl border text-xs leading-relaxed space-y-2 ${
                      msg.isClient
                        ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                            msg.isClient ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.senderName.charAt(0)}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                            &lt;{msg.senderEmail}&gt;
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Docked AI Reply Composer */}
            <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-900">
                    Replying as Marcus Chen (on behalf of Elena Vance)
                  </span>
                </div>

                {/* Tone Pills */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">Tone:</span>
                  {['professional', 'warm', 'direct', 'firm'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setComposerTone(tone)}
                      className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                        composerTone === tone
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions Input & Draft Generator */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={composerInstructions}
                  onChange={(e) => setComposerInstructions(e.target.value)}
                  placeholder="Custom AI instructions (e.g. Propose Thursday 2 PM, confirm pricing)..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  onClick={handleGenerateAIDraft}
                  disabled={isDrafting}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0"
                >
                  {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-600" />}
                  <span>Generate AI Draft</span>
                </button>
              </div>

              {/* AI Polish Tools */}
              {draftBody && (
                <div className="flex items-center space-x-1.5 py-0.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 font-medium text-[10px]">AI Polish:</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDrafting(true);
                      const refined = await refineDraft({
                        originalDraft: draftBody,
                        refinementType: 'shorter',
                        role: 'assistant',
                        threadId: selectedThread._id,
                      });
                      setDraftBody(refined);
                      setIsDrafting(false);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[10px]"
                  >
                    ✂️ Shorter
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDrafting(true);
                      const refined = await refineDraft({
                        originalDraft: draftBody,
                        refinementType: 'assertive',
                        role: 'assistant',
                        threadId: selectedThread._id,
                      });
                      setDraftBody(refined);
                      setIsDrafting(false);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[10px]"
                  >
                    💼 Assertive
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDrafting(true);
                      const refined = await refineDraft({
                        originalDraft: draftBody,
                        refinementType: 'bulletize',
                        role: 'assistant',
                        threadId: selectedThread._id,
                      });
                      setDraftBody(refined);
                      setIsDrafting(false);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[10px]"
                  >
                    📋 Bulletize
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDrafting(true);
                      const refined = await refineDraft({
                        originalDraft: draftBody,
                        refinementType: 'warm',
                        role: 'assistant',
                        threadId: selectedThread._id,
                      });
                      setDraftBody(refined);
                      setIsDrafting(false);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[10px]"
                  >
                    🤝 Warmer
                  </button>
                </div>
              )}

              {/* Draft Editor Textarea */}
              <textarea
                rows={3}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Reply draft will appear here, or type your response directly..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white leading-relaxed"
              />

              {/* Bottom Outbox Notice & Send Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  ⚡ Simulated Outbox: Message logged to thread without external SMTP dispatch.
                </span>
                <button
                  onClick={handleSendReply}
                  disabled={isSending || !draftBody.trim()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Reply & Mark Handled</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <Mail className="w-8 h-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Select an email to view conversation</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Choose an email from the list on the left to read history, inspect AI triage rationale, or prepare drafts.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
