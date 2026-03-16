-- ============================================================
-- MoodWave Database Schema (PostgreSQL / Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MOOD HISTORY ─────────────────────────────────────────────
CREATE TABLE mood_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  raw_input       TEXT NOT NULL,                -- user's raw typed text
  detected_mood   TEXT NOT NULL,                -- happy | sad | energetic | calm | stressed | romantic | nostalgic
  confidence      FLOAT DEFAULT 0.0,            -- AI confidence 0–1
  emotion_scores  JSONB,                        -- { happy: 0.8, sad: 0.1, ... }
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RECOMMENDATIONS ──────────────────────────────────────────
CREATE TABLE recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_history_id UUID REFERENCES mood_history(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  tracks          JSONB NOT NULL,               -- array of track objects
  playlist_title  TEXT,
  source          TEXT DEFAULT 'lastfm',        -- lastfm | deezer | manual
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SAVED PLAYLISTS ──────────────────────────────────────────
CREATE TABLE saved_playlists (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  tracks            JSONB NOT NULL,
  mood              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_mood_history_user    ON mood_history(user_id);
CREATE INDEX idx_mood_history_mood    ON mood_history(detected_mood);
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_saved_playlists_user ON saved_playlists(user_id);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
