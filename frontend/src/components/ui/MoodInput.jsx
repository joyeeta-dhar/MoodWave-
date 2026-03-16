import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMood } from '../../hooks/useMood'
import api from '../../services/api'

export default function MoodInput() {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const { updateMood, setLoading, loading } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/mood/analyze', { text })
      updateMood(data)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-3xl p-6 md:p-8 glow">
        <label className="block text-sm font-mono tracking-widest uppercase mb-3 opacity-60">
          How are you feeling right now?
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
          placeholder="I'm feeling like the world is a bit too much today..."
          rows={3}
          maxLength={500}
          className="w-full bg-transparent text-lg resize-none outline-none placeholder-white/20 font-body leading-relaxed"
          style={{ color: 'var(--mood-text)' }}
        />
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-2">
            {error}
          </motion.p>
        )}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
          <span className="text-xs opacity-40 font-mono">{text.length}/500</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading || text.trim().length < 2}
            className="px-8 py-3 rounded-2xl font-display font-semibold text-sm tracking-wide disabled:opacity-40 transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--mood-primary), var(--mood-secondary))',
              color: 'var(--mood-bg-from)',
            }}
          >
            {loading ? 'Reading your vibe...' : 'Find My Playlist ✦'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
