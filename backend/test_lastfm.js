const axios = require('axios');
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_KEY = 'a1640de378d6565009a6c2bd2e8cc7f5';

async function test() {
  try {
    const res = await axios.get(LASTFM_BASE, {
      params: {
        method: 'artist.gettoptracks',
        artist: 'Arijit Singh',
        api_key: LASTFM_KEY,
        format: 'json',
        limit: 5,
      },
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

test();
