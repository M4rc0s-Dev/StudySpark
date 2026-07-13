import { supabase, SessionRow } from './supabase'
import { StudySession } from '../types'

// Persist a study session to Supabase (only when a user is logged in).
// Failures are swallowed so the local experience never breaks.
export async function saveSessionToSupabase(session: StudySession): Promise<void> {
  if (!supabase) return
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from('sessions').upsert({
    id: session.id,
    user_id: user.id,
    title: session.title,
    study_mode: session.studyMode,
    flashcards: session.flashcards,
    time_spent: session.timeSpent || 0,
    score: session.score || 0,
    folder: session.folder || '',
    color: session.color || null,
  })
  if (error) console.error('Error saving session:', error)
}

// Load a single saved session by id and convert it to a StudySession.
export async function loadSessionFromSupabase(id: string): Promise<StudySession | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null

  const row = data as SessionRow
  return {
    id: row.id,
    title: row.title,
    folder: row.folder || '',
    color: row.color || undefined,
    flashcards: (row.flashcards as StudySession['flashcards']) ?? [],
    createdAt: new Date(row.created_at),
    studyMode: (row.study_mode as StudySession['studyMode']) ?? 'basic',
    timeSpent: row.time_spent || 0,
    score: row.score || 0,
  }
}

// Update only mutable metadata (title / folder / color) without overwriting the deck.
export async function updateSessionMeta(
  id: string,
  meta: { title?: string; folder?: string; color?: string | null }
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('sessions')
    .update({
      ...(meta.title !== undefined ? { title: meta.title } : {}),
      ...(meta.folder !== undefined ? { folder: meta.folder } : {}),
      ...(meta.color !== undefined ? { color: meta.color } : {}),
    })
    .eq('id', id)
  if (error) console.error('Error updating session meta:', error)
}

// Permanently delete a session from Supabase.
export async function deleteSessionFromSupabase(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) console.error('Error deleting session:', error)
}
