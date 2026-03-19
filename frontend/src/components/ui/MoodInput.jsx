import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMood } from '../../hooks/useMood'
import api from '../../services/api'

const PRESETS = [
  { label: 'Late night heartbreak 💔', text: 'I want a late night heartbreak playlist, something sad and melancholic.' },
  { label: 'Deep focus coding session 💻', text: 'I am coding and need deep focus, something calm and instrumental.' },
  { label: 'Gym beast mode 🔥', text: 'I am at the gym in beast mode, need high energy workout tracks.' },
  { label: 'Rainy day nostalgia 🌧️', text: 'It is a rainy day and I am feeling nostalgic, give me some old classics.' },
  { label: 'Chill cafe vibes ☕', text: 'I am at a chill cafe relaxing, something lo-fi and mellow.' }
]

export default function MoodInput() {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const { updateMood, setLoading, loading } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async (inputText = text) => {
    if (!inputText.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/mood/analyze', { text: inputText })
      updateMood(data)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const handlePresetClick = (presetText) => {
    setText(presetText)
    handleSubmit(presetText)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-3xl p-6 md:p-8 glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="mb-6">
          <h2 className="text-xl font-display font-bold mb-2 tracking-tight">Build your perfect playlist 🎧</h2>
          <div className="space-y-1.5 opacity-60">
            <p className="text-xs font-body">Tell us:</p>
            <ol className="text-[11px] font-body list-decimal list-inside space-y-0.5 ml-1">
              <li>What are you feeling right now?</li>
              <li>What are you doing? (studying / traveling / chilling / workout)</li>
              <li>Energy level? (low / medium / high)</li>
              <li>Preferred language or genre?</li>
              <li>Any artist/song you love?</li>
            </ol>
          </div>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
          placeholder="Type it naturally 👇"
          rows={4}
          maxLength={500}
          className="w-full bg-transparent text-lg resize-none outline-none placeholder-white/20 font-body leading-relaxed mb-1"
          style={{ color: 'var(--mood-text)' }}
        />

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1">
            {error}
          </motion.p>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
          <span className="text-[10px] opacity-30 font-mono tracking-tighter uppercase">{text.length} / 500 characters</span>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={() => handleSubmit()}
            disabled={loading || text.trim().length < 2}
            className="px-8 py-3 rounded-2xl font-display font-semibold text-sm tracking-wide disabled:opacity-40 transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--mood-primary), var(--mood-secondary))',
              color: 'var(--mood-bg-from)',
            }}
          >
            {loading ? 'Reading the vibe...' : 'Sync Frequency ✦'}
          </motion.button>
        </div>
      </div>

      {/* KILLER UPGRADE: "Or try these" Presets */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-20 mb-4">Or try these presets</p>
        <div className="flex flex-wrap justify-center gap-3">
          {PRESETS.map((preset, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetClick(preset.text)}
              className="px-4 py-2.5 rounded-xl glass text-[11px] font-body opacity-60 hover:opacity-100 transition-all border-white/5"
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
