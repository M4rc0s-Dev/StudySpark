// Shared color palette for folders and sessions in the Library.
// A color is stored as a short token (e.g. 'indigo'); the UI resolves it to
// Tailwind classes here so the mapping stays in one place and dark mode works.

export type ColorToken =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'

// Ordered strictly like a rainbow, red -> violet. 13 colors which, together
// with the "no color" option, make 14 swatches = two neat rows of 7.
export const COLOR_TOKENS: ColorToken[] = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
]

interface ColorClasses
{
  // Solid swatch used in the color picker.
  swatch: string
  // Accent text/icon color.
  text: string
  // Soft background tint for cards/folders.
  bg: string
  // Border accent.
  border: string
}

const MAP: Record<ColorToken, ColorClasses> =
{
  red:
  {
    swatch: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-300 dark:border-red-500/40',
  },
  orange:
  {
    swatch: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-300 dark:border-orange-500/40',
  },
  amber:
  {
    swatch: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-300 dark:border-amber-500/40',
  },
  yellow:
  {
    swatch: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-300 dark:border-yellow-500/40',
  },
  lime:
  {
    swatch: 'bg-lime-500',
    text: 'text-lime-600 dark:text-lime-400',
    bg: 'bg-lime-50 dark:bg-lime-500/10',
    border: 'border-lime-300 dark:border-lime-500/40',
  },
  green:
  {
    swatch: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-500/10',
    border: 'border-green-300 dark:border-green-500/40',
  },
  emerald:
  {
    swatch: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-300 dark:border-emerald-500/40',
  },
  teal:
  {
    swatch: 'bg-teal-500',
    text: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-300 dark:border-teal-500/40',
  },
  cyan:
  {
    swatch: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-300 dark:border-cyan-500/40',
  },
  sky:
  {
    swatch: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-300 dark:border-sky-500/40',
  },
  blue:
  {
    swatch: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-300 dark:border-blue-500/40',
  },
  indigo:
  {
    swatch: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-300 dark:border-indigo-500/40',
  },
  violet:
  {
    swatch: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-300 dark:border-violet-500/40',
  },
}

// Resolve a color token to its class set. Returns undefined for an unknown or
// empty token so callers can fall back to the default styling.
export function colorClasses(token?: string | null): ColorClasses | undefined
{
  if (!token) return undefined
  return MAP[token as ColorToken]
}
