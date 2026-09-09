import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import syncRouter from './routes/sync.js';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB if MONGODB_URI is defined
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      db.isMongoConnected = true;
      console.log('✅ Berhasil terhubung ke MongoDB Cloud Database!');
    })
    .catch((err) => {
      console.error('❌ Gagal terhubung ke MongoDB, beralih ke local storage fallback:', err.message);
    });
} else {
  console.log('ℹ️ MONGODB_URI tidak ditemukan di .env. Berjalan dalam mode local storage (JSON file).');
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'RezekiQ Backend API',
    database: db.isCloudDb() ? 'MongoDB Cloud' : 'Local JSON Storage',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/user', syncRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan internal pada server cloud.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 RezekiQ Cloud Backend running on port ${PORT}`);
  console.log(`📡 Health check: /api/health`);
  console.log(`💾 Database mode: ${MONGODB_URI ? 'MongoDB (Atlas/Cloud)' : 'Local File'}`);
  console.log(`========================================`);
});
