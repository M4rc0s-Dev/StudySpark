import React from 'react'
import { Clock, Timer, Repeat, Brain, Zap } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import type { StudyMode } from '../../context/SettingsContext'

interface StudyModeSelectorProps {
  mode: StudyMode
  onModeChange?: (mode: StudyMode) => void
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ mode, onModeChange }) => {
  const { t } = useLanguage()
  const { prefs, setPrefs } = useSettings()

  const modes: { id: StudyMode; icon: typeof Brain; color: string; key: string }[] = [
    { id: 'basic', icon: Brain, color: 'bg-blue-500', key: 'mode.basic' },
    { id: 'timed', icon: Clock, color: 'bg-orange-500', key: 'mode.timed' },
    { id: 'spaced-repetition', icon: Repeat, color: 'bg-emerald-500', key: 'mode.spaced' },
  ]

  const handlePick = (m: StudyMode) => {
    setPrefs({ defaultMode: m })
    onModeChange?.(m)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-sepia-700 rounded-xl p-1.5">
      {modes.map((m) => {
        const Icon = m.icon
        const active = mode === m.id
        return (
          <button
            key={m.id}
            onClick={() => handlePick(m.id)}
            title={t(m.key as any)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? `${m.color} text-white shadow-sm`
                : 'text-gray-600 dark:text-sepia-200 hover:bg-white dark:hover:bg-sepia-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{t(m.key as any)}</span>
          </button>
        )
      })}
    </div>
  )
}

export default StudyModeSelector
