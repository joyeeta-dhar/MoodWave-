import { motion, AnimatePresence } from 'framer-motion'
import MoodInput from '../components/ui/MoodInput'
import MoodBadge from '../components/ui/MoodBadge'
import { useMood } from '../hooks/useMood'

export default function Home() {
  const { moodData, loading } = useMood()

  return (
    <motion.main
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen px-4 py-24 md:py-32"
    >
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <div className="glass inline-block px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase mb-6 opacity-70">
            AI Music · Mood-Powered
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 leading-tight">
            Music that{' '}
            <span className="gradient-text glow-text">feels</span>
            <br />like you do
          </h1>
          <p className="text-lg opacity-50 font-body max-w-md mx-auto">
            Tell us how you feel. We'll find the perfect soundtrack.
          </p>
        </motion.div>

        {/* Input */}
        <MoodInput />

        {/* Result */}
        <AnimatePresence>
          {moodData && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-8"
            >
              <MoodBadge mood={moodData.mood} confidence={moodData.confidence} />
              <p className="text-sm opacity-40 mt-3 font-body">{moodData.description}</p>
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                {moodData.musicProfile?.tags?.slice(0, 4).map(tag => (
                  <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full glass">#{tag}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="text-center mt-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-12 h-12 rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--mood-primary)' }}
            />
            <p className="mt-4 opacity-40 font-mono text-sm">Tuning into your frequency...</p>
          </div>
        )}
      </div>
    </motion.main>
  )
}
