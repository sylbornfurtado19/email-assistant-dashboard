import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  Clock,
  Mail,
  User,
  ArrowRight,
  Check,
  HelpCircle,
  FileCheck,
  Calendar,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function ClientView() {
  const {
    threads,
    delegateThread,
    toggleThreadStatus,
    sendReply,
    addToast,
    fetchThreads,
    fetchStats,
    setActiveRole,
  } = useApp();

  // Filter ONLY threads where classification === 'client_to_reply' and not completed
  const clientThreads = threads.filter(
    (t) => t.classification === 'client_to_reply' && !t.isCompleted
  );

  // Expanded thread IDs for viewing message details
  const [expandedThreadIds, setExpandedThreadIds] = useState({});

  // Delegation modal / input state per thread: { [threadId]: noteString }
  const [delegationNotes, setDelegationNotes] = useState({});
  const [activeDelegatingId, setActiveDelegatingId] = useState(null);

  // Direct reply states per thread: { [threadId]: replyText }
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (threadId) => {
    setExpandedThreadIds((prev) => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  const handleDelegate = async (threadId) => {
    const note = delegationNotes[threadId] || '';
    try {
      setIsSubmitting(true);
      await delegateThread(threadId, note);
      setActiveDelegatingId(null);
      setDelegationNotes((prev) => ({ ...prev, [threadId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHandled = async (threadId) => {
    try {
      await toggleThreadStatus(threadId, 'isCompleted', true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendClientReply = async (threadId) => {
    const body = replyTexts[threadId] || '';
    if (!body.trim()) {
      addToast('Please enter a response body', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await sendReply(threadId, {
        body,
        markCompleted: true,
        senderName: 'Elena Vance',
        senderEmail: 'elena.vance@vancetech.io',
        isClient: true,
      });
      setActiveReplyId(null);
      setReplyTexts((prev) => ({ ...prev, [threadId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Executive Focus Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5 text-violet-300" />
              Executive Focus Mode • Elena Vance, CEO
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Action Required from You
            </h1>
            <p className="text-sm text-violet-200/90 mt-1 max-w-xl">
              Marcus Chen and your AI assistant have filtered your inbox down to only high-stakes
              decisions requiring direct CEO authorization.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur px-4 py-3 rounded-xl border border-white/10 self-start sm:self-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{clientThreads.length}</p>
              <p className="text-[11px] text-violet-200 uppercase tracking-wider font-medium">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Single-Column Feed */}
      <div className="space-y-4">
        {clientThreads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Inbox Zero for Elena!</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              All high-stakes signatory, legal, and strategic decisions have been handled or delegated to Marcus.
            </p>
            <button
              onClick={() => setActiveRole('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>Switch to Assistant View to monitor operations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          clientThreads.map((thread) => {
            const isExpanded = !!expandedThreadIds[thread._id];
            const isDelegating = activeDelegatingId === thread._id;
            const isReplying = activeReplyId === thread._id;
            const lastMsg = thread.messages?.[thread.messages.length - 1];

            return (
              <div
                key={thread._id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-violet-300 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar: Sender & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                        {lastMsg?.senderName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{lastMsg?.senderName}</h3>
                        <p className="text-xs text-slate-500">{lastMsg?.senderEmail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(lastMsg?.timestamp || thread.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Subject */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {thread.subject}
                    </h2>
                  </div>

                  {/* AI Executive Summary */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">AI Summary: </span>
                    {thread.summary}
                  </p>

                  {/* Highlighted "Why Your Attention is Needed" Alert Box */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl shadow-2xs">
                    <div className="flex items-start space-x-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                          Why your attention is needed
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                          {thread.whyClientNeeded || thread.aiReason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delegation Note Form if Active */}
                  {isDelegating && (
                    <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          Delegate to Marcus Chen (EA)
                        </span>
                        <button
                          onClick={() => setActiveDelegatingId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={delegationNotes[thread._id] || ''}
                        onChange={(e) =>
                          setDelegationNotes({
                            ...delegationNotes,
                            [thread._id]: e.target.value,
                          })
                        }
                        placeholder="Add quick notes for Marcus (e.g. 'Politely decline the 99.99% SLA and offer 99.9% with credits')..."
                        className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDelegate(thread._id)}
                          disabled={isSubmitting}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Confirm Delegation & Move to Assistant</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Direct Reply Form if Active */}
                  {isReplying && (
                    <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-violet-600" />
                          Reply Directly as Elena Vance (CEO)
                        </span>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={replyTexts[thread._id] || ''}
                        onChange={(e) =>
                          setReplyTexts({
                            ...replyTexts,
                            [thread._id]: e.target.value,
                          })
                        }
                        placeholder="Write your direct executive response..."
                        className="w-full px-3 py-2 text-xs border border-violet-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 bg-white"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSendClientReply(thread._id)}
                          disabled={isSubmitting}
                          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply & Mark Handled</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable Message History */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Full Conversation Thread
                      </p>
                      {thread.messages?.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                            msg.isClient
                              ? 'bg-violet-50 border-violet-200 text-violet-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-700">
                            <span>{msg.senderName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-600 whitespace-pre-line">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => toggleExpand(thread._id)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Hide Thread</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>View Full Thread ({thread.messages?.length || 0})</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2.5">
                      {!isReplying && (
                        <button
                          onClick={() => {
                            setActiveReplyId(thread._id);
                            setActiveDelegatingId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 border border-violet-200 rounded-lg transition"
                        >
                          Reply Directly
                        </button>
                      )}

                      {!isDelegating && (
                        <button
                          onClick={() => {
                            setActiveDelegatingId(thread._id);
                            setActiveReplyId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Delegate to Assistant</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkHandled(thread._id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Handled</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

