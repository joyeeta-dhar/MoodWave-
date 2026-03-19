const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_KEY = process.env.LASTFM_API_KEY;

// Curated seed artists per mood for quality results
const MOOD_SEED_ARTISTS = {
  happy: ['Pharrell Williams', 'Lizzo', 'Dua Lipa', 'Harry Styles', 'Justin Timberlake'],
  sad: ['Phoebe Bridgers', 'Bon Iver', 'Sufjan Stevens', 'Elliott Smith', 'Lana Del Rey'],
  energetic: ['The Weeknd', 'Travis Scott', 'Doja Cat', 'Post Malone', 'Kendrick Lamar'],
  calm: ['Frank Ocean', 'Rex Orange County', 'Tame Impala', 'Beach House', 'Cigarettes After Sex'],
  stressed: ['Brian Eno', 'Nils Frahm', 'Max Richter', 'Ólafur Arnalds', 'Ludovico Einaudi'],
  romantic: ['John Legend', 'Daniel Caesar', 'H.E.R.', 'SZA', 'Bruno Mars'],
  nostalgic: ['Fleetwood Mac', 'The Cure', 'New Order', 'Talking Heads', 'Radiohead'],
};

/**
 * Fetch tracks from Last.fm based on mood tags
 */
async function fetchTracksByTag(tag, limit = 10) {
  try {
    const res = await axios.get(LASTFM_BASE, {
      params: {
        method: 'tag.gettoptracks',
        tag,
        api_key: LASTFM_KEY,
        format: 'json',
        limit,
      },
    });

    const tracks = res.data?.tracks?.track || [];
    return tracks.map(formatTrack);
  } catch {
    return [];
  }
}

/**
 * Fetch similar artists' top tracks
 */
async function fetchArtistTopTracks(artist, limit = 3) {
  try {
    const res = await axios.get(LASTFM_BASE, {
      params: {
        method: 'artist.gettoptracks',
        artist,
        api_key: LASTFM_KEY,
        format: 'json',
        limit,
      },
    });

    const tracks = res.data?.toptracks?.track || [];
    return tracks.map(formatTrack);
  } catch {
    return [];
  }
}

/**
 * Normalize track object
 */
function formatTrack(track) {
  const images = track.image || [];
  let albumArt =
    images.find((i) => i.size === 'extralarge')?.['#text'] ||
    images.find((i) => i.size === 'large')?.['#text'] ||
    images[images.length - 1]?.['#text'] ||
    null;

  if (albumArt && albumArt.includes('2a96cbd8b46e442fc41c2b86b821562f')) albumArt = null;

  const fallbackImg = `https://picsum.photos/seed/${encodeURIComponent((track.name || '') + (track.artist?.name || track.artist || ''))}/300/300`;

  return {
    id: `${track.artist?.name || track.artist}-${track.name}`.replace(/\s+/g, '-').toLowerCase(),
    title: track.name,
    artist: track.artist?.name || track.artist || 'Unknown Artist',
    albumArt: albumArt || fallbackImg,
    playUrl: track.url,
    listeners: parseInt(track.listeners || 0, 10),
  };
}


/**
 * Build a full playlist for a detected mood with AI explanations and user learning
 */
async function buildPlaylist(moodResult, userId = null) {
  // Support old signature (mood, tags) by checking types
  let mood, tags, valence, energy, tempo, artists;
  
  if (typeof moodResult === 'string') {
    mood = moodResult;
    tags = arguments[1] || [];
    valence = 0.5; energy = 0.5; tempo = 100;
    artists = [];
  } else {
    ({ mood, musicProfile: { tags }, valence, energy, tempo, artists } = moodResult);
  }

  const seeds = MOOD_SEED_ARTISTS[mood] || MOOD_SEED_ARTISTS.calm;
  const primaryTag = (tags && tags[0]) || mood;

  // 1. Fetch tracks in parallel
  // If artists are mentioned, we fetch more for them (up to 10 each)
  const artistQueries = (artists || []).slice(0, 3).map((a) => fetchArtistTopTracks(a, 10));
  
  const [tagTracks, seedArtistTracks, mentionedArtistTracks] = await Promise.all([
    fetchTracksByTag(primaryTag, 15),
    Promise.all(seeds.slice(0, 2).map((a) => fetchArtistTopTracks(a, 5))),
    Promise.all(artistQueries),
  ]);

  // Combine and de-duplicate
  let combined = [...mentionedArtistTracks.flat(), ...seedArtistTracks.flat(), ...tagTracks];
  
  // Extra filter: if "hindi" is in tags, ensure we favor tracks that mention hindi or are from the mentioned hindi artists
  if (tags && tags.some(t => t.toLowerCase() === 'hindi')) {
    const hindiTracks = combined.filter(t => 
      t.artist.toLowerCase().includes('singh') || 
      t.artist.toLowerCase().includes('aslam') ||
      t.artist.toLowerCase().includes('nigam') ||
      t.title.toLowerCase().includes('hindi')
    );
    const nonHindi = combined.filter(t => !hindiTracks.includes(t));
    combined = [...hindiTracks, ...nonHindi];
  }

  // 2. Apply Learning Loop (Filter skips & Boost likes)
  if (userId) {
    try {
      // Fetch all recent feedback
      const { rows: feedbackRows } = await db.query(
        "SELECT track_id, action FROM public.user_feedback WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'",
        [userId]
      );
      
      const skippedIds = new Set(feedbackRows.filter(r => r.action === 'skip').map(r => r.track_id));
      const likedIds = new Set(feedbackRows.filter(r => r.action === 'like' || r.action === 'replay').map(r => r.track_id));
      
      if (skippedIds.size > 0) {
        combined = combined.filter(track => !skippedIds.has(track.id));
      }
      
      // Boost liked tracks by moving them to the front if they appear in our new fetch
      const likedInPool = combined.filter(t => likedIds.has(t.id));
      const others = combined.filter(t => !likedIds.has(t.id));
      combined = [...likedInPool, ...others];
    } catch (err) {
      console.error('Feedback filtering/boosting failed:', err);
    }
  }

  // 3. Deduplicate
  const seen = new Set();
  const unique = combined.filter((t) => {
    const key = `${t.title}-${t.artist}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const finalTracks = unique.slice(0, 10);

  // 4. AI Explanation Engine
  try {
    const tracksSummary = finalTracks.map(t => `${t.title} by ${t.artist}`).join(', ');
    const explanationPrompt = `
      The user mood is "${mood}" (Valence: ${valence}, Energy: ${energy}, Tempo: ${tempo} BPM).
      Provide a specific reason (max 12 words) why each of these songs fits this mood.
      Tracks: ${tracksSummary}
      Return ONLY a JSON array of strings in the exact same order.
    `;

    const aiRes = await model.generateContent(explanationPrompt);
    const explanations = JSON.parse(aiRes.response.text().replace(/```json|```/g, '').trim());
    
    finalTracks.forEach((track, i) => {
      track.aiExplanation = explanations[i] || `Matches your current ${mood} vibe perfectly.`;
    });
  } catch (err) {
    console.error('AI Explanation Engine failed:', err);
    finalTracks.forEach(t => t.aiExplanation = `Great match for your ${mood} mood.`);
  }

  return finalTracks;
}

module.exports = { buildPlaylist };
