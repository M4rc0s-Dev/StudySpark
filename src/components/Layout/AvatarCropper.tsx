import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, Check, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface AvatarCropperProps {
  file: File
  onCancel: () => void
  onConfirm: (dataUrl: string) => void
}

const OUTPUT = 256

// Crop a square region out of an uploaded image inside a circular frame.
// The user can zoom (slider) and pan (drag) to decide which part is kept.
const AvatarCropper: React.FC<AvatarCropperProps> = ({ file, onCancel, onConfirm }) => {
  const { t } = useLanguage()
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [src, setSrc] = useState<string>('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [file])

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => { imgRef.current = img }
    img.src = src
  }, [src])

  // Keep the panned image inside the circular frame bounds.
  const clamp = useCallback((x: number, y: number, z: number) => {
    const max = (z - 1) * 100 // percent of half-frame the image can drift
    return { x: Math.max(-max, Math.min(max, x)), y: Math.max(-max, Math.min(max, y)) }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const nx = drag.current.ox + (e.clientX - drag.current.x) / 1.4
    const ny = drag.current.oy + (e.clientY - drag.current.y) / 1.4
    setOffset(clamp(nx, ny, zoom))
  }
  const onPointerUp = () => { drag.current = null }

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#e7ecf2'
    ctx.fillRect(0, 0, OUTPUT, OUTPUT)
    // The frame is 100% of the stage; image is scaled by `zoom` and shifted by
    // `offset` (in % of half the stage). Map image-pixel space -> canvas.
    const stage = 280 // matches the preview stage size below
    const scale = (stage * zoom) / Math.min(img.width, img.height)
    const drawW = img.width * scale
    const drawH = img.height * scale
    const baseX = (stage - drawW) / 2
    const baseY = (stage - drawH) / 2
    const dx = baseX + (offset.x / 100) * stage
    const dy = baseY + (offset.y / 100) * stage
    ctx.drawImage(img, dx, dy, drawW, drawH)
    onConfirm(canvas.toDataURL('image/png'))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-paper-sunken dark:border-[#33465c] bg-paper-raised dark:bg-[#1e2c3c] p-4"
    >
      <p className="text-sm font-medium text-ink-soft dark:text-sepia-200 mb-3 text-center">
        {t('auth.avatar.crop')}
      </p>

      <div
        className="relative mx-auto w-[280px] h-[280px] rounded-full overflow-hidden bg-paper-sunken dark:bg-sepia-800 cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {src && (
          <img
            src={src}
            alt="crop"
            draggable={false}
            className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
            style={{
              width: `${(280 * zoom) / 1}px`,
              height: 'auto',
              transform: `translate(-50%, -50%) translate(${offset.x}%, ${offset.y}%) scale(${zoom})`,
              transformOrigin: 'center',
            }}
          />
        )}
        {/* circular guide ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-ember-500/60" />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <ZoomIn className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            const z = Number(e.target.value)
            setZoom(z)
            setOffset((o) => clamp(o.x, o.y, z))
          }}
          className="flex-1 accent-ember-600 cursor-pointer"
        />
      </div>
      <p className="text-xs text-ink-muted dark:text-sepia-300 text-center mt-1">
        {t('auth.avatar.crop.hint')}
      </p>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-paper-sunken dark:border-[#33465c] text-sm font-medium text-ink-soft dark:text-sepia-200 hover:bg-paper-sunken dark:hover:bg-[#111d2a] transition-colors"
        >
          <X className="w-4 h-4" /> {t('config.cancel')}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!src}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ember-500 text-paper text-sm font-semibold shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> {t('auth.avatar.crop.save')}
        </button>
      </div>
    </motion.div>
  )
}

export default AvatarCropper
