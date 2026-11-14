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
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'What am I waiting on?',
  'Why is this assigned to the client?',
  'Show all upcoming meetings',
  'What needs urgent review?',
];

export default function AskAIDrawer() {
  const { isAskAIOpen, setIsAskAIOpen, threads, selectThread, setActiveRole } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Marcus & Elena! I'm your inbox AI Copilot. Ask me anything about your current workload, blockers, client assignments, or upcoming meetings.",
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
      const res = await fetch('/api/emails/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        // Resolve matching thread objects from the ID list
        const matched = (data.response.matchingThreadIds || [])
          .map((id) => threads.find((t) => t._id === id))
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
          text: 'Sorry, I encountered an issue inspecting your inbox. Please check your network or try again.',
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
    setIsAskAIOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Inbox AI Copilot</h3>
              <p className="text-[11px] text-indigo-200">Natural Language Inbox Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsAskAIOpen(false)}
            className="p-1 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Quick Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="text-xs px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition whitespace-nowrap shadow-2xs"
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
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>
              </div>

              {/* Matching Thread Cards if available */}
              {msg.matchingThreads && msg.matchingThreads.length > 0 && (
                <div className="mt-2.5 space-y-2 w-full pl-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Referenced Threads ({msg.matchingThreads.length}):
                  </p>
                  {msg.matchingThreads.map((thread) => (
                    <button
                      key={thread._id}
                      onClick={() => handleSelectThread(thread)}
                      className="w-full text-left p-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs rounded-xl transition flex items-start justify-between group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-medium rounded-sm ${
                              thread.classification === 'client_to_reply'
                                ? 'bg-amber-100 text-amber-800'
                                : thread.classification === 'assistant_to_reply'
                                ? 'bg-indigo-100 text-indigo-800'
                                : thread.classification === 'needs_review'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
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
              <span>Analyzing inbox telemetry...</span>
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
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

