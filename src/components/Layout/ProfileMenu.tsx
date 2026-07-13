import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ChevronDown, ChevronLeft, LogOut, Settings, Layers, Flame, Zap, Trash2, Library as LibraryIcon, Sparkles } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useFlashcardStore, getRecentSessionIds } from '../../context/FlashcardContext'
import { deleteSessionFromSupabase } from '../../lib/sessions'
import { levelFromXp } from '../../lib/leveling'
import ConfirmDialog from './ConfirmDialog'
import type { SessionRow } from '../../lib/supabase'

const ProfileMenu: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<SessionRow | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, profile, sessions, signOut, refreshSessions } = useAuth()
  const { removeSession } = useFlashcardStore()

  // Delete a session from the cloud and local store, mirroring the Library page.
  const handleDeleteSession = async (s: SessionRow) => {
    await deleteSessionFromSupabase(s.id)
    removeSession(s.id)
    if (user) await refreshSessions()
    setSessionToDelete(null)
    toast.success(t('settings.deleted'))
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowSessions(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  const initial = (profile?.name || user.name || 'U').charAt(0).toUpperCase()
  const xp = profile?.xp ?? 0
  const { level, intoLevel, levelSpan, progressPct } = levelFromXp(xp)
  const streak = profile?.study_streak ?? 0

  // The streak "flame" is lit only when today's study has been registered.
  const today = new Date().toISOString().slice(0, 10)
  const streakActive = Boolean(profile?.last_study_date) && profile?.last_study_date === today

  // Show "recent sessions": order by last-opened, keeping cloud order as fallback.
  const recentIds = getRecentSessionIds()
  const recentSessions = [...sessions].sort((a, b) => {
    const ia = recentIds.indexOf(a.id)
    const ib = recentIds.indexOf(b.id)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  const openSession = (id: string) => {
    setOpen(false)
    setShowSessions(false)
    navigate(`/study/${id}`)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); setShowSessions(false) }}
        className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 hover:shadow-sm transition-all"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
          {initial}
        </span>
        <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {profile?.name || user.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{profile?.name || user.name}</p>
                  <p className="text-xs text-indigo-100 truncate">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-[11px] text-indigo-100">{t('profile.streak')}</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    {streakActive ? (
                      <Flame className="w-3.5 h-3.5 text-orange-300" />
                    ) : (
                      <Flame className="w-3.5 h-3.5 text-indigo-200" />
                    )}{' '}
                    {streak} {t('profile.days')}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-[11px] text-indigo-100">{t('reward.level', { level })}</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {xp} {t('profile.xp')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-indigo-100 mb-1">
                  <span>{t('profile.xp')}</span>
                  <span>{intoLevel}/{levelSpan} {t('reward.level', { level: level + 1 })}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-300 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sessions list (toggle) */}
            {!showSessions ? (
              <div className="p-2">
                <button
                  onClick={() => setShowSessions(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-indigo-500" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{t('profile.recentsessions')}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">{sessions.length}</span>
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/library') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                    <LibraryIcon className="w-4 h-4 text-amber-500" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('library.title')}</span>
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-violet-500" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('profile.settings')}</span>
                </button>
                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => { setOpen(false); signOut() }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-rose-500" />
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{t('profile.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="p-2 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 px-2 pb-2">
                  <button
                    onClick={() => setShowSessions(false)}
                    title={t('profile.back')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('profile.recentsessions')}</span>
                </div>
                {recentSessions.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-6 text-center">{t('profile.nosessions')}</p>
                ) : (
                  recentSessions.map((s) => (
                    <div
                      key={s.id}
                      className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <button
                        onClick={() => openSession(s.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <span className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{s.title}</span>
                          <span className="block text-xs text-gray-400 dark:text-gray-500">
                            {Array.isArray(s.flashcards) ? s.flashcards.length : 0} · {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => setSessionToDelete(s)}
                        title={t('library.delete')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={sessionToDelete !== null}
        title={t('library.delete')}
        message={t('library.confirm.delete.session')}
        onConfirm={() => {
          if (sessionToDelete) handleDeleteSession(sessionToDelete)
        }}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  )
}

export default ProfileMenu
