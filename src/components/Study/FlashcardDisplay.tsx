import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, Volume2, VolumeX } from 'lucide-react'
import FlashcardComponent from '../Features/Flashcard'

interface FlashcardDisplayProps {
  flashcards: any[]
  currentIndex: number
  onNext: () => void
  onPrevious: () => void
  onFlip: () => void
  isFlipped: boolean
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcards,
  currentIndex,
  onNext,
  onPrevious,
  onFlip,
  isFlipped
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false)

  const currentFlashcard = flashcards[currentIndex]

  const handleTextToSpeech = () => {
    if (!currentFlashcard) return

    const text = isFlipped ? currentFlashcard.answer : currentFlashcard.question
    const utterance = new SpeechSynthesisUtterance(text)

    if (audioEnabled) {
      speechSynthesis.cancel()
      setAudioEnabled(false)
    } else {
      speechSynthesis.speak(utterance)
      setAudioEnabled(true)

      utterance.onend = () => setAudioEnabled(false)
    }
  }

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === flashcards.length - 1}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Flashcard */}
      <div className="mb-8">
        <FlashcardComponent
          flashcard={currentFlashcard}
          showAnswer={isFlipped}
          onToggleAnswer={onFlip}
        />
      </div>

      {/* Audio Control & Flip Hint */}
      <div className="flex justify-center items-center space-x-8">
        <button
          onClick={handleTextToSpeech}
          className={`p-3 rounded-full transition-all ${audioEnabled
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {audioEnabled ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Press the card to flip</p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-8 h-2 bg-blue-500 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
        </div>

        <button
          onClick={onFlip}
          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default FlashcardDisplay