// lib/cache/redis.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// Cache feed results
export async function getCachedFeed(userId: string) {
  const cached = await redis.get(`feed:${userId}`)
  
  if (cached) {
    return JSON.parse(cached as string)
  }
  
  return null
}

export async function cacheFeed(userId: string, feed: unknown[], ttl: number = 300) {
  await redis.set(`feed:${userId}`, JSON.stringify(feed), { ex: ttl })
}

// Cache channel posts
export async function getCachedChannelPosts(channelId: string) {
  return await redis.get(`channel:${channelId}:posts`)
}