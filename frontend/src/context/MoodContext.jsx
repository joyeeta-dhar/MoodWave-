import { createContext, useState, useCallback } from 'react'

export const MoodContext = createContext(null)

export function MoodProvider({ children }) {
  const [mood, setMood] = useState('calm')
  const [moodData, setMoodData] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)

  const updateMood = useCallback((data) => {
    setMood(data.mood)
    setMoodData(data)
    setTracks(data.tracks || [])
  }, [])

  return (
    <MoodContext.Provider value={{ mood, moodData, tracks, loading, setLoading, updateMood }}>
      {children}
    </MoodContext.Provider>
  )
}
