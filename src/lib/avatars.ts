// Geometric, non-photographic avatars for StudySpark user profiles.
// Uses DiceBear's geometric styles (shapes, rings, identicon) tinted to the
// StudySpark palette. Each avatar is deterministic from a seed, so a user
// keeps the same picture across devices.

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

// Build a deterministic geometric avatar URL from a seed + style.
export function avatarUrl(seed: string, style: AvatarStyle = 'shapes'): string {
  const s = encodeURIComponent(seed || 'StudySpark')
  return `${BASE}/${style}/svg?seed=${s}&radius=50&backgroundType=gradientLinear&palette=${PALETTE}`
}

// A set of distinct seeds used to present multiple avatar options in the
// chooser. Selecting one pins that exact seed to the account.
export const AVATAR_SEEDS = Array.from({ length: 12 }, (_, i) => `studyspark-${i + 1}`)

// Resolve the avatar URL for a stored profile: if the profile has no avatar
// seed, derive a stable one from the user's name/email so existing accounts
// still get a consistent geometric picture instead of a blank.
export function profileAvatarUrl(avatar: string | null | undefined, fallback: string): string {
  const seed = (avatar && avatar.trim()) || fallback || 'StudySpark'
  return avatarUrl(seed, 'shapes')
}
