import { motion } from 'framer-motion'

export default function TrackCard({ track, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
    >
      <a href={track.playUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative overflow-hidden">
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.target.src = `https://picsum.photos/seed/${track.id}/300/300` }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <span className="text-4xl drop-shadow">▶</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm truncate" style={{ color: 'var(--mood-text)' }}>
            {track.title}
          </h3>
          <p className="text-xs opacity-60 mt-1 truncate font-body">{track.artist}</p>
          <div className="mt-3">
            <span className="text-xs font-mono opacity-30">
              {track.listeners
                ? `${(track.listeners / 1_000_000).toFixed(1)}M listeners`
                : '▶ Listen on Last.fm'}
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
