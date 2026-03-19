require('dotenv').config();
const { analyzeMood } = require('./services/moodService');

async function testExtraction() {
  const inputs = [
    "I want some Arijit Singh songs",
    "Feeling romantic, play Atif Aslam",
    "I like Arijit Singh and some sad indie music",
    "Show me some songs by Sonu Nigam"
  ];

  for (const input of inputs) {
    console.log(`\nTesting: "${input}"`);
    const result = await analyzeMood(input);
    console.log(`Mood: ${result.mood}`);
    console.log(`Artists: ${JSON.stringify(result.artists)}`);
    console.log(`Music Profile Tags: ${JSON.stringify(result.musicProfile?.tags)}`);
  }
}

testExtraction();
