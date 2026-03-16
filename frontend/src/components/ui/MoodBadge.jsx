import { motion, AnimatePresence } from 'framer-motion'

const MOOD_CONFIG = {
  happy:     { emoji: '😄', label: 'Happy',     pulse: true },
  sad:       { emoji: '🌧', label: 'Melancholic', pulse: false },
  energetic: { emoji: '⚡', label: 'Energetic',  pulse: true },
  calm:      { emoji: '🌿', label: 'Calm',       pulse: false },
  stressed:  { emoji: '😤', label: 'Stressed',   pulse: true },
  romantic:  { emoji: '💫', label: 'Romantic',   pulse: false },
  nostalgic: { emoji: '🎞', label: 'Nostalgic',  pulse: false },
}

export default function MoodBadge({ mood, confidence, className = '' }) {
  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.calm

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-2xl ${className}`}
      >
        {/* Pulse dot */}
        <div className="relative flex items-center justify-center">
          {config.pulse && (
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-3 h-3 rounded-full"
              style={{ background: 'var(--mood-primary)' }}
            />
          )}
          <div
            className="w-2 h-2 rounded-full relative z-10"
            style={{ background: 'var(--mood-primary)' }}
          />
        </div>

        <span className="text-base">{config.emoji}</span>

        <div className="flex flex-col">
          <span className="font-display font-semibold text-xs gradient-text leading-tight">
            {config.label}
          </span>
          {confidence !== undefined && (
            <span className="text-xs opacity-30 font-mono leading-tight">
              {Math.round(confidence * 100)}% match
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
