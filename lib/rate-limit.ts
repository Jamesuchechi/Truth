// lib/rate-limit.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

/**
 * Enhanced Redis-based Sliding Window Rate Limiter
 * @param identifier Unique key (e.g. user ID or IP)
 * @param limit Max actions allowed in the window
 * @param window Duration of window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowMs = window * 1000
  const minScore = now - windowMs

  try {
    const pipeline = redis.pipeline()

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, minScore)
    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    // Count active entries in window
    pipeline.zcard(key)
    // Set expiry
    pipeline.expire(key, window)

    const results = await pipeline.exec()
    const count = results[2] as number
    const remaining = Math.max(0, limit - count)
    const success = count <= limit

    // Calculate reset time (earliest entry + window)
    const earliest = await redis.zrange<{ score: number; member: string }[]>(key, 0, 0, { withScores: true })
    const reset = earliest.length > 0 ? earliest[0].score + windowMs : now + windowMs

    return {
      success,
      remaining,
      reset: Math.ceil(reset / 1000)
    }
  } catch (error) {
    console.error("[RATELIMIT] Redis filtering failure:", error)
    // Fail-soft: allow the request but log the error
    return { success: true, remaining: 1, reset: Math.ceil((now + windowMs) / 1000) }
  }
}