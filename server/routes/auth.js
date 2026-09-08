import express from 'express';
import { db } from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, gender, phoneNumber, initialData } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const { user, data } = await db.createUser({
      email,
      password,
      name,
      gender: gender || 'Laki-laki',
      phoneNumber: phoneNumber || ''
    });

    // If initial local data was sent from device during registration, merge it
    if (initialData && typeof initialData === 'object') {
      const mergedData = {
        amalLog: initialData.amalLog || data.amalLog,
        journal: Array.isArray(initialData.journal) && initialData.journal.length > 0 ? initialData.journal : data.journal,
        customAmalan: Array.isArray(initialData.customAmalan) ? initialData.customAmalan : data.customAmalan,
        theme: initialData.theme || data.theme,
        user: {
          ...data.user,
          niat: initialData.user?.niat || data.user.niat,
          spiritualGoal: initialData.user?.spiritualGoal || '',
          preferredRecitation: initialData.user?.preferredRecitation || '',
          earnedRewards: initialData.user?.earnedRewards || [],
          challenges: initialData.user?.challenges || [],
          selectedAmalanIds: initialData.user?.selectedAmalanIds || data.user.selectedAmalanIds
        }
      };
      db.setUserData(user.id, mergedData);
    }

    const finalData = db.getUserData(user.id);
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registrasi berhasil! Akun dan data cloud Anda telah aktif.',
      token,
      user,
      data: finalData
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(400).json({ error: err.message || 'Gagal mendaftarkan akun.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const isValid = await db.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);
    const data = db.getUserData(user.id);

    return res.json({
      message: 'Login berhasil! Selamat datang kembali.',
      token,
      user: safeUser,
      data: data || null
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan di sistem cloud.' });
    }

    const { password: _, ...safeUser } = user;
    const data = db.getUserData(user.id);

    return res.json({
      user: safeUser,
      data: data || null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal memverifikasi sesi pengguna.' });
  }
});

export default router;
