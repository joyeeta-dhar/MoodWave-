import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, username: form.username, password: form.password }

      const { data } = await api.post(endpoint, payload)
      login(data.token, data.user)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main
      key="auth"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            {mode === 'login' ? 'Welcome back' : 'Join MoodWave'}
          </h1>
          <p className="opacity-50 font-body text-sm">
            {mode === 'login' ? 'Sign in to save your mood history' : 'Create an account to get started'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 glow">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase opacity-50 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--mood-primary)] transition-colors font-body"
                  style={{ color: 'var(--mood-text)' }}
                />
              </div>

              {/* Username (register only) */}
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-mono tracking-widest uppercase opacity-50 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="your_username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--mood-primary)] transition-colors font-body"
                    style={{ color: 'var(--mood-text)' }}
                  />
                </motion.div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase opacity-50 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--mood-primary)] transition-colors font-body"
                  style={{ color: 'var(--mood-text)' }}
                />
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm font-body text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-display font-semibold text-sm tracking-wide mt-2 disabled:opacity-50 transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--mood-primary), var(--mood-secondary))',
                  color: 'var(--mood-bg-from)',
                }}
              >
                {loading
                  ? 'Loading...'
                  : mode === 'login' ? 'Sign In ✦' : 'Create Account ✦'}
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Toggle mode */}
          <div className="text-center mt-6 text-sm">
            <span className="opacity-40 font-body">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="font-semibold font-display transition-opacity hover:opacity-80"
              style={{ color: 'var(--mood-primary)' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Guest note */}
        <p className="text-center text-xs opacity-30 font-mono mt-6">
          You can also use MoodWave without an account
        </p>
      </motion.div>
    </motion.main>
  )
}
