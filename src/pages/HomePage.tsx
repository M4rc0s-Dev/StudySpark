import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import UploadArea from '../components/Features/UploadArea'
import SessionConfigModal from '../components/Study/SessionConfigModal'
import LoadingScreen from '../components/Features/LoadingScreen'
import { toast } from 'react-hot-toast'
import FlashcardAPI from '../services/apiService'
import { useLanguage } from '../context/LanguageContext'
import { useFlashcardStore } from '../context/FlashcardContext'
import { useSettings } from '../context/SettingsContext'
import { saveSessionToSupabase } from '../lib/sessions'
import { StudySession } from '../types'
import type { SessionConfig } from '../context/SettingsContext'
import { FileText, Wand2, Brain, ArrowRight, Star, Sparkles, Zap, Layers, Trophy } from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  // Last generation error, shown on the loading screen with a Cancel button.
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loadingElapsed, setLoadingElapsed] = useState(0)
  const [pendingCards, setPendingCards] = useState<{ title: string; cards: StudySession['flashcards'] } | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const uploadRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { createSession } = useFlashcardStore()
  const { prefs } = useSettings()

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Called from the loading screen's Cancel button: abort the poll loop and
  // drop the overlay so the user is never stuck on a frozen screen.
  const cancelUpload = () => {
    try { FlashcardAPI.cancel() } catch {}
    setIsUploading(false)
    setUploadError(null)
  }

  const handleUpload = async (file?: File, text?: string, fileName?: string, cardCount?: number) => {
    setIsUploading(true)
    setLoadingElapsed(0)
    setUploadError(null)
    try {
      // cardCount may be -1 (let the AI decide); only fall back to the default
      // when nothing was provided at all.
      const finalCount = cardCount === undefined ? prefs.cardCount : cardCount
      // Async flow: the Worker returns a jobId immediately and we poll Supabase
      // until the AI finishes, driving the staged loading screen with onTick.
      const response = await FlashcardAPI.generateFlashcards(
        text || '',
        file,
        fileName,
        finalCount,
        (elapsedMs) => setLoadingElapsed(elapsedMs)
      )
      const cards = response.flashcards || []
      if (!cards.length) {
        toast.error('La IA no devolvió tarjetas. Prueba con más texto.')
        return
      }
      const title = fileName?.trim() || 'Mis flashcards'
      setPendingCards({ title, cards })
      setConfigOpen(true)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudieron generar las flashcards. Inténtalo de nuevo.'
      setUploadError(msg)
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const startStudy = (cfg: SessionConfig) => {
    if (!pendingCards) return
    const id = createSession(pendingCards.title, pendingCards.cards, cfg.mode)
    const session: StudySession = {
      id,
      title: pendingCards.title,
      fileName: pendingCards.title,
      flashcards: pendingCards.cards,
      createdAt: new Date(),
      studyMode: cfg.mode,
      timeSpent: 0,
      score: 0,
    }
    // Persist the chosen order/direction on the session so it survives reload.
    saveSessionToSupabase(session)
    toast.success('¡Flashcards generadas!')
    setConfigOpen(false)
    setPendingCards(null)
    // Pass the full session config (mode, order, direction, autoplay) through
    // navigation state so StudyPage starts with exactly what the user chose
    // instead of falling back to the default preferences.
    navigate('/study', { state: { config: cfg } })
  }

  const steps = [
    { icon: FileText, key: 'how.step1', descKey: 'how.step1.desc' },
    { icon: Wand2, key: 'how.step2', descKey: 'how.step2.desc' },
    { icon: Brain, key: 'how.step3', descKey: 'how.step3.desc' },
  ]

  const testimonials = [
    { name: 'Lucía M.', role: 'Medicina', text: 'Hice 200 tarjetas de anatomía en una tarde. Aprobé.', initial: 'L' },
    { name: 'Carlos R.', role: 'Ingeniería', text: 'La repetición espaciada me salvó la carrera. Clarísimo.', initial: 'C' },
    { name: 'Marta G.', role: 'Oposiciones', text: 'Subí mis temas y salieron flashcards perfectas.', initial: 'M' },
  ]

  const stats = [
    { icon: Zap, value: '< 10s', label: 'Por mazo' },
    { icon: Layers, value: '4 formatos', label: 'Pregunta tipo' },
    { icon: Trophy, value: '∞', label: 'Repaso' },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700">
        {/* Floating background blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl animate-blob" />
        <div className="absolute top-32 -right-16 w-80 h-80 rounded-full bg-fuchsia-400/20 blur-2xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-300/20 blur-2xl animate-blob animation-delay-4000" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" /> {t('hero.badge')}
          </motion.span>

          <motion.h1
            initial="hidden" animate="show" variants={fade} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
          >
            {t('hero.title.1')}{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              {t('hero.title.2')}
            </span>{' '}
            {t('hero.title.3')}
          </motion.h1>

          <motion.p
            initial="hidden" animate="show" variants={fade} transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-5 text-lg text-indigo-100 max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial="hidden" animate="show" variants={fade} transition={{ delay: 0.18, duration: 0.5 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <UploadArea onUpload={handleUpload} isUploading={isUploading} innerRef={uploadRef} />
          </motion.div>
        </div>

        {/* Stats band */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="text-center"
                >
                  <Icon className="w-7 h-7 mx-auto mb-2 text-yellow-300" />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-indigo-200">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
        >
          {t('how.title')}
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.key}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div className="relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-5 shadow-md transition-transform group-hover:scale-110">
                  <Icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-indigo-900 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(step.key as any)}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{t(step.descKey as any)}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            {t('testi.title')}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((tm, i) => (
              <motion.div
                key={tm.name}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                  {[...Array(5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-4">"{tm.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                    {tm.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{tm.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tm.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
            className="text-3xl font-bold text-white"
          >
            {t('cta.bottom')}
          </motion.h2>
          <motion.button
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade} transition={{ delay: 0.1 }}
            onClick={scrollToUpload}
            className="mt-8 inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-indigo-700 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" /> {t('cta.create')}
          </motion.button>
        </div>
      </section>

      <SessionConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onStart={startStudy}
        deckTitle={pendingCards?.title}
      />

      {isUploading && <LoadingScreen elapsedMs={loadingElapsed} error={uploadError} onCancel={cancelUpload} />}
    </div>
  )
}

export default HomePage
