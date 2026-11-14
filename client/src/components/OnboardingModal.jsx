import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  Shield,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function OnboardingModal() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    user,
    connectAccount,
    disconnectAccount,
    resetWorkspace,
  } = useApp();

  const [connectingProvider, setConnectingProvider] = useState(null);

  if (!isOnboardingOpen) return null;

  const gmailAccount = user?.connectedAccounts?.find((a) => a.provider === 'gmail');
  const outlookAccount = user?.connectedAccounts?.find((a) => a.provider === 'outlook');
  const isGmailConnected = gmailAccount?.status === 'connected';
  const isOutlookConnected = outlookAccount?.status === 'connected';

  const handleSimulateOAuth = async (provider) => {
    setConnectingProvider(provider);
    setTimeout(async () => {
      const email =
        provider === 'gmail'
          ? 'elena.vance@vancetech.io'
          : 'elena.vance@board.oakmont.com';
      await connectAccount(provider, email);
      setConnectingProvider(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 px-6 py-6 text-white relative">
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-300" />
            Enterprise OAuth Security
          </div>
          <h2 className="text-xl font-bold tracking-tight">Connect Inbox Sources</h2>
          <p className="text-sm text-indigo-200 mt-1">
            Synchronize executive email streams into the AetherInbox AI triage pipeline.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Executive & Assistant Info Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace Profile</p>
              <p className="text-sm font-bold text-slate-800">{user?.executiveName} (CEO)</p>
              <p className="text-xs text-slate-600">Managed by {user?.assistantName}</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Active Suite
            </span>
          </div>

          {/* Account Connect Options */}
          <div className="space-y-3">
            {/* Google Workspace / Gmail */}
            <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                  G
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Google Workspace (Gmail)</h4>
                  <p className="text-xs text-slate-500">
                    {isGmailConnected
                      ? `Connected: ${gmailAccount.email}`
                      : 'Sync executive corporate emails and calendar'}
                  </p>
                </div>
              </div>

              {isGmailConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center text-xs font-medium text-emerald-600 gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Synced
                  </span>
                  <button
                    onClick={() => disconnectAccount('gmail')}
                    className="text-xs text-slate-400 hover:text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  disabled={connectingProvider === 'gmail'}
                  onClick={() => handleSimulateOAuth('gmail')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                >
                  {connectingProvider === 'gmail' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Connect</span>
                </button>
              )}
            </div>

            {/* Microsoft 365 / Outlook */}
            <div className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Microsoft 365 (Outlook)</h4>
                  <p className="text-xs text-slate-500">
                    {isOutlookConnected
                      ? `Connected: ${outlookAccount.email}`
                      : 'Board correspondence & calendar invites'}
                  </p>
                </div>
              </div>

              {isOutlookConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center text-xs font-medium text-emerald-600 gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Synced
                  </span>
                  <button
                    onClick={() => disconnectAccount('outlook')}
                    className="text-xs text-slate-400 hover:text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  disabled={connectingProvider === 'outlook'}
                  onClick={() => handleSimulateOAuth('outlook')}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                >
                  {connectingProvider === 'outlook' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Connect</span>
                </button>
              )}
            </div>
          </div>

          {/* Scopes & Permissions Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center text-slate-700 font-semibold gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Requested Granular Scopes</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500">
              <li>Read & classify incoming thread metadata</li>
              <li>Extract calendar events & draft replies on behalf of executive</li>
              <li>Never auto-sends without explicit user approval</li>
            </ul>
          </div>

          {/* Quick Launch Demo Workspace Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={() => {
                resetWorkspace();
                setIsOnboardingOpen(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload 12 Seed Demo Threads
            </button>

            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

