import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import EmailThread from './models/EmailThread.js';
import User from './models/User.js';
import { seedDatabase } from './seed/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AetherInbox AI Server',
    llmMode: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'rule-based-intelligent-engine',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Static Production Frontend Hosting (if built)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server and Auto-Seed if needed
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is brand new
    const threadCount = await EmailThread.countDocuments();
    const userCount = await User.countDocuments();
    if (threadCount === 0 || userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial 12 realistic executive threads...');
      await seedDatabase();
    } else {
      console.log(`[Server] Database contains ${threadCount} threads and ${userCount} user profile.`);
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 AetherInbox AI Server running on: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📧 Emails API: http://localhost:${PORT}/api/emails`);
      console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini Live API' : 'Smart Rule-Based AI Engine'}`);
      console.log('====================================================');
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(async () => {
        await closeDB();
        console.log('[Server] Closed HTTP and database connections. Bye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Fatal startup failure:', err);
    process.exit(1);
  }
};

startServer();

