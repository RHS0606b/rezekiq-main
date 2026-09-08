import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/user/sync - Get latest cloud data for authenticated user
router.get('/sync', authMiddleware, (req, res) => {
  try {
    const data = db.getUserData(req.userId);
    if (!data) {
      return res.status(404).json({ error: 'Data progres pengguna belum ditemukan di cloud.' });
    }

    return res.json({
      success: true,
      data,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    console.error('Fetch sync error:', err);
    return res.status(500).json({ error: 'Gagal mengambil data dari cloud.' });
  }
});

// POST /api/user/sync - Push/save progress data to cloud
router.post('/sync', authMiddleware, (req, res) => {
  try {
    const { amalLog, journal, customAmalan, user, theme } = req.body;

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Payload data tidak valid.' });
    }

    const currentCloudData = db.getUserData(req.userId) || {};

    // Smart merge strategy:
    // 1. amalLog: merge dates
    const mergedAmalLog = { ...(currentCloudData.amalLog || {}) };
    if (amalLog && typeof amalLog === 'object') {
      Object.keys(amalLog).forEach(date => {
        mergedAmalLog[date] = {
          ...(mergedAmalLog[date] || {}),
          ...amalLog[date]
        };
      });
    }

    // 2. Journal: deduplicate by entry id
    const currentJournal = Array.isArray(currentCloudData.journal) ? currentCloudData.journal : [];
    const clientJournal = Array.isArray(journal) ? journal : [];
    const journalMap = new Map();
    // Put existing cloud first
    currentJournal.forEach(item => {
      if (item && item.id) journalMap.set(item.id, item);
    });
    // Overlay client journal
    clientJournal.forEach(item => {
      if (item && item.id) journalMap.set(item.id, item);
    });
    const mergedJournal = Array.from(journalMap.values()).sort((a, b) => {
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    // 3. Custom Amalan: deduplicate by id
    const currentCustom = Array.isArray(currentCloudData.customAmalan) ? currentCloudData.customAmalan : [];
    const clientCustom = Array.isArray(customAmalan) ? customAmalan : [];
    const customMap = new Map();
    currentCustom.forEach(c => { if (c && c.id) customMap.set(c.id, c); });
    clientCustom.forEach(c => { if (c && c.id) customMap.set(c.id, c); });
    const mergedCustomAmalan = Array.from(customMap.values());

    // 4. User profile / rewards / challenges
    const mergedRewards = Array.from(new Set([
      ...(currentCloudData.user?.earnedRewards || []),
      ...(user?.earnedRewards || [])
    ]));

    const mergedUser = {
      ...(currentCloudData.user || {}),
      ...(user || {}),
      earnedRewards: mergedRewards,
      id: req.userId // Always enforce correct user id
    };

    const payloadToSave = {
      amalLog: mergedAmalLog,
      journal: mergedJournal,
      customAmalan: mergedCustomAmalan,
      user: mergedUser,
      theme: theme || currentCloudData.theme || 'light'
    };

    const savedData = db.setUserData(req.userId, payloadToSave);

    return res.json({
      success: true,
      message: 'Progres berhasil disinkronkan ke cloud.',
      serverTime: new Date().toISOString(),
      data: savedData
    });
  } catch (err) {
    console.error('Save sync error:', err);
    return res.status(500).json({ error: 'Gagal menyinkronkan data ke cloud.' });
  }
});

// POST /api/user/backup - Create or download backup snapshot
router.get('/backup', authMiddleware, (req, res) => {
  try {
    const data = db.getUserData(req.userId);
    const user = db.getUserById(req.userId);
    const { password: _, ...safeUser } = user || {};

    return res.json({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: safeUser,
      data
    });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal membuat cadangan data.' });
  }
});

export default router;
