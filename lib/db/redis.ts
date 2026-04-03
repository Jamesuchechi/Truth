import { Redis } from "@upstash/redis"

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS environmental variables are missing")
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const FEED_CACHE_TTL = 300 // 5 minutes in seconds

/**
 * Get cached feed for a specific user.
 */
export async function getCachedFeed(userId: string) {
  try {
    const cached = await redis.get(`feed:${userId}`)
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached
    }
  } catch (error) {
    console.error("[REDIS] getCachedFeed Error:", error)
  }
  return null
}

/**
 * Cache a user's feed for a set amount of time.
 */
export async function cacheFeed(userId: string, feed: unknown[], ttl: number = FEED_CACHE_TTL) {
  try {
    await redis.set(`feed:${userId}`, JSON.stringify(feed), { ex: ttl })
  } catch (error) {
    console.error("[REDIS] cacheFeed Error:", error)
  }
}

/**
 * Invalidate cached feed for a user.
 */
export async function invalidateFeedCache(userId: string) {
  try {
    await redis.del(`feed:${userId}`)
  } catch (error) {
    console.error("[REDIS] invalidateFeedCache Error:", error)
  }
}

/**
 * Get cached posts for a specific channel.
 */
export async function getCachedChannelPosts(channelId: string) {
  try {
    const cached = await redis.get(`channel:${channelId}:posts`)
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached
    }
  } catch (error) {
    console.error("[REDIS] getCachedChannelPosts Error:", error)
  }
  return null
}

/**
 * Invalidate channel post cache.
 */
export async function invalidateChannelCache(channelId: string) {
  try {
    await redis.del(`channel:${channelId}:posts`)
  } catch (error) {
    console.error("[REDIS] invalidateChannelCache Error:", error)
  }
}
