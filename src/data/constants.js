// Platform configuration constants. Unlike the old mockData.js, nothing
// in this file is fake/demo content — it's taxonomy and small utilities
// that every environment (including a brand-new, empty database) needs.

export const categories = [
  'Civil Engineer',
  'Architect',
  'Structural Engineer',
  'MEP Engineer',
  'Contractor',
  'Surveyor',
  'Interior Designer',
  'Landscape Designer',
]

// Deterministic, license-free placeholder avatars (DiceBear), used only
// as a fallback when a real user hasn't uploaded a profile photo yet.
export function avatarUrl(seed) {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}
