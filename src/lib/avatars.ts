// Geometric, non-photographic avatars for StudySpark user profiles, plus the
// option to upload a real photo. Uses DiceBear's geometric styles (shapes,
// rings, identicon) tinted to the StudySpark palette. Each avatar is
// deterministic from a seed, so a user keeps the same picture across devices.
//
// A profile's `avatar` column stores ONE of:
//   - "style:seed"  e.g. "rings:studyspark-3"  (geometric, style is kept!)
//   - "photo:<dataURL>"                          (user-uploaded image)
//   - null / ""                                 (fallback to a derived seed)

// Palette tokens (from tailwind.config.js) as broadcastable hex strings.
const PALETTE = [
  '1e2a38', // ink
  '4a6c86', // ember (slate blue)
  '6f9bb8', // ember light
  'e0e9f2', // mist
  'd98c5f', // sepia/ember accent
  '2f4858', // deep slate
].join(',')

export type AvatarStyle = 'shapes' | 'rings' | 'identicon'

// The geometric styles a user can pick from.
export const AVATAR_STYLES: { id: AvatarStyle; label: string }[] = [
  { id: 'shapes', label: 'auth.avatar.shapes' },
  { id: 'rings', label: 'auth.avatar.rings' },
  { id: 'identicon', label: 'auth.avatar.identicon' },
]

const BASE = 'https://api.dicebear.com/9.x'

export const AVATAR_SEED_PREFIX = 'studyspark'
export const PHOTO_PREFIX = 'photo:'

// Build a deterministic geometric avatar URL from a seed + style.
export function avatarUrl(seed: string, style: AvatarStyle = 'shapes'): string {
  const s = encodeURIComponent(seed || 'StudySpark')
  return `${BASE}/${style}/svg?seed=${s}&radius=50&backgroundType=gradientLinear&palette=${PALETTE}`
}

// A set of distinct seeds used to present multiple avatar options in the
// chooser. Selecting one pins that exact "style:seed" to the account.
export const AVATAR_SEEDS = Array.from({ length: 12 }, (_, i) => `${AVATAR_SEED_PREFIX}-${i + 1}`)

// Compose / parse the stored "style:seed" token.
export function avatarToken(style: AvatarStyle, seed: string): string {
  return `${style}:${seed}`
}

export function parseAvatarToken(value: string | null | undefined): {
  kind: 'geometric' | 'photo' | 'none'
  style: AvatarStyle
  seed: string
  photo?: string
} {
  const v = (value || '').trim()
  if (!v) return { kind: 'none', style: 'shapes', seed: '' }
  if (v.startsWith(PHOTO_PREFIX)) return { kind: 'photo', style: 'shapes', seed: '', photo: v.slice(PHOTO_PREFIX.length) }
  const idx = v.indexOf(':')
  if (idx > 0) {
    const style = v.slice(0, idx) as AvatarStyle
    const seed = v.slice(idx + 1)
    if ((AVATAR_STYLES as { id: string }[]).some((s) => s.id === style) && seed) {
      return { kind: 'geometric', style, seed }
    }
  }
  // Legacy value: just a seed with no style -> default to shapes.
  return { kind: 'geometric', style: 'shapes', seed: v }
}

// Resolve the avatar URL/string for a stored profile. Returns either a
// Data URL (photo) or a DiceBear URL whose style comes from the stored token,
// so a chosen "rings"/"identicon" avatar is always shown correctly.
export function profileAvatarUrl(avatar: string | null | undefined, fallback: string): string {
  const { kind, style, seed, photo } = parseAvatarToken(avatar)
  if (kind === 'photo' && photo) return photo
  const s = seed || fallback || 'StudySpark'
  return avatarUrl(s, style)
}
