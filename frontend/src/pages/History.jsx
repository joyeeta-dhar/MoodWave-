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

function MoodEvolutionGraph({ history = [] }) {
  if (history.length < 2) return null;
  
  // Sort by date and take recent 10 for the graph
  const sorted = [...history].reverse().slice(-10);
  const data = sorted.map((entry, i) => ({
    x: (i / (sorted.length - 1)) * 100,
    y: 100 - (entry.valence * 100),
    mood: entry.detected_mood
  }));

  const pathData = data.reduce((acc, curr, i) => {
    return acc + (i === 0 ? `M ${curr.x} ${curr.y}` : ` L ${curr.x} ${curr.y}`);
  }, "");

  return (
    <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden h-64">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
      <h2 className="font-display font-semibold text-xs tracking-[0.3em] uppercase opacity-30 mb-8 border-b border-white/5 pb-4">
        Emotional Evolution Trend
      </h2>
      <div className="relative h-32 w-full mt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
          
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={pathData}
            fill="none"
            stroke="url(#graph-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="graph-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--mood-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--mood-secondary)" />
            </linearGradient>
          </defs>

          {data.map((point, i) => (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5 + (i * 0.1) }}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={MOOD_COLOR[point.mood] || "white"}
              className="drop-shadow-lg"
            />
          ))}
        </svg>
        <div className="flex justify-between mt-6">
          <span className="text-[10px] font-mono opacity-20 uppercase tracking-tighter">Earlier</span>
          <span className="text-[10px] font-mono opacity-20 uppercase tracking-tighter text-center flex-1">Neural Trajectory (Valence)</span>
          <span className="text-[10px] font-mono opacity-20 uppercase tracking-tighter">Latest</span>
        </div>
      </div>
    </div>
  )
}

function HistoryCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
  const tracks = typeof entry.tracks === 'string' ? JSON.parse(entry.tracks) : (entry.tracks || [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/5 transition-colors group"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${MOOD_COLOR[entry.detected_mood]}22` }}
        >
          {MOOD_EMOJI[entry.detected_mood] || '🎵'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full capitalize"
              style={{
                background: `${MOOD_COLOR[entry.detected_mood]}22`,
                color: MOOD_COLOR[entry.detected_mood],
              }}
            >
              {entry.detected_mood}
            </span>
            <span className="text-[10px] opacity-30 font-mono">
              {new Date(entry.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
          
          <p className="text-sm opacity-90 font-display italic mb-2 line-clamp-1">
            "{entry.explanation || entry.raw_input}"
          </p>
          
          {entry.valence !== null && entry.valence !== undefined && (
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono opacity-20 uppercase">Valence</span>
                <span className="text-[10px] font-mono text-white/40">{Math.round(entry.valence * 100)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono opacity-20 uppercase">Energy</span>
                <span className="text-[10px] font-mono text-white/40">{Math.round(entry.energy * 100)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono opacity-20 uppercase">Tempo</span>
                <span className="text-[10px] font-mono text-white/40">{Math.round(entry.tempo)} BPM</span>
              </div>
            </div>
          )}
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-30 text-sm flex-shrink-0 mt-1"
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
            <div className="px-5 pb-6 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mt-5 mb-3">
                <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                  Personalized Collection · {tracks.length} tracks
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tracks.map((track, i) => (
                  <a
                    key={i}
                    href={track.playUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl glass border-transparent hover:border-white/10 hover:bg-white/5 transition-all group"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img
                        src={track.albumArt}
                        alt={track.title}
                        className="w-full h-full rounded-xl object-cover"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(track.id)}/40/40` }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                        <span className="text-[10px]">▶</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display font-semibold truncate text-white/90">{track.title}</p>
                      <p className="text-[10px] opacity-40 font-body truncate">{track.artist}</p>
                    </div>
                  </a>
                ))}
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
              Your Evolution
            </h1>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <p className="opacity-40 font-body text-sm tracking-wide uppercase">
            {user.username} · {history.length} Neural Sessions Synced
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
            {/* Evolution Graph - KILLER FEATURE */}
            <MoodEvolutionGraph history={history} />

            {/* Stats */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
                <h2 className="font-display font-semibold text-xs tracking-[0.3em] uppercase opacity-30 mb-8 border-b border-white/5 pb-4">
                  Mood Resonance Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {stats.map(s => (
                    <StatBar
                      key={s.mood}
                      mood={s.mood}
                      count={parseInt(s.count)}
                      max={maxCount}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* History list */}
            {history.length > 0 ? (
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-xs tracking-[0.3em] uppercase opacity-20 ml-2">
                  Timeline
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {history.map((entry, i) => (
                    <HistoryCard key={entry.id} entry={entry} index={i} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 glass rounded-3xl border-dashed border-white/10">
                <div className="text-5xl mb-6 grayscale opacity-30">🎵</div>
                <p className="opacity-30 font-body text-sm italic">Digital silence detected. Begin your first session.</p>
                <Link to="/" className="inline-block mt-8 px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-xs font-mono uppercase tracking-widest">
                  Start Analysis
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.main>
  )
}
