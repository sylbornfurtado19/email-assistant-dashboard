import { connectDB, closeDB } from '../config/db.js';
import EmailThread from '../models/EmailThread.js';
import User from '../models/User.js';
import { seedDatabase } from '../seed/seedData.js';
import AIService, { RuleBasedAIEngine } from '../services/aiService.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting AetherInbox AI Comprehensive Test Suite');
  console.log('====================================================');

  await connectDB();
  await seedDatabase();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. User Model & Suite Verification
    console.log('\n--- Test 1: User & Workspace Setup ---');
    const user = await User.findOne();
    assert(user !== null, 'User exists in database');
    assert(user.executiveName === 'Elena Vance', 'Executive is Elena Vance');
    assert(user.assistantName === 'Marcus Chen', 'Assistant is Marcus Chen');
    assert(user.connectedAccounts.length === 2, '2 Connected Accounts exist (Gmail & Outlook)');

    // 2. Initial 12 Seed Threads Verification
    console.log('\n--- Test 2: Seed Threads & Classifications ---');
    const threadCount = await EmailThread.countDocuments();
    assert(threadCount === 12, `Seeded exactly 12 threads (found ${threadCount})`);

    const clientThreads = await EmailThread.find({ classification: 'client_to_reply' });
    assert(clientThreads.length >= 3, `Found ${clientThreads.length} client_to_reply threads (minimum 3 expected)`);

    const assistantThreads = await EmailThread.find({ classification: 'assistant_to_reply' });
    assert(assistantThreads.length >= 4, `Found ${assistantThreads.length} assistant_to_reply threads`);

    const needsReviewThreads = await EmailThread.find({ classification: 'needs_review' });
    assert(needsReviewThreads.length >= 1, `Found ${needsReviewThreads.length} needs_review threads`);

    const noReplyThreads = await EmailThread.find({ classification: 'no_reply_needed' });
    assert(noReplyThreads.length >= 3, `Found ${noReplyThreads.length} no_reply_needed threads`);

    // 3. AI Classification Engine & 75% Confidence Threshold
    console.log('\n--- Test 3: AI Classification & Confidence Threshold ---');
    
    // Ambiguous test
    const ambiguousResult = await AIService.classifyThread(
      [{ senderName: 'Vague Rep', senderEmail: 'vague@rep.io', body: 'Maybe we can do something together? Unclear pricing or revenue split.' }],
      'Synergy proposal'
    );
    assert(ambiguousResult.classification === 'needs_review', 'Ambiguous inquiry classified as needs_review');
    assert(ambiguousResult.confidence < 75, `Confidence is under 75% (${ambiguousResult.confidence}%)`);

    // High stakes test
    const executiveResult = await AIService.classifyThread(
      [{ senderName: 'Sarah Sterling', senderEmail: 's@apollo.com', body: 'Elena, revised Term Sheet for $160M valuation requires your signature prior to close.' }],
      'Series B Term Sheet'
    );
    assert(executiveResult.classification === 'client_to_reply', 'High-stakes M&A classified as client_to_reply');
    assert(executiveResult.whyClientNeeded.length > 0, 'whyClientNeeded is populated');
    assert(executiveResult.confidence >= 75, `Confidence meets/exceeds 75% (${executiveResult.confidence}%)`);
    assert(executiveResult.suggestedAction.length > 0, `suggestedAction is populated: "${executiveResult.suggestedAction}"`);

    // Meeting & Event Extraction test
    const meetingResult = await AIService.classifyThread(
      [{ senderName: 'Arthur', senderEmail: 'arthur@board.com', body: 'Board dinner on Nov 20, 2026 at 7:00 PM at The Grand Pavilion.' }],
      'Q3 Board Dinner'
    );
    assert(meetingResult.extractedEvent !== null, 'Calendar event successfully extracted');
    assert(meetingResult.extractedEvent.date.includes('Nov 20'), 'Extracted correct date Nov 20');
    assert(meetingResult.extractedEvent.time.includes('7:00 PM'), 'Extracted correct time 7:00 PM');

    // 4. Role-Conditioned Reply Drafting
    console.log('\n--- Test 4: Role-Based Reply Drafting ---');
    const sampleThread = clientThreads[0];
    
    // Assistant drafting ON BEHALF OF Elena
    const assistantDraft = await AIService.draftReply(sampleThread, 'assistant', 'Please confirm documents', 'professional');
    assert(assistantDraft.replyBody.includes('On behalf of Elena Vance'), 'Assistant draft explicitly writes on behalf of Elena Vance');
    assert(assistantDraft.replyBody.includes('Marcus Chen'), 'Assistant draft signed by Marcus Chen');

    // Client drafting IN FIRST PERSON as Elena
    const clientDraft = await AIService.draftReply(sampleThread, 'client', 'Terms approved', 'direct');
    assert(clientDraft.replyBody.includes('Elena Vance') || clientDraft.replyBody.includes('Elena'), 'Client draft signed in first person by Elena');
    assert(!clientDraft.replyBody.includes('On behalf of'), 'Client draft does not say on behalf of');

    // 5. Dynamic Reclassification on Incoming Messages
    console.log('\n--- Test 5: Dynamic Reclassification on Incoming Messages ---');
    const waitingThread = await EmailThread.findOne({ category: 'waiting_for_response' });
    assert(waitingThread !== null, 'Found waiting_for_response thread');

    // Partner sends urgent demand for CEO signatory
    const newIncoming = {
      senderName: 'Gregory Vance-Smith (KPMG)',
      senderEmail: 'gvancesmith@kpmg.com',
      body: 'Elena, our partners completed the audit but legal requires your direct CEO signature on page 5 before noon.',
      timestamp: new Date(),
      isClient: false,
    };
    const { aiResult, updatedMessages } = await AIService.reclassifyThread(waitingThread, newIncoming);
    assert(updatedMessages.length === waitingThread.messages.length + 1, 'Message appended to thread history');
    assert(aiResult.classification === 'client_to_reply', `Thread dynamically reclassified to client_to_reply (got ${aiResult.classification})`);

    // 6. Delegation & Synchronization
    console.log('\n--- Test 6: Delegation & Status Sync ---');
    const termSheetThread = await EmailThread.findOne({ subject: /Term Sheet/i });
    assert(termSheetThread !== null, 'Found Term Sheet thread');
    
    // Elena delegates to Marcus
    termSheetThread.classification = 'assistant_to_reply';
    termSheetThread.delegationNote = 'Marcus, coordinate with Latham & Watkins on section 14';
    termSheetThread.whyClientNeeded = '';
    await termSheetThread.save();

    const reloaded = await EmailThread.findById(termSheetThread._id);
    assert(reloaded.classification === 'assistant_to_reply', 'Delegation changed classification to assistant_to_reply');
    assert(reloaded.delegationNote.includes('Latham & Watkins'), 'Delegation note persisted correctly');

    // 7. Human Override Audit Trail
    console.log('\n--- Test 7: Human Classification Override Audit Trail ---');
    const ambiguousThread = await EmailThread.findOne({ classification: 'needs_review' });
    assert(ambiguousThread !== null, 'Found needs_review thread');

    ambiguousThread.originalClassification = ambiguousThread.classification;
    ambiguousThread.isOverridden = true;
    ambiguousThread.overriddenBy = 'Marcus Chen (Assistant)';
    ambiguousThread.overriddenAt = new Date();
    ambiguousThread.classification = 'assistant_to_reply';
    ambiguousThread.confidence = 100;
    await ambiguousThread.save();

    const overriddenReloaded = await EmailThread.findById(ambiguousThread._id);
    assert(overriddenReloaded.isOverridden === true, 'isOverridden flag is true');
    assert(overriddenReloaded.originalClassification === 'needs_review', 'Original classification preserved as needs_review');
    assert(overriddenReloaded.overriddenBy === 'Marcus Chen (Assistant)', 'overriddenBy recorded correctly');

    // 8. Inbox Natural Language Copilot ("Ask AI")
    console.log('\n--- Test 8: AI Copilot Q&A against Live Inbox Data ---');
    const allThreads = await EmailThread.find({ isArchived: false });
    
    // Query 1: Waiting on
    const waitingAnswer = await AIService.askInbox('What am I waiting on?', allThreads);
    assert(waitingAnswer.matchingThreadIds.length > 0, 'Waiting query returns matching threads');
    assert(waitingAnswer.answer.includes('waiting') || waitingAnswer.answer.includes('KPMG') || waitingAnswer.answer.includes('threads'), 'Waiting query answered with thread details');

    // Query 2: Client assignments
    const clientAnswer = await AIService.askInbox('Why is this assigned to the client?', allThreads);
    assert(clientAnswer.answer.includes('Elena') || clientAnswer.answer.includes('CEO') || clientAnswer.answer.includes('authorization'), 'Client query explains executive requirements');

    // Query 3: Meetings
    const meetingAnswer = await AIService.askInbox('Show upcoming meetings', allThreads);
    assert(meetingAnswer.matchingThreadIds.length > 0, 'Meeting query returns meeting thread IDs');
    assert(meetingAnswer.answer.includes('Nov 20') || meetingAnswer.answer.includes('Grand Pavilion') || meetingAnswer.answer.includes('calendar'), 'Meeting query cites specific dates/locations');

    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    
    await closeDB();
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    await closeDB();
    process.exit(1);
  }
}

runTests();

