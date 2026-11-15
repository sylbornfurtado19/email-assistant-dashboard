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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Executive Focus Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-amber-300 text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Executive Focus • Elena Vance (CEO)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Action Required from You
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Filtered strictly down to high-stakes decisions requiring direct CEO signatory authorization, media quotes, or non-standard terms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 self-start sm:self-center">
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
              title="Open Elena's Morning Radar & Audio Briefing"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Morning Radar & Audio Brief</span>
            </button>

            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{clientThreads.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Pending Decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Single-Column Feed */}
      <div className="space-y-4">
        {clientThreads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Inbox Zero for Elena!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              All high-stakes signatory, legal, and strategic decisions have been handled or delegated to Marcus Chen.
            </p>
            <button
              onClick={() => setActiveRole('assistant')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
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
            const currentTone = replyTones[thread._id] || 'professional';

            return (
              <div
                key={thread._id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all duration-150 shadow-2xs overflow-hidden"
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Bar: Sender & Date */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center font-bold text-xs">
                        {lastMsg?.senderName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{lastMsg?.senderName}</h3>
                        <p className="text-[11px] text-slate-500">{lastMsg?.senderEmail}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(lastMsg?.timestamp || thread.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {thread.subject}
                    </h2>
                  </div>

                  {/* AI Executive Summary */}
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">AI Summary: </span>
                    {thread.summary}
                  </div>

                  {/* Highlighted "Why Your Attention is Needed" Alert Box */}
                  <div className="p-3 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-lg">
                    <div className="flex items-start space-x-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                          Why your attention is needed
                        </h4>
                        <p className="text-xs text-amber-900 font-medium leading-relaxed">
                          {thread.whyClientNeeded || thread.aiReason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Action Callout if available */}
                  {thread.suggestedAction && (
                    <div className="text-[11px] text-indigo-900 font-medium bg-indigo-50/60 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Suggested Action: {thread.suggestedAction}</span>
                    </div>
                  )}

                  {/* Delegation Note Form if Active */}
                  {isDelegating && (
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
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
                        placeholder="Add guidance for Marcus (e.g. 'Politely decline the 99.99% SLA and offer 99.9% with credits')..."
                        className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDelegate(thread._id)}
                          disabled={isSubmitting}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Confirm Delegation & Move to Assistant</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Direct Reply Form if Active (with 1st Person AI Drafting) */}
                  {isReplying && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Reply in First Person as Elena Vance (CEO)
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Tone and AI Draft Controls for Executive */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">Tone:</span>
                          {['professional', 'warm', 'direct', 'firm'].map((tone) => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() =>
                                setReplyTones((prev) => ({
                                  ...prev,
                                  [thread._id]: tone,
                                }))
                              }
                              className={`px-2 py-0.5 rounded text-[11px] capitalize transition ${
                                currentTone === tone
                                  ? 'bg-slate-900 text-white font-medium'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGenerateClientDraft(thread)}
                          disabled={isDrafting}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium rounded-lg transition flex items-center gap-1"
                        >
                          {isDrafting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-amber-600" />
                          )}
                          <span>Generate CEO Draft</span>
                        </button>
                      </div>

                      {/* AI Draft Polish Pills */}
                      {replyTexts[thread._id] && (
                        <div className="flex items-center space-x-1.5 py-1 overflow-x-auto text-[11px]">
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
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition"
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
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition"
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
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition"
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
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition"
                          >
                            🤝 Warmer
                          </button>
                        </div>
                      )}

                      <textarea
                        rows={3}
                        value={replyTexts[thread._id] || ''}
                        onChange={(e) =>
                          setReplyTexts({
                            ...replyTexts,
                            [thread._id]: e.target.value,
                          })
                        }
                        placeholder="Write your direct executive response or click 'Generate CEO Draft'..."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-white"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          ⚡ Simulated Outbox: Message logged to thread history without live SMTP dispatch.
                        </span>
                        <button
                          onClick={() => handleSendClientReply(thread._id)}
                          disabled={isSubmitting || !(replyTexts[thread._id] || '').trim()}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Reply & Mark Handled</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable Message History */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 pt-3 space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Full Conversation Thread ({thread.messages?.length || 0})
                      </p>
                      {thread.messages?.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs leading-relaxed space-y-1 ${
                            msg.isClient
                              ? 'bg-amber-50/40 border-amber-200/80 text-amber-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-700">
                            <span>{msg.senderName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(msg.timestamp).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 whitespace-pre-line">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <button
                      onClick={() => toggleExpand(thread._id)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Thread</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View Full Thread ({thread.messages?.length || 0})</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      {!isReplying && (
                        <button
                          onClick={() => {
                            setActiveReplyId(thread._id);
                            setActiveDelegatingId(null);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
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
                          className="px-2.5 py-1 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg transition flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Delegate to Assistant</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleMarkHandled(thread._id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
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
