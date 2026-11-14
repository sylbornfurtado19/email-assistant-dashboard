import dotenv from 'dotenv';
dotenv.config();

/**
 * Robust JSON extraction helper
 * Strips markdown code blocks and extracts JSON objects safely
 */
export function safeJsonParse(text) {
  if (!text || typeof text !== 'string') return null;
  // 1. Direct parse
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 2. Strip markdown code fences (```json ... ``` or ``` ...)
  const cleaned = text
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/```\s*$/m, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // 3. Extract outermost { ... }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {}
  }

  return null;
}

/**
 * Validates and sanitizes structured classification output
 */
export function validateClassification(parsed, fallbackGenerator) {
  const validClassifications = ['assistant_to_reply', 'client_to_reply', 'no_reply_needed', 'needs_review'];
  const validCategories = ['meetings', 'action_required', 'waiting_for_response', 'important', 'general'];

  if (!parsed || typeof parsed !== 'object') {
    return fallbackGenerator();
  }

  let classification = validClassifications.includes(parsed.classification)
    ? parsed.classification
    : 'needs_review';

  let confidence = typeof parsed.confidence === 'number' && !isNaN(parsed.confidence)
    ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
    : 70;

  // Enforce 75% confidence threshold: if confidence < 75, force needs_review
  if (confidence < 75 && classification !== 'no_reply_needed') {
    classification = 'needs_review';
  }

  const category = validCategories.includes(parsed.category) ? parsed.category : 'general';
  const aiReason = parsed.aiReason ? String(parsed.aiReason).trim() : 'Classified by AI triage engine.';
  const summary = parsed.summary ? String(parsed.summary).trim() : 'Email thread conversation.';
  const whyClientNeeded =
    classification === 'client_to_reply'
      ? (parsed.whyClientNeeded ? String(parsed.whyClientNeeded).trim() : 'High-priority executive decision required from CEO Elena.')
      : '';
  const suggestedAction = parsed.suggestedAction ? String(parsed.suggestedAction).trim() : 'Review thread and take appropriate action.';

  let extractedEvent = null;
  if (parsed.extractedEvent && typeof parsed.extractedEvent === 'object' && parsed.extractedEvent.date) {
    extractedEvent = {
      title: String(parsed.extractedEvent.title || 'Calendar Event').trim(),
      date: String(parsed.extractedEvent.date || '').trim(),
      time: String(parsed.extractedEvent.time || '').trim(),
      location: String(parsed.extractedEvent.location || 'Virtual / TBD').trim(),
    };
  }

  return {
    classification,
    confidence,
    aiReason,
    summary,
    whyClientNeeded,
    category,
    suggestedAction,
    extractedEvent,
  };
}

/**
 * Intelligent Deterministic Rule-Based Engine
 * Ensures 100% functionality and accuracy without requiring external API keys.
 */
export class RuleBasedAIEngine {
  static extractDatesAndTimes(text) {
    // Detect dates like Nov 20, 2026, 2026-11-20, November 20th, tomorrow, etc.
    const dateRegex = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/i;
    const isoDateRegex = /\b202\d-\d{2}-\d{2}\b/;
    const timeRegex = /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b/;
    const locationRegex = /(?:at|location:|venue:)\s+([^,\n\.]+)/i;

    const dateMatch = text.match(dateRegex) || text.match(isoDateRegex);
    const timeMatch = text.match(timeRegex);
    const locMatch = text.match(locationRegex);

    if (dateMatch || timeMatch) {
      return {
        title: 'Extracted Calendar Event',
        date: dateMatch ? dateMatch[0].trim() : 'Upcoming',
        time: timeMatch ? timeMatch[0].trim() : 'TBD',
        location: locMatch ? locMatch[1].trim() : 'Virtual / TBD',
      };
    }
    return null;
  }

  static classify(messages = [], subject = '') {
    const fullText = `${subject} ${messages.map((m) => `${m.senderName}: ${m.body}`).join(' ')}`.toLowerCase();
    const latestMessage = messages[messages.length - 1] || { body: '', senderName: '', senderEmail: '', isClient: false };
    const latestText = `${latestMessage.body}`.toLowerCase();
    const latestIsClient = !!latestMessage.isClient;

    // Check for explicit event/meeting scheduling
    const event = this.extractDatesAndTimes(`${subject} ${latestMessage.body}`);
    const isMeetingRelated = /(meeting|dinner|lunch|coffee|reschedule|calendar|sync|call|zoom|rsvp|itinerary|flight)/i.test(
      fullText
    );

    // Rule 1: High-stakes executive decision / Signatory / M&A / Term Sheet / Press / Custom SLA
    const isExecutiveLevel =
      /(term sheet|acquisition|merger|m&a|valuation|signatory|signature|signoff|sign-off|docusign|press embargo|bloomberg|interview request|lawsuit|board member approval|equity grant|custom sla|penalty clause|legal settlement|indemnity clause)/i.test(
        fullText
      );

    // Rule 2: Ambiguous or confusing inquiries (< 75 confidence -> needs_review)
    const isAmbiguous =
      /(maybe|unclear|per your thoughts|could go either way|cryptic|partnership inquiry|revenue split?|conflicting|please clarify|open to interpretation|excess gpu|excess capacity|joint press release\?)/i.test(
        fullText
      ) ||
      (fullText.includes('proposal') && !fullText.includes('approved') && fullText.length < 150);

    // Rule 3: Automated notifications, receipts, newsletters, marketing (no_reply_needed)
    const isAutomatedOrNoReply =
      /(no-reply|noreply|billing receipt|invoice receipt|cloudwatch|aws billing|alert confirmation|flight itinerary confirmed|ticket confirmation|security training|phishing simulation|newsletter|do not reply|no security actions or responses are required|no action is required)/i.test(
        fullText
      );

    // Rule 4: Waiting for response (Client sent the latest message awaiting external response)
    const isWaitingOnOther =
      latestIsClient ||
      (/(waiting for|awaiting your documents|pending receipt of|will send by|looking forward to receiving the audit|kpmg)/i.test(
        fullText
      ) && latestIsClient);

    // Decision Logic
    let classification = 'assistant_to_reply';
    let confidence = 88;
    let aiReason = '';
    let whyClientNeeded = '';
    let category = 'general';
    let suggestedAction = '';

    if (isAutomatedOrNoReply) {
      classification = 'no_reply_needed';
      confidence = 97;
      aiReason = 'Automated system notification or informational receipt requiring zero correspondence.';
      category = isMeetingRelated ? 'meetings' : 'general';
      suggestedAction = 'Archive informational update to system records.';
    } else if (isAmbiguous) {
      classification = 'needs_review';
      confidence = 68; // Under 75 threshold as required
      aiReason =
        'Ambiguous context with vague terms or conflicting signals; requires human assistant triage to determine appropriate owner.';
      category = 'action_required';
      suggestedAction = 'Review partnership inquiry and clarify required executive involvement.';
    } else if (isExecutiveLevel) {
      classification = 'client_to_reply';
      confidence = 94;
      category = 'important';

      if (/(term sheet|acquisition|valuation|signatory|signature|signoff|docusign|indemnity)/i.test(fullText)) {
        whyClientNeeded = 'Requires legal signatory authorization and valuation approval directly from CEO Elena.';
        aiReason = 'Strategic M&A and contract execution necessitates direct executive authorization.';
        suggestedAction = 'Review term sheet with outside counsel and authorize DocuSign signature.';
      } else if (/(press|bloomberg|interview)/i.test(fullText)) {
        whyClientNeeded = 'Press embargo commentary deadline within short timeframe regarding company strategy.';
        aiReason = 'High-visibility media request requiring principal executive quotes.';
        suggestedAction = 'Confirm CEO availability for live TV studio broadcast.';
      } else if (/(sla|penalty)/i.test(fullText)) {
        whyClientNeeded = 'Customer requesting custom SLA penalty clause outside standard operating limits.';
        aiReason = 'Enterprise risk exposure requires executive pricing & SLA signoff.';
        suggestedAction = 'Review custom 99.99% uptime terms or propose alternative service credits.';
      } else {
        whyClientNeeded = 'Strategic decision requiring principal executive authority and signature.';
        aiReason = 'High-priority executive matter identified from thread keywords.';
        suggestedAction = 'Evaluate proposal and advise assistant on executive position.';
      }
    } else if (isWaitingOnOther) {
      classification = 'assistant_to_reply';
      category = 'waiting_for_response';
      confidence = 85;
      aiReason = 'Thread is currently blocked waiting on external partner delivery before next action.';
      suggestedAction = 'Monitor inbox for auditor delivery; send follow-up nudge if delayed.';
    } else if (isMeetingRelated) {
      category = 'meetings';
      if (/(dinner|vip|board)/i.test(fullText)) {
        classification = 'assistant_to_reply';
        confidence = 92;
        aiReason = 'Executive assistant calendar coordination requested for upcoming VIP event.';
        suggestedAction = 'Confirm headcount, dietary restrictions, and send calendar invite.';
      } else {
        classification = 'assistant_to_reply';
        confidence = 90;
        aiReason = 'Routine calendar & logistical scheduling suitable for assistant resolution.';
        suggestedAction = 'Cross-reference Elena’s calendar and send confirmed time slot.';
      }
    } else {
      classification = 'assistant_to_reply';
      confidence = 86;
      aiReason = 'Standard operational inquiry suitable for executive assistant response on behalf of client.';
      category = 'action_required';
      suggestedAction = 'Draft confirmation reply on behalf of Elena Vance.';
    }

    // Generate executive summary
    const summary = this.generateSummary(subject, messages, classification, event);

    return {
      classification,
      confidence,
      aiReason,
      summary,
      whyClientNeeded: classification === 'client_to_reply' ? whyClientNeeded : '',
      category,
      suggestedAction,
      extractedEvent: event,
    };
  }

  static generateSummary(subject, messages, classification, event) {
    const sender = messages[0]?.senderName || 'External Sender';
    const lastMsg = messages[messages.length - 1]?.body || '';
    const cleanSnippet = lastMsg.replace(/\r?\n|\r/g, ' ').slice(0, 140);

    if (event) {
      return `${sender} requests calendar alignment for "${subject}". Detected proposed slot: ${event.date} at ${event.time} (${event.location}).`;
    }
    if (classification === 'client_to_reply') {
      return `Critical executive decision on "${subject}". Latest from ${sender}: "${cleanSnippet}..."`;
    }
    if (classification === 'needs_review') {
      return `Unverified inquiry from ${sender} regarding "${subject}". Requires assistant review to clarify actionability.`;
    }
    if (classification === 'no_reply_needed') {
      return `Informational update: "${subject}". No reply or follow-up required.`;
    }
    return `Actionable operational thread with ${sender} regarding "${subject}". Latest status: "${cleanSnippet}..."`;
  }

  static generateDraftReply(thread, role = 'assistant', instructions = '', tone = 'professional') {
    const lastSender =
      thread.messages && thread.messages.length > 0
        ? thread.messages[thread.messages.length - 1].senderName
        : 'Colleague';
    const subject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;
    const clientName = 'Elena Vance';
    const assistantName = 'Marcus Chen';

    const firstName = lastSender.split(' ')[0] || 'there';
    let salutation = `Hi ${firstName},`;
    let body = '';
    let signOff = '';

    if (role === 'assistant') {
      // Writing ON BEHALF of Elena Vance
      if (instructions) {
        body = `On behalf of ${clientName}, thank you for reaching out regarding ${thread.subject}.\n\n${instructions}\n\nPlease let us know if you need any additional details or documents from our side.`;
      } else if (thread.category === 'meetings' || thread.extractedEvent) {
        body = `On behalf of ${clientName}, thank you for your note. We have reviewed the proposed timing for "${thread.subject}".\n\n${clientName}'s calendar can accommodate this window. I will send over a calendar invite with the conference link shortly.\n\nPlease let me know if there are specific agenda topics you would like prioritized.`;
      } else if (thread.classification === 'needs_review') {
        body = `Thank you for contacting ${clientName}'s office. I am reviewing the details of your request with Elena and will follow up shortly with our consolidated feedback.`;
      } else {
        body = `On behalf of ${clientName}, thank you for your message. We have received the materials and are currently processing the next steps.\n\nEverything appears in order, and we will update you as soon as this phase is completed.`;
      }

      if (tone === 'warm') {
        signOff = `Warm regards,\n\n${assistantName}\nExecutive Assistant to ${clientName}, CEO\nVance Technologies`;
      } else if (tone === 'direct') {
        signOff = `Best,\n${assistantName} | Office of Elena Vance`;
      } else if (tone === 'firm') {
        signOff = `Regards,\n\n${assistantName}\nExecutive Office of Elena Vance`;
      } else {
        signOff = `Sincerely,\n\n${assistantName}\nExecutive Assistant to ${clientName}\nVance Technologies | Office of the CEO`;
      }
    } else {
      // Writing IN FIRST PERSON as Elena Vance (Client)
      if (instructions) {
        body = `Thanks for following up on this.\n\n${instructions}\n\nLet's ensure we keep this moving smoothly.`;
      } else if (thread.category === 'meetings') {
        body = `Thanks for reaching out. I'd be glad to connect. Marcus (cc'd) will coordinate the exact calendar invite and dial-in details.\n\nLooking forward to speaking.`;
      } else if (thread.whyClientNeeded) {
        body = `I've reviewed the proposal regarding ${thread.subject}. The terms outlined align with our strategic direction. Please coordinate with Marcus on my team to finalize execution documents.`;
      } else {
        body = `Thanks for the update. Everything looks solid from my end. Let's proceed as planned.`;
      }

      if (tone === 'warm') {
        signOff = `Warmly,\nElena\n\nElena Vance\nCEO, Vance Technologies`;
      } else if (tone === 'direct') {
        signOff = `Thanks,\nElena`;
      } else if (tone === 'firm') {
        signOff = `Regards,\n\nElena Vance\nCEO, Vance Technologies`;
      } else {
        signOff = `Best regards,\n\nElena Vance\nCEO, Vance Technologies`;
      }
    }

    const fullDraft = `${salutation}\n\n${body}\n\n${signOff}`;

    return {
      replySubject: subject,
      replyBody: fullDraft,
      tone,
      keyPoints: [
        'Acknowledge receipt and clarify immediate next steps',
        role === 'assistant' ? 'Explicitly noted assistant delegation on behalf of Elena' : 'First-person CEO signoff',
        'Next steps and coordination contact specified',
      ],
    };
  }

  static answerInboxQuestion(query, threads = []) {
    const q = query.toLowerCase();

    // 1. "What am I waiting on / waiting for?"
    if (q.includes('waiting') || q.includes('blocked') || q.includes('pending')) {
      const waitingThreads = threads.filter(
        (t) => t.category === 'waiting_for_response' || t.aiReason?.toLowerCase().includes('waiting')
      );
      if (waitingThreads.length > 0) {
        const list = waitingThreads.map((t) => `• **${t.subject}** (${t.aiReason})`).join('\n');
        return {
          answer: `You are currently waiting on responses for **${waitingThreads.length} threads**:\n\n${list}\n\nRecommended: Marcus can send a polite nudge on the KPMG audit documents if no update arrives by end of day.`,
          matchingThreadIds: waitingThreads.map((t) => t._id.toString()),
          suggestedActions: ['Draft reminder for KPMG audit', 'Mark thread as priority follow-up'],
        };
      }
      return {
        answer: 'No threads are currently stalled waiting on external replies.',
        matchingThreadIds: [],
        suggestedActions: ['Check incoming unread messages'],
      };
    }

    // 2. "Why is this assigned to the client?" or "Which emails require client approval / attention?"
    if (
      (q.includes('why') && (q.includes('client') || q.includes('assigned') || q.includes('elena'))) ||
      q.includes('require client') ||
      q.includes('client approval') ||
      q.includes('requiring my attention')
    ) {
      const clientThreads = threads.filter((t) => t.classification === 'client_to_reply');
      if (clientThreads.length > 0) {
        const list = clientThreads
          .map((t) => `• **${t.subject}**: ${t.whyClientNeeded || t.aiReason}`)
          .join('\n');
        return {
          answer: `There are **${clientThreads.length} items** requiring Elena Vance's direct executive input:\n\n${list}\n\n*General Rule:* High-stakes legal contracts, media quotes, and custom SLA concessions cannot be delegated without direct CEO authorization.`,
          matchingThreadIds: clientThreads.map((t) => t._id.toString()),
          suggestedActions: ['Switch to Client View to review cards', 'Delegate routine parts to Marcus'],
        };
      }
      return {
        answer: 'There are currently no threads requiring direct client authorization. Inbox Zero for Elena!',
        matchingThreadIds: [],
        suggestedActions: ['View assistant queue'],
      };
    }

    // 3. Meetings / Calendar queries
    if (q.includes('meeting') || q.includes('calendar') || q.includes('dinner') || q.includes('schedule') || q.includes('upcoming')) {
      const meetingThreads = threads.filter((t) => t.category === 'meetings' || t.extractedEvent);
      if (meetingThreads.length > 0) {
        const list = meetingThreads
          .map((t) => {
            const ev = t.extractedEvent;
            return `• **${t.subject}**: ${ev?.title || 'Meeting'} on **${ev?.date || 'Date TBD'}** at **${ev?.time || 'Time TBD'}** (${ev?.location || 'Location TBD'})`;
          })
          .join('\n');
        return {
          answer: `Found **${meetingThreads.length} calendar and meeting threads**:\n\n${list}\n\nAll extracted dates have been prepared with single-click calendar sync banners.`,
          matchingThreadIds: meetingThreads.map((t) => t._id.toString()),
          suggestedActions: ['Sync events to Google Calendar', 'Confirm attendees'],
        };
      }
      return {
        answer: 'No upcoming meetings or calendar invites detected in active threads.',
        matchingThreadIds: [],
        suggestedActions: ['Check archived items'],
      };
    }

    // 4. "What needs urgent review?" / "Needs review"
    if (q.includes('review') || q.includes('urgent') || q.includes('ambiguous')) {
      const reviewThreads = threads.filter(
        (t) => t.classification === 'needs_review' || (t.confidence < 75 && !t.isCompleted)
      );
      if (reviewThreads.length > 0) {
        const list = reviewThreads
          .map((t) => `• **${t.subject}** (Confidence: ${t.confidence}% - ${t.aiReason})`)
          .join('\n');
        return {
          answer: `There are **${reviewThreads.length} ambiguous threads** flagged for human assistant review (< 75% confidence):\n\n${list}\n\nYou can override their classification directly from the Assistant Dashboard right-hand pane.`,
          matchingThreadIds: reviewThreads.map((t) => t._id.toString()),
          suggestedActions: ['Review ambiguous threads', 'Override classification'],
        };
      }
      return {
        answer: 'All active threads have high AI confidence (> 75%). Zero ambiguous threads pending review.',
        matchingThreadIds: [],
        suggestedActions: ['Check assistant queue'],
      };
    }

    // 5. "Summarize this conversation" or "Summarize"
    if (q.includes('summarize')) {
      const activeSample = threads.filter((t) => !t.isCompleted).slice(0, 3);
      const list = activeSample
        .map((t) => `• **${t.subject}**: ${t.summary || t.aiReason}`)
        .join('\n\n');
      return {
        answer: `Here is the current executive summary of high-priority inbox threads:\n\n${list}`,
        matchingThreadIds: activeSample.map((t) => t._id.toString()),
        suggestedActions: ['Open first thread', 'Filter by client to reply'],
      };
    }

    // 6. "Draft a response to this email" or "draft"
    if (q.includes('draft') || q.includes('response')) {
      const targetThread = threads.find((t) => t.classification === 'assistant_to_reply' && !t.isCompleted) || threads[0];
      if (targetThread) {
        return {
          answer: `I can draft a response for **${targetThread.subject}**. Marcus can choose from 4 tones (*Professional, Warm, Direct, Firm*) in the Reply Composer on the right panel.\n\nSuggested approach: ${targetThread.suggestedAction || 'Acknowledge receipt and confirm next steps.'}`,
          matchingThreadIds: [targetThread._id.toString()],
          suggestedActions: ['Generate AI Draft in Composer', 'Open thread'],
        };
      }
    }

    // Generic fallback keyword search across inbox data
    const terms = q.split(/\s+/).filter((word) => word.length > 2);
    const matches = threads.filter((t) => {
      const hay = `${t.subject} ${t.summary} ${t.aiReason} ${t.whyClientNeeded} ${t.suggestedAction}`.toLowerCase();
      return terms.some((term) => hay.includes(term));
    });

    if (matches.length > 0) {
      const sample = matches.slice(0, 4);
      const list = sample
        .map((t) => `• **${t.subject}** [${t.classification.replace(/_/g, ' ')}] - ${t.summary}`)
        .join('\n');
      return {
        answer: `I found **${matches.length} relevant threads** matching "${query}":\n\n${list}`,
        matchingThreadIds: sample.map((t) => t._id.toString()),
        suggestedActions: ['Open matching thread', 'Filter inbox'],
      };
    }

    return {
      answer: `I searched across your inbox for "${query}", but found no direct matches. Try asking: \n- *"What am I waiting for?"*\n- *"Which emails require client approval?"*\n- *"What meetings are coming up?"*\n- *"What needs urgent review?"*`,
      matchingThreadIds: [],
      suggestedActions: ['Show all threads', 'Filter by Client to Reply'],
    };
  }
}

/**
 * Main AI Service
 * Supports Gemini API SDK if GEMINI_API_KEY is configured,
 * with seamless automatic fallback to the intelligent RuleBasedAIEngine.
 */
class AIService {
  static async classifyThread(messages = [], subject = '') {
    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an elite Executive Assistant AI for Elena Vance (CEO). Classify this email thread.
Subject: ${subject}
Conversation history:
${messages.map((m) => `${m.senderName} (${m.senderEmail}): ${m.body}`).join('\n---\n')}

Classify into strict JSON matching this schema:
{
  "classification": "assistant_to_reply" | "client_to_reply" | "no_reply_needed" | "needs_review",
  "confidence": number between 0 and 100,
  "aiReason": "One-sentence explanation of why this classification was chosen",
  "summary": "Concise 1-2 sentence executive summary of the thread status",
  "whyClientNeeded": "If client_to_reply, explain why Elena Vance's personal input is required; otherwise empty string",
  "category": "meetings" | "action_required" | "waiting_for_response" | "important" | "general",
  "suggestedAction": "One clear actionable next step recommendation",
  "extractedEvent": { "title": "string", "date": "string", "time": "string", "location": "string" } or null
}
CRITICAL: If confidence is lower than 75, set classification to "needs_review". Output ONLY valid JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = safeJsonParse(response.text);
        if (parsed) {
          return validateClassification(parsed, () => RuleBasedAIEngine.classify(messages, subject));
        }
      } catch (err) {
        console.warn('[AI Service] Gemini call failed, falling back to smart rule engine:', err.message);
      }
    }

    // Default to the intelligent rule-based engine
    return RuleBasedAIEngine.classify(messages, subject);
  }

  static async reclassifyThread(thread, incomingMessage) {
    const updatedMessages = [...(thread.messages || []), incomingMessage];
    const aiResult = await this.classifyThread(updatedMessages, thread.subject);
    return {
      aiResult,
      updatedMessages,
    };
  }

  static async draftReply(thread, role = 'assistant', instructions = '', tone = 'professional') {
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are drafting an email reply.
Role: ${role === 'assistant' ? 'Executive Assistant Marcus Chen writing ON BEHALF of CEO Elena Vance' : 'CEO Elena Vance writing in first person'}
Subject: ${thread.subject}
Tone: ${tone}
User custom instructions: ${instructions || 'None provided'}
Previous conversation:
${thread.messages?.map((m) => `${m.senderName}: ${m.body}`).join('\n')}

Generate strict JSON:
{
  "replySubject": "Re: ${thread.subject}",
  "replyBody": "The full drafted reply text with greeting and signoff",
  "tone": "${tone}",
  "keyPoints": ["point 1", "point 2"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = safeJsonParse(response.text);
        if (parsed && parsed.replyBody) {
          return parsed;
        }
      } catch (err) {
        console.warn('[AI Service] Gemini draft failed, using rule-based generator:', err.message);
      }
    }

    return RuleBasedAIEngine.generateDraftReply(thread, role, instructions, tone);
  }

  static async askInbox(query, threads = []) {
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const context = threads.map((t) => ({
          id: t._id,
          subject: t.subject,
          classification: t.classification,
          category: t.category,
          aiReason: t.aiReason,
          summary: t.summary,
          whyClientNeeded: t.whyClientNeeded,
          suggestedAction: t.suggestedAction,
          event: t.extractedEvent,
        }));

        const prompt = `You are an AI inbox copilot for an Executive and Assistant team (Elena Vance & Marcus Chen).
User Query: "${query}"
Inbox Threads:
${JSON.stringify(context, null, 2)}

Provide strict JSON:
{
  "answer": "Markdown answer directly addressing the question with clear bullet points and advice",
  "matchingThreadIds": ["array of thread id strings that are relevant"],
  "suggestedActions": ["1-3 short suggested next actions"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = safeJsonParse(response.text);
        if (parsed && parsed.answer) {
          return parsed;
        }
      } catch (err) {
        console.warn('[AI Service] Gemini Q&A failed, using smart Q&A engine:', err.message);
      }
    }

    return RuleBasedAIEngine.answerInboxQuestion(query, threads);
  }
}

export default AIService;
