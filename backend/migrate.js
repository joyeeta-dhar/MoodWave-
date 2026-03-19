require('dotenv').config();
const db = require('./config/database');

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Create user_feedback table
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.user_feedback (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        track_id TEXT NOT NULL,
        action TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table user_feedback created/verified.');

    // Update mood_history table
    await db.query(`
      ALTER TABLE public.mood_history 
      ADD COLUMN IF NOT EXISTS valence FLOAT,
      ADD COLUMN IF NOT EXISTS energy FLOAT,
      ADD COLUMN IF NOT EXISTS tempo FLOAT,
      ADD COLUMN IF NOT EXISTS explanation TEXT
    `);
    console.log('Columns added to mood_history.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
