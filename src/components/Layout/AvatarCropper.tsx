import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, Check, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface AvatarCropperProps {
  file: File
  onCancel: () => void
  onConfirm: (dataUrl: string) => void
}

const STAGE = 280 // preview circle diameter (px)
const OUTPUT = 256 // exported png size (px)
const MIN_ZOOM = 1
const MAX_ZOOM = 3

// Crop a square region out of an uploaded image inside a circular frame.
// One single math model drives BOTH the live preview and the exported canvas,
// so "what you see is what you get". At zoom=1 the image already covers the
// circle (cover fit); zooming in and panning decides which part is kept.
// Anything outside the circle is shown dimmed so the user sees what is discarded.
const AvatarCropper: React.FC<AvatarCropperProps> = ({ file, onCancel, onConfirm }) => {
  const { t } = useLanguage()
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [src, setSrc] = useState<string>('')
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 }) // px, top-left of image vs stage
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [file])

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setDims({ w: img.naturalWidth, h: img.naturalHeight })
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    img.src = src
  }, [src])

  // cover scale: image size (px) at zoom=1 so it fills the stage.
  const coverScale = useMemo(() => {
    if (!dims.w || !dims.h) return 1
    return Math.max(STAGE / dims.w, STAGE / dims.h)
  }, [dims])

  const displaySize = useMemo(
    () => ({ w: dims.w * coverScale * zoom, h: dims.h * coverScale * zoom }),
    [dims, coverScale, zoom],
  )

  // How far the image can be panned so it still covers the circle.
  const maxOffset = useMemo(
    () => ({ x: Math.max(0, (displaySize.w - STAGE) / 2), y: Math.max(0, (displaySize.h - STAGE) / 2) }),
    [displaySize],
  )

  const clampOffset = useCallback(
    (x: number, y: number) => ({
      x: Math.max(-maxOffset.x, Math.min(maxOffset.x, x)),
      y: Math.max(-maxOffset.y, Math.min(maxOffset.y, y)),
    }),
    [maxOffset],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const nx = drag.current.ox + (e.clientX - drag.current.x)
    const ny = drag.current.oy + (e.clientY - drag.current.y)
    setOffset(clampOffset(nx, ny))
  }
  const onPointerUp = () => { drag.current = null }

  const onZoom = (z: number) => {
    const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
    setZoom(nz)
    setOffset((o) => clampOffset(o.x, o.y))
  }

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img || !dims.w) return
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#e7ecf2'
    ctx.fillRect(0, 0, OUTPUT, OUTPUT)
    // Map the same preview geometry into the output canvas.
    const ratio = OUTPUT / STAGE
    const dW = displaySize.w * ratio
    const dH = displaySize.h * ratio
    const dx = offset.x * ratio
    const dy = offset.y * ratio
    ctx.drawImage(img, dx, dy, dW, dH)
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
        className="relative mx-auto rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ width: STAGE, height: STAGE, backgroundColor: 'rgba(0,0,0,0.04)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {src && dims.w > 0 && (
          <>
            {/* Full image, dimmed: shows what will be discarded outside the circle. */}
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute left-0 top-0 max-w-none pointer-events-none opacity-40"
              style={{ width: displaySize.w, height: displaySize.h, transform: `translate(${offset.x}px, ${offset.y}px)` }}
            />
            {/* Same image clipped to the circle: the part that is kept. */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <img
                src={src}
                alt="crop"
                draggable={false}
                className="absolute left-0 top-0 max-w-none pointer-events-none"
                style={{ width: displaySize.w, height: displaySize.h, transform: `translate(${offset.x}px, ${offset.y}px)` }}
              />
            </div>
          </>
        )}
        {/* circular guide ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-ember-500/70" />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <ZoomIn className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
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
          disabled={!src || dims.w === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ember-500 text-paper text-sm font-semibold shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> {t('auth.avatar.crop.save')}
        </button>
      </div>
    </motion.div>
  )
}

export default AvatarCropper
