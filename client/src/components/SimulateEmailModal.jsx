import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Zap,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Mail,
  HelpCircle,
  MessageSquare,
  Repeat,
  CheckCircle2,
} from 'lucide-react';

const PRESETS = [
  {
    id: 'term-sheet',
    title: 'Acquisition Term Sheet ($160M)',
    icon: FileText,
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    senderName: 'Sarah Sterling (Apollo Ventures)',
    senderEmail: 'ssterling@apollo-ventures.com',
    subject: 'Project Apollo: Revised $160M Term Sheet with Founder Indemnity',
    body: 'Elena, our investment partners revised the Apollo valuation upward to $160M post-money, but inserted a special founder indemnity clause regarding IP ownership. Outside counsel flagged that only you, as CEO and principal signatory, can authorize this clause prior to midnight.',
    expected: 'Client to Reply (Elena must authorize legal indemnity)',
  },
  {
    id: 'cryptic-inquiry',
    title: 'Ambiguous Vendor Inquiry',
    icon: HelpCircle,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    senderName: 'Vague Tech Vendor Rep',
    senderEmail: 'sales@quantumcloudservices.biz',
    subject: 'Synergy and possible cloud bundling or maybe licensing?',
    body: 'Hey there, we might have some excess GPU capacity in our cluster. Maybe we could cross-promote or sell you seats at a discount, or perhaps do a joint press release? Not sure if you use H100s or L40s, let me know if anyone on your team cares.',
    expected: 'Needs Review (<75% confidence, ambiguous proposal)',
  },
  {
    id: 'board-reschedule',
    title: 'Board Meeting Reschedule',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    senderName: 'Arthur Pendelton (Oakmont Capital)',
    senderEmail: 'arthur.pendelton@oakmontcapital.com',
    subject: 'URGENT: Rescheduling Q3 Board Dinner to Nov 22nd at 7:30 PM',
    body: 'Hi Elena & Marcus, due to flight delays from New York, we need to shift our Q3 Board Dinner at The Grand Pavilion from Nov 20 to Sunday, Nov 22nd at 7:30 PM. Please confirm if Elena can make this new time slot so we can lock in the private room.',
    expected: 'Assistant to Reply (Calendar slot extracted)',
  },
  {
    id: 'automated-statement',
    title: 'Automated Cloud Receipt',
    icon: CheckCircle2,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    senderName: 'AWS Billing Alerts',
    senderEmail: 'no-reply-aws@amazon.com',
    subject: 'Amazon Web Services: Monthly Billing Statement Available',
    body: 'Your monthly invoice for $14,892.10 USD is ready. Your corporate card ending in 4092 was automatically charged. No reply or security action is required.',
    expected: 'No Reply Needed (Automated notification)',
  },
];

export default function SimulateEmailModal() {
  const { isSimulateOpen, setIsSimulateOpen, simulateEmail, appendMessageToThread, threads } = useApp();

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'reply'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Thread Form State
  const [formData, setFormData] = useState({
    senderName: 'Samantha Reed (Global FinCorp)',
    senderEmail: 'sreed@globalfincorp.com',
    subject: 'Urgent: Revised SLA Clause for $650k Enterprise Agreement',
    body: 'Elena, our executive procurement committee is meeting in 2 hours. We need your final signoff on the 99.99% SLA rebate addendum so we can release payment today.',
  });

  // Reply Simulation State (for reclassifying an existing thread)
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [replyFormData, setReplyFormData] = useState({
    senderName: 'Gregory Vance-Smith (KPMG)',
    senderEmail: 'gvancesmith@kpmg.com',
    body: 'Hi Marcus & Elena, we have completed the balance sheet audit memorandum. However, our compliance partner needs Elena to sign the final audit representation letter before we release the public opinion.',
  });

  if (!isSimulateOpen) return null;

  const handleApplyPreset = (preset) => {
    setFormData({
      senderName: preset.senderName,
      senderEmail: preset.senderEmail,
      subject: preset.subject,
      body: preset.body,
    });
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.body) return;

    try {
      setIsSubmitting(true);
      await simulateEmail(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    const threadId = selectedThreadId || threads[0]?._id;
    if (!threadId || !replyFormData.body) return;

    try {
      setIsSubmitting(true);
      await appendMessageToThread(threadId, {
        senderName: replyFormData.senderName,
        senderEmail: replyFormData.senderEmail,
        body: replyFormData.body,
        isClient: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Simulate Email Event</h3>
              <p className="text-xs text-slate-300">
                Trigger real-time AI classification and dynamic reclassification testing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulateOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Simulate New Thread</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reply');
              if (!selectedThreadId && threads.length > 0) {
                setSelectedThreadId(threads[0]._id);
              }
            }}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reply'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Simulate Reply to Existing Thread (Dynamic Reclassification)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeTab === 'new' ? (
            <>
              {/* Presets Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    One-Click Test Presets
                  </span>
                  <span className="text-[11px] text-slate-400">Click to populate form</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="p-2.5 text-left border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 rounded-xl transition group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`p-1 rounded-md border text-xs ${preset.color}`}>
                              <Icon className="w-3 h-3" />
                            </span>
                            <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                              {preset.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{preset.subject}</p>
                        </div>
                        <span className="mt-1.5 text-[10px] font-medium text-indigo-600">
                          {preset.expected.split('(')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitNew} className="space-y-3.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.senderEmail}
                      onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Message Body
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsSimulateOpen(false)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Run AI Classification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Reply Simulation Tab */
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                <span className="font-semibold">Dynamic Reclassification: </span>
                Simulate an external stakeholder replying with new terms, a signature demand, or a question. The AI will analyze the full conversation history and reclassify the thread immediately.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Existing Conversation Thread
                </label>
                <select
                  value={selectedThreadId || (threads[0]?._id || '')}
                  onChange={(e) => setSelectedThreadId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  {threads.map((t) => (
                    <option key={t._id} value={t._id}>
                      [{t.classification.replace(/_/g, ' ')}] {t.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Replying Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={replyFormData.senderName}
                    onChange={(e) => setReplyFormData({ ...replyFormData, senderName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Replying Sender Email
                  </label>
                  <input
                    type="email"
                    required
                    value={replyFormData.senderEmail}
                    onChange={(e) => setReplyFormData({ ...replyFormData, senderEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Incoming Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyFormData.body}
                  onChange={(e) => setReplyFormData({ ...replyFormData, body: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reclassifying...</span>
                    </>
                  ) : (
                    <>
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Append & Reclassify Thread</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
