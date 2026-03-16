const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const moodService = require('../services/moodService');
const musicService = require('../services/musicService');
const db = require('../config/database');

// Analyze mood
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    let userId = null;
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      if (token) userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (_) { /* not logged in — that's fine */ }

    const analysis = await moodService.analyzeMood(text);
    const tracks = await musicService.buildPlaylist(analysis.mood, analysis.musicProfile.tags);

    if (userId) {
      const moodResult = await db.query(
        'INSERT INTO mood_history (user_id, raw_input, detected_mood, confidence, emotion_scores) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, text, analysis.mood, analysis.confidence, analysis.scores]
      );
      await db.query(
        'INSERT INTO recommendations (mood_history_id, user_id, tracks) VALUES ($1, $2, $3)',
        [moodResult.rows[0].id, userId, JSON.stringify(tracks)]
      );
    }

    res.json({
      mood: analysis.mood,
      description: analysis.description,
      scores: analysis.scores,
      tracks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mood analysis failed' });
  }
});

// Get History
router.get('/history', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mh.*, r.tracks 
       FROM mood_history mh 
       LEFT JOIN recommendations r ON mh.id = r.mood_history_id 
       WHERE mh.user_id = $1 
       ORDER BY mh.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT detected_mood as mood, COUNT(*) as count FROM mood_history WHERE user_id = $1 GROUP BY detected_mood',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
