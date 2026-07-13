import type { StudySession } from '../types'

function downloadBlob(content: string, filename: string, mime: string) {
  // Prepend a UTF-8 BOM so Excel (and other spreadsheet apps) decode accents
  // and special characters correctly instead of showing mojibake like "Ã©".
  const blob = new Blob(['﻿' + content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function safeName(title: string): string {
  // Keep accents, ñ and other unicode letters. Only strip characters that are
  // illegal in file names on the common operating systems ( / \ : * ? " < > | ).
  const cleaned = (title || 'studyspark').replace(/[\/\\:*?"<>|]/g, '_').trim()
  return cleaned || 'studyspark'
}

export function exportSession(session: StudySession, format: 'csv' | 'json' = 'csv') {
  const name = safeName(session.title)
  if (format === 'json') {
    downloadBlob(JSON.stringify(session, null, 2), `${name}.json`, 'application/json')
    return
  }
  const header = 'question,answer,concept,difficulty\n'
  const rows = (session.flashcards || [])
    .map((c) => {
      const esc = (s: string = '') => `"${String(s).replace(/"/g, '""').replace(/\n/g, ' ')}"`
      return [esc(c.question), esc(c.answer), esc(c.concept || ''), esc(c.difficulty || '')].join(',')
    })
    .join('\n')
  downloadBlob(header + rows, `${name}.csv`, 'text/csv')
}

export function exportSessions(sessions: StudySession[], format: 'csv' | 'json' = 'csv') {
  if (format === 'json') {
    const all = sessions.flatMap((s) => s.flashcards || [])
    downloadBlob(JSON.stringify(all, null, 2), 'studyspark_all.json', 'application/json')
    return
  }
  const header = 'deck,question,answer,concept,difficulty\n'
  const rows = sessions
    .flatMap((s) =>
      (s.flashcards || []).map((c) => {
        const esc = (v: string = '') => `"${String(v).replace(/"/g, '""').replace(/\n/g, ' ')}"`
        return [esc(s.title), esc(c.question), esc(c.answer), esc(c.concept || ''), esc(c.difficulty || '')].join(',')
      })
    )
    .join('\n')
  downloadBlob(header + rows, 'studyspark_all.csv', 'text/csv')
}
