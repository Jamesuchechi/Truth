const ADJECTIVES = [
  "Neon", "Void", "Spectral", "Ghost", "Cipher", "Dark", "Ethereal", "Static",
  "Onyx", "Chrome", "Binary", "Quantum", "Shadow", "Silent", "Hidden", "Obsidian"
]

const NOUNS = [
  "Spectre", "Drifter", "Pulse", "Signal", "Phantom", "Walker", "Wraith", "Oracle",
  "Fragment", "Trace", "Echo", "Vector", "Node", "Core", "Entity", "Warden"
]

const PROFANITY_BLACKLIST = [
  "admin", "root", "system", "moderator", "truth_admin", "staff"
  // Note: Add common offensive terms as needed
]

export function generateShadowName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const suffix = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  
  return `${adj}_${noun}_${suffix}`
}

export function isProfane(name: string): boolean {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return PROFANITY_BLACKLIST.some(badWord => sanitized.includes(badWord))
}

export function calculateActivityLevel(postCount: number): string {
  if (postCount > 100) return "HIGH FREQUENCY"
  if (postCount > 50) return "STABLE SIGNAL"
  if (postCount > 10) return "LOW LATENCY"
  return "INITIALIZING"
}

export function isEligibleForShadowVerification(shadowCreatedAt: Date | null, postCount: number): boolean {
  if (!shadowCreatedAt) return false
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return new Date(shadowCreatedAt) < thirtyDaysAgo && postCount >= 5
}
