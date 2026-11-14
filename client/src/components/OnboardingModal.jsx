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
  AlertCircle,
  Info,
} from 'lucide-react';

export default function OnboardingModal() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    user,
    connectAccount,
    disconnectAccount,
    resetWorkspace,
    fetchStats,
    fetchThreads,
    addToast,
  } = useApp();

  const [connectingProvider, setConnectingProvider] = useState(null);
  const [syncingProvider, setSyncingProvider] = useState(null);

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
    }, 1000);
  };

  const handleManualSync = async (provider) => {
    setSyncingProvider(provider);
    setTimeout(async () => {
      await connectAccount(provider, provider === 'gmail' ? 'elena.vance@vancetech.io' : 'elena.vance@board.oakmont.com');
      await fetchStats();
      await fetchThreads();
      setSyncingProvider(null);
      addToast(`${provider.toUpperCase()} synced with inbox pipeline`, 'success');
    }, 800);
  };

  const formatLastSynced = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-slate-900 px-6 py-5 text-white relative">
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-indigo-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Inbox Synchronization Suite
          </div>
          <h2 className="text-xl font-bold tracking-tight">Connected Accounts & Onboarding</h2>
          <p className="text-xs text-slate-300 mt-1">
            Manage executive email streams synchronized with the AetherInbox AI triage pipeline.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Executive & Assistant Info Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workspace Profile</p>
              <p className="text-sm font-bold text-slate-900">{user?.executiveName || 'Elena Vance'} (CEO)</p>
              <p className="text-xs text-slate-600">Managed by {user?.assistantName || 'Marcus Chen'} (Chief of Staff / EA)</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Active Pair
            </span>
          </div>

          {/* Account Connect Options */}
          <div className="space-y-3">
            {/* Google Workspace / Gmail */}
            <div className="p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-base">
                  G
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-semibold text-slate-900">Google Workspace (Gmail)</h4>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Simulated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isGmailConnected
                      ? `${gmailAccount.email} • Synced: ${formatLastSynced(gmailAccount.lastSynced)}`
                      : 'Corporate email & calendar synchronization'}
                  </p>
                </div>
              </div>

              {isGmailConnected ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleManualSync('gmail')}
                    disabled={syncingProvider === 'gmail'}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    title="Sync Now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'gmail' ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => disconnectAccount('gmail')}
                    className="text-xs text-slate-400 hover:text-rose-600 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  disabled={connectingProvider === 'gmail'}
                  onClick={() => handleSimulateOAuth('gmail')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
                >
                  {connectingProvider === 'gmail' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3 h-3" />
                  )}
                  <span>Connect</span>
                </button>
              )}
            </div>

            {/* Microsoft 365 / Outlook */}
            <div className="p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-base">
                  M
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-semibold text-slate-900">Microsoft 365 (Outlook)</h4>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Simulated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isOutlookConnected
                      ? `${outlookAccount.email} • Synced: ${formatLastSynced(outlookAccount.lastSynced)}`
                      : 'Board correspondence & calendar invites'}
                  </p>
                </div>
              </div>

              {isOutlookConnected ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleManualSync('outlook')}
                    disabled={syncingProvider === 'outlook'}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    title="Sync Now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'outlook' ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => disconnectAccount('outlook')}
                    className="text-xs text-slate-400 hover:text-rose-600 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  disabled={connectingProvider === 'outlook'}
                  onClick={() => handleSimulateOAuth('outlook')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
                >
                  {connectingProvider === 'outlook' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3 h-3" />
                  )}
                  <span>Connect</span>
                </button>
              )}
            </div>
          </div>

          {/* Clear Disclosure of Simulated Integrations */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center font-semibold gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Simulated Integration Disclosure</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Google Workspace and Microsoft 365 OAuth authentication flows and mailbox polling are simulated for this evaluation prototype. No live third-party API credentials or OAuth app verifications are required.
            </p>
          </div>

          {/* Granular Scopes Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center text-slate-700 font-semibold gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Granular Triage Scopes</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
              <li>Read & classify incoming thread metadata</li>
              <li>Extract calendar events & draft replies on behalf of executive</li>
              <li>Never auto-sends replies without explicit human review and approval</li>
            </ul>
          </div>

          {/* Footer Actions */}
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
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
