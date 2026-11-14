# 🚀 AetherInbox AI — Executive & Personal Assistant Email Management Suite

An enterprise-grade, full-stack **MERN** prototype of an **AI-Powered Personal Assistant Email Management Dashboard** tailored for high-performing Executive Assistants (e.g. Marcus Chen) managing an executive Client's inbox (e.g. Elena Vance, CEO).

Built with **Node.js, Express, MongoDB (with automatic in-memory zero-config fallback), React 18, Vite, Tailwind CSS, Lucide Icons, and LLM Copilot integration (Gemini / OpenAI with smart rule-based fallback)**.

---

## 🌟 Key Architecture & Capabilities

### 1. Two Dedicated, Specialized Perspectives
- **Assistant View (Marcus Chen):**
  - **KPI Header:** Instant breakdown of Unread count, Action Required, Assistant to Reply, Client to Reply, and Upcoming Meetings.
  - **Smart Segment Filters:** One-click filtering across `Assistant to Reply`, `Client to Reply`, `Needs Review (<75% AI Confidence)`, `Meetings & Appointments`, `Waiting for Response`, `Important`, and `Completed`.
  - **Scannable Thread Cards:** Senders, time ago, subject, AI executive summary snippet, responsibility badges, confidence meters, and event tags.
  - **Extracted Calendar Event Banner:** Automatically isolates event title, date, time, and location with one-click Google Calendar synchronization.
  - **AI Intelligence Triage Card:** Explains the exact rationale for classification, shows "Why Client Needed" (if applicable), and provides a **Manual Classification Override** dropdown with immediate updates.
  - **Full Thread History:** Collapsible multi-message history with distinct visual distinction between client messages (Elena in purple) and external senders.
  - **Interactive AI Draft & Approve Composer:** Allows the assistant to select tone (*Professional, Warm, Direct, Firm*), enter custom guiding notes, generate AI drafts on behalf of the client, edit, and click **"Send & Mark Handled"**.

- **Executive Client View (Elena Vance):**
  - **Focus Mode:** Filtered down strictly to `client_to_reply` items.
  - **Highlighted "Why Your Attention is Needed":** Prominent callout explaining the exact business reason why the CEO's personal authorization is required (e.g. *"Requires legal signatory authorization and valuation approval directly from CEO Elena"*).
  - **One-Click Delegation to Assistant:** Elena can enter a quick note (e.g., *"Marcus, decline politely and suggest next quarter"*) and click **"Confirm Delegation"**—the thread immediately flips to `assistant_to_reply` with the delegation note attached.
  - **Mark Handled:** Resolves items with 1 click.
  - **Direct Executive Reply:** Elena can also compose and send a direct CEO signoff.

### 2. Multi-Modal AI Engine (`aiService.js`)
- **Live Classification & Confidence Scoring:** Analyzes full thread history and assigns one of 4 states:
  - `assistant_to_reply`
  - `client_to_reply`
  - `needs_review` (strictly enforced whenever confidence is `< 75%`)
  - `no_reply_needed`
- **Calendar Event Detection:** Extracts dates, times, and venues from conversation text.
- **Tailored Role-Based Reply Drafting:**
  - When acting as `assistant`: Writes on behalf of Elena Vance (*"On behalf of Elena Vance, thank you for reaching out..."*).
  - When acting as `client`: Writes in first person (*"Thanks for following up on this..."*).
- **Inbox Natural Language Copilot ("Ask AI"):** Slide-over assistant that answers questions like *"What am I waiting on?"*, *"Why is this assigned to the client?"*, or *"Show all upcoming meetings"*, and returns clickable references that navigate directly to matching threads.
- **Fail-Safe Operation:** Works with live Google Gemini / OpenAI keys, or automatically uses the built-in intelligent rule engine so the demo **never halts or crashes** even without API credentials.

---

## 📁 Monorepo Folder Structure

```
email-assistant-dashboard/
├── package.json                   # Root orchestrator with concurrent run scripts
├── README.md                      # Documentation & instructions
│
├── server/
│   ├── config/
│   │   └── db.js                  # Resilient MongoDB connection with MongoMemoryServer fallback
│   ├── models/
│   │   ├── User.js                # Executive & Assistant suite profile, OAuth accounts
│   │   └── EmailThread.js         # Threads, multi-message history, AI classification, events
│   ├── services/
│   │   └── aiService.js           # Gemini API SDK + Intelligent Rule-Based Engine
│   ├── routes/
│   │   ├── authRoutes.js          # Demo login, account sync simulation, role switching
│   │   └── emailRoutes.js         # Segmented fetching, simulate incoming mail, delegate, draft, ask AI
│   ├── seed/
│   │   └── seedData.js            # 12 realistic multi-message email threads covering all classifications
│   ├── server.js                  # Express backend entry point
│   ├── .env                       # Backend environment configuration
│   └── package.json
│
└── client/
    ├── src/
    │   ├── context/
    │   │   └── AppContext.jsx     # Centralized state for user, active role, threads, and stats
    │   ├── components/
    │   │   ├── Navbar.jsx         # Role Switcher, Account Sync Pill, Action Triggers
    │   │   ├── OnboardingModal.jsx # Simulated OAuth flow for Gmail & Outlook
    │   │   ├── AssistantDashboard.jsx # 3-pane layout + KPI strip + AI Composer
    │   │   ├── ClientView.jsx     # Minimalist executive feed with Delegation
    │   │   ├── SimulateEmailModal.jsx # 3 one-click presets + live AI classifier
    │   │   └── AskAIDrawer.jsx    # Slide-over natural language inbox assistant
    │   ├── App.jsx                # Main layout + toast notifications
    │   ├── main.jsx
    │   └── index.css              # Tailwind directives & styles
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Start & Terminal Commands

### Step 1: Install Dependencies

From the project root directory (`email-assistant-dashboard`):

```bash
# Option A: One command to install root, server, and client packages
npm run install:all

# Option B: Or install individually
cd server && npm install
cd ../client && npm install
cd ..
npm install
```

### Step 2: (Optional) Set API Key in `server/.env`

If you have a Google Gemini or OpenAI API key, open `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/email_assistant_db
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** If no key is set, the built-in intelligent rule engine runs automatically with 100% precision!

### Step 3: Run the Monorepo

Start both `/server` (port 5000) and `/client` (port 5173) concurrently:

```bash
npm run dev
```

Or run them in separate terminal windows:

```bash
# Terminal 1 (Backend Server)
cd server
npm run dev

# Terminal 2 (Frontend Client)
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Interactive Walkthrough

1. **Role Toggling:**
   - Click **"Assistant View"** (Marcus Chen) in the top navigation bar to see the comprehensive 3-pane triage dashboard.
   - Click **"Client View"** (Elena Vance) to experience the minimalistic executive feed showing only items requiring CEO intervention.

2. **Simulate Incoming Email:**
   - Click the **"Simulate Email"** button in the navbar.
   - Pick one of the 3 presets (e.g. *Urgent Board Meeting Reschedule*, *Enterprise Term Sheet*, or *Cryptic Vendor Inquiry*).
   - Click **"Run AI Classification"** to watch the AI classify, score confidence, extract calendar events, and route the email in real-time.

3. **Client Delegation:**
   - In **Client View**, find any thread and click **"Delegate to Assistant"**.
   - Type instructions (e.g. *"Marcus, approve with a 5% cap"*).
   - Confirm delegation—the thread instantly transitions to `assistant_to_reply` with Elena's note attached!

4. **AI Reply Drafting:**
   - In **Assistant View**, pick a thread in the middle column.
   - In the right-hand pane, choose a tone (*Warm, Professional, Direct, Firm*).
   - Click **"Generate AI Draft"** to watch the AI tailor a reply on behalf of Elena Vance.
   - Edit the text and click **"Send & Mark Handled"**.

5. **Ask AI Inbox Copilot:**
   - Click **"Ask AI"** in the navbar to open the slide-over assistant.
   - Click any prompt like *"What am I waiting on?"* or *"Why is this assigned to the client?"*.
   - Click the referenced thread cards to navigate directly to that thread.

6. **Resetting Data:**
   - Click the circular refresh icon in the navbar at any time to re-seed the pristine 12-thread dataset.

