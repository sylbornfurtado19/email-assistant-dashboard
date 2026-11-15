import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Calendar,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Share2,
  Loader2,
} from 'lucide-react';

export default function ExecutiveBriefModal() {
  const { isBriefingOpen, setIsBriefingOpen, fetchExecutiveBrief, selectThread, setActiveRole, addToast } = useApp();

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Audio Playback state using SpeechSynthesis
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef(null);

  useEffect(() => {
    if (isBriefingOpen) {
      setLoading(true);
      fetchExecutiveBrief()
        .then((data) => {
          setBrief(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Stop speech when modal closes
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isBriefingOpen]);

  const handlePlayAudio = () => {
    if (!window.speechSynthesis || !brief?.audioScript) {
      addToast('Audio playback not supported in this browser', 'info');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(brief.audioScript);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleCopyBrief = () => {
    if (!brief) return;
    const text = `🎙️ *AetherInbox Morning Radar — Elena Vance (CEO)*\n\n` +
      `🚨 *Urgent Decisions (${brief.urgentDecisions.length}):*\n` +
      brief.urgentDecisions.map((d) => `• ${d.subject} (${d.sender}): ${d.whyClientNeeded}`).join('\n') +
      `\n\n⏳ *Active Blockers:*\n` +
      brief.blockers.map((b) => `• ${b.subject}: ${b.waitingOn}`).join('\n') +
      `\n\n📅 *Schedule Today:*\n` +
      brief.todayEvents.map((e) => `• ${e.title} at ${e.time} (${e.location})`).join('\n') +
      `\n\n📝 *Marcus's Note:*\n"${brief.assistantNote}"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Morning Brief copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isBriefingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-linear-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Elena's Morning Radar</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/20">
                  Daily Brief
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Synthesized by Marcus Chen • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBriefingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-700 text-xs sm:text-sm">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Synthesizing executive briefing from active threads...</p>
            </div>
          ) : brief ? (
            <>
              {/* Audio Briefing Player Strip */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePlayAudio}
                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs transition shrink-0"
                    title={isPlaying ? 'Pause spoken brief' : 'Listen to spoken brief'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-xs">Audio Briefing (Marcus Voice)</span>
                      {isPlaying && (
                        <div className="flex items-center space-x-0.5">
                          <span className="w-1 h-3 bg-indigo-600 rounded-full animate-bounce"></span>
                          <span className="w-1 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                          <span className="w-1 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isPlaying ? 'Speaking briefing aloud...' : isPaused ? 'Audio paused' : 'Listen to a 60-second synthesized audio summary'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {isPlaying && (
                    <button
                      onClick={handleStopAudio}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition"
                      title="Stop audio"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={handleCopyBrief}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div className="text-[11px] font-semibold text-amber-800">Decisions Needed</div>
                  <div className="text-xl font-bold text-amber-900 mt-0.5">{brief.stats.clientActionCount}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Direct CEO sign-off</div>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl">
                  <div className="text-[11px] font-semibold text-purple-800">Active Blockers</div>
                  <div className="text-xl font-bold text-purple-900 mt-0.5">{brief.stats.waitingCount}</div>
                  <div className="text-[10px] text-purple-700 mt-0.5">Waiting on 3rd parties</div>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                  <div className="text-[11px] font-semibold text-blue-800">Events Today</div>
                  <div className="text-xl font-bold text-blue-900 mt-0.5">{brief.stats.meetingsCount}</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Confirmed on calendar</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <div className="text-[11px] font-semibold text-emerald-800">EA Intercepted</div>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5">{brief.stats.assistantIntercepted}</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Handled by Marcus</div>
                </div>
              </div>

              {/* Marcus's Executive Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <UserCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">Marcus's Morning Recommendation: </span>
                  <span className="text-slate-600 italic">"{brief.assistantNote}"</span>
                </div>
              </div>

              {/* Urgent Decisions Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Priority Decisions Required ({brief.urgentDecisions.length})</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {brief.urgentDecisions.map((dec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-amber-200/90 rounded-xl shadow-2xs hover:border-amber-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                              {dec.urgency}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">{dec.subject}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">From: {dec.sender}</p>
                          <p className="text-xs text-amber-950 font-medium mt-1">
                            🎯 <span className="font-semibold">Why you're needed:</span> {dec.whyClientNeeded}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsBriefingOpen(false);
                            setActiveRole('client');
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-2xs transition shrink-0"
                        >
                          Review Card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule & Commitments */}
              {brief.todayEvents && brief.todayEvents.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Calendar Schedule</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {brief.todayEvents.map((ev, i) => (
                      <div key={i} className="p-2.5 bg-blue-50/50 border border-blue-200/80 rounded-xl text-xs">
                        <div className="font-semibold text-blue-900">{ev.title}</div>
                        <div className="text-[11px] text-blue-700 mt-0.5">
                          {ev.date} • {ev.time}
                        </div>
                        <div className="text-[10px] text-slate-500">{ev.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-400 py-8">Failed to generate briefing data.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Press <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">Esc</kbd> to close
          </p>
          <button
            onClick={() => setIsBriefingOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-xs"
          >
            Got it, Let's Work
          </button>
        </div>
      </div>
    </div>
  );
}
