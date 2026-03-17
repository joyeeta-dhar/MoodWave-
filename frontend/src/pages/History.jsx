import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMood } from '../hooks/useMood'
import api from '../services/api'

const MOOD_EMOJI = {
  happy: '😄', sad: '🌧', energetic: '⚡', calm: '🌿',
  stressed: '😤', romantic: '💫', nostalgic: '🎞',
}

const MOOD_COLOR = {
  happy: '#fbbf24', sad: '#60a5fa', energetic: '#f472b6',
  calm: '#34d399', stressed: '#fb923c', romantic: '#f43f5e', nostalgic: '#a78bfa',
}

function StatBar({ mood, count, max }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-24 capitalize font-body opacity-70">{mood}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(count / max) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: MOOD_COLOR[mood] || '#a78bfa' }}
        />
      </div>
      <span className="text-xs font-mono opacity-40 w-6 text-right">{count}</span>
    </div>
  )
}

function HistoryCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
  const tracks = Array.isArray(entry.tracks) ? entry.tracks : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/5 transition-colors"
      >
        {/* Mood icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${MOOD_COLOR[entry.detected_mood]}22` }}
        >
          {MOOD_EMOJI[entry.detected_mood] || '🎵'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full capitalize"
              style={{
                background: `${MOOD_COLOR[entry.detected_mood]}22`,
                color: MOOD_COLOR[entry.detected_mood],
              }}
            >
              {entry.detected_mood}
            </span>
            <span className="text-xs opacity-30 font-mono">
              {new Date(entry.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm opacity-60 font-body truncate">"{entry.raw_input}"</p>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-30 text-sm flex-shrink-0"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && tracks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5">
              <p className="text-xs font-mono opacity-30 uppercase tracking-widest mt-4 mb-3">
                Playlist · {tracks.length} tracks
              </p>
              <div className="space-y-2">
                {tracks.slice(0, 5).map((track, i) => (
                  <a
                    key={i}
                    href={track.playUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${i}/32/32` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display truncate">{track.title}</p>
                      <p className="text-xs opacity-40 font-body truncate">{track.artist}</p>
                    </div>
                    <span className="opacity-0 group-hover:opacity-40 text-xs transition-opacity">▶</span>
                  </a>
                ))}
                {tracks.length > 5 && (
                  <p className="text-xs opacity-30 font-mono pl-2">+{tracks.length - 5} more tracks</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function History() {
  const { user } = useAuth()
  const { mood } = useMood()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/mood/history'),
      api.get('/mood/stats'),
    ]).then(([histRes, statsRes]) => {
      setHistory(histRes.data)
      setStats(statsRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <motion.main
        key="history-guest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
      >
        <div className="text-center glass rounded-3xl p-10 max-w-sm w-full">
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="font-display font-bold text-xl mb-2">Sign in to see your history</h2>
          <p className="text-sm opacity-50 font-body mb-6">
            Your mood history and playlists are saved when you have an account.
          </p>
          <Link
            to="/auth"
            className="inline-block px-6 py-3 rounded-2xl font-display font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--mood-primary), var(--mood-secondary))',
              color: 'var(--mood-bg-from)',
            }}
          >
            Sign In ✦
          </Link>
        </div>
      </motion.main>
    )
  }

  const maxCount = stats.length > 0 ? Math.max(...stats.map(s => parseInt(s.count))) : 1

  return (
    <motion.main
      key="history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-24 md:py-32"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Your Mood History
          </h1>
          <p className="opacity-40 font-body text-sm">
            Hey {user.username} · {history.length} sessions recorded
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--mood-primary)' }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="font-display font-semibold text-sm tracking-widest uppercase opacity-50 mb-5">
                  Mood Distribution
                </h2>
                <div className="space-y-3">
                  {stats.map(s => (
                    <StatBar
                      key={s.detected_mood}
                      mood={s.detected_mood}
                      count={parseInt(s.count)}
                      max={maxCount}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* History list */}
            {history.length > 0 ? (
              <div className="space-y-3">
                <h2 className="font-display font-semibold text-sm tracking-widest uppercase opacity-50">
                  Recent Sessions
                </h2>
                {history.map((entry, i) => (
                  <HistoryCard key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-2xl">
                <div className="text-4xl mb-3">🎵</div>
                <p className="opacity-40 font-body text-sm">No mood sessions yet. Go feel something!</p>
                <Link to="/" className="inline-block mt-4 text-sm font-display"
                  style={{ color: 'var(--mood-primary)' }}>
                  ← Back to home
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.main>
  )
}
