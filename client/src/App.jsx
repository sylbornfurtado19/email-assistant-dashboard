import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AssistantDashboard from './components/AssistantDashboard';
import ClientView from './components/ClientView';
import OnboardingModal from './components/OnboardingModal';
import SimulateEmailModal from './components/SimulateEmailModal';
import AskAIDrawer from './components/AskAIDrawer';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const {
    activeRole,
    setActiveRole,
    isAskAIOpen,
    setIsAskAIOpen,
    isSimulateOpen,
    setIsSimulateOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    toasts,
    removeToast,
  } = useApp();

  // Superhuman/Linear keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      // Cmd+K or Ctrl+K to toggle Ask AI Copilot
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAskAIOpen((prev) => !prev);
        return;
      }

      // Escape to close modals and drawers
      if (e.key === 'Escape') {
        if (isAskAIOpen) setIsAskAIOpen(false);
        if (isSimulateOpen) setIsSimulateOpen(false);
        if (isOnboardingOpen) setIsOnboardingOpen(false);
        return;
      }

      // Single-key navigation when not typing in an input
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          setActiveRole('assistant');
        } else if (e.key === '2') {
          setActiveRole('client');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isAskAIOpen,
    isSimulateOpen,
    isOnboardingOpen,
    setActiveRole,
    setIsAskAIOpen,
    setIsSimulateOpen,
    setIsOnboardingOpen,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Role-Specific View */}
      <main className="flex-1 overflow-x-hidden">
        {activeRole === 'assistant' ? <AssistantDashboard /> : <ClientView />}
      </main>

      {/* Slide-over & Modals */}
      <OnboardingModal />
      <SimulateEmailModal />
      <AskAIDrawer />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-xs sm:text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

