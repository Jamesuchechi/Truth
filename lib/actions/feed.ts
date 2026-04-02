// lib/actions/feed.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { postInclude } from "@/lib/types/post"
import { suggestedShadowSelect } from "@/lib/types/user"

export async function getFollowingFeed(limit = 20, cursor?: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true }
  })

  if (following.length === 0) return []

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
    include: {
      ...postInclude,
      feedTracking: {
        where: { userId: session.user.id }
      }
    }
  })

  return posts
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
