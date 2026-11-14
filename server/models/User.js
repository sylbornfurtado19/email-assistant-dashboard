import mongoose from 'mongoose';
import { inMemoryDB } from '../config/memoryStore.js';

const connectedAccountSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['gmail', 'outlook'],
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'syncing', 'error'],
    default: 'connected',
  },
  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Elena & Marcus Executive Suite',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: 'elena.vance@vancetech.io',
    },
    executiveName: {
      type: String,
      default: 'Elena Vance',
    },
    executiveTitle: {
      type: String,
      default: 'CEO & Founder',
    },
    assistantName: {
      type: String,
      default: 'Marcus Chen',
    },
    assistantTitle: {
      type: String,
      default: 'Chief of Staff / Executive Assistant',
    },
    activeRole: {
      type: String,
      enum: ['assistant', 'client'],
      default: 'assistant',
    },
    connectedAccounts: [connectedAccountSchema],
    settings: {
      aiConfidenceThreshold: {
        type: Number,
        default: 75,
      },
      autoArchiveNoReply: {
        type: Boolean,
        default: false,
      },
      defaultTone: {
        type: String,
        default: 'professional',
      },
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUserModel = mongoose.models.User || mongoose.model('User', userSchema);

// Proxy that routes to In-Memory DB if global.USE_IN_MEMORY_STORE is set
const UserProxy = new Proxy(MongooseUserModel, {
  get(target, prop) {
    if (global.USE_IN_MEMORY_STORE) {
      if (prop in inMemoryDB.users) {
        return inMemoryDB.users[prop].bind(inMemoryDB.users);
      }
    }
    return target[prop];
  },
});

export default UserProxy;
