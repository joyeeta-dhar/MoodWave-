import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useMood } from './hooks/useMood'
import MoodBackground from './components/three/MoodBackground'
import Navbar from './components/ui/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Auth from './pages/Auth'

export default function App() {
  const { mood } = useMood()
  const location = useLocation()

  return (
    // data-mood drives the CSS variable theme swap
    <div data-mood={mood} className="min-h-screen relative">
      <MoodBackground mood={mood} />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history"   element={<History />} />
          <Route path="/auth"      element={<Auth />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
