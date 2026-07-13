import React from 'react'

interface ProgressBarProps {
  progress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span>0%</span>
        <span>{progress < 10 ? '0' : progress < 100 ? Math.floor(progress) : '100'}%</span>
      </div>
    </div>
  )
}

export default ProgressBar