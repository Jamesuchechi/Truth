import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Calculate Levenshtein distance between two strings
 * Used for detecting slightly mutated spam signals
 */
export function getLevenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) [s1, s2] = [s2, s1]
  if (s2.length === 0) return s1.length

  const previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i)
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1]
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1
      const deletions = currentRow[j] + 1
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0)
      currentRow.push(Math.min(insertions, deletions, substitutions))
    }
    previousRow.splice(0, previousRow.length, ...currentRow)
  }
  return previousRow[s2.length]
}

/**
 * Check if content is too similar to recent transmissions
 */
export async function isDuplicateSignal(userId: string, content: string): Promise<boolean> {
  const historyKey = `user:${userId}:post_history`
  const recentPosts = await redis.lrange(historyKey, 0, 4) // Last 5 posts

  for (const prevContent of recentPosts) {
    const distance = getLevenshteinDistance(content, prevContent as string)
    const threshold = Math.floor(content.length * 0.2) // 20% difference allowed
    if (distance <= threshold) return true
  }

  return false
}

/**
 * Rate limiting enforcement (Drift-tier governance)
 * 3 posts/min, 20 posts/hour
 */
export async function checkRateLimit(userId: string): Promise<{ success: boolean; reason?: string }> {
  const minKey = `rate_limit:min:${userId}`
  const hourKey = `rate_limit:hour:${userId}`

  const [minCount, hourCount] = await Promise.all([
    redis.incr(minKey),
    redis.incr(hourKey),
  ])

  if (minCount === 1) await redis.expire(minKey, 60)
  if (hourCount === 1) await redis.expire(hourKey, 3600)

  if (minCount > 3) return { success: false, reason: "RAPID_FIRE_POSTING: Max 3 transmissions per minute." }
  if (hourCount > 20) return { success: false, reason: "SATURATION_LIMIT: Max 20 transmissions per hour." }

  return { success: true }
}

/**
 * Global duplicate detection (Link Farm tracking)
 */
export async function isGlobalDuplicate(content: string): Promise<boolean> {
  const hash = Buffer.from(content).toString('base64').substring(0, 32)
  const key = `global:post_hash:${hash}`
  const exists = await redis.get(key)
  
  if (exists) return true
  
  await redis.set(key, "1", { ex: 3600 * 24 }) // Track for 24 hours
  return false
}

/**
 * Record a successful transmission in history
 */
export async function recordPostHistory(userId: string, content: string) {
  const historyKey = `user:${userId}:post_history`
  await redis.lpush(historyKey, content)
  await redis.ltrim(historyKey, 0, 9) // Keep last 10
  await redis.expire(historyKey, 3600 * 24)
}
