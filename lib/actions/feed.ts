// lib/actions/feed.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { postInclude, type PostWithRelations } from "@/lib/types/post"
import { suggestedShadowSelect } from "@/lib/types/user"
import { 
  getPersonalizedFeed, 
  getTrendingFeed as getTrendingRanking, 
  getDeepDiveFeed as getDeepDiveRanking, 
  getQuickHitsFeed as getQuickHitsRanking 
} from "@/lib/feed/ranking"

import { redis, FEED_CACHE_TTL } from "@/lib/db/redis"

export async function getForYouFeed(limit = 20, cursor?: string) {
  const session = await auth()
  const userId = session?.user?.id
  
  const cacheKey = `feed:foryou:${userId || 'guest'}:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  let result
  if (!userId) {
    const posts = await prisma.post.findMany({
      where: { deletedAt: null, visibilityType: "PUBLIC", parentId: null },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: postInclude
    })
    result = {
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null
    }
  } else {
    result = await getPersonalizedFeed(userId, cursor || null, limit)
  }

  // Cache for slightly less than global feeds
  await redis.set(cacheKey, result, { ex: 60 }) // 1 minute for personalized
  return result
}

export async function getFreshFeed(limit = 20, cursor?: string) {
  const session = await auth()
  const userId = session?.user?.id

  const cacheKey = `feed:fresh:${userId || 'guest'}:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  let channelIds: string[] = []
  if (userId) {
    const subs = await prisma.channelSubscription.findMany({
      where: { userId },
      select: { channelId: true }
    })
    channelIds = subs.map(s => s.channelId)
  }

  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      visibilityType: "PUBLIC",
      parentId: null,
      ...(channelIds.length > 0 && { channelId: { in: channelIds } })
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: postInclude
  })

  const result = {
    posts,
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null
  }

  await redis.set(cacheKey, result, { ex: 60 })
  return result
}

export async function getTrendingFeed(limit = 20, cursor?: string) {
  const cacheKey = `feed:trending:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  const result = await getTrendingRanking(limit, cursor)
  await redis.set(cacheKey, result, { ex: FEED_CACHE_TTL })
  return result
}

export async function getDeepDiveFeed(limit = 10, cursor?: string) {
  const cacheKey = `feed:deepdive:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  const result = await getDeepDiveRanking(limit, cursor)
  await redis.set(cacheKey, result, { ex: FEED_CACHE_TTL })
  return result
}

export async function getQuickHitsFeed(limit = 15, cursor?: string) {
  const cacheKey = `feed:quickhits:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  const result = await getQuickHitsRanking(limit, cursor)
  await redis.set(cacheKey, result, { ex: FEED_CACHE_TTL })
  return result
}

export async function getFollowingFeed(limit = 20, cursor?: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { posts: [], nextCursor: null }

  const cacheKey = `feed:following:${userId}:limit:${limit}:cursor:${cursor || 'start'}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached as { posts: PostWithRelations[], nextCursor: string | null }

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  })

  if (following.length === 0) return { posts: [], nextCursor: null }

  const followingIds = following.map(f => f.followingId)

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: followingIds },
      deletedAt: null,
      parentId: null,
      visibilityType: { in: ["PUBLIC", "FOLLOWERS_ONLY"] }
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: postInclude
  })

  const result = {
    posts,
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null
  }

  await redis.set(cacheKey, result, { ex: 60 })
  return result
}

export async function getSuggestedShadows(limit = 5) {
  const session = await auth()
  const userId = session?.user?.id

  // Basic suggestion: users with shadow identities that the current user isn't following
  // and prioritize high reputation
  const suggestions = await prisma.user.findMany({
    where: {
      shadowName: { not: null },
      id: { not: userId },
      followers: userId ? {
        none: { followerId: userId }
      } : undefined
    },
    take: limit,
    orderBy: {
      reputationScore: "desc"
    },
    select: suggestedShadowSelect
  })

  return suggestions
}
