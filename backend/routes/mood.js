const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const moodService = require('../services/moodService');
const musicService = require('../services/musicService');
const db = require('../config/database');

/**
 * Analyze mood and get smart recommendations
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    let userId = null;
    
    // Attempt to get userId from token if provided
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) { /* continue as guest */ }

    // 1. Multi-vector mood analysis via Gemini
    const analysis = await moodService.analyzeMood(text);
    
    // 2. Build personalized playlist with AI explanations & skip filtering
    const tracks = await musicService.buildPlaylist(analysis, userId);

    // 3. Store history if logged in
    if (userId) {
      try {
        const moodResult = await db.query(
          `INSERT INTO public.mood_history 
           (user_id, raw_input, detected_mood, confidence, emotion_scores, valence, energy, tempo, explanation) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            userId, 
            text, 
            analysis.mood, 
            analysis.confidence, 
            analysis.scores, 
            analysis.valence, 
            analysis.energy, 
            analysis.tempo, 
            analysis.description
          ]
        );

        await db.query(
          'INSERT INTO public.recommendations (mood_history_id, user_id, tracks) VALUES ($1, $2, $3)',
          [moodResult.rows[0].id, userId, JSON.stringify(tracks)]
        );
      } catch (dbErr) {
        console.error('Failed to store mood history:', dbErr);
      }
    }

    res.json({
      mood: analysis.mood,
      description: analysis.description,
      scores: analysis.scores,
      tracks,
      valence: analysis.valence,
      energy: analysis.energy,
      tempo: analysis.tempo,
      rawInput: text
    });
  } catch (err) {
    console.error('Mood Analysis Endpoint Failed:', err);
    res.status(500).json({ error: 'Mood analysis failed. Please try again later.' });
  }
});

/**
 * Record user feedback (skips, likes, replays) for the learning loop
 */
router.post('/feedback', auth, async (req, res) => {
  try {
    const { trackId, action } = req.body;
    
    if (!trackId || !['skip', 'like', 'replay'].includes(action)) {
      return res.status(400).json({ error: 'Invalid feedback data' });
    }

    await db.query(
      'INSERT INTO public.user_feedback (user_id, track_id, action) VALUES ($1, $2, $3)',
      [req.user.id, trackId, action]
    );

    res.json({ success: true, message: 'Feedback recorded' });
  } catch (err) {
    console.error('Feedback recording failed:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

/**
 * Get History
 */
router.get('/history', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mh.*, r.tracks 
       FROM public.mood_history mh 
       LEFT JOIN public.recommendations r ON mh.id = r.mood_history_id 
       WHERE mh.user_id = $1 
       ORDER BY mh.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * Get Stats
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT detected_mood as mood, COUNT(*) as count FROM public.mood_history WHERE user_id = $1 GROUP BY detected_mood',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
