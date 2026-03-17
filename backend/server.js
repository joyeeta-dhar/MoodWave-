require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.vercel\.app$/,  // allow all Vercel preview deployments
  ],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiting ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests, please slow down.' },
});

// Tighter limit for AI mood analysis
const moodLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Mood analysis limit reached. Wait a minute.' },
});

app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodLimiter, moodRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Debug endpoint – check env vars + DB connectivity
app.get('/api/debug', async (req, res) => {
  const db = require('./config/database');
  let dbStatus = 'unknown';
  let dbError = null;
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'failed';
    dbError = e.message;
  }
  res.json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'set (' + process.env.DATABASE_URL.slice(0, 30) + '...)' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'not set',
    },
    db: { status: dbStatus, error: dbError },
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🎵 MoodWave API running on port ${PORT}`);
  });
}

module.exports = app;
