import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { avatarUrl, AVATAR_STYLES, AVATAR_SEEDS, type AvatarStyle } from '../../lib/avatars'

interface AvatarPickerProps {
  value: string
  onSelect: (seed: string) => void
  size?: 'sm' | 'md'
  label?: string
}

// A profile avatar that opens a chooser popover on click. The popover shows
// the three geometric styles; picking one reveals a grid of concrete options
// (seeds) for that style. Selecting an option pins exactly that seed.
const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onSelect, size = 'md', label }) => {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<AvatarStyle>('shapes')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const dim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16'
  const iconDim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${dim} rounded-full overflow-hidden ring-2 ring-ember-500/40 bg-paper-sunken dark:bg-sepia-800 shadow-sm hover:ring-ember-500 transition-all flex items-center justify-center`}
        aria-label={label || t('auth.avatar')}
      >
        <img src={avatarUrl(value, style)} alt={label || t('auth.avatar')} className={`${iconDim} object-cover`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute z-50 mt-2 left-0 w-72 rounded-2xl border border-paper-sunken dark:border-[#33465c] bg-paper-raised dark:bg-[#1e2c3c] shadow-lift p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-sepia-300 mb-2">
              {t('auth.avatar.style')}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AVATAR_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                    style === s.id
                      ? 'border-ember-500 bg-ember-50 dark:bg-ember-500/15'
                      : 'border-paper-sunken dark:border-[#33465c] hover:border-ember-300'
                  }`}
                >
                  <img src={avatarUrl(value, s.id)} alt={s.id} className="w-9 h-9 rounded-full bg-paper-sunken dark:bg-sepia-800" />
                  <span className="text-[11px] font-medium text-ink-soft dark:text-sepia-200">{t(s.label as any)}</span>
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-sepia-300 mb-2 flex items-center justify-between">
              <span>{t('auth.avatar.choose')}</span>
              <span className="normal-case font-normal text-[11px]">{t('auth.avatar.hint.short')}</span>
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
              {AVATAR_SEEDS.map((seed) => {
                const url = avatarUrl(seed, style)
                const isSelected = seed === value
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => { onSelect(seed); setOpen(false) }}
                    className={`relative rounded-full overflow-hidden ring-2 transition-all ${
                      isSelected ? 'ring-ember-500 scale-105' : 'ring-transparent hover:ring-ember-300'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full aspect-square object-cover bg-paper-sunken dark:bg-sepia-800" />
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-ember-500 flex items-center justify-center ring-2 ring-paper-raised dark:ring-[#1e2c3c]">
                        <Check className="w-2.5 h-2.5 text-paper" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvatarPicker
