import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  HelpCircle,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  User,
  Inbox,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What am I waiting for?',
  'Which emails require client approval?',
  'Why has this email been assigned to the client?',
  'What meetings are coming up?',
  'What needs urgent review?',
  'Summarize active high-stakes threads',
];

export default function AskAIDrawer() {
  const { isAskAIOpen, setIsAskAIOpen, threads, selectThread, setActiveRole, API_BASE } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Elena & Marcus! I'm your AetherInbox AI Copilot. Ask me anything about your current workload, pending client decisions, waiting threads, or upcoming meetings.",
      matchingThreads: [],
      suggestedActions: [],
    },
  ]);

  if (!isAskAIOpen) return null;

  const handleAsk = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMessage = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/emails/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        // Resolve matching thread objects from the ID list
        const matched = (data.response.matchingThreadIds || [])
          .map((id) => threads.find((t) => t._id.toString() === id.toString()))
          .filter(Boolean);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.response.answer,
            matchingThreads: matched,
            suggestedActions: data.response.suggestedActions || [],
          },
        ]);
      }
    } catch (err) {
      console.error('Ask AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I encountered an issue querying your inbox data. Please check your connection or try again.',
          matchingThreads: [],
          suggestedActions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (thread) => {
    selectThread(thread);
    if (thread.classification !== 'client_to_reply') {
      setActiveRole('assistant');
    }
    setIsAskAIOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Inbox AI Copilot</h3>
              <p className="text-[11px] text-slate-300">Natural Language Intelligence on Real Inbox Data</p>
            </div>
          </div>
          <button
            onClick={() => setIsAskAIOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggested Prompts Carousel / Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg transition whitespace-nowrap shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-2xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>
              </div>

              {/* Matching Referenced Thread Cards */}
              {msg.matchingThreads && msg.matchingThreads.length > 0 && (
                <div className="mt-2.5 space-y-2 w-full pl-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Referenced Inbox Threads ({msg.matchingThreads.length}):
                  </p>
                  {msg.matchingThreads.map((thread) => (
                    <button
                      key={thread._id}
                      onClick={() => handleSelectThread(thread)}
                      className="w-full text-left p-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-2xs rounded-xl transition flex items-start justify-between group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-medium rounded-md border ${
                              thread.classification === 'client_to_reply'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : thread.classification === 'assistant_to_reply'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : thread.classification === 'needs_review'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {thread.classification.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                          {thread.subject}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{thread.summary}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 self-center shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing live inbox threads...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about blockers, meetings, assignments..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
