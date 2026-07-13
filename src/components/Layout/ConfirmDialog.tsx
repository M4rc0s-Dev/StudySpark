import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { cn } from '../../utils/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  // Optional third button, shown between cancel and confirm (e.g. an alternative
  // destructive action like "delete folder AND its contents").
  secondaryLabel?: string
  onSecondary?: () => void
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  secondaryLabel,
  onSecondary,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage()
  // Render through a portal to document.body so a transformed/animated ancestor
  // (e.g. the profile dropdown) can never offset or clip the centered dialog.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-ink/50 dark:bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm bg-paper-raised dark:bg-[#161210] rounded-2xl shadow-lift border border-paper-sunken dark:border-[#2a2420] p-6"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  destructive
                    ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-ember-50 dark:bg-ember-500/15 text-ember-600 dark:text-ember-400'
                )}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold text-ink dark:text-stone-100">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft dark:text-stone-300 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-[#d6d3d1] dark:border-[#3a342e] dark:text-stone-200 text-sm font-medium hover:bg-paper-sunken dark:hover:bg-[#1c1917] transition-colors"
              >
                {cancelLabel || t('config.cancel')}
              </button>
              {secondaryLabel && onSecondary && (
                <button
                  onClick={onSecondary}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  {secondaryLabel}
                </button>
              )}
              <button
                onClick={onConfirm}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors',
                  destructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-ember-600 hover:bg-ember-700'
                )}
              >
                {confirmLabel || t('library.delete')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ConfirmDialog
