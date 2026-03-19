import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Heart, X, Play } from 'lucide-react'
import api from '../../services/api'

export default function TrackCard({ track, index }) {
  const [feedback, setFeedback] = useState(null) // 'like' or 'skip'

  const handleFeedback = async (e, action) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.post('/mood/feedback', { trackId: track.id, action })
      setFeedback(action)
    } catch (err) {
      console.error('Feedback failed:', err)
      // If unauthorized (guest), just show local feedback state
      setFeedback(action)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ scale: feedback === 'skip' ? 1.0 : 1.03, y: feedback === 'skip' ? 0 : -4 }}
      className={`glass rounded-2xl overflow-hidden cursor-pointer group relative transition-all duration-300 ${
        feedback === 'skip' ? 'opacity-30 grayscale scale-95 pointer-events-none' : ''
      }`}
    >
      <a href={track.playUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative overflow-hidden aspect-square flex items-center justify-center bg-black/10">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(track.id)}/300/300` }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <Play className="w-10 h-10 text-white fill-white drop-shadow-lg" />
          </div>
          
          {/* Action Overlay */}
          <AnimatePresence>
            {!feedback && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-2.5 right-2.5 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all"
              >
                <button 
                  onClick={(e) => handleFeedback(e, 'like')}
                  className="w-9 h-9 rounded-full glass border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 text-rose-500 shadow-xl backdrop-blur-md"
                  title="Love this"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <button 
                  onClick={(e) => handleFeedback(e, 'skip')}
                  className="w-9 h-9 rounded-full glass border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 text-gray-300 shadow-xl backdrop-blur-md"
                  title="Not for me"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-4 relative">
          <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--mood-text)' }}>
            {track.title || 'Untitled Track'}
          </h3>
          <p className="text-xs opacity-60 mt-0.5 truncate font-body">{track.artist || 'Unknown Artist'}</p>
          
          {/* AI Explanation Engine Feature */}
          {track.aiExplanation && (
            <div className="mt-3 py-2 px-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] leading-relaxed opacity-50 italic font-body">
                {track.aiExplanation}
              </p>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono opacity-30 uppercase tracking-tighter">
              {track.listeners
                ? `${(track.listeners / 1_000_000).toFixed(1)}M Popularity`
                : 'Last.fm Result'}
            </span>
            {feedback && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[10px] font-mono font-bold uppercase ${feedback === 'like' ? 'text-emerald-400' : 'text-gray-500'}`}
              >
                {feedback === 'like' ? 'Saved' : 'Filtered'}
              </motion.span>
            )}
          </div>
        </div>
      </a>
    </motion.div>
  )
}
