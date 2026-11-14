import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  UserCheck,
  User,
  Zap,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Mail,
  Shield,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const {
    user,
    activeRole,
    setActiveRole,
    setIsSimulateOpen,
    setIsAskAIOpen,
    setIsOnboardingOpen,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AetherInbox</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> AI Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Executive & Assistant Co-Pilot • Elena Vance (CEO) & Marcus Chen (EA)
              </p>
            </div>
          </div>

          {/* Center: Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setActiveRole('assistant')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isAssistant
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${isAssistant ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Assistant View</span>
              <span className="hidden md:inline text-[11px] opacity-75 font-normal">(Marcus)</span>
            </button>

            <button
              onClick={() => setActiveRole('client')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                !isAssistant
                  ? 'bg-white text-violet-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <User className={`w-4 h-4 ${!isAssistant ? 'text-violet-600' : 'text-slate-400'}`} />
              <span>Client View</span>
              <span className="hidden md:inline text-[11px] opacity-75 font-normal">(Elena)</span>
              {stats.clientToReply > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {stats.clientToReply}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Account Sync Pill */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              title="Click to manage email sync accounts"
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
                  ? 'Gmail Connected'
                  : 'Sync Accounts'}
              </span>
            </button>

            {/* Simulate Email Trigger */}
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 rounded-lg text-xs sm:text-sm font-medium transition shadow-xs"
              title="Simulate incoming email with live AI classification"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span className="hidden sm:inline">Simulate Email</span>
            </button>

            {/* Ask AI Trigger */}
            <button
              onClick={() => setIsAskAIOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-sm shadow-indigo-500/20"
              title="Ask AI Copilot natural language questions about your inbox"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI</span>
            </button>

            {/* Reset Workspace Demo Data */}
            <button
              onClick={resetWorkspace}
              title="Reset Demo Dataset (12 realistic threads)"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

