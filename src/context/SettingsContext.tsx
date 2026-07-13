import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { StudySession } from '../types'

// Fixed time for timed mode (seconds per card) - equal for every difficulty.
export const TIMED_SECONDS_PER_CARD = 30

// Maximum number of flashcards the AI can generate per deck.
export const MAX_CARDS = 25

// Predefined amounts the user can pick from (no free numeric input).
// A value of -1 means "let the AI decide" (the n8n workflow picks a sensible
// number based on the length of the notes).
export const CARD_COUNT_OPTIONS = [5, 10, 15, 20, 25] as const
export const CARD_COUNT_AUTO = -1
export const CARD_COUNT_AUTO_LABEL = 'auto'

export type StudyMode = 'basic' | 'timed' | 'spaced-repetition'
export type CardOrder = 'default' | 'shuffle' | 'hard'
export type CardDirection = 'qa' | 'aq'

export interface SessionConfig {
  mode: StudyMode
  order: CardOrder
  direction: CardDirection
  autoplay: boolean
}

export interface StudyPreferences {
  defaultMode: StudyMode
  autoplay: boolean
  cardCount: number
}

const DEFAULT_PREFS: StudyPreferences = {
  defaultMode: 'basic',
  autoplay: false,
  cardCount: 10,
}

const STORAGE_KEY = 'studyspark.prefs.v1'

interface SettingsContextValue {
  prefs: StudyPreferences
  setPrefs: (p: Partial<StudyPreferences>) => void
  resetLocalProgress: () => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

function loadPrefs(): StudyPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefsState] = useState<StudyPreferences>(loadPrefs)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      /* ignore */
    }
  }, [prefs])

  const setPrefs = useCallback((p: Partial<StudyPreferences>) => {
    setPrefsState((prev) => ({ ...prev, ...p }))
  }, [])

  const resetLocalProgress = useCallback(() => {
    try {
      localStorage.removeItem('studyspark.prefs.v1')
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ prefs, setPrefs, resetLocalProgress }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Helper: apply order + (later) direction transforms to a deck.
export function applyOrder(
  flashcards: StudySession['flashcards'],
  order: CardOrder
): StudySession['flashcards'] {
  if (order === 'default') return flashcards
  const copy = [...flashcards]
  if (order === 'shuffle') {
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }
  // hardest first: hard > medium > easy > very-easy > very-hard > undefined
  const rank: Record<string, number> = { hard: 0, medium: 1, easy: 2, 'very-easy': 3, 'very-hard': 4 }
  return copy.sort((a, b) => (rank[a.difficulty ?? ''] ?? 5) - (rank[b.difficulty ?? ''] ?? 5))
}
