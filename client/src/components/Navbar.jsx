import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  UserCheck,
  User,
  Zap,
  Sparkles,
  RefreshCw,
  Mail,
  Shield,
  Layers,
  ChevronDown,
  BarChart3,
  Volume2,
} from 'lucide-react';

export default function Navbar() {
  const {
    user,
    activeRole,
    setActiveRole,
    setIsSimulateOpen,
    setIsAskAIOpen,
    setIsOnboardingOpen,
    setIsBriefingOpen,
    setIsAnalyticsOpen,
    resetWorkspace,
    stats,
  } = useApp();

  const isAssistant = activeRole === 'assistant';

  // Connected accounts status
  const gmailAccount = user?.connectedAccounts?.find((a) => a.provider === 'gmail');
  const outlookAccount = user?.connectedAccounts?.find((a) => a.provider === 'outlook');
  const isGmailConnected = gmailAccount?.status === 'connected';
  const isOutlookConnected = outlookAccount?.status === 'connected';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs border border-slate-800">
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base sm:text-lg text-slate-900 tracking-tight">
                  AetherInbox
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-md tracking-wide">
                  AI Triage
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Elena Vance (CEO) & Marcus Chen (EA)
              </p>
            </div>
          </div>

          {/* Center: Role Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setActiveRole('assistant')}
              className={`flex items-center space-x-1.5 px-3 py-1.2 rounded-md text-xs font-medium transition-all ${
                isAssistant
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${isAssistant ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Assistant</span>
              <span className="hidden md:inline text-[10px] text-slate-400 font-normal">(Marcus)</span>
            </button>

            <button
              onClick={() => setActiveRole('client')}
              className={`flex items-center space-x-1.5 px-3 py-1.2 rounded-md text-xs font-medium transition-all relative ${
                !isAssistant
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${!isAssistant ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Client</span>
              <span className="hidden md:inline text-[10px] text-slate-400 font-normal">(Elena)</span>
              {stats.clientToReply > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {stats.clientToReply}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Account Sync Pill */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              title="Click to view connected accounts & simulated sync"
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 transition"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">
                {isGmailConnected && isOutlookConnected
                  ? 'Gmail & Outlook Synced'
                  : isGmailConnected
                  ? 'Gmail Synced'
                  : 'Sync Accounts'}
              </span>
            </button>

            {/* Morning Radar & Audio Brief */}
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition"
              title="Elena's Morning Radar & Audio Briefing"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Briefing</span>
            </button>

            {/* Executive Analytics */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              title="Executive Triage & Workload Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            {/* Simulate Email Trigger */}
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 rounded-lg text-xs font-medium transition shadow-2xs"
              title="Simulate incoming email with live AI classification"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span className="hidden sm:inline">Simulate Email</span>
            </button>

            {/* Ask AI Copilot Trigger */}
            <button
              onClick={() => setIsAskAIOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-xs"
              title="Ask AI Copilot natural language questions about your inbox (Ctrl+K / ⌘K)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-300 bg-white/10 rounded border border-white/15">
                ⌘K
              </kbd>
            </button>

            {/* Reset Workspace Demo Data */}
            <button
              onClick={resetWorkspace}
              title="Reset Demo Dataset (12 realistic threads)"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
