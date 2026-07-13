import React, { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Globe, User, LogOut, Settings, BookOpen, MessageCircle, Coffee, Moon, Sun, Library as LibraryIcon } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ProfileMenu from './ProfileMenu'
import Chatbot from '../Chatbot/Chatbot'

const KOFI_URL = 'https://ko-fi.com/mvalera_dev'

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { t, toggle, lang } = useLanguage()
  const { user, profile, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.study'), href: '/study', icon: BookOpen },
    { name: t('library.title'), href: '/library', icon: LibraryIcon },
    { name: t('nav.contact'), href: '/contact', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100 flex flex-col transition-colors">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                S
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudySpark
              </span>
            </Link>

            {/* Centered desktop nav */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right cluster: theme + language + ko-fi + login/profile + mobile button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={toggle}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Cambiar idioma"
              >
                <Globe className="w-4 h-4" />
                {lang === 'es' ? 'ES' : 'EN'}
              </button>
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
              >
                <Coffee className="w-4 h-4" /> {t('support.kofi')}
              </a>
              {user ? (
                <ProfileMenu />
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                >
                  <User className="w-4 h-4" /> {t('nav.login')}
                </Link>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute right-0 top-16 w-64 h-full bg-white dark:bg-gray-900 shadow-xl p-4 dark:border-l dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
            >
              <Coffee className="w-4 h-4" /> {t('support.kofi')}
            </a>
            {user && (
              <button
                onClick={() => { signOut(); setIsSidebarOpen(false) }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium"
              >
                <LogOut className="w-4 h-4" />
                {t('profile.logout')}
              </button>
            )}
            <button
              onClick={toggle}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium"
            >
              <Globe className="w-4 h-4" />
              {lang === 'es' ? 'Español' : 'English'}
            </button>
            {user && (
              <button
                onClick={() => { setIsSidebarOpen(false); navigate('/settings') }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium"
              >
                <Settings className="w-4 h-4" />
                {t('profile.settings')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                S
              </span>
              <span className="font-bold text-gray-900 dark:text-white">StudySpark</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} StudySpark. {t('footer.copy')}
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/contact" className="hover:text-gray-900 transition-colors">{t('footer.privacy')}</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">{t('footer.terms')}</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
