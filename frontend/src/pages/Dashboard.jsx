import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMood } from '../hooks/useMood'
import { useAuth } from '../hooks/useAuth'
import TrackCard from '../components/ui/TrackCard'

const MOOD_DESCRIPTIONS = {
  happy:     { emoji: '😄', title: 'Feeling Happy',     sub: 'Bright & uplifting tracks queued' },
  sad:       { emoji: '🌧', title: 'Feeling Blue',      sub: 'Melancholic tunes for your heart' },
  energetic: { emoji: '⚡', title: 'Full Energy',       sub: 'High-octane bangers incoming' },
  calm:      { emoji: '🌿', title: 'Calm & Centered',   sub: 'Peaceful sounds for clarity' },
  stressed:  { emoji: '😤', title: 'Need Relief',       sub: 'Soothing tracks to decompress' },
  romantic:  { emoji: '💫', title: 'In the Feels',      sub: 'Smooth and romantic vibes' },
  nostalgic: { emoji: '🎞', title: 'Throwback Mode',    sub: 'Timeless hits for your soul' },
}

function MoodMeter({ scores = {} }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 5)
  return (
    <div className="space-y-2.5">
      {sorted.map(([mood, score]) => (
        <div key={mood} className="flex items-center gap-3">
          <span className="text-xs capitalize font-body opacity-50 w-20">{mood}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score * 100}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'var(--mood-primary)' }}
            />
          </div>
          <span className="text-xs font-mono opacity-30 w-8 text-right">
            {Math.round(score * 100)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { mood, moodData, tracks } = useMood()
  const { user } = useAuth()
  const info = MOOD_DESCRIPTIONS[mood] || MOOD_DESCRIPTIONS.calm

  if (!moodData) {
    return (
      <motion.main
        key="dashboard-empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="font-display font-bold text-2xl mb-2">No mood detected yet</h2>
          <p className="text-sm opacity-40 font-body mb-6">Head back home and tell us how you feel.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-2xl font-display font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--mood-primary), var(--mood-secondary))',
              color: 'var(--mood-bg-from)',
            }}
          >
            ← Detect My Mood
          </Link>
        </div>
      </motion.main>
    )
  }

  return (
    <motion.main
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-24 md:py-32"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="text-5xl">{info.emoji}</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mt-2 mb-1">
            {info.title}
          </h1>
          <p className="opacity-40 font-body">{info.sub}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Mood breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50 mb-4">
              Emotion Breakdown
            </h3>
            <MoodMeter scores={moodData.scores} />
          </motion.div>

          {/* AI description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50 mb-3">
                AI Insight
              </h3>
              <p className="font-body text-sm leading-relaxed opacity-80">
                {moodData.description}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-xs font-mono opacity-30">Confidence: </span>
              <span className="text-xs font-mono" style={{ color: 'var(--mood-primary)' }}>
                {Math.round(moodData.confidence * 100)}%
              </span>
            </div>
          </motion.div>

          {/* Music tags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50 mb-4">
              Music Profile
            </h3>
            <div className="flex flex-wrap gap-2">
              {moodData.musicProfile?.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1.5 rounded-xl capitalize glass"
                  style={{ borderColor: 'var(--mood-card-border)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="opacity-40 font-mono">Tempo</span>
                <span className="capitalize font-mono" style={{ color: 'var(--mood-primary)' }}>
                  {moodData.musicProfile?.tempo}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="opacity-40 font-mono">Energy</span>
                <span className="capitalize font-mono" style={{ color: 'var(--mood-primary)' }}>
                  {moodData.musicProfile?.energy}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tracks */}
        {tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl gradient-text">
                Your Playlist
              </h2>
              <Link
                to="/"
                className="text-xs font-mono opacity-40 hover:opacity-70 transition-opacity"
              >
                ← New mood
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tracks.map((track, i) => (
                <TrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  )
}
