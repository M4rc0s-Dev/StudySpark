import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Upload } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import {
  avatarUrl,
  AVATAR_STYLES,
  AVATAR_SEEDS,
  avatarToken,
  parseAvatarToken,
  PHOTO_PREFIX,
  type AvatarStyle,
} from '../../lib/avatars'
import AvatarCropper from './AvatarCropper'

interface AvatarPickerProps {
  value: string
  onSelect: (token: string) => void
  size?: 'sm' | 'md'
  label?: string
}

// A profile avatar that opens a chooser popover on click. The popover shows
// the three geometric styles; picking one reveals a grid of concrete options
// (seeds) for that style. The stored value keeps BOTH style and seed
// ("style:seed") so a chosen "rings"/"identicon" avatar survives reloads.
// Users can also upload their own photo, cropped to a circle with zoom/pan.
const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onSelect, size = 'md', label }) => {
  const { t } = useLanguage()
  const parsed = parseAvatarToken(value)
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<AvatarStyle>(parsed.kind === 'geometric' ? parsed.style : 'shapes')
  const [seed, setSeed] = useState(parsed.kind === 'geometric' ? parsed.seed : AVATAR_SEEDS[0])
  const [cropping, setCropping] = useState<File | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const dim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16'
  const previewSrc = parsed.kind === 'photo' && parsed.photo ? parsed.photo : avatarUrl(seed, style)

  const chooseSeed = (s: string) => {
    const token = avatarToken(style, s)
    setSeed(s)
    onSelect(token)
    setOpen(false)
  }

  const chooseStyle = (st: AvatarStyle) => {
    setStyle(st)
    onSelect(avatarToken(st, seed))
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setCropping(f)
    e.target.value = ''
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${dim} rounded-full overflow-hidden ring-2 ring-ember-500/40 bg-paper-sunken dark:bg-sepia-800 shadow-sm hover:ring-ember-500 transition-all flex items-center justify-center`}
        aria-label={label || t('auth.avatar')}
      >
        <img src={previewSrc} alt={label || t('auth.avatar')} className={`${dim} object-cover`} />
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
            {cropping ? (
              <AvatarCropper
                file={cropping}
                onCancel={() => setCropping(null)}
                onConfirm={(dataUrl) => {
                  onSelect(`${PHOTO_PREFIX}${dataUrl}`)
                  setCropping(null)
                  setOpen(false)
                }}
              />
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-sepia-300 mb-2">
                  {t('auth.avatar.style')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {AVATAR_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => chooseStyle(s.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                        style === s.id
                          ? 'border-ember-500 bg-ember-50 dark:bg-ember-500/15'
                          : 'border-paper-sunken dark:border-[#33465c] hover:border-ember-300'
                      }`}
                    >
                      <img src={avatarUrl(seed, s.id)} alt={s.id} className="w-9 h-9 rounded-full bg-paper-sunken dark:bg-sepia-800" />
                      <span className="text-[11px] font-medium text-ink-soft dark:text-sepia-200">{t(s.label as any)}</span>
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-sepia-300 mb-2 flex items-center justify-between">
                  <span>{t('auth.avatar.choose')}</span>
                  <span className="normal-case font-normal text-[11px]">{t('auth.avatar.hint.short')}</span>
                </p>
                <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1 mb-3">
                  {AVATAR_SEEDS.map((s) => {
                    const url = avatarUrl(s, style)
                    const isSelected = parsed.kind === 'geometric' && parsed.style === style && s === seed
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => chooseSeed(s)}
                        className={`relative rounded-full overflow-hidden ring-2 transition-all ${
                          isSelected ? 'ring-ember-500 scale-105' : 'ring-transparent hover:ring-ember-300'
                        }`}
                      >
                        <img src={url} alt={s} className="w-full aspect-square object-cover bg-paper-sunken dark:bg-sepia-800" />
                        {isSelected && (
                          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-ember-500 flex items-center justify-center ring-2 ring-paper-raised dark:ring-[#1e2c3c]">
                            <Check className="w-2.5 h-2.5 text-paper" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-dashed border-paper-sunken dark:border-[#33465c] text-sm font-medium text-ember-600 dark:text-ember-400 hover:bg-ember-50 dark:hover:bg-ember-500/10 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" /> {t('auth.avatar.upload')}
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvatarPicker
