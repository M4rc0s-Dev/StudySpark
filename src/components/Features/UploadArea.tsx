import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, X, AlertCircle, Loader2, Layers, ChevronDown } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { CARD_COUNT_OPTIONS, CARD_COUNT_AUTO, CARD_COUNT_AUTO_LABEL, MAX_CARDS } from '../../context/SettingsContext'

interface UploadAreaProps {
  onUpload: (file?: File, text?: string, fileName?: string, cardCount?: number) => void
  isUploading: boolean
  innerRef?: React.RefObject<HTMLDivElement>
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, isUploading, innerRef }) => {
  const { t } = useLanguage()
  const { prefs } = useSettings()
  const [cardCount, setCardCount] = useState<number>(prefs.cardCount)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState<string>('')

  const acceptedFiles = {
    'text/plain': ['.txt'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setError('')

      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsText(file)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  })

  const handleTextSubmit = () => {
    if (textInput.trim()) onUpload(undefined, textInput.trim(), fileName.trim() || undefined, cardCount)
  }

  const handleFileSubmit = () => {
    if (selectedFile) onUpload(selectedFile, undefined, fileName.trim() || selectedFile.name, cardCount)
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview('')
    setTextInput('')
    setFileName('')
    setError('')
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'txt': return '📝'
      case 'docx': return '📗'
      default: return '📁'
    }
  }

  return (
    <div ref={innerRef} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl ring-1 ring-white/40 dark:ring-gray-700/50 p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('upload.title')}</h2>

      {/* File name (sent to n8n) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t('filename.label')}
        </label>
        <input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder={t('filename.placeholder')}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Card count for this deck (overrides the default in Settings) */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" /> {t('settings.cardcount')}
        </p>
        <div className="relative">
          <select
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm font-medium text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition"
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

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5'}
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : ''}`}
      >
        <input {...getInputProps()} />
        <div className={`mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'}`}>
          <Upload className="w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {isDragActive ? t('upload.drop') : t('upload.drag')}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-1">{t('upload.click')}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t('upload.formats')}</p>
      </div>

      {error && (
        <div className="mt-4 flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {selectedFile && (
        <SelectedFileCard file={selectedFile} preview={preview} clear={clearSelection} icon={getFileIcon(selectedFile.name)} />
      )}

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-900 px-4 text-gray-400 font-medium">{t('upload.or')}</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {t('upload.text.label')}
        </label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('upload.text.placeholder')}
          className="w-full h-36 p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={clearSelection}
          className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          disabled={isUploading}
        >
          {t('upload.clear')}
        </button>
        <button
          onClick={handleTextSubmit}
          disabled={!textInput.trim() || isUploading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('upload.fromtext')}
        </button>
        <button
          onClick={handleFileSubmit}
          disabled={!selectedFile || isUploading}
          className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-semibold hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {t('upload.fromfile')}
        </button>
      </div>

      {isUploading && (
        <div className="mt-6 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-3 font-medium text-gray-700">{t('upload.processing')}</p>
          <p className="text-sm text-gray-500">{t('upload.processing.sub')}</p>
        </div>
      )}
    </div>
  )
}

const SelectedFileCard: React.FC<{
  file: File
  preview: string
  clear: () => void
  icon: string
}> = ({ file, preview, clear, icon }) => {
  const { t } = useLanguage()
  return (
  <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-700">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <button onClick={clear} className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Quitar archivo">
        <X className="w-5 h-5" />
      </button>
    </div>
    {preview && (
      <div>
        <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">{t('upload.preview')}</p>
        <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 max-h-32 overflow-y-auto">
          {preview.substring(0, 200)}...
        </div>
      </div>
    )}
  </div>
  )
}

export default UploadArea
