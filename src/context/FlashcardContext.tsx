import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { Flashcard, StudySession } from '../types'

const RECENT_KEY = 'studyspark.recent.sessions'

// Persist the order in which sessions were last opened (most recent first),
// capped at the 8 latest. Used by the profile dropdown's "recent sessions".
function pushRecent(id: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
    const next = [id, ...list.filter((x) => x !== id)].slice(0, 8)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function getRecentSessionIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

interface FlashcardState {
  sessions: StudySession[]
  currentSession: StudySession | null
  isLoading: boolean
  error: string | null
  user: { email: string; name: string } | null
}

interface FlashcardActions {
  loadSession: (sessionId: string) => void
  createSession: (title: string, flashcards: Flashcard[], mode: 'basic' | 'timed' | 'spaced-repetition') => string
  updateSession: (session: StudySession) => void
  removeSession: (sessionId: string) => void
  setCurrentSession: (session: StudySession) => void
  setUser: (user: { email: string; name: string } | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

type FlashcardDispatch = React.Dispatch<{ type: string; payload?: any }>

const initialState: FlashcardState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  user: null,
}

function flashcardReducer(
  state: FlashcardState,
  action: { type: string; payload?: any }
): FlashcardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'LOAD_SESSION':
      return {
        ...state,
        currentSession: state.sessions.find((s) => s.id === action.payload) || null,
      }
    case 'CREATE_SESSION':
      const newSession: StudySession = {
        id: action.payload.id,
        title: action.payload.title,
        flashcards: action.payload.flashcards,
        createdAt: new Date(),
        studyMode: action.payload.mode,
        timeSpent: 0,
        score: 0,
      }
      return {
        ...state,
        sessions: [...state.sessions, newSession],
        currentSession: newSession,
      }
    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.payload,
        sessions: state.sessions.some((s) => s.id === action.payload.id)
          ? state.sessions.map((s) => (s.id === action.payload.id ? action.payload : s))
          : [...state.sessions, action.payload],
      }
    case 'UPDATE_SESSION':
      const updatedSession = action.payload
      // Upsert: update the session if it already exists in the store, otherwise
      // add it. Sessions loaded from the cloud may not be in the local store yet,
      // and a plain map() would silently drop the update (e.g. moving a deck to a
      // folder), forcing a manual refresh to see the change.
      const exists = state.sessions.some((s) => s.id === updatedSession.id)
      return {
        ...state,
        sessions: exists
          ? state.sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s))
          : [...state.sessions, updatedSession],
        currentSession:
          state.currentSession?.id === updatedSession.id ? updatedSession : state.currentSession,
      }
    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
        currentSession:
          state.currentSession?.id === action.payload ? null : state.currentSession,
      }
    case 'LOAD_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      }
    default:
      return state
  }
}

const FlashcardContext = createContext<
  ({ state: FlashcardState; dispatch: FlashcardDispatch } & FlashcardActions) | undefined
>(undefined)

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flashcardReducer, initialState)

  const loadSession = useCallback((sessionId: string) => {
    dispatch({ type: 'LOAD_SESSION', payload: sessionId })
  }, [])

  const createSession = useCallback(
    (title: string, flashcards: Flashcard[], mode: 'basic' | 'timed' | 'spaced-repetition') => {
      const sessionId = Math.random().toString(36).substring(2, 11)
      dispatch({ type: 'CREATE_SESSION', payload: { id: sessionId, title, flashcards, mode } })
      return sessionId
    },
    []
  )

  const setCurrentSession = useCallback((session: StudySession) => {
    pushRecent(session.id)
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
  }, [])

  const updateSession = useCallback((session: StudySession) => {
    dispatch({ type: 'UPDATE_SESSION', payload: session })
  }, [])

  const removeSession = useCallback((sessionId: string) => {
    dispatch({ type: 'REMOVE_SESSION', payload: sessionId })
  }, [])

  const setUser = useCallback((user: { email: string; name: string } | null) => {
    dispatch({ type: 'SET_USER', payload: user })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  return (
    <FlashcardContext.Provider
      value={{
        state,
        dispatch,
        loadSession,
        createSession,
        setCurrentSession,
        updateSession,
        removeSession,
        setUser,
        setLoading,
        setError,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  )
}

export const useFlashcardStore = () => {
  const context = useContext(FlashcardContext)
  if (context === undefined) {
    throw new Error('useFlashcardStore must be used within a FlashcardProvider')
  }
  return context
}
