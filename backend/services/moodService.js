const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure dotenv is loaded if not already (mostly for local tests)
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mood categories and their music mapping
const MOOD_MUSIC_MAP = {
  happy: { tags: ['pop', 'dance', 'upbeat', 'feel-good', 'summer'], tempo: 'fast', energy: 'high' },
  sad: { tags: ['indie', 'acoustic', 'melancholic', 'slow', 'emotional'], tempo: 'slow', energy: 'low' },
  energetic: { tags: ['electronic', 'hip-hop', 'workout', 'edm', 'hype'], tempo: 'very-fast', energy: 'high' },
  calm: { tags: ['ambient', 'lo-fi', 'jazz', 'chill', 'meditation'], tempo: 'slow', energy: 'low' },
  stressed: { tags: ['classical', 'nature', 'ambient', 'relaxation'], tempo: 'slow', energy: 'low' },
  romantic: { tags: ['r&b', 'soul', 'love songs', 'slow dance'], tempo: 'medium', energy: 'medium' },
  nostalgic: { tags: ['80s', '90s', 'classic rock', 'retro'], tempo: 'medium', energy: 'medium' },
};

const MOOD_KEYWORDS = {
  happy: ['happy', 'joy', 'joyful', 'excited', 'good', 'wonderful'],
  sad: ['sad', 'unhappy', 'depressed', 'cry', 'lonely', 'miss', 'broken'],
  energetic: ['energetic', 'pumped', 'hyped', 'workout', 'gym', 'run'],
  calm: ['calm', 'peaceful', 'relaxed', 'chill', 'relaxing'],
  stressed: ['stress', 'stressed', 'anxious', 'panic', 'tense'],
  romantic: ['love', 'romantic', 'romance', 'crush', 'date'],
  nostalgic: ['nostalgic', 'memories', 'remember', 'throwback'],
};

/**
 * Analyze user text and classify mood using Gemini
 */
async function analyzeMood(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY missing, using fallback.");
    return fallbackAnalyzeMood(text);
  }

  const prompt = `
    You are a music recommendation engine for MoodWave.
    Convert the following user input into a structured emotional and musical profile.
    
    User Input: "${text}"

    Return ONLY a JSON object with this exact structure:
    {
      "mood": "one of [happy, sad, calm, energetic, romantic, focused, stressed, nostalgic]",
      "energy": "one of [low, medium, high]",
      "genres": ["max 3 genres"],
      "artists": ["list of specific artists mentioned by the user - e.g. Arijit Singh, Atif Aslam"],
      "language": "e.g., English, Hindi, or 'Any'",
      "keywords": ["context like breakup, party, study, travel, rainy, coffee, etc."],
      "valence": 0.0 to 1.0,
      "energy_score": 0.0 to 1.0,
      "tempo": estimated BPM (60 to 180),
      "explanation": "max 15 words explanation"
    }

    Special Rule: If the user mentions "songs of [Artist]" or "[Artist] songs", ensure [Artist] is in the 'artists' list.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonStr);

    const primaryMood = ['happy', 'sad', 'energetic', 'calm', 'stressed', 'romantic', 'nostalgic'].includes(data.mood) 
      ? data.mood : 'calm';

    const scores = {};
    ['happy', 'sad', 'energetic', 'calm', 'stressed', 'romantic', 'nostalgic'].forEach(m => {
      scores[m] = m === primaryMood ? 0.9 : 0.05 + (Math.random() * 0.1);
    });

    // Smart Tagging: Include language if specified
    const extraTags = [];
    if (data.language && data.language.toLowerCase() !== 'any') {
      extraTags.push(data.language.toLowerCase());
      extraTags.push(`${data.language.toLowerCase()} pop`);
    }

    return {
      mood: primaryMood,
      confidence: 0.95,
      scores,
      description: data.explanation,
      valence: data.valence,
      energy: data.energy_score || 0.5,
      tempo: data.tempo || 100,
      artists: data.artists || [],
      musicProfile: {
        tags: [...extraTags, ...(data.genres || []), ...(data.keywords || []), ...(MOOD_MUSIC_MAP[primaryMood]?.tags || [])],
        tempo: data.energy === 'high' ? 'fast' : 'slow',
      }
    };
  } catch (err) {
    console.error('Gemini Analysis Failed:', err);
    return fallbackAnalyzeMood(text);
  }
}

/**
 * Fallback with basic regex for artists
 */
function fallbackAnalyzeMood(text) {
  const lower = text.toLowerCase();
  
  // Basic Artist Extraction Regex
  const artistRegex = /(?:by|of|play|like)\s+([a-zA-Z\s]+?)(?:\s+songs|\s+tracks|\.|$)/gi;
  const artists = [];
  let match;
  while ((match = artistRegex.exec(text)) !== null) {
    if (match[1].trim().split(' ').length <= 3) {
      artists.push(match[1].trim());
    }
  }

  // Common Hindi Artist Hard-check
  if (lower.includes('arijit singh')) artists.push('Arijit Singh');
  if (lower.includes('atif aslam')) artists.push('Atif Aslam');
  if (lower.includes('sonu nigam')) artists.push('Sonu Nigam');
  if (lower.includes('hindi')) artists.push('Hindi');

  const scores = {};
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) if (lower.includes(kw)) score += 1;
    scores[mood] = score;
  }

  let topMood = 'calm';
  let topScore = 0;
  for (const [mood, score] of Object.entries(scores)) {
    if (score > topScore) { topScore = score; topMood = mood; }
  }

  const normalizedScores = {};
  for (const mood of Object.keys(MOOD_KEYWORDS)) normalizedScores[mood] = mood === topMood ? 0.8 : 0.1;

  const extraTags = [];
  if (lower.includes('hindi')) extraTags.push('hindi');

  return {
    mood: topMood,
    confidence: 0.4,
    scores: normalizedScores,
    description: `Returning ${topMood} vibes${artists.length ? ` with ${artists[0]}` : ''}.`,
    valence: topMood === 'happy' ? 0.8 : 0.5,
    energy: topMood === 'energetic' ? 0.9 : 0.4,
    tempo: 100,
    artists,
    musicProfile: {
      tags: [...extraTags, ...(MOOD_MUSIC_MAP[topMood]?.tags || [])],
      tempo: 'medium'
    }
  };
}

module.exports = { analyzeMood, fallbackAnalyzeMood };
