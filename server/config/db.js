import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let memoryServerInstance = null;

export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/email_assistant_db';

  // Attempt 1: Connect to provided or default MongoDB instance
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${primaryUri}...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000, // Quick timeout to fail fast if local mongod is not running
    });
    console.log(`[Database] Connected to external MongoDB host: ${conn.connection.host}`);
    global.USE_IN_MEMORY_STORE = false;
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${err.message}).`);
  }

  // Attempt 2: Zero-config in-memory MongoDB server
  try {
    if (!memoryServerInstance) {
      console.log('[Database] Spinning up mongodb-memory-server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'email_assistant_memory_db',
        },
      });
    }
    const memoryUri = memoryServerInstance.getUri();
    console.log(`[Database] In-memory MongoDB active at: ${memoryUri}`);

    const conn = await mongoose.connect(memoryUri);
    console.log('[Database] Mongoose successfully connected to in-memory MongoDB!');
    global.USE_IN_MEMORY_STORE = false;
    return conn;
  } catch (memErr) {
    console.warn(`[Database] mongodb-memory-server not available (${memErr.message}).`);
  }

  // Attempt 3: Pure JavaScript in-memory resilient fallback
  console.log('⚡ [Database] Using lightning-fast zero-dependency In-Memory Store.');
  global.USE_IN_MEMORY_STORE = true;
  return {
    connection: { host: 'memory://zero-config-store' },
  };
};

export const closeDB = async () => {
  try {
    if (!global.USE_IN_MEMORY_STORE && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
  } catch (err) {
    console.error('[Database] Error closing DB connection:', err);
  }
};
