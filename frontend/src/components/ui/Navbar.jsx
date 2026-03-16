import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-6xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl gradient-text">
          MoodWave
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/history', 'History']].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className="px-3 py-1.5 rounded-xl text-sm font-body transition-all"
              style={{
                background: isActive(path) ? 'var(--mood-card-bg)' : 'transparent',
                opacity: isActive(path) ? 1 : 0.5,
                color: 'var(--mood-text)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="opacity-50 font-body text-xs hidden sm:block">{user.username}</span>
              <button
                onClick={logout}
                className="text-xs opacity-40 hover:opacity-80 transition-opacity font-mono"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-xl font-display font-semibold text-xs transition-all hover:opacity-90"
              style={{
                background: 'var(--mood-primary)',
                color: 'var(--mood-bg-from)',
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
