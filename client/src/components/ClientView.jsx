import React, { useState } from 'react';
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
  Loader2,
  Edit3,
  Volume2,
} from 'lucide-react';

export default function ClientView() {
  const {
    threads,
    delegateThread,
    toggleThreadStatus,
    sendReply,
    generateDraft,
    refineDraft,
    addToast,
    setActiveRole,
    setIsBriefingOpen,
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
  const [replyTones, setReplyTones] = useState({});
  const [replyInstructions, setReplyInstructions] = useState({});
  const [isDrafting, setIsDrafting] = useState(false);
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

  const handleGenerateClientDraft = async (thread) => {
    try {
      setIsDrafting(true);
      const tone = replyTones[thread._id] || 'professional';
      const instructions = replyInstructions[thread._id] || '';
      const draft = await generateDraft(thread._id, {
        role: 'client', // Draft IN FIRST PERSON as Elena Vance
        instructions,
        tone,
      });
      if (draft) {
        setReplyTexts((prev) => ({
          ...prev,
          [thread._id]: draft.replyBody,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
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
      setReplyInstructions((prev) => ({ ...prev, [threadId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestionPrompts = [
    'Marcus, politely decline and propose next quarter.',
    'Marcus, request updated financial schedule before we proceed.',
    'Marcus, coordinate a 15-minute briefing call with outside counsel.',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Executive Focus Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 text-xs font-semibold">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Executive Focus • Elena Vance (CEO)</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Action Required from You
            </h1>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Filtered strictly to decisions requiring direct CEO authorization (DocuSign, valuation, press embargo, custom liability caps).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition"
              title="Open Elena's Morning Radar & Audio Briefing (B)"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-950" />
              <span>Morning Radar</span>
            </button>

            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-center min-w-[72px]">
              <p className="text-xl font-bold text-white">{clientThreads.length}</p>
              <p className="text-[9px] text-slate-300 uppercase tracking-wider font-medium">Pending</p>
            </div>
          </div>
        </div>

        {/* Main Single-Column Feed */}
        <div className="space-y-4">
          {clientThreads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">All Clear, Elena!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                You have zero pending decisions requiring direct CEO authorization. Marcus is actively managing routine inbox operations.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setActiveRole('assistant')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>View Assistant Command Center</span>
                </button>
              </div>
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
                  className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3.5 transition"
                >
                  {/* Card Header: Sender, Date, Subject */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{lastMsg?.senderName || 'External Counterparty'}</span>
                        <span className="font-mono text-[11px] text-slate-400">&lt;{lastMsg?.senderEmail}&gt;</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(lastMsg?.timestamp || thread.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                      {thread.subject}
                    </h3>
                  </div>

                  {/* Why Elena is Needed Callout */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Why Your Attention is Required:</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium pl-5">
                      {thread.whyClientNeeded || thread.aiReason}
                    </p>
                  </div>

                  {/* Summary & Snippet */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="font-medium text-slate-700">Summary:</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      {thread.summary || lastMsg?.body}
                    </p>
                  </div>

                  {/* Expand Conversation Button */}
                  <div>
                    <button
                      onClick={() => toggleExpand(thread._id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide conversation history' : `View full conversation history (${thread.messages?.length || 0} messages)`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Conversation History */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {thread.messages?.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            msg.isClient
                              ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                              : 'bg-slate-50/60 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-900">{msg.senderName}</span>
                            <span className="font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Primary Action Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      {/* Toggle Delegate */}
                      <button
                        onClick={() => {
                          setActiveDelegatingId(isDelegating ? null : thread._id);
                          setActiveReplyId(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
                          isDelegating
                            ? 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Delegate to Marcus</span>
                      </button>

                      {/* Toggle Reply Directly */}
                      <button
                        onClick={() => {
                          setActiveReplyId(isReplying ? null : thread._id);
                          setActiveDelegatingId(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
                          isReplying
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Reply Directly</span>
                      </button>
                    </div>

                    {/* Mark Handled */}
                    <button
                      onClick={() => handleMarkHandled(thread._id)}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Handled</span>
                    </button>
                  </div>

                  {/* Inline Delegation Box */}
                  {isDelegating && (
                    <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-900">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Delegation Instructions for Marcus:</span>
                      </div>

                      {/* Suggestion Chips */}
                      <div className="flex flex-wrap gap-1">
                        {suggestionPrompts.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDelegationNotes((prev) => ({ ...prev, [thread._id]: s }))}
                            className="text-[10px] px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-200 text-purple-900 rounded transition"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={delegationNotes[thread._id] || ''}
                        onChange={(e) => setDelegationNotes((prev) => ({ ...prev, [thread._id]: e.target.value }))}
                        placeholder="Enter instructions for Marcus (e.g. Reject liability clause and offer credits)..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveDelegatingId(null)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelegate(thread._id)}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
                        >
                          {isSubmitting ? 'Transferring...' : 'Confirm Delegation to Marcus'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Direct Reply Composer */}
                  {isReplying && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">
                          Drafting as Elena Vance (CEO • First Person)
                        </span>

                        <button
                          onClick={() => handleGenerateClientDraft(thread)}
                          disabled={isDrafting}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-md text-xs font-medium transition flex items-center space-x-1"
                        >
                          {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-600" />}
                          <span>Generate CEO Draft</span>
                        </button>
                      </div>

                      {/* AI Polish Tools */}
                      {replyTexts[thread._id] && (
                        <div className="flex items-center space-x-1.5 py-0.5 overflow-x-auto text-[11px]">
                          <span className="text-slate-400 font-medium text-[10px]">AI Polish:</span>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsDrafting(true);
                              const refined = await refineDraft({
                                originalDraft: replyTexts[thread._id],
                                refinementType: 'shorter',
                                role: 'client',
                                threadId: thread._id,
                              });
                              setReplyTexts((prev) => ({ ...prev, [thread._id]: refined }));
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
                                originalDraft: replyTexts[thread._id],
                                refinementType: 'assertive',
                                role: 'client',
                                threadId: thread._id,
                              });
                              setReplyTexts((prev) => ({ ...prev, [thread._id]: refined }));
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
                                originalDraft: replyTexts[thread._id],
                                refinementType: 'bulletize',
                                role: 'client',
                                threadId: thread._id,
                              });
                              setReplyTexts((prev) => ({ ...prev, [thread._id]: refined }));
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
                                originalDraft: replyTexts[thread._id],
                                refinementType: 'warm',
                                role: 'client',
                                threadId: thread._id,
                              });
                              setReplyTexts((prev) => ({ ...prev, [thread._id]: refined }));
                              setIsDrafting(false);
                            }}
                            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[10px]"
                          >
                            🤝 Warmer
                          </button>
                        </div>
                      )}

                      <textarea
                        rows={3}
                        value={replyTexts[thread._id] || ''}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [thread._id]: e.target.value }))}
                        placeholder="Write direct CEO response or click 'Generate CEO Draft'..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          ⚡ Simulated Outbox: Message logged to thread history.
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendClientReply(thread._id)}
                            disabled={isSubmitting || !(replyTexts[thread._id] || '').trim()}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-40"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Reply & Mark Handled</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
