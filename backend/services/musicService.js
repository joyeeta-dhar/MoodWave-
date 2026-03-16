const axios = require('axios');

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
 * Fetch similar artists' top tracks for better personalization
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
 * Normalize track object from Last.fm response
 */
function formatTrack(track) {
  const images = track.image || [];
  let albumArt =
    images.find((i) => i.size === 'extralarge')?.['#text'] ||
    images.find((i) => i.size === 'large')?.['#text'] ||
    images[images.length - 1]?.['#text'] ||
    null;

  // Last.fm returns a default star avatar when it has no art - ignore it so our dynamic fallback kicks in
  if (albumArt && albumArt.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
    albumArt = null;
  }

  // To ensure the placeholders are vibrant and varied, use a styled UI Avatar fallback 
  // or a more reliable photo placeholder.
  const fallbackImg = `https://picsum.photos/seed/${encodeURIComponent(track.name + track.artist)}/300/300`;

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
 * Build a full playlist for a detected mood
 * @param {string} mood - Detected mood key
 * @param {string[]} tags - Music tags from mood profile
 * @returns {Object[]} Array of track objects
 */
async function buildPlaylist(mood, tags = []) {
  const seeds = MOOD_SEED_ARTISTS[mood] || MOOD_SEED_ARTISTS.calm;
  const primaryTag = tags[0] || mood;

  const [tagTracks, ...artistTrackArrays] = await Promise.all([
    fetchTracksByTag(primaryTag, 8),
    ...seeds.slice(0, 3).map((a) => fetchArtistTopTracks(a, 2)),
  ]);

  const artistTracks = artistTrackArrays.flat();
  const combined = [...tagTracks, ...artistTracks];

  // Deduplicate by title+artist
  const seen = new Set();
  const unique = combined.filter((t) => {
    const key = `${t.title}-${t.artist}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // If API failed / no key, return curated fallback
  if (unique.length < 5) return getFallbackPlaylist(mood);

  return unique.slice(0, 15);
}

/**
 * Static fallback playlist when API is unavailable
 */
function getFallbackPlaylist(mood) {
  const fallbacks = {
    happy: [
      { id: 'h1', title: 'Happy', artist: 'Pharrell Williams', albumArt: 'https://picsum.photos/seed/happy1/300/300', playUrl: 'https://www.youtube.com/results?search_query=Pharrell+Williams+Happy', listeners: 9000000 },
      { id: 'h2', title: 'Good as Hell', artist: 'Lizzo', albumArt: 'https://picsum.photos/seed/happy2/300/300', playUrl: 'https://www.youtube.com/results?search_query=Lizzo+Good+as+Hell', listeners: 7000000 },
      { id: 'h3', title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://picsum.photos/seed/happy3/300/300', playUrl: 'https://www.youtube.com/results?search_query=Dua+Lipa+Levitating', listeners: 8500000 },
    ],
    sad: [
      { id: 's1', title: 'Motion Sickness', artist: 'Phoebe Bridgers', albumArt: 'https://picsum.photos/seed/sad1/300/300', playUrl: 'https://www.youtube.com/results?search_query=Phoebe+Bridgers+Motion+Sickness', listeners: 2000000 },
      { id: 's2', title: 'Skinny Love', artist: 'Bon Iver', albumArt: 'https://picsum.photos/seed/sad2/300/300', playUrl: 'https://www.youtube.com/results?search_query=Bon+Iver+Skinny+Love', listeners: 4000000 },
    ],
    energetic: [
      { id: 'e1', title: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://picsum.photos/seed/energetic1/300/300', playUrl: 'https://www.youtube.com/results?search_query=The+Weeknd+Blinding+Lights', listeners: 12000000 },
      { id: 'e2', title: 'SICKO MODE', artist: 'Travis Scott', albumArt: 'https://picsum.photos/seed/energetic2/300/300', playUrl: 'https://www.youtube.com/results?search_query=Travis+Scott+Sicko+Mode', listeners: 10000000 },
    ],
    calm: [
      { id: 'c1', title: 'Nights', artist: 'Frank Ocean', albumArt: 'https://picsum.photos/seed/calm1/300/300', playUrl: 'https://www.youtube.com/results?search_query=Frank+Ocean+Nights', listeners: 5000000 },
      { id: 'c2', title: 'The Less I Know The Better', artist: 'Tame Impala', albumArt: 'https://picsum.photos/seed/calm2/300/300', playUrl: 'https://www.youtube.com/results?search_query=Tame+Impala+Less+I+Know', listeners: 6000000 },
    ],
  };
  return fallbacks[mood] || fallbacks.calm;
}

module.exports = { buildPlaylist };
