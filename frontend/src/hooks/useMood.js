import { useContext } from 'react'
import { MoodContext } from '../context/MoodContext'
export const useMood = () => useContext(MoodContext)
