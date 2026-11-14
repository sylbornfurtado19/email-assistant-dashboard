import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import EmailThread from '../models/EmailThread.js';
import User from '../models/User.js';

dotenv.config();

export const seedThreads = [
  // 1. High-Stakes M&A / Term Sheet Signing
  {
    subject: 'Project Apollo: Final Term Sheet & Signatory Execution',
    participants: [
      { name: 'Sarah Sterling', email: 'ssterling@apollo-ventures.com', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'Sarah Sterling',
        senderEmail: 'ssterling@apollo-ventures.com',
        body: 'Elena, attached is the revised Term Sheet for the Series B secondary tranche reflecting the $140M post-money cap agreed during Tuesday’s executive dinner. Legal counsel from Latham & Watkins has signed off on the liquidation preference clause. We require your signature on page 14 prior to Friday’s close.',
        timestamp: new Date(Date.now() - 3600000 * 5),
        isClient: false,
      },
      {
        senderName: 'Elena Vance',
        senderEmail: 'elena.vance@vancetech.io',
        body: 'Sarah, reviewing the updated liquidation carveout now with our outside counsel. Marcus, please flag this for my 3 PM review block.',
        timestamp: new Date(Date.now() - 3600000 * 3),
        isClient: true,
      },
      {
        senderName: 'Sarah Sterling',
        senderEmail: 'ssterling@apollo-ventures.com',
        body: 'Understood Elena. DocuSign envelope is queued and ready for your principal authorization. Please let us know if any questions arise before 5 PM EST.',
        timestamp: new Date(Date.now() - 3600000 * 1),
        isClient: false,
      },
    ],
    classification: 'client_to_reply',
    confidence: 95,
    aiReason: 'High-stakes legal signatory authorization and valuation approval required directly from CEO Elena.',
    summary: 'Apollo Ventures submitted the final $140M Series B Term Sheet requiring Elena’s binding DocuSign signature before Friday 5 PM EST.',
    whyClientNeeded: 'Requires legal signatory authorization and valuation approval directly from CEO Elena.',
    category: 'important',
    extractedEvent: null,
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },

  // 2. Board of Directors Dinner RSVP
  {
    subject: 'Q3 Board of Directors Annual Dinner & Strategy Briefing',
    participants: [
      { name: 'Arthur Pendelton', email: 'arthur.pendelton@oakmontcapital.com', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'Arthur Pendelton',
        senderEmail: 'arthur.pendelton@oakmontcapital.com',
        body: 'Hi Elena, We have secured the private dining room at The Grand Pavilion in San Francisco for our Q3 Board Dinner on Friday, November 20th at 7:00 PM. Please confirm if you and Marcus have any dietary restrictions and whether you would like 15 minutes of executive session before drinks.',
        timestamp: new Date(Date.now() - 3600000 * 24),
        isClient: false,
      },
      {
        senderName: 'Marcus Chen',
        senderEmail: 'marcus.chen@vancetech.io',
        body: 'Hi Arthur, thanks for organizing. Elena will definitely attend. I will check on her pre-dinner briefing schedule and confirm dietary preferences today.',
        timestamp: new Date(Date.now() - 3600000 * 12),
        isClient: false,
      },
      {
        senderName: 'Arthur Pendelton',
        senderEmail: 'arthur.pendelton@oakmontcapital.com',
        body: 'Wonderful Marcus! The venue asks for final guest headcount and audio/visual requirements by Wednesday noon.',
        timestamp: new Date(Date.now() - 3600000 * 2),
        isClient: false,
      },
    ],
    classification: 'assistant_to_reply',
    confidence: 92,
    aiReason: 'Logistical event RSVP and guest coordination within executive assistant scope.',
    summary: 'Arthur Pendelton requests final headcount, dietary restrictions, and AV setup for the Q3 Board Dinner on Nov 20.',
    whyClientNeeded: '',
    category: 'meetings',
    extractedEvent: {
      title: 'Q3 Board of Directors Dinner',
      date: 'Nov 20, 2026',
      time: '7:00 PM',
      location: 'The Grand Pavilion, San Francisco',
    },
    isRead: true,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },

  // 3. Vendor Software License Renewal Invoice
  {
    subject: 'Invoice #INV-2026-881: Notion Enterprise Annual Renewal',
    participants: [
      { name: 'Notion Billing Team', email: 'billing@m.notion.so', role: 'external' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'Notion Billing Team',
        senderEmail: 'billing@m.notion.so',
        body: 'Your workspace subscription for 120 Enterprise seats will renew on December 1st, 2026. The renewal total is $3,200.00 USD. If you wish to adjust seat allocation or update the corporate credit card on file, please submit before Nov 25th.',
        timestamp: new Date(Date.now() - 3600000 * 18),
        isClient: false,
      },
    ],
    classification: 'assistant_to_reply',
    confidence: 88,
    aiReason: 'Standard operational invoice within EA procurement approval limits ($3,200).',
    summary: 'Notion Enterprise renewal notice for 120 seats ($3,200). Assistant can verify seat count and approve standard billing.',
    whyClientNeeded: '',
    category: 'action_required',
    extractedEvent: null,
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
  },

  // 4. Ambiguous Partner Inquiry with Conflicting Signals (< 75 confidence)
  {
    subject: 'Potential Strategic Synergy & Co-Marketing Opportunity',
    participants: [
      { name: 'Liam Gallagher', email: 'liam@nexusgrowthlab.io', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
    ],
    messages: [
      {
        senderName: 'Liam Gallagher',
        senderEmail: 'liam@nexusgrowthlab.io',
        body: 'Hey Elena, saw your keynote at SaaStr! We have an idea to bundle our AI analytics engine with VanceTech’s enterprise suite. Maybe revenue share or maybe just co-branded webinar series. We could also cross-sell our database. Let’s jump on a quick 10-minute call next week if this aligns with your roadmap.',
        timestamp: new Date(Date.now() - 3600000 * 8),
        isClient: false,
      },
    ],
    classification: 'needs_review',
    confidence: 68,
    aiReason: 'Mention of strategic co-marketing with low pricing context; unclear whether executive approval is required.',
    summary: 'Vague partnership solicitation from Nexus Growth proposing unverified revenue share or co-marketing webinars.',
    whyClientNeeded: '',
    category: 'action_required',
    extractedEvent: null,
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
  },

  // 5. Weekly AWS CloudWatch Billing Alert / Receipt
  {
    subject: 'Amazon Web Services: Monthly Billing Statement Available',
    participants: [
      { name: 'AWS Notifications', email: 'no-reply-aws@amazon.com', role: 'external' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'AWS Notifications',
        senderEmail: 'no-reply-aws@amazon.com',
        body: 'Greetings from Amazon Web Services. Your invoice for the billing period October 1 - October 31, 2026 is now available. Total amount charged: $14,892.10 USD. Your default payment method (Corporate Amex ending in 4092) was automatically processed successfully. No action is required.',
        timestamp: new Date(Date.now() - 3600000 * 30),
        isClient: false,
      },
    ],
    classification: 'no_reply_needed',
    confidence: 98,
    aiReason: 'Automated notification with no action items.',
    summary: 'Automated receipt: AWS monthly invoice ($14,892.10) processed successfully against corporate card.',
    whyClientNeeded: '',
    category: 'general',
    extractedEvent: null,
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: true,
  },

  // 6. Key Client Contract Negotiation (Enterprise SLA concession)
  {
    subject: 'VanceTech Enterprise Agreement: Global FinCorp SLA Redlines',
    participants: [
      { name: 'Samantha Reed', email: 'sreed@globalfincorp.com', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'Samantha Reed',
        senderEmail: 'sreed@globalfincorp.com',
        body: 'Elena, our General Counsel reviewed section 8.2 of the Master Service Agreement. We cannot sign unless VanceTech commits to a 99.99% uptime guarantee with a 15% monthly rebate penalty for downtime exceeding 15 minutes. Our board requires this for all tier-1 infrastructure vendors.',
        timestamp: new Date(Date.now() - 3600000 * 6),
        isClient: false,
      },
      {
        senderName: 'Elena Vance',
        senderEmail: 'elena.vance@vancetech.io',
        body: 'Samantha, our standard Tier-1 SLA is 99.9% with service credits. 99.99% carries significant engineering failover costs. I will convene our VP of Infrastructure this afternoon to see if a custom pricing tier can support this.',
        timestamp: new Date(Date.now() - 3600000 * 4),
        isClient: true,
      },
      {
        senderName: 'Samantha Reed',
        senderEmail: 'sreed@globalfincorp.com',
        body: 'Thank you Elena. If we can lock in the SLA addendum by Friday morning, our procurement committee is authorized to execute the $650k ACV contract immediately.',
        timestamp: new Date(Date.now() - 3600000 * 2),
        isClient: false,
      },
    ],
    classification: 'client_to_reply',
    confidence: 94,
    aiReason: 'Contract negotiation involves significant liability risk and non-standard SLA rebate penalty.',
    summary: 'Global FinCorp demands 99.99% uptime with 15% rebate penalty before executing $650k ACV enterprise contract.',
    whyClientNeeded: 'Customer requesting 99.99% custom SLA penalty clause outside standard terms.',
    category: 'important',
    extractedEvent: null,
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },

  // 7. Speaking Invitation at Tech Summit Keynote
  {
    subject: 'Keynote Speaker Invitation: Global AI Leadership Summit 2027',
    participants: [
      { name: 'Chloe Dubois', email: 'chloe.dubois@techsummit.org', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
    ],
    messages: [
      {
        senderName: 'Chloe Dubois',
        senderEmail: 'chloe.dubois@techsummit.org',
        body: 'Dear Elena, On behalf of the Global AI Leadership Committee, we would be honored to have you deliver the opening keynote in Zurich on February 12, 2027. We provide first-class travel, lodging at The Dolder Grand, and a $25,000 honorarium (or charitable donation in your name). Please let us know if your calendar permits.',
        timestamp: new Date(Date.now() - 3600000 * 14),
        isClient: false,
      },
    ],
    classification: 'client_to_reply',
    confidence: 89,
    aiReason: 'Prestigious speaking invitation requiring executive availability and keynote topic selection.',
    summary: 'Global AI Summit invites Elena to deliver the Zurich opening keynote on Feb 12 with $25k honorarium and executive travel.',
    whyClientNeeded: 'Keynote presentation topic preference and travel availability must come from Elena.',
    category: 'important',
    extractedEvent: {
      title: 'Global AI Leadership Keynote',
      date: 'Feb 12, 2027',
      time: '09:00 AM',
      location: 'Zurich, Switzerland',
    },
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },

  // 8. Flight & Hotel Itinerary Confirmation for NY Trip
  {
    subject: 'Flight Confirmation: SFO to JFK (UA 248) - Booking Ref #VF7901',
    participants: [
      { name: 'United Airlines Premier', email: 'reservations@united.com', role: 'external' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'United Airlines Premier',
        senderEmail: 'reservations@united.com',
        body: 'E-Ticket Confirmation for Vance/Elena: Flight UA248 departing San Francisco (SFO Terminal 3) on Dec 5, 2026 at 08:15 AM PST, arriving New York (JFK Terminal 7) at 04:45 PM EST. Seat 2A (Polaris Business). Baggage allowance: 2 bags included. Calendar invite attached.',
        timestamp: new Date(Date.now() - 3600000 * 36),
        isClient: false,
      },
    ],
    classification: 'no_reply_needed',
    confidence: 96,
    aiReason: 'Flight confirmation e-ticket; details logged for travel itinerary, no response necessary.',
    summary: 'United flight UA248 confirmed for Elena: SFO to JFK on Dec 5 at 8:15 AM. Polaris Business Seat 2A.',
    whyClientNeeded: '',
    category: 'meetings',
    extractedEvent: {
      title: 'Flight UA248 SF to JFK',
      date: 'Dec 05, 2026',
      time: '08:15 AM',
      location: 'SFO Terminal 3',
    },
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: true,
  },

  // 9. EA Calendar Coordination for Coffee with Seed Investor
  {
    subject: 'Catch up coffee in SF next week? - David Park',
    participants: [
      { name: 'David Park', email: 'david.park@sequoiacap.com', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'David Park',
        senderEmail: 'david.park@sequoiacap.com',
        body: 'Elena, great catching you at the founder mixer. Would love to grab 30 mins for coffee next Tuesday afternoon around 3:30 PM near Mint Plaza (Blue Bottle). Let me know if you’re free or if Marcus can slot us in.',
        timestamp: new Date(Date.now() - 3600000 * 16),
        isClient: false,
      },
      {
        senderName: 'Elena Vance',
        senderEmail: 'elena.vance@vancetech.io',
        body: 'David, sounds good! Adding Marcus to coordinate the calendar.',
        timestamp: new Date(Date.now() - 3600000 * 10),
        isClient: true,
      },
      {
        senderName: 'David Park',
        senderEmail: 'david.park@sequoiacap.com',
        body: 'Sounds great Marcus, looking forward to your invite confirmation.',
        timestamp: new Date(Date.now() - 3600000 * 4),
        isClient: false,
      },
    ],
    classification: 'assistant_to_reply',
    confidence: 91,
    aiReason: 'Calendar coordination handed off by Elena to Marcus to confirm coffee logistics.',
    summary: 'David Park requested 30-min coffee meeting on Nov 18 at 3:30 PM (Blue Bottle Mint Plaza). Elena delegated to Marcus.',
    whyClientNeeded: '',
    category: 'meetings',
    extractedEvent: {
      title: 'Coffee with Seed Investor David Park',
      date: 'Nov 18, 2026',
      time: '3:30 PM',
      location: 'Blue Bottle Coffee, Mint Plaza',
    },
    isRead: false,
    isImportant: false,
    isArchived: false,
    isCompleted: false,
  },

  // 10. Follow-up: Waiting for Audit Documents from KPMG
  {
    subject: 'FY2026 Financial Audit: Outstanding Balance Sheet Schedules',
    participants: [
      { name: 'Gregory Vance-Smith', email: 'gvancesmith@kpmg.com', role: 'external' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ],
    messages: [
      {
        senderName: 'Marcus Chen',
        senderEmail: 'marcus.chen@vancetech.io',
        body: 'Gregory, following up on our call last Thursday. We uploaded our Q3 payroll and revenue recognition sheets to the KPMG portal. Could you send over the final reconciled balance sheet review by Tuesday?',
        timestamp: new Date(Date.now() - 3600000 * 48),
        isClient: false,
      },
      {
        senderName: 'Gregory Vance-Smith',
        senderEmail: 'gvancesmith@kpmg.com',
        body: 'Hi Marcus, our lead audit manager is verifying the deferred revenue model. We anticipate delivering the signed memorandum to you by Thursday afternoon.',
        timestamp: new Date(Date.now() - 3600000 * 20),
        isClient: false,
      },
    ],
    classification: 'assistant_to_reply',
    confidence: 85,
    aiReason: 'Thread is currently blocked waiting on external auditor delivery before next steps.',
    summary: 'Awaiting KPMG delivery of FY2026 signed audit schedules promised by Thursday afternoon.',
    whyClientNeeded: '',
    category: 'waiting_for_response',
    extractedEvent: null,
    isRead: true,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },

  // 11. Security Audit Phishing Simulation Alert
  {
    subject: '[Internal Notice] Q4 Cybersecurity Awareness Training Completed',
    participants: [
      { name: 'InfoSec Automated Service', email: 'infosec@vancetech.io', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
    ],
    messages: [
      {
        senderName: 'InfoSec Automated Service',
        senderEmail: 'infosec@vancetech.io',
        body: 'Company-wide notice: VanceTech successfully completed the simulated phishing exercise for November. 97.4% compliance reached across all departments. No security actions or responses are required. Thank you for staying vigilant.',
        timestamp: new Date(Date.now() - 3600000 * 52),
        isClient: false,
      },
    ],
    classification: 'no_reply_needed',
    confidence: 99,
    aiReason: 'Internal IT automated training notification, no response required.',
    summary: 'Internal InfoSec report: Q4 phishing simulation completed with 97.4% staff compliance score.',
    whyClientNeeded: '',
    category: 'general',
    extractedEvent: null,
    isRead: true,
    isImportant: false,
    isArchived: false,
    isCompleted: true,
  },

  // 12. Urgent Press Interview Request with Bloomberg Tech
  {
    subject: 'URGENT: Bloomberg Technology Interview Request (AI Enterprise Launch)',
    participants: [
      { name: 'Rachel Chang', email: 'rchang@bloomberg.net', role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
    ],
    messages: [
      {
        senderName: 'Rachel Chang',
        senderEmail: 'rchang@bloomberg.net',
        body: 'Elena, we are breaking an exclusive segment today at 2:00 PM EST covering enterprise AI adoption curves. We would love to feature a 5-minute live commentary from you on VanceTech’s latest agentic workflows. Our deadline for on-air confirmation is 11:30 AM EST. Can you do a remote Zoom studio link?',
        timestamp: new Date(Date.now() - 3600000 * 1.5),
        isClient: false,
      },
    ],
    classification: 'client_to_reply',
    confidence: 90,
    aiReason: 'High-profile press media embargo with short 4-hour live TV commitment deadline.',
    summary: 'Bloomberg Technology TV requesting live 5-minute broadcast interview with Elena Vance at 2 PM EST. Response deadline 11:30 AM.',
    whyClientNeeded: 'Press embargo commentary deadline within 4 hours regarding AI product launch.',
    category: 'important',
    extractedEvent: {
      title: 'Bloomberg Technology Live TV Interview',
      date: 'Today',
      time: '02:00 PM EST',
      location: 'Remote Studio / Zoom',
    },
    isRead: false,
    isImportant: true,
    isArchived: false,
    isCompleted: false,
  },
];

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('[Seed] Database ready. Clearing existing records...');
    await EmailThread.deleteMany({});
    await User.deleteMany({});

    // Create default executive user
    const user = await User.create({
      name: 'Elena & Marcus Executive Suite',
      email: 'elena.vance@vancetech.io',
      executiveName: 'Elena Vance',
      executiveTitle: 'CEO & Founder',
      assistantName: 'Marcus Chen',
      assistantTitle: 'Chief of Staff / Executive Assistant',
      activeRole: 'assistant',
      connectedAccounts: [
        {
          provider: 'gmail',
          email: 'elena.vance@vancetech.io',
          status: 'connected',
          lastSynced: new Date(),
        },
        {
          provider: 'outlook',
          email: 'elena.vance@board.oakmont.com',
          status: 'connected',
          lastSynced: new Date(Date.now() - 15 * 60 * 1000),
        },
      ],
      settings: {
        aiConfidenceThreshold: 75,
        autoArchiveNoReply: false,
        defaultTone: 'professional',
      },
    });

    console.log(`[Seed] Created User: ${user.name}`);

    // Insert 12 multi-message threads
    const inserted = await EmailThread.insertMany(seedThreads);
    console.log(`[Seed] Successfully seeded ${inserted.length} realistic multi-message email threads.`);
    return { user, threadsCount: inserted.length };
  } catch (err) {
    console.error('[Seed] Database seeding failed:', err);
    throw err;
  }
};

// Allow direct execution: `node seed/seedData.js`
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding completed successfully. Closing connection.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Failed:', err);
      process.exit(1);
    });
}
