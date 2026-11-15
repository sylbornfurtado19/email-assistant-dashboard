import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  UserCheck,
  User,
  AlertTriangle,
  ArrowRight,
  Layers,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';

export default function AnalyticsModal() {
  const { isAnalyticsOpen, setIsAnalyticsOpen, fetchAnalytics, selectThread, setActiveRole } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAnalyticsOpen) {
      setLoading(true);
      fetchAnalytics()
        .then((data) => {
          setAnalytics(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isAnalyticsOpen]);

  if (!isAnalyticsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight">Triage Velocity & Executive Analytics</h3>
              <p className="text-[11px] text-slate-400">Real-time productivity telemetry across Elena & Marcus</p>
            </div>
          </div>
          <button
            onClick={() => setIsAnalyticsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700 text-xs sm:text-sm">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Aggregating inbox telemetry...</p>
            </div>
          ) : analytics ? (
            <>
              {/* 3 Top Hero Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-indigo-800 text-[11px] font-semibold">
                    <span>Executive Time Saved</span>
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-950">~{analytics.estimatedHoursSaved} hrs</div>
                  <p className="text-[10px] text-indigo-700">Intercepted by EA Marcus & AI</p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold">
                    <span>Delegation Efficiency</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-950">{analytics.workloadSplit.assistantDelegationRate}%</div>
                  <p className="text-[10px] text-emerald-700">Volume filtered before reaching CEO</p>
                </div>

                <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-purple-800 text-[11px] font-semibold">
                    <span>Active High-Stakes Queue</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-950">{analytics.workloadSplit.clientCount}</div>
                  <p className="text-[10px] text-purple-700">Requiring Elena's personal call</p>
                </div>
              </div>

              {/* Workload Distribution Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Workload Allocation Breakdown
                  </h4>
                  <span className="text-[11px] text-slate-500">{analytics.totalVolume} Total Monitored Threads</span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
                  <div
                    style={{
                      width: `${(analytics.workloadSplit.assistantCount / (analytics.totalVolume || 1)) * 100}%`,
                    }}
                    className="bg-indigo-600 h-full"
                    title={`Marcus Handled: ${analytics.workloadSplit.assistantCount}`}
                  ></div>
                  <div
                    style={{
                      width: `${(analytics.workloadSplit.clientCount / (analytics.totalVolume || 1)) * 100}%`,
                    }}
                    className="bg-amber-500 h-full"
                    title={`Elena Action: ${analytics.workloadSplit.clientCount}`}
                  ></div>
                  <div
                    style={{
                      width: `${(analytics.workloadSplit.noReplyCount / (analytics.totalVolume || 1)) * 100}%`,
                    }}
                    className="bg-slate-400 h-full"
                    title={`No Reply Needed: ${analytics.workloadSplit.noReplyCount}`}
                  ></div>
                  <div
                    style={{
                      width: `${(analytics.workloadSplit.reviewCount / (analytics.totalVolume || 1)) * 100}%`,
                    }}
                    className="bg-rose-500 h-full"
                    title={`Needs Review: ${analytics.workloadSplit.reviewCount}`}
                  ></div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span className="text-slate-600">Assistant ({analytics.workloadSplit.assistantCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Client Elena ({analytics.workloadSplit.clientCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-slate-600">No Reply ({analytics.workloadSplit.noReplyCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Review ({analytics.workloadSplit.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Confidence Distribution & Category Breakdown (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AI Confidence Tiers */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Confidence Tiers</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">High Confidence (&gt;= 85%)</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {analytics.confidenceDistribution.highConfidence}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Standard (75% - 84%)</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {analytics.confidenceDistribution.mediumConfidence}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Low (&lt; 75% Flagged for Review)</span>
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        {analytics.confidenceDistribution.lowConfidence}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Segment Breakdown</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Action Required</span>
                      <span className="font-bold text-slate-800">{analytics.categoryBreakdown.action_required}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Meetings & Calendar</span>
                      <span className="font-bold text-slate-800">{analytics.categoryBreakdown.meetings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Waiting on Response</span>
                      <span className="font-bold text-slate-800">{analytics.categoryBreakdown.waiting_for_response}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Marked Important</span>
                      <span className="font-bold text-slate-800">{analytics.categoryBreakdown.important}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottleneck Radar */}
              {analytics.bottlenecks && analytics.bottlenecks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>External Bottlenecks (Waiting on Response)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {analytics.bottlenecks.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">{b.subject}</div>
                          <p className="text-[11px] text-slate-500">
                            Counterparty: {b.sender} • {b.aiReason}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded-md text-[11px] shrink-0">
                          {b.daysWaiting} day{b.daysWaiting === 1 ? '' : 's'} waiting
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-400 py-8">No analytics data available.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => setIsAnalyticsOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-xs"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
