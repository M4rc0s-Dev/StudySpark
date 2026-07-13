import React from 'react'

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4 // 0 = vacío, 4 = muy fuerte
  label: string // es
  color: string // tailwind bg class for the filled bars
  textColor: string
}

// Scores a password 0-4 from length + character variety. Returns the
// label + colors for the meter UI. Kept pure so it can be reused on the
// register form too.
export function scorePassword(pw: string): PasswordStrengthResult {
  if (!pw) return { score: 0, label: '', color: '', textColor: '' }
  let bits = 0
  if (pw.length >= 8) bits++
  if (pw.length >= 12) bits++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) bits++
  if (/\d/.test(pw)) bits++
  if (/[^A-Za-z0-9]/.test(pw)) bits++

  // Map the 0-5 bit count to 1-4 so even a short pw shows something.
  let score: 0 | 1 | 2 | 3 | 4 = 1
  if (bits >= 5 && pw.length >= 8) score = 4
  else if (bits >= 4 && pw.length >= 8) score = 3
  else if (bits >= 3) score = 2
  else score = 1

  const map: Record<number, { label: string; color: string; textColor: string }> = {
    1: { label: 'Débil', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
    2: { label: 'Media', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
    3: { label: 'Buena', color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
    4: { label: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
  }
  const m = map[score]
  return { score, label: m.label, color: m.color, textColor: m.textColor }
}

interface PasswordStrengthProps {
  value: string
  // Pass the "repeat" field value to also show a match check.
  confirm?: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value, confirm }) => {
  const res = scorePassword(value)
  const bars = [1, 2, 3, 4]
  const matched = confirm !== undefined && confirm.length > 0 && value === confirm && value.length > 0

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {bars.map((b) => (
          <div
            key={b}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              b <= res.score && res.score > 0 ? res.color : 'bg-slate-200 dark:bg-sepia-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px]">
        <span className={res.score > 0 ? res.textColor : 'text-ink-muted dark:text-sepia-300'}>
          {res.score > 0 ? `Seguridad: ${res.label}` : ' '}
        </span>
        {confirm !== undefined && (
          <span className={matched ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-ink-muted dark:text-sepia-300'}>
            {matched ? '✓ Coinciden' : ' '}
          </span>
        )}
      </div>
    </div>
  )
}

export default PasswordStrength
