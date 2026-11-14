import express from 'express';
import User from '../models/User.js';
import EmailThread from '../models/EmailThread.js';
import { seedDatabase } from '../seed/seedData.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Retrieves the current executive suite user profile and connected accounts.
 */
router.get('/me', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      await seedDatabase();
      user = await User.findOne();
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching auth user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/demo
 * Auto-initializes or logs in the demo workspace.
 */
router.post('/demo', async (req, res) => {
  try {
    let user = await User.findOne();
    const threadCount = await EmailThread.countDocuments();
    if (!user || threadCount === 0) {
      const seeded = await seedDatabase();
      user = seeded.user;
    }
    return res.json({
      success: true,
      message: 'Demo workspace initialized successfully',
      user,
    });
  } catch (err) {
    console.error('Error initializing demo workspace:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/role
 * Toggles or sets the active role ('assistant' | 'client').
 */
router.post('/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['assistant', 'client'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified' });
    }
    let user = await User.findOne();
    if (!user) {
      await seedDatabase();
      user = await User.findOne();
    }
    user.activeRole = role;
    await user.save();
    return res.json({ success: true, activeRole: user.activeRole, user });
  } catch (err) {
    console.error('Error switching active role:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/connect
 * Simulates connecting a Gmail or Outlook account via OAuth.
 */
router.post('/connect', async (req, res) => {
  try {
    const { provider, email } = req.body;
    if (!['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({ success: false, error: 'Provider must be gmail or outlook' });
    }

    let user = await User.findOne();
    if (!user) {
      await seedDatabase();
      user = await User.findOne();
    }

    const targetEmail = email || (provider === 'gmail' ? 'elena.vance@vancetech.io' : 'elena.vance@board.oakmont.com');
    const existingIndex = user.connectedAccounts.findIndex((acc) => acc.provider === provider);

    if (existingIndex >= 0) {
      user.connectedAccounts[existingIndex].status = 'connected';
      user.connectedAccounts[existingIndex].email = targetEmail;
      user.connectedAccounts[existingIndex].lastSynced = new Date();
    } else {
      user.connectedAccounts.push({
        provider,
        email: targetEmail,
        status: 'connected',
        lastSynced: new Date(),
      });
    }

    await user.save();
    return res.json({
      success: true,
      message: `Successfully connected ${provider.toUpperCase()} account`,
      connectedAccounts: user.connectedAccounts,
    });
  } catch (err) {
    console.error('Error connecting account:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/disconnect
 * Simulates disconnecting a connected provider account.
 */
router.post('/disconnect', async (req, res) => {
  try {
    const { provider } = req.body;
    const user = await User.findOne();
    if (user) {
      const acc = user.connectedAccounts.find((a) => a.provider === provider);
      if (acc) {
        acc.status = 'disconnected';
        await user.save();
      }
    }
    return res.json({
      success: true,
      message: `Disconnected ${provider}`,
      connectedAccounts: user?.connectedAccounts || [],
    });
  } catch (err) {
    console.error('Error disconnecting account:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/auth/reset-demo
 * Resets the entire database with clean 12 seed threads and default users.
 */
router.post('/reset-demo', async (req, res) => {
  try {
    const result = await seedDatabase();
    return res.json({
      success: true,
      message: 'Workspace successfully reset to default 12 realistic threads',
      result,
    });
  } catch (err) {
    console.error('Error resetting demo workspace:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

