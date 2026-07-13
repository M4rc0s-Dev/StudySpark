import axios, { AxiosResponse } from 'axios'
import { Flashcard, StudySession, UploadResponse, ProcessingProgress, Difficulty } from '../types'
import { supabase } from '../lib/supabase'

// Map any difficulty label from the n8n agent to our 5-level scale.
const DIFFICULTY_MAP: Record<string, Difficulty> = {
  'muy facil': 'very-easy',
  'muy fácil': 'very-easy',
  'very easy': 'very-easy',
  'very-easy': 'very-easy',
  facil: 'easy',
  fácil: 'easy',
  easy: 'easy',
  medio: 'medium',
  medium: 'medium',
  dificil: 'hard',
  difícil: 'hard',
  hard: 'hard',
  'muy dificil': 'very-hard',
  'muy difícil': 'very-hard',
  'very hard': 'very-hard',
  'very-hard': 'very-hard',
}

function normalizeDifficulty(value: unknown): Difficulty | undefined {
  if (!value) return undefined
  const key = String(value).toLowerCase().trim()
  return DIFFICULTY_MAP[key]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export class FlashcardAPI {
  private static instance: FlashcardAPI
  private sessionId: string | null = null
  private cancelled = false

  static getInstance(): FlashcardAPI {
    if (!FlashcardAPI.instance) {
      FlashcardAPI.instance = new FlashcardAPI()
    }
    return FlashcardAPI.instance
  }

  // Start an async generation job. The Worker returns immediately with a jobId
  // (it does NOT wait for the AI). The caller then polls with pollJob(jobId).
  async startGeneration(
    notes: string,
    file?: File,
    fileName?: string,
    cardCount?: number
  ): Promise<string> {
    let response: Response
    if (file) {
      // Send the file as multipart/form-data so the Worker can forward the
      // binary to n8n (which extracts text from PDF/DOCX).
      const form = new FormData()
      form.append('file', file, fileName || file.name)
      form.append('fileName', fileName || file.name)
      form.append('cardCount', String(cardCount ?? 10))
      response = await fetch('/api/generate', { method: 'POST', body: form })
    } else {
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyNotes: notes,
          fileName: fileName || 'studyspark',
          cardCount: cardCount ?? 10,
        }),
      })
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.jobId) {
      throw new Error('The server did not return a job id')
    }
    return data.jobId as string
  }

  // Poll the Supabase `jobs` table until the job is done (or fails / times out).
  // Returns the normalized flashcards. onProgress is called with the elapsed
  // fraction so the UI can advance a staged loading screen.
  async pollJob(
    jobId: string,
    opts?: { timeoutMs?: number; intervalMs?: number; onTick?: (elapsedMs: number) => void }
  ): Promise<UploadResponse> {
    if (!supabase) throw new Error('Supabase is not configured')
    const timeoutMs = opts?.timeoutMs ?? 180000 // 3 minutes
    const intervalMs = opts?.intervalMs ?? 2500
    const started = Date.now()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const elapsed = Date.now() - started
      if (elapsed > timeoutMs) {
        throw new Error('Timed out waiting for the flashcards to be generated')
      }
      opts?.onTick?.(elapsed)

      const { data, error } = await supabase
        .from('jobs')
        .select('status, flashcards, error')
        .eq('id', jobId)
        .maybeSingle()

      if (!error && data) {
        if (data.status === 'done') {
          const cards: Flashcard[] = ((data.flashcards as any[]) || []).map((c: any, i: number) => ({
            id: c.id || `c${i}-${Date.now()}`,
            question: c.question || '',
            answer: c.answer || '',
            concept: c.concept,
            difficulty: normalizeDifficulty(c.difficulty),
          }))
          this.sessionId = jobId
          return { flashcards: cards, sessionId: jobId } as UploadResponse
        }
        if (data.status === 'error') {
          throw new Error(data.error || 'Generation failed')
        }
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  // Convenience wrapper kept for callers that want the old one-shot behavior:
  // start the job and poll until it resolves.
  async generateFlashcards(
    notes: string,
    file?: File,
    fileName?: string,
    cardCount?: number,
    onTick?: (elapsedMs: number) => void
  ): Promise<UploadResponse> {
    const jobId = await this.startGeneration(notes, file, fileName, cardCount)
    return this.pollJob(jobId, { onTick })
  }

  async getFlashcards(sessionId: string): Promise<Flashcard[]> {
    try {
      const response = await axios.get<Flashcard[]>
        (`${API_BASE_URL}/api/flashcards/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      throw new Error('Failed to fetch flashcards')
    }
  }

  async exportFlashcards(
    sessionId: string,
    format: 'csv' | 'json'
  ): Promise<Blob> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/export/${sessionId}?format=${format}`,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      console.error('Error exporting flashcards:', error)
      throw new Error('Failed to export flashcards')
    }
  }

  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw new Error('Failed to download file')
    }
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  setSessionId(id: string): void {
    this.sessionId = id
  }

  // Abort an in-flight pollJob loop (called when the user hits "Cancelar"
  // on the loading screen, so we don't hang for the full timeout).
  cancel(): void {
    this.cancelled = true
  }

  // Reset the cancellation flag before starting a new generation.
  resetCancel(): void {
    this.cancelled = false
  }
}

export default FlashcardAPI.getInstance()