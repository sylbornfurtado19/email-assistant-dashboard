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
} from 'lucide-react';

const PRESETS = [
  {
    id: 'board-reschedule',
    title: 'Urgent Board Meeting Reschedule',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    senderName: 'Arthur Pendelton (Oakmont Capital)',
    senderEmail: 'arthur.pendelton@oakmontcapital.com',
    subject: 'URGENT: Rescheduling Q3 Board Dinner to Nov 22nd at 7:30 PM',
    body: 'Hi Elena & Marcus, due to flight delays from New York, we need to shift our Q3 Board Dinner at The Grand Pavilion from Nov 20 to Sunday, Nov 22nd at 7:30 PM. Please confirm if Elena can make this new time slot so we can lock in the private room.',
    expected: 'Meetings / Assistant to Reply (Extracts new date & time)',
  },
  {
    id: 'term-sheet',
    title: 'Enterprise Acquisition Term Sheet Revision',
    icon: FileText,
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    senderName: 'Sarah Sterling (Apollo Ventures)',
    senderEmail: 'ssterling@apollo-ventures.com',
    subject: 'Project Apollo: Revised $160M Term Sheet with Founder Indemnity',
    body: 'Elena, our investment partners revised the Apollo valuation upward to $160M post-money, but inserted a special founder indemnity clause regarding IP ownership. Outside counsel flagged that only you, as CEO and principal signatory, can authorize this clause prior to midnight.',
    expected: 'Client to Reply (Elena must authorize legal indemnity)',
  },
  {
    id: 'cryptic-inquiry',
    title: 'Cryptic Vendor Inquiry with Ambiguous Pricing',
    icon: HelpCircle,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    senderName: 'Vague Tech Vendor Rep',
    senderEmail: 'sales@quantumcloudservices.biz',
    subject: 'Synergy and possible cloud bundling or maybe licensing?',
    body: 'Hey there, we might have some excess GPU capacity in our cluster. Maybe we could cross-promote or sell you seats at a discount, or perhaps do a joint press release? Not sure if you use H100s or L40s, let me know if anyone on your team cares.',
    expected: 'Needs Review (<75% confidence, ambiguous proposal)',
  },
];

export default function SimulateEmailModal() {
  const { isSimulateOpen, setIsSimulateOpen, simulateEmail } = useApp();

  const [formData, setFormData] = useState({
    senderName: 'Samantha Reed (Global FinCorp)',
    senderEmail: 'sreed@globalfincorp.com',
    subject: 'Urgent: Revised SLA Clause for $650k Enterprise Agreement',
    body: 'Elena, our executive procurement committee is meeting in 2 hours. We need your final signoff on the 99.99% SLA rebate addendum so we can release payment today.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSimulateOpen) return null;

  const handleApplyPreset = (preset) => {
    setFormData({
      senderName: preset.senderName,
      senderEmail: preset.senderEmail,
      subject: preset.subject,
      body: preset.body,
    });
  };

  const handleSubmit = async (e) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Simulate Incoming Email</h3>
              <p className="text-xs text-indigo-200">
                Test the live AI classifier, confidence scoring, and automated extraction.
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                One-Click Test Presets
              </span>
              <span className="text-xs text-slate-400">Click to load into form</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 text-left border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className={`p-1 rounded-md border text-xs ${preset.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-700">
                          {preset.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{preset.subject}</p>
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-indigo-600 block">
                      Target: {preset.expected.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sender Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Rachel Chang"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sender Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. rchang@bloomberg.net"
                  />
                </div>
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
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Term Sheet execution deadline"
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
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste the email content here..."
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsSimulateOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Run AI Classification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

