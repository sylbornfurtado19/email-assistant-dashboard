import mongoose from 'mongoose';
import { inMemoryDB } from '../config/memoryStore.js';

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'external' },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isClient: { type: Boolean, default: false },
  },
  { _id: true }
);

const extractedEventSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const replyDraftSchema = new mongoose.Schema(
  {
    content: { type: String, default: '' },
    draftedByRole: { type: String, enum: ['assistant', 'client'], default: 'assistant' },
    tone: { type: String, default: 'professional' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const emailThreadSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    participants: [participantSchema],
    messages: [messageSchema],
    classification: {
      type: String,
      enum: ['assistant_to_reply', 'client_to_reply', 'no_reply_needed', 'needs_review'],
      default: 'needs_review',
      required: true,
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    aiReason: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    whyClientNeeded: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['meetings', 'action_required', 'waiting_for_response', 'important', 'general'],
      default: 'general',
      index: true,
    },
    extractedEvent: {
      type: extractedEventSchema,
      default: null,
    },
    delegationNote: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    replyDraft: {
      type: replyDraftSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailThreadSchema.index({
  subject: 'text',
  summary: 'text',
  'messages.body': 'text',
  'messages.senderName': 'text',
});

const MongooseThreadModel = mongoose.models.EmailThread || mongoose.model('EmailThread', emailThreadSchema);

// Proxy that routes to In-Memory DB if global.USE_IN_MEMORY_STORE is set
const EmailThreadProxy = new Proxy(MongooseThreadModel, {
  get(target, prop) {
    if (global.USE_IN_MEMORY_STORE) {
      if (prop in inMemoryDB.threads) {
        return inMemoryDB.threads[prop].bind(inMemoryDB.threads);
      }
    }
    return target[prop];
  },
});

export default EmailThreadProxy;
