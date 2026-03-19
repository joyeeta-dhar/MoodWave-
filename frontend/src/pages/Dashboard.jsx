import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Activity, BarChart2, RefreshCw, ArrowRight, Zap } from 'lucide-react'
import { useMood } from '../hooks/useMood'
import { useAuth } from '../hooks/useAuth'
import TrackCard from '../components/ui/TrackCard'
import api from '../services/api'

const MOOD_DESCRIPTIONS = {
  happy:     { emoji: '😄', icon: Zap,          title: 'Feeling Happy',     sub: 'Bright & uplifting tracks queued' },
  sad:       { emoji: '🌧', icon: Activity,     title: 'Feeling Blue',      sub: 'Melancholic tunes for your heart' },
  energetic: { emoji: '⚡', icon: Zap,          title: 'Full Energy',       sub: 'High-octane bangers incoming' },
  calm:      { emoji: '🌿', icon: Activity,     title: 'Calm & Centered',   sub: 'Peaceful sounds for clarity' },
  stressed:  { emoji: '😤', icon: Activity,     title: 'Need Relief',       sub: 'Soothing tracks to decompress' },
  romantic:  { emoji: '💫', icon: Activity,     title: 'In the Feels',      sub: 'Smooth and romantic vibes' },
  nostalgic: { emoji: '🎞', icon: Activity,     title: 'Throwback Mode',    sub: 'Timeless hits for your soul' },
}

function MiniTrend({ history = [] }) {
  if (history.length < 2) return null;
  const recent = [...history].reverse().slice(-5);
  const pathData = recent.map((h, i) => {
    const x = (i / (recent.length - 1)) * 100;
    const y = 20 - (h.valence * 20);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="mt-6 pt-4 border-t border-white/5">
      <p className="text-[9px] font-mono opacity-20 uppercase mb-3 tracking-widest">Recent Neural Trend</p>
      <div className="h-6 w-full relative">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            d={pathData}
            fill="none"
            stroke="var(--mood-primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
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

function EmotionalVectors({ valence = 0.5, energy = 0.5, tempo = 100 }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono uppercase opacity-40">
          <span>Valence (Sad → Happy)</span>
          <span>{Math.round(valence * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${valence * 100}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-rose-400"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono uppercase opacity-40">
          <span>Energy (Chill → Hype)</span>
          <span>{Math.round(energy * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${energy * 100}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 to-orange-500"
          />
        </div>
      </div>
      <div className="pt-2 flex justify-between items-end">
        <span className="text-[10px] font-mono uppercase opacity-40">Estimated Tempo</span>
        <span className="text-2xl font-display font-bold tabular-nums text-white/90">
          {Math.round(tempo)} <span className="text-[10px] opacity-30 font-normal">BPM</span>
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { mood, moodData, tracks, updateMood } = useMood()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const info = MOOD_DESCRIPTIONS[mood] || MOOD_DESCRIPTIONS.calm

  useEffect(() => {
    if (user) {
      api.get('/mood/history').then(res => setHistory(res.data)).catch(console.error);
    }
  }, [user]);

  const handleRefresh = async () => {
    if (!moodData?.rawInput || refreshing) return
    setRefreshing(true)
    try {
      const { data } = await api.post('/mood/analyze', { text: moodData.rawInput })
      updateMood(data)
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

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
          <div className="flex items-center gap-5 mb-2">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-rose-400 drop-shadow-2xl">
              <info.icon className="w-8 h-8" />
            </div>
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
              <Activity className="w-3 h-3" /> MoodWave Neural Engine
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mt-3 mb-1">
            {info.title}
          </h1>
          <p className="opacity-40 font-body max-w-xl">{info.sub}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Emotion Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50">
                Emotional Profile
              </h3>
            </div>
            <EmotionalVectors 
              valence={moodData.valence} 
              energy={moodData.energy} 
              tempo={moodData.tempo} 
            />
            {history.length > 0 && <MiniTrend history={history} />}
          </motion.div>

          {/* AI description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50">
                  AI Mood Insight
                </h3>
              </div>
              <p className="font-body text-base leading-relaxed text-white/90 italic">
                "{moodData.description}"
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-mono opacity-30 uppercase">Neural Confidence</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--mood-primary)' }}>
                {Math.round(moodData.confidence * 100)}%
              </span>
            </div>
          </motion.div>

          {/* Neural Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-semibold text-xs tracking-widest uppercase opacity-50">
                Network Analysis
              </h3>
            </div>
            <MoodMeter scores={moodData.scores} />
          </motion.div>
        </div>

        {/* Tracks Section */}
        {tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-bold text-2xl gradient-text">
                    Tailored Recommendations
                  </h2>
                  <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`p-2 rounded-lg glass border-white/5 hover:bg-white/5 transition-all text-white/40 hover:text-white ${refreshing ? 'animate-spin' : ''}`}
                    title="Refresh with latest feedback"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs opacity-30 font-body mt-1 max-w-md">Neural matching engine using real audio vectors and learning loop feedback.</p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  to="/history"
                  className="flex items-center gap-2 text-[10px] font-mono opacity-30 hover:opacity-100 transition-all uppercase tracking-widest"
                >
                  View Trends <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/"
                  className="group flex items-center gap-2 text-[10px] font-mono opacity-30 hover:opacity-100 transition-all uppercase tracking-widest"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Re-calibrate
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
