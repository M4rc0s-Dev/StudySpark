import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

interface TimerProps {
  time: number
  isRunning: boolean
}

const Timer: React.FC<TimerProps> = ({ time, isRunning }) => {
  const { t } = useLanguage()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isRunning ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
      <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
      <span className="font-mono text-lg font-semibold">{formatTime(time)}</span>
      <span className="text-sm">{isRunning ? t('mode.recording') : t('mode.paused')}</span>
    </div>
  )
}

export default Timer
