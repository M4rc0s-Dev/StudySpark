import React, { useState } from 'react'
import { HelpCircle, MessageCircle, Copy, Check, Volume2, VolumeX } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLanguage } from '../../context/LanguageContext'
import type { Difficulty } from '../../types'

interface FlashcardProps {
  flashcard: {
    question: string
    answer: string
    concept?: string
    difficulty?: Difficulty
  }
  showAnswer: boolean
  onToggleAnswer: () => void
  autoplay?: boolean
}

const difficultyStyles: Record<string, { ring: string; chip: string; key: string }> = {
  'very-easy': {
    ring: 'border-emerald-200',
    chip: 'bg-emerald-100 text-emerald-700',
    key: 'card.very-easy',
  },
  easy: {
    ring: 'border-teal-200',
    chip: 'bg-teal-100 text-teal-700',
    key: 'card.easy',
  },
  medium: {
    ring: 'border-amber-200',
    chip: 'bg-amber-100 text-amber-700',
    key: 'card.medium',
  },
  hard: {
    ring: 'border-orange-200',
    chip: 'bg-orange-100 text-orange-700',
    key: 'card.hard',
  },
  'very-hard': {
    ring: 'border-rose-200',
    chip: 'bg-rose-100 text-rose-700',
    key: 'card.very-hard',
  },
}

const conceptStyles: Record<string, string> = {
  Politics: 'bg-blue-100 text-blue-800',
  Economics: 'bg-emerald-100 text-emerald-800',
  Military: 'bg-slate-100 text-slate-800',
  Science: 'bg-purple-100 text-purple-800',
  History: 'bg-orange-100 text-orange-800',
  Física: 'bg-sky-100 text-sky-800',
  Biología: 'bg-green-100 text-green-800',
  Ciencia: 'bg-purple-100 text-purple-800',
  Historia: 'bg-orange-100 text-orange-800',
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcard, showAnswer, onToggleAnswer, autoplay }) => {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const diff = flashcard.difficulty ? difficultyStyles[flashcard.difficulty] : null
  const conceptClass =
    (flashcard.concept && conceptStyles[flashcard.concept]) || 'bg-indigo-100 text-indigo-800'
  const noDifficultyLabel = t('card.no.difficulty')

  const handleCopy = async () => {
    const text = `Q: ${flashcard.question}\nA: ${flashcard.answer}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available */
    }
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = /[áéíóúñ¿¡]/i.test(text) ? 'es-ES' : 'en-US'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    speak(showAnswer ? flashcard.answer : flashcard.question)
  }

  // Auto-play when the card flips to reveal the answer.
  React.useEffect(() => {
    if (autoplay && showAnswer && 'speechSynthesis' in window) {
      speak(flashcard.answer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnswer, autoplay])

  const FaceWrapper: React.FC<{ back?: boolean; children: React.ReactNode }> = ({
    back,
    children,
  }) => (
    <div
      className={cn(
        'absolute inset-0 backface-hidden overflow-hidden rounded-3xl border-2',
        diff ? diff.ring : 'border-gray-200 dark:border-gray-700',
        back
          ? 'rotate-y-180 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40'
          : 'bg-white dark:bg-gray-800 card-sheen'
      )}
    >
      {children}
    </div>
  )

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      <div
        onClick={onToggleAnswer}
        className={cn(
          'relative w-full h-72 cursor-pointer transition-transform duration-700 preserve-3d',
          showAnswer ? 'rotate-y-180' : ''
        )}
      >
        {/* FRONT — Question */}
        <FaceWrapper>
          <div className="flex h-full flex-col p-7">
            <div className="mb-3 flex items-start justify-between">
              <span className="inline-flex items-center gap-2 text-indigo-600">
                <HelpCircle className="w-6 h-6" />
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                  {t('card.question')}
                </span>
              </span>
              {diff ? (
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', diff.chip)}>
                  {t(diff.key as any)}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                  {noDifficultyLabel}
                </span>
              )}
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-xl font-semibold leading-relaxed text-gray-900 dark:text-gray-50">
                {flashcard.question}
              </p>
            </div>
            {flashcard.concept && (
              <div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', conceptClass)}>
                  {flashcard.concept}
                </span>
              </div>
            )}
          </div>
        </FaceWrapper>

        {/* BACK — Answer */}
        <FaceWrapper back>
          <div className="flex h-full flex-col p-7">
            <div className="mb-3 flex items-start justify-between">
              <span className="inline-flex items-center gap-2 text-emerald-600">
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  {t('card.answer')}
                </span>
              </span>
              {diff ? (
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', diff.chip)}>
                  {t(diff.key as any)}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                  {noDifficultyLabel}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-100">{flashcard.answer}</p>
            </div>
            {flashcard.concept && (
              <div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', conceptClass)}>
                  {flashcard.concept}
                </span>
              </div>
            )}
          </div>
        </FaceWrapper>
      </div>

      {/* Toolbar (sits below the card, does not flip) */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCopy()
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? t('card.copied') : t('card.copy')}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSpeak()
          }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm border transition-colors',
            speaking
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {speaking ? t('card.stop') : t('card.listen')}
        </button>
      </div>
    </div>
  )
}

export default Flashcard
