import { prisma } from '@/lib/db/prisma'
import type { ReactionType } from '@prisma/client'

interface FeedSignals {
  userId: string
  postId: string
  viewDuration?: number
  reacted: boolean
  reactionType?: ReactionType | null
  allReactions?: { type: ReactionType }[]
  commented: boolean
  saved: boolean
  channelAffinity: number
  recency: number
  creatorReputation: number
}

export async function calculateFeedScore(signals: FeedSignals): Promise<number> {
  // Engagement Weight (0-1)
  const engagementScore = calculateEngagementScore({
    viewDuration: signals.viewDuration,
    reacted: signals.reacted,
    reactionType: signals.reactionType,
    allReactions: signals.allReactions || [],
    commented: signals.commented,
    saved: signals.saved
  })

  // Channel Affinity (0-1)
  const channelScore = signals.channelAffinity

  // Recency Score (0-1)
  const recencyScore = signals.recency

  // Creator Reputation (0-1)
  const creatorScore = signals.creatorReputation

  // Weighted combination
  const feedScore = 
    (engagementScore * 0.4) +
    (channelScore * 0.3) +
    (recencyScore * 0.15) +
    (creatorScore * 0.15)

  return feedScore
}

function calculateEngagementScore(engagement: {
  viewDuration?: number
  reacted: boolean
  reactionType?: ReactionType | null
  allReactions?: { type: ReactionType }[]
  commented: boolean
  saved: boolean
}): number {
  let score = 0

  // View duration (max 60 seconds = 1.0)
  if (engagement.viewDuration) {
    score += Math.min(engagement.viewDuration / 60000, 1) * 0.3
  }

  // Reactions with specific weights
  if (engagement.reacted) {
    const weight = getReactionWeight(engagement.reactionType || null)
    score += weight
  }

  // Reaction Diversity Bonus
  if (engagement.allReactions && engagement.allReactions.length > 0) {
    const uniqueTypes = new Set(engagement.allReactions.map((r) => r.type)).size
    if (uniqueTypes >= 3) score += 0.2 // Diverse emotional response boost
    if (uniqueTypes >= 5) score += 0.1 // Maximum diversity bonus
  }

  // Comments (highest signal)
  if (engagement.commented) score += 0.4

  // Saved
  if (engagement.saved) score += 0.2

  return Math.min(score, 1)
}

export async function getPersonalizedFeed(
  userId: string,
  cursor: string | null,
  limit: number
) {
  // Get user's channel subscriptions
  const userChannels = await prisma.channelSubscription.findMany({
    where: { userId },
    select: { channelId: true }
  })

  const channelIds = userChannels.map((c: { channelId: string }) => c.channelId)

  // Calculate channel affinity scores
  const channelAffinity = await calculateChannelAffinity(userId, channelIds)

  // Fetch candidate posts
  const posts = await prisma.post.findMany({
    where: {
      channelId: { in: channelIds },
      deletedAt: null,
      visibilityType: 'PUBLIC',
    },
    include: {
      author: {
        select: {
          shadowName: true,
          shadowVerified: true
        }
      },
      channel: true,
      reactions: {
        where: { userId },
        select: { type: true }
      },
      _count: {
        select: {
          reactions: true,
          comments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3, // Get more posts to rank
    ...(cursor && { cursor: { id: cursor }, skip: 1 })
  })

  // Rank posts
  const rankedPosts = await Promise.all(
    posts.map(async (post) => {
      const recency = calculateRecencyScore(post.createdAt)
      const channelScore = channelAffinity[post.channelId || ''] || 0.5
      const creatorScore = await getCreatorReputation(post.authorId)

      const score = await calculateFeedScore({
        userId,
        postId: post.id,
        viewDuration: undefined,
        reacted: post.reactions.length > 0,
        reactionType: post.reactions[0]?.type || null,
        allReactions: post.reactions,
        commented: false,
        saved: false,
        channelAffinity: channelScore,
        recency,
        creatorReputation: creatorScore
      })

      return { ...post, feedScore: score }
    })
  )

  // Sort by score and return top N
  return rankedPosts
    .sort((a, b) => b.feedScore - a.feedScore)
    .slice(0, limit)
}

function calculateRecencyScore(createdAt: Date): number {
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  
  // Exponential decay
  // Fresh posts (0-6h): 1.0
  // 12h old: 0.5
  // 24h old: 0.25
  // 48h old: 0.1
  return Math.exp(-ageInHours / 12)
}

async function calculateChannelAffinity(
  userId: string,
  channelIds: string[]
): Promise<Record<string, number>> {
  const affinity: Record<string, number> = {}

  for (const channelId of channelIds) {
    const interactions = await prisma.feedTracking.findMany({
      where: {
        userId,
        post: { channelId }
      },
      select: {
        viewDuration: true,
        reacted: true,
        commented: true,
        saved: true
      }
    })

    const totalScore = interactions.reduce((sum, int) => {
      let score = 0
      if (int.viewDuration && int.viewDuration > 10000) score += 0.3
      if (int.reacted) score += 0.3
      if (int.commented) score += 0.4
      if (int.saved) score += 0.2
      return sum + score
    }, 0)

    affinity[channelId] = Math.min(totalScore / interactions.length || 0.5, 1)
  }

  return affinity
}

async function getCreatorReputation(authorId: string): Promise<number> {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      posts: {
        include: {
          _count: {
            select: {
              reactions: true,
              comments: true
            }
          }
        }
      }
    }
  })

  if (!author) return 0.5

  const totalPosts = author.posts.length
  if (totalPosts === 0) return 0.5

  const avgReactions = author.posts.reduce((sum, p) => sum + p._count.reactions, 0) / totalPosts
  const avgComments = author.posts.reduce((sum, p) => sum + p._count.comments, 0) / totalPosts

  // Normalize to 0-1 scale
  const reactionScore = Math.min(avgReactions / 10, 1) * 0.6
  const commentScore = Math.min(avgComments / 5, 1) * 0.4

  return reactionScore + commentScore
}

function getReactionWeight(type: ReactionType | null): number {
  if (!type) return 0.3 // Default weight

  switch (type) {
    case 'DEEP':
    case 'REAL_TALK':
      return 0.5 // High emotional resonance
    case 'WILD':
    case 'THAT_HURTS':
    case 'STAY_STRONG':
      return 0.4 // Significant impact
    case 'RELATE':
    case 'NOT_ALONE':
    case 'THANK_YOU':
    default:
      return 0.3 // Standard engagement
  }
}