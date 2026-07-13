import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { Home } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-7xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{t('notfound.title')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">{t('notfound.desc')}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <Home className="w-5 h-5" /> {t('notfound.home')}
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
