import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronRight,
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
  SlidersHorizontal,
  Archive,
  ArrowUpDown,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
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
    overrideClassification,
    toggleThreadStatus,
    generateDraft,
    sendReply,
    addToast,
  } = useApp();

  // Composer states
  const [composerTone, setComposerTone] = useState('professional');
  const [composerInstructions, setComposerInstructions] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOverrideDropdown, setShowOverrideDropdown] = useState(false);

  // When selectedThread changes, populate composer with draft or subject
  useEffect(() => {
    if (selectedThread) {
      setDraftSubject(
        selectedThread.replyDraft?.content
          ? selectedThread.subject.startsWith('Re:')
            ? selectedThread.subject
            : `Re: ${selectedThread.subject}`
          : selectedThread.subject.startsWith('Re:')
          ? selectedThread.subject
          : `Re: ${selectedThread.subject}`
      );
      setDraftBody(selectedThread.replyDraft?.content || '');
      setComposerTone(selectedThread.replyDraft?.tone || 'professional');
      setComposerInstructions('');
      setShowOverrideDropdown(false);
    }
  }, [selectedThread]);

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
        setDraftSubject(draft.replySubject);
        setDraftBody(draft.replyBody);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread || !draftBody.trim()) {
      addToast('Please enter or generate a reply message first', 'error');
      return;
    }
    try {
      setIsSending(true);
      await sendReply(selectedThread._id, {
        body: draftBody,
        markCompleted: true,
      });
      setDraftBody('');
      setComposerInstructions('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Helper for responsibility badge styling
  const getBadgeStyle = (classification) => {
    switch (classification) {
      case 'assistant_to_reply':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'client_to_reply':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'needs_review':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'no_reply_needed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getBadgeLabel = (classification) => {
    switch (classification) {
      case 'assistant_to_reply':
        return 'Assistant to Reply';
      case 'client_to_reply':
        return 'Client to Reply';
      case 'needs_review':
        return 'Needs Review';
      case 'no_reply_needed':
        return 'No Reply Needed';
      default:
        return (classification || '').replace(/_/g, ' ');
    }
  };

  // Sidebar filters list (all 9 categories)
  const sidebarFilters = [
    { id: 'all', label: 'All Inboxes', icon: Inbox, count: stats.totalActive },
    { id: 'assistant_to_reply', label: 'Assistant to Reply', icon: UserCheck, count: stats.assistantToReply, color: 'text-indigo-600' },
    { id: 'client_to_reply', label: 'Client to Reply', icon: User, count: stats.clientToReply, color: 'text-amber-600' },
    { id: 'needs_review', label: 'Needs Review', icon: AlertCircle, count: stats.needsReview, color: 'text-rose-600' },
    { id: 'meetings', label: 'Meetings & Events', icon: Calendar, count: stats.upcomingMeetings, color: 'text-emerald-600' },
    { id: 'waiting_for_response', label: 'Waiting for Response', icon: Clock, count: stats.waitingForResponse, color: 'text-cyan-600' },
    { id: 'important', label: 'Important', icon: Star, count: stats.important, color: 'text-amber-500' },
    { id: 'no_reply_needed', label: 'No Reply Needed', icon: CheckCircle2, count: stats.noReplyNeeded, color: 'text-slate-500' },
    { id: 'completed', label: 'Handled / Archive', icon: Check, count: stats.completed, color: 'text-teal-600' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.75rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2.5 space-y-2.5">
      {/* 1. Refined KPI Summary Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white px-3 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unread</p>
            <p className="text-lg font-bold text-slate-900">{stats.totalUnread}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Action Required</p>
            <p className="text-lg font-bold text-slate-900">{stats.actionRequired}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">Assistant</p>
            <p className="text-lg font-bold text-indigo-900">{stats.assistantToReply}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2.5 rounded-xl border border-amber-100 bg-amber-50/20 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Client Action</p>
            <p className="text-lg font-bold text-amber-900">{stats.clientToReply}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2.5 rounded-xl border border-rose-100 bg-rose-50/20 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Needs Review</p>
            <p className="text-lg font-bold text-rose-900">{stats.needsReview}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white px-3 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Meetings</p>
            <p className="text-lg font-bold text-emerald-900">{stats.upcomingMeetings}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* 2. Main 3-Pane Work Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Pane 1: Left Filter Sidebar (2.5 cols) */}
        <aside className="hidden md:flex md:col-span-3 lg:col-span-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 flex-col space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1">
            Smart Segments
          </p>
          {sidebarFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedSegment === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedSegment(filter.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : filter.color || 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{filter.label}</span>
                </div>
                {typeof filter.count === 'number' && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 mt-auto border-t border-slate-100 text-[10px] text-slate-400 px-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Triage Active</span>
            </div>
            <p className="leading-tight">Confidence threshold: 75%</p>
            <p className="leading-tight text-slate-400">Ambiguous &lt;75% flags for review</p>
          </div>
        </aside>

        {/* Pane 2: Middle Thread List (4.5 cols) */}
        <section className="col-span-1 md:col-span-5 lg:col-span-4.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col min-h-0 overflow-hidden">
          {/* Search & Sort Controls Header */}
          <div className="p-2.5 border-b border-slate-200/80 space-y-2 bg-slate-50/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, sender, body..."
                className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
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
              <span className="text-[11px] font-medium text-slate-600">
                {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
              </span>

              {/* Sort Selector */}
              <div className="flex items-center space-x-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[11px] bg-transparent text-slate-600 font-medium border-0 focus:ring-0 py-0 pr-6 pl-1 cursor-pointer"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="confidence_desc">High confidence</option>
                  <option value="confidence_asc">Low confidence</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thread Card Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                Loading email threads...
              </div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Mail className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No emails in this segment</p>
                <p className="mt-1 text-slate-400">Try selecting another filter or simulate incoming mail.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = selectedThread?._id === thread._id;
                const lastMsg = thread.messages?.[thread.messages.length - 1];
                return (
                  <div
                    key={thread._id}
                    onClick={() => selectThread(thread)}
                    className={`p-3 cursor-pointer transition text-left relative group border-l-2 ${
                      isSelected
                        ? 'bg-slate-50/90 border-l-indigo-600'
                        : !thread.isRead
                        ? 'bg-indigo-50/15 border-l-transparent hover:bg-slate-50/60'
                        : 'border-l-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Top Row: Sender & Time */}
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center space-x-1.5 truncate pr-2">
                        {!thread.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                        )}
                        <span
                          className={`truncate text-xs ${
                            !thread.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {lastMsg?.senderName || 'External Sender'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(lastMsg?.timestamp || thread.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Subject Line */}
                    <h4
                      className={`text-xs mb-1 line-clamp-1 ${
                        !thread.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
                      }`}
                    >
                      {thread.subject}
                    </h4>

                    {/* AI Executive Summary Snippet */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {thread.summary || lastMsg?.body}
                    </p>

                    {/* Bottom Metadata Badges */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${getBadgeStyle(
                            thread.classification
                          )}`}
                        >
                          {getBadgeLabel(thread.classification)}
                        </span>

                        {thread.isOverridden && (
                          <span
                            title={`Manually overridden by Assistant (Original: ${getBadgeLabel(thread.originalClassification)})`}
                            className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium rounded-md"
                          >
                            Overridden
                          </span>
                        )}

                        {thread.extractedEvent && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium rounded-md flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {thread.extractedEvent.date}
                          </span>
                        )}

                        {thread.delegationNote && (
                          <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-medium rounded-md">
                            Delegated
                          </span>
                        )}
                      </div>

                      {/* Confidence Meter */}
                      <span
                        className={`text-[10px] font-semibold ${
                          thread.confidence >= 85
                            ? 'text-emerald-600'
                            : thread.confidence >= 75
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                        title={`AI Confidence Score: ${thread.confidence}%`}
                      >
                        {thread.confidence}% AI
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Pane 3: Right Detail & Copilot Pane (5 cols) */}
        <section className="col-span-1 md:col-span-4 lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col min-h-0 overflow-hidden">
          {selectedThread ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Header Bar */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white sticky top-0 z-10 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug tracking-tight">
                      {selectedThread.subject}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>Participants:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedThread.participants?.map((p, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-medium border ${
                              p.role === 'client'
                                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                : p.role === 'assistant'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() =>
                        toggleThreadStatus(selectedThread._id, 'isImportant', !selectedThread.isImportant)
                      }
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
                      onClick={() =>
                        toggleThreadStatus(selectedThread._id, 'isRead', !selectedThread.isRead)
                      }
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                      title={selectedThread.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        toggleThreadStatus(selectedThread._id, 'isArchived', !selectedThread.isArchived)
                      }
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                      title={selectedThread.isArchived ? 'Unarchive Thread' : 'Archive Thread'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        toggleThreadStatus(selectedThread._id, 'isCompleted', !selectedThread.isCompleted)
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
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

                {/* Extracted Meeting Banner if detected */}
                {selectedThread.extractedEvent && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CalendarPlus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          {selectedThread.extractedEvent.title || 'Calendar Event'}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {selectedThread.extractedEvent.date} • {selectedThread.extractedEvent.time} ({selectedThread.extractedEvent.location || 'Location TBD'})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        addToast(`Event synced to Google Calendar: ${selectedThread.extractedEvent.title}`, 'success')
                      }
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[11px] font-semibold transition shrink-0"
                    >
                      Sync Calendar
                    </button>
                  </div>
                )}

                {/* AI Reasoning & Classification Override Box */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">AI Triage Rationale</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold border ${getBadgeStyle(
                          selectedThread.classification
                        )}`}
                      >
                        {getBadgeLabel(selectedThread.classification)} ({selectedThread.confidence}%)
                      </span>
                    </div>

                    {/* Classification Override Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowOverrideDropdown(!showOverrideDropdown)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Override</span>
                      </button>

                      {showOverrideDropdown && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                          {[
                            'assistant_to_reply',
                            'client_to_reply',
                            'needs_review',
                            'no_reply_needed',
                          ].map((cls) => (
                            <button
                              key={cls}
                              onClick={() => {
                                overrideClassification(selectedThread._id, cls);
                                setShowOverrideDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition ${
                                selectedThread.classification === cls
                                  ? 'font-bold text-indigo-600 bg-indigo-50/50'
                                  : 'text-slate-700'
                              }`}
                            >
                              {getBadgeLabel(cls)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overridden audit indicator */}
                  {selectedThread.isOverridden && (
                    <div className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-900 flex items-center justify-between">
                      <span>Human Override by {selectedThread.overriddenBy || 'Assistant'}</span>
                      <span className="text-[10px] opacity-75">
                        Originally: {getBadgeLabel(selectedThread.originalClassification)}
                      </span>
                    </div>
                  )}

                  {/* AI Reason explanation */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedThread.aiReason}
                  </p>

                  {/* Suggested Action Callout */}
                  {selectedThread.suggestedAction && (
                    <div className="text-[11px] text-indigo-900 font-medium bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Suggested Action: {selectedThread.suggestedAction}</span>
                    </div>
                  )}

                  {/* Why Client Needed Callout */}
                  {selectedThread.whyClientNeeded && (
                    <div className="p-2 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Why Elena Vance is Required: </span>
                        <span>{selectedThread.whyClientNeeded}</span>
                      </div>
                    </div>
                  )}

                  {/* Client Delegation Note if present */}
                  {selectedThread.delegationNote && (
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Elena Vance Delegation Note: </span>
                        <span>"{selectedThread.delegationNote}"</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message History Feed */}
              <div className="p-3.5 space-y-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Thread History ({selectedThread.messages?.length || 0} messages)
                </p>

                {selectedThread.messages?.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                      msg.isClient
                        ? 'bg-amber-50/40 border-amber-200/80 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-1 border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            msg.isClient
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.senderName.charAt(0)}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            &lt;{msg.senderEmail}&gt;
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-slate-700 pt-0.5">{msg.body}</div>
                  </div>
                ))}
              </div>

              {/* Interactive Draft & Approve Composer */}
              <div className="p-3.5 border-t border-slate-200/90 bg-slate-50/60 mt-auto space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      AI Reply Assistant
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Drafting as Marcus (EA on behalf of Elena)
                  </span>
                </div>

                {/* Tone Selector */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Tone:</span>
                  {['professional', 'warm', 'direct', 'firm'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setComposerTone(tone)}
                      className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition ${
                        composerTone === tone
                          ? 'bg-slate-900 text-white font-medium shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                {/* Custom Instructions Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={composerInstructions}
                    onChange={(e) => setComposerInstructions(e.target.value)}
                    placeholder="Instructions for AI (e.g., Confirm 3 PM slot and request deck)..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleGenerateAIDraft}
                    disabled={isDrafting}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 rounded-lg text-xs font-medium transition flex items-center gap-1 shrink-0"
                  >
                    {isDrafting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>Generate AI Draft</span>
                  </button>
                </div>

                {/* Editable Draft Body Textarea */}
                <textarea
                  rows={4}
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  placeholder="Draft reply content will appear here or click 'Generate AI Draft'..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                />

                {/* Simulated Outbox Notice & Send Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    ⚡ Simulated Outbox: Message logged to thread history without live SMTP dispatch.
                  </span>

                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !draftBody.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isSending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Send & Mark Handled</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs text-center">
              <Mail className="w-10 h-10 mb-2.5 text-slate-200" />
              <p className="font-semibold text-slate-700 text-sm">No Thread Selected</p>
              <p className="max-w-xs mt-1 text-slate-400">
                Choose an email from the middle queue to inspect AI triage, full history, and draft approved responses.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
