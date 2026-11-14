import express from 'express';
import EmailThread from '../models/EmailThread.js';
import AIService from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/emails
 * Fetches email threads by segment, status, search term, and sort order.
 */
router.get('/', async (req, res) => {
  try {
    const { segment = 'all', search = '', status = 'active', sort = 'newest' } = req.query;

    const query = {};

    // Filter by completed / active / archived status
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'archived') {
      query.isArchived = true;
    } else if (segment !== 'completed' && segment !== 'archived') {
      query.isArchived = false;
    }

    // Segment filters
    switch (segment) {
      case 'assistant_to_reply':
        query.classification = 'assistant_to_reply';
        query.isCompleted = false;
        break;
      case 'client_to_reply':
        query.classification = 'client_to_reply';
        query.isCompleted = false;
        break;
      case 'needs_review':
        query.classification = 'needs_review';
        query.isCompleted = false;
        break;
      case 'no_reply_needed':
        query.classification = 'no_reply_needed';
        break;
      case 'meetings':
        query.$or = [{ category: 'meetings' }, { extractedEvent: { $ne: null } }];
        break;
      case 'waiting_for_response':
        query.category = 'waiting_for_response';
        break;
      case 'important':
        query.isImportant = true;
        break;
      case 'completed':
        query.isCompleted = true;
        break;
      case 'archived':
        query.isArchived = true;
        break;
      case 'all':
      default:
        // All active threads
        break;
    }

    // Keyword search filter
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { subject: regex },
        { summary: regex },
        { 'messages.body': regex },
        { 'messages.senderName': regex },
        { 'messages.senderEmail': regex },
      ];
    }

    // Sort order definition
    let sortObj = { updatedAt: -1, createdAt: -1 };
    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'confidence_desc') {
      sortObj = { confidence: -1 };
    } else if (sort === 'confidence_asc') {
      sortObj = { confidence: 1 };
    } else if (sort === 'priority') {
      sortObj = { isImportant: -1, updatedAt: -1 };
    }

    const threads = await EmailThread.find(query).sort(sortObj);
    return res.json({ success: true, count: threads.length, threads });
  } catch (err) {
    console.error('Error fetching email threads:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/emails/stats
 * Aggregates KPI counts for top bar badges.
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUnread,
      actionRequired,
      assistantToReply,
      clientToReply,
      needsReview,
      upcomingMeetings,
      waitingForResponse,
      important,
      noReplyNeeded,
      totalActive,
      completed,
    ] = await Promise.all([
      EmailThread.countDocuments({ isRead: false, isArchived: false }),
      EmailThread.countDocuments({
        classification: { $in: ['assistant_to_reply', 'client_to_reply', 'needs_review'] },
        isCompleted: false,
        isArchived: false,
      }),
      EmailThread.countDocuments({
        classification: 'assistant_to_reply',
        isCompleted: false,
        isArchived: false,
      }),
      EmailThread.countDocuments({
        classification: 'client_to_reply',
        isCompleted: false,
        isArchived: false,
      }),
      EmailThread.countDocuments({
        classification: 'needs_review',
        isCompleted: false,
        isArchived: false,
      }),
      EmailThread.countDocuments({
        $or: [{ category: 'meetings' }, { extractedEvent: { $ne: null } }],
        isArchived: false,
      }),
      EmailThread.countDocuments({
        category: 'waiting_for_response',
        isArchived: false,
      }),
      EmailThread.countDocuments({
        isImportant: true,
        isArchived: false,
      }),
      EmailThread.countDocuments({
        classification: 'no_reply_needed',
        isArchived: false,
      }),
      EmailThread.countDocuments({ isArchived: false }),
      EmailThread.countDocuments({ isCompleted: true }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUnread,
        actionRequired,
        assistantToReply,
        clientToReply,
        needsReview,
        upcomingMeetings,
        waitingForResponse,
        important,
        noReplyNeeded,
        totalActive,
        completed,
      },
    });
  } catch (err) {
    console.error('Error calculating email stats:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/emails/:id
 * Fetches a single thread and marks it as read.
 */
router.get('/:id', async (req, res) => {
  try {
    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }
    if (!thread.isRead) {
      thread.isRead = true;
      await thread.save();
    }
    return res.json({ success: true, thread });
  } catch (err) {
    console.error('Error fetching thread:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emails/simulate
 * Simulates a brand new incoming email, runs live AI classification, and saves to database.
 */
router.post('/simulate', async (req, res) => {
  try {
    const {
      senderName = 'Alex Mercer',
      senderEmail = 'amercer@venturebridge.com',
      subject = 'Urgent: Follow up on partnership terms',
      body = 'Elena, we need your signoff on the partnership schedule before our executive committee meets tomorrow morning.',
      isClient = false,
    } = req.body;

    const messages = [
      {
        senderName,
        senderEmail,
        body,
        timestamp: new Date(),
        isClient,
      },
    ];

    // Run AI Classification
    const aiResult = await AIService.classifyThread(messages, subject);

    // Build participants list
    const participants = [
      { name: senderName, email: senderEmail, role: 'external' },
      { name: 'Elena Vance', email: 'elena.vance@vancetech.io', role: 'client' },
      { name: 'Marcus Chen', email: 'marcus.chen@vancetech.io', role: 'assistant' },
    ];

    const newThread = await EmailThread.create({
      subject,
      participants,
      messages,
      classification: aiResult.classification,
      confidence: aiResult.confidence,
      aiReason: aiResult.aiReason,
      summary: aiResult.summary,
      whyClientNeeded: aiResult.whyClientNeeded,
      suggestedAction: aiResult.suggestedAction || '',
      category: aiResult.category,
      extractedEvent: aiResult.extractedEvent,
      isRead: false,
      isImportant: aiResult.classification === 'client_to_reply',
      isArchived: false,
      isCompleted: false,
      isOverridden: false,
      originalClassification: aiResult.classification,
    });

    return res.status(201).json({
      success: true,
      message: 'Simulated email received and AI-classified successfully',
      thread: newThread,
      aiAnalysis: aiResult,
    });
  } catch (err) {
    console.error('Error simulating incoming email:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emails/:id/messages
 * Simulates a new incoming message on an EXISTING conversation thread and triggers AI reclassification.
 */
router.post('/:id/messages', async (req, res) => {
  try {
    const {
      senderName = 'External Partner',
      senderEmail = 'partner@external.io',
      body,
      isClient = false,
    } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, error: 'Message body is required' });
    }

    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    const incomingMsg = {
      senderName,
      senderEmail,
      body: body.trim(),
      timestamp: new Date(),
      isClient: !!isClient,
    };

    // Reclassify with updated message stream
    const { aiResult, updatedMessages } = await AIService.reclassifyThread(thread, incomingMsg);

    thread.messages = updatedMessages;
    thread.classification = aiResult.classification;
    thread.confidence = aiResult.confidence;
    thread.aiReason = aiResult.aiReason;
    thread.summary = aiResult.summary;
    thread.whyClientNeeded = aiResult.whyClientNeeded;
    thread.suggestedAction = aiResult.suggestedAction || thread.suggestedAction;
    thread.category = aiResult.category;
    if (aiResult.extractedEvent) {
      thread.extractedEvent = aiResult.extractedEvent;
    }

    // New incoming external message unmarks completed & marks unread
    if (!isClient) {
      thread.isCompleted = false;
      thread.isRead = false;
    }

    // Reset override if new message changes context
    thread.isOverridden = false;

    await thread.save();

    return res.json({
      success: true,
      message: 'New message added and thread reclassified by AI',
      thread,
      aiAnalysis: aiResult,
    });
  } catch (err) {
    console.error('Error adding message and reclassifying thread:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/emails/:id/override
 * Manual classification override by assistant, preserving human vs. AI audit distinction.
 */
router.patch('/:id/override', async (req, res) => {
  try {
    const { classification, aiReason } = req.body;
    if (!['assistant_to_reply', 'client_to_reply', 'no_reply_needed', 'needs_review'].includes(classification)) {
      return res.status(400).json({ success: false, error: 'Invalid classification' });
    }

    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    // Preserve audit distinction
    if (!thread.isOverridden) {
      thread.originalClassification = thread.classification;
    }
    thread.isOverridden = true;
    thread.overriddenBy = 'Marcus Chen (Assistant)';
    thread.overriddenAt = new Date();

    thread.classification = classification;
    thread.confidence = 100; // Human verified
    thread.aiReason = aiReason || `Manually overridden by Assistant Marcus Chen to ${classification.replace(/_/g, ' ')}.`;

    if (classification === 'client_to_reply' && !thread.whyClientNeeded) {
      thread.whyClientNeeded = 'Manually designated by assistant for executive review.';
      thread.suggestedAction = 'Executive review and decision required from Elena Vance.';
    } else if (classification !== 'client_to_reply') {
      thread.whyClientNeeded = '';
      if (classification === 'assistant_to_reply') {
        thread.suggestedAction = 'Assistant Marcus Chen to handle routine response.';
      } else if (classification === 'no_reply_needed') {
        thread.suggestedAction = 'Informational only; no further response necessary.';
      }
    }

    await thread.save();
    return res.json({ success: true, message: 'Classification updated successfully', thread });
  } catch (err) {
    console.error('Error overriding classification:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/emails/:id/delegate
 * Executive Client delegates thread to Assistant with an optional note.
 */
router.patch('/:id/delegate', async (req, res) => {
  try {
    const { delegationNote = '' } = req.body;
    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    thread.classification = 'assistant_to_reply';
    thread.delegationNote = delegationNote.trim();
    thread.aiReason = `Delegated by Elena to Marcus: "${delegationNote.trim() || 'Please handle this.'}"`;
    thread.whyClientNeeded = ''; // Handled by delegation
    thread.suggestedAction = `Marcus: Follow Elena's instructions: "${delegationNote.trim() || 'Please handle this.'}"`;

    await thread.save();
    return res.json({
      success: true,
      message: 'Thread successfully delegated to Assistant Marcus Chen',
      thread,
    });
  } catch (err) {
    console.error('Error delegating thread:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/emails/:id/status
 * Updates thread flags (isCompleted, isRead, isImportant, isArchived).
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { isCompleted, isRead, isImportant, isArchived } = req.body;
    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    if (typeof isCompleted === 'boolean') thread.isCompleted = isCompleted;
    if (typeof isRead === 'boolean') thread.isRead = isRead;
    if (typeof isImportant === 'boolean') thread.isImportant = isImportant;
    if (typeof isArchived === 'boolean') thread.isArchived = isArchived;

    await thread.save();
    return res.json({ success: true, message: 'Status updated', thread });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emails/:id/draft
 * Generates an AI-tailored reply draft based on role, tone, and instructions.
 */
router.post('/:id/draft', async (req, res) => {
  try {
    const { role = 'assistant', instructions = '', tone = 'professional' } = req.body;
    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    const draft = await AIService.draftReply(thread, role, instructions, tone);

    thread.replyDraft = {
      content: draft.replyBody,
      draftedByRole: role,
      tone,
      updatedAt: new Date(),
    };
    await thread.save();

    return res.json({ success: true, draft, thread });
  } catch (err) {
    console.error('Error drafting reply:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emails/:id/send
 * Sends reply message (appends to thread history) and optionally marks completed.
 * Simulated dispatch indicator returned.
 */
router.post('/:id/send', async (req, res) => {
  try {
    const {
      senderName = 'Marcus Chen',
      senderEmail = 'marcus.chen@vancetech.io',
      body,
      isClient = false,
      markCompleted = true,
    } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, error: 'Reply message body is required' });
    }

    const thread = await EmailThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    thread.messages.push({
      senderName,
      senderEmail,
      body: body.trim(),
      timestamp: new Date(),
      isClient,
    });

    if (markCompleted) {
      thread.isCompleted = true;
    }
    thread.replyDraft = null; // Clear draft once sent
    thread.isRead = true;

    await thread.save();
    return res.json({
      success: true,
      simulated: true,
      message: 'Reply logged to conversation thread (Simulated Outbox - no live SMTP contact)',
      thread,
    });
  } catch (err) {
    console.error('Error sending reply:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/emails/ask-ai
 * Slide-over natural language inbox assistant Q&A using live database threads.
 */
router.post('/ask-ai', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const allThreads = await EmailThread.find({ isArchived: false }).sort({ updatedAt: -1 });
    const response = await AIService.askInbox(query, allThreads);

    return res.json({ success: true, query, response });
  } catch (err) {
    console.error('Error processing ask-ai query:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
