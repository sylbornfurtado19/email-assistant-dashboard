import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  UserCheck,
  User,
  Zap,
  Sparkles,
  RefreshCw,
  Mail,
  MoreVertical,
  BarChart3,
  Volume2,
  Settings,
  ChevronDown,
  Check,
  HelpCircle,
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAssistant = activeRole === 'assistant';

  // Connected accounts status
  const gmailAccount = user?.connectedAccounts?.find((a) => a.provider === 'gmail');
  const outlookAccount = user?.connectedAccounts?.find((a) => a.provider === 'outlook');
  const isGmailConnected = gmailAccount?.status === 'connected';
  const isOutlookConnected = outlookAccount?.status === 'connected';

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm z-30 shrink-0 px-4 flex items-center justify-between select-none">
      {/* 1. Brand Identity & Sync Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-indigo-400 shadow-sm">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-slate-900 tracking-tight">
            AetherInbox
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
            AI Triage
          </span>
        </div>

        {/* Subtle Sync Pill */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="hidden md:flex items-center space-x-1.5 px-2 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-[11px]"
          title="Connected Accounts Status (Click to manage)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-600">
            {isGmailConnected && isOutlookConnected
              ? 'Gmail & Outlook Synced'
              : isGmailConnected
              ? 'Gmail Synced'
              : 'Accounts Synced'}
          </span>
        </button>
      </div>

      {/* 2. Primary Segmented Role Switcher */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
        <button
          onClick={() => setActiveRole('assistant')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-all ${
            isAssistant
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <UserCheck className={`w-3.5 h-3.5 ${isAssistant ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Assistant</span>
          <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">Marcus</span>
        </button>

        <button
          onClick={() => setActiveRole('client')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-all relative ${
            !isAssistant
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <User className={`w-3.5 h-3.5 ${!isAssistant ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Client</span>
          <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">Elena</span>
          {stats.clientToReply > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
              {stats.clientToReply}
            </span>
          )}
        </button>
      </div>

      {/* 3. Primary Actions & Clean Overflow Menu */}
      <div className="flex items-center space-x-2">
        {/* Ask AI Copilot (High Priority) */}
        <button
          onClick={() => setIsAskAIOpen(true)}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm"
          title="Ask AI Copilot natural language questions (⌘K)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Ask AI</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-300 bg-white/10 rounded border border-white/15">
            ⌘K
          </kbd>
        </button>

        {/* Secondary Actions Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition"
            title="More actions and workspace tools"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Workspace Tools
              </div>

              <button
                onClick={() => {
                  setIsBriefingOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Elena's Morning Radar</span>
                </div>
                <kbd className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">B</kbd>
              </button>

              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Workload Analytics</span>
                </div>
                <kbd className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">A</kbd>
              </button>

              <button
                onClick={() => {
                  setIsSimulateOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Simulate Incoming Email</span>
              </button>

              <button
                onClick={() => {
                  setIsOnboardingOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Connected Accounts</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  resetWorkspace();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Dataset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
