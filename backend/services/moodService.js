// Mood categories and their music mapping
const MOOD_MUSIC_MAP = {
  happy: {
    tags: ['pop', 'dance', 'upbeat', 'feel-good', 'summer'],
    tempo: 'fast',
    energy: 'high',
  },
  sad: {
    tags: ['indie', 'acoustic', 'melancholic', 'slow', 'emotional'],
    tempo: 'slow',
    energy: 'low',
  },
  energetic: {
    tags: ['electronic', 'hip-hop', 'workout', 'edm', 'hype'],
    tempo: 'very-fast',
    energy: 'very-high',
  },
  calm: {
    tags: ['ambient', 'lo-fi', 'jazz', 'chill', 'meditation'],
    tempo: 'slow',
    energy: 'low',
  },
  stressed: {
    tags: ['classical', 'nature', 'ambient', 'breathing', 'relaxation'],
    tempo: 'slow',
    energy: 'very-low',
  },
  romantic: {
    tags: ['r&b', 'soul', 'love songs', 'slow dance', 'sensual'],
    tempo: 'medium',
    energy: 'medium',
  },
  nostalgic: {
    tags: ['80s', '90s', 'classic rock', 'retro', 'throwback'],
    tempo: 'medium',
    energy: 'medium',
  },
};

// Keyword lexicon for each mood
const MOOD_KEYWORDS = {
  happy: [
    'happy', 'joy', 'joyful', 'excited', 'great', 'wonderful', 'amazing', 'fantastic',
    'good', 'awesome', 'cheerful', 'elated', 'thrilled', 'delighted', 'glad', 'blessed',
    'ecstatic', 'euphoric', 'content', 'pleased', 'celebrate', 'celebrating', 'fun',
    'laugh', 'laughing', 'smile', 'smiling', 'positive', 'upbeat', 'bright', 'sunshine',
    'love today', 'feeling good',
  ],
  sad: [
    'sad', 'unhappy', 'depressed', 'cry', 'crying', 'tears', 'heartbroken', 'lonely',
    'alone', 'miss', 'missing', 'lost', 'hopeless', 'gloomy', 'blue', 'down', 'low',
    'hurt', 'pain', 'grief', 'sorrow', 'miserable', 'empty', 'broken', 'upset', 'melancholy',
    'disappointed', 'devastated', 'feel bad', 'not okay',
  ],
  energetic: [
    'energetic', 'pumped', 'hyped', 'hype', 'motivated', 'gym', 'workout', 'run', 'running',
    'exercise', 'powerful', 'strong', 'fired up', 'let\'s go', 'aggressive', 'intense',
    'adrenaline', 'active', 'hustle', 'grind', 'productive', 'unstoppable', 'focused',
    'determined', 'charged', 'electric', 'party',
  ],
  calm: [
    'calm', 'peaceful', 'relaxed', 'chill', 'chilling', 'serene', 'tranquil', 'quiet',
    'gentle', 'easy', 'mellow', 'soft', 'still', 'zen', 'meditat', 'rest', 'resting',
    'slow', 'lazy', 'cozy', 'comfortable', 'at peace', 'mindful', 'breathe', 'unwind',
    'wind down', 'laid back', 'sleepy',
  ],
  stressed: [
    'stress', 'stressed', 'anxiety', 'anxious', 'worried', 'worry', 'overwhelm', 'overwhelmed',
    'panic', 'nervous', 'tense', 'pressure', 'frustrated', 'frustrating', 'irritated',
    'angry', 'mad', 'furious', 'annoyed', 'exhausted', 'tired', 'burnout', 'burnt out',
    'too much', 'can\'t cope', 'need help',
  ],
  romantic: [
    'love', 'loving', 'romantic', 'romance', 'crush', 'date', 'dating', 'relationship',
    'partner', 'boyfriend', 'girlfriend', 'wife', 'husband', 'valentine', 'heart', 'adore',
    'affection', 'tender', 'intimate', 'passion', 'flirt', 'miss you', 'thinking of you',
    'in love',
  ],
  nostalgic: [
    'nostalgic', 'nostalgia', 'memories', 'remember', 'childhood', 'old times', 'throwback',
    'miss the old', 'back in the day', 'retro', 'vintage', 'classic', 'used to', 'long ago',
    'years ago', 'past', 'school', 'teenager', 'grew up', 'simpler times',
  ],
};

const MOOD_DESCRIPTIONS = {
  happy: 'You\'re radiating positive energy and joy right now!',
  sad: 'You seem to be going through a tough emotional time.',
  energetic: 'You\'re full of energy and ready to conquer the world!',
  calm: 'You\'re in a peaceful, relaxed state of mind.',
  stressed: 'You seem to be feeling a bit overwhelmed or tense.',
  romantic: 'Love is in the air — you\'re feeling warm and affectionate.',
  nostalgic: 'You\'re in a reflective mood, reminiscing about the past.',
};

/**
 * Analyze user text and classify mood using keyword matching
 * @param {string} text - User's mood input
 * @returns {Object} { mood, confidence, scores, description }
 */
async function analyzeMood(text) {
  const lower = text.toLowerCase();
  const scores = {};

  // Score each mood by counting keyword matches
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += 1;
      }
    }
    scores[mood] = score;
  }

  // Find mood with highest score
  let topMood = 'calm';
  let topScore = 0;
  for (const [mood, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topMood = mood;
    }
  }

  // Normalize scores to 0-1 range
  const maxRaw = Math.max(...Object.values(scores), 1);
  const normalizedScores = {};
  for (const mood of Object.keys(MOOD_KEYWORDS)) {
    normalizedScores[mood] = parseFloat((scores[mood] / maxRaw).toFixed(2));
  }

  const confidence = topScore > 0
    ? parseFloat(Math.min(0.5 + (topScore * 0.15), 0.95).toFixed(2))
    : 0.4;

  const result = {
    mood: topMood,
    confidence,
    scores: normalizedScores,
    description: MOOD_DESCRIPTIONS[topMood],
    musicProfile: MOOD_MUSIC_MAP[topMood],
  };

  return result;
}

module.exports = { analyzeMood, MOOD_MUSIC_MAP };
