import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Globe, Coffee, Sparkles, Download, Trash2, Brain, Clock, Repeat, ArrowLeft, Check, Layers, ChevronDown } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { exportSessions } from '../lib/export'
import { CARD_COUNT_OPTIONS, CARD_COUNT_AUTO, MAX_CARDS } from '../context/SettingsContext'
import type { StudyMode } from '../context/SettingsContext'
import type { StudySession } from '../types'

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

const defaultModes: { id: StudyMode; icon: typeof Brain; key: string }[] = [
  { id: 'basic', icon: Brain, key: 'mode.basic' },
  { id: 'timed', icon: Clock, key: 'mode.timed' },
  { id: 'spaced-repetition', icon: Repeat, key: 'mode.spaced' },
]

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, lang, toggle } = useLanguage()
  const { user, profile, sessions } = useAuth()
  const { prefs, setPrefs, resetLocalProgress } = useSettings()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    resetLocalProgress()
    setConfirmDelete(false)
    toast.success(t('settings.deleted'))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t('study.back')}
      </button>

      <motion.h1
        initial="hidden" animate="show" variants={fade}
        className="text-3xl font-bold text-gray-900 dark:text-white"
      >
        {t('settings.title')}
      </motion.h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t('settings.subtitle')}</p>

      <div className="space-y-6">
        {/* Language */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-indigo-500" /> {t('settings.language')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(['es', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => { if (lang !== l) toggle() }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  lang === l
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                }`}
              >
                {lang === l && <Check className="w-4 h-4" />}
                {l === 'es' ? t('settings.lang.es') : t('settings.lang.en')}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Study preferences */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-500" /> {t('settings.studyprefs')}
          </h2>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('settings.defaultmode')}</p>
            <div className="grid grid-cols-3 gap-2">
              {defaultModes.map((m) => {
                const Icon = m.icon
                const active = prefs.defaultMode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setPrefs({ defaultMode: m.id })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t(m.key as any)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> {t('settings.cardcount')}
            </p>
            <div className="relative">
              <select
                value={prefs.cardCount}
                onChange={(e) => setPrefs({ cardCount: Number(e.target.value) })}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition"
              >
                <option value={CARD_COUNT_AUTO}>{t('upload.cardcount.auto')}</option>
                {CARD_COUNT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === MAX_CARDS ? `(${t('settings.cardcount.max')})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.speak')}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{t('settings.speak.desc')}</span>
              </span>
            </span>
            <input
              type="checkbox"
              checked={prefs.autoplay}
              onChange={(e) => setPrefs({ autoplay: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
          </label>
        </motion.section>

        {/* Account / support */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Coffee className="w-5 h-5 text-amber-500" /> {t('settings.account')}
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('settings.plan')}</p>
              <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> {t('profile.free')}
              </p>
            </div>
          </div>
          <a
            href="https://ko-fi.com/mvalera_dev"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Coffee className="w-4 h-4" /> {t('support.kofi')}
          </a>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">{t('support.thanks')}</p>
        </motion.section>

        {/* Data */}
        <motion.section
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-emerald-500" /> {t('settings.data')}
          </h2>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('settings.export')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('settings.export.desc')}</p>
            <button
              onClick={() => {
                const decks: StudySession[] = sessions.map((s) => ({
                  id: s.id,
                  title: s.title,
                  flashcards: (s.flashcards as StudySession['flashcards']) || [],
                  createdAt: new Date(s.created_at),
                  studyMode: (s.study_mode as StudySession['studyMode']) || 'basic',
                }))
                exportSessions(decks, 'csv')
                toast.success(t('export.done'))
              }}
              disabled={sessions.length === 0}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> {t('export.csv')}
            </button>
          </div>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> {t('settings.delete')}
            </button>
          ) : (
            <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 p-4">
              <p className="text-sm text-rose-700 dark:text-rose-300 mb-3">{t('settings.delete.confirm')}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
                >
                  {t('settings.delete')}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:text-gray-200 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {t('config.cancel')}
                </button>
              </div>
            </div>
          )}

          {!user && (
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{t('auth.login.desc')}</p>
          )}
        </motion.section>
      </div>
    </div>
  )
}

export default SettingsPage
