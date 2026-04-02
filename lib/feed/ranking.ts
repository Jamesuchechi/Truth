import { prisma } from '../db/prisma'
import type { ReactionType, ReputationTier, ToneType } from '@prisma/client'
import { postInclude, type PostWithRelations } from '../types/post'

interface FeedSignals {
  userId: string
  postId: string
  authorTier?: ReputationTier
  viewDuration?: number
  hoverDuration?: number
  scrollDepth?: number
  reacted: boolean
  reactionType?: ReactionType | null
  allReactions?: { type: ReactionType }[]
  commented: boolean
  saved: boolean
  channelAffinity: number
  recency: number
  reactionPattern: number
  timeOfDayScore: number
  scrolledPast?: boolean
  readComplete?: boolean
  tone?: ToneType
  toxicityScore?: number
}

export async function calculateFeedScore(signals: FeedSignals): Promise<number> {
  // 1. Engagement Weight (0.3x)
  const engagementScore = calculateEngagementScore({
    viewDuration: signals.viewDuration,
    hoverDuration: signals.hoverDuration,
    scrollDepth: signals.scrollDepth,
    reacted: signals.reacted,
    reactionType: signals.reactionType,
    allReactions: signals.allReactions || [],
    commented: signals.commented,
    saved: signals.saved,
    scrolledPast: signals.scrolledPast,
    readComplete: signals.readComplete
  })

  // 2. Channel Affinity (0.2x)
  const channelScore = signals.channelAffinity

  // 3. Recency Score (0.1x)
  const recencyScore = signals.recency

  // 4. Reaction Pattern (0.1x)
  const reactionPatternScore = signals.reactionPattern

  // 5. Reputation Boost (0.15x)
  const reputationScore = getReputationMultiplier(signals.authorTier || 'DRIFTER')

  // 6. Ethical Ranking & Tone (0.15x)
  let ethicsScore = 0.5 // Neutral baseline
  // Tone Boost
  if (signals.tone === 'HONEST' || signals.tone === 'DEEP') ethicsScore += 0.3
  if (signals.tone === 'HARSH') ethicsScore -= 0.2

  // 7. Time of Day Adjustment
  const timeBoost = 1 + (signals.timeOfDayScore * 0.1)

  // Weighted combination
  let feedScore = 
    ((engagementScore * 0.3) +
    (channelScore * 0.2) +
    (recencyScore * 0.1) +
    (reactionPatternScore * 0.1) +
    (reputationScore * 0.15) +
    (ethicsScore * 0.15)) * timeBoost

  // 8. Toxicity Penalty (Heavy)
  if (signals.toxicityScore && signals.toxicityScore > 0.5) {
    feedScore *= 0.2 // Severe downrank for toxic content
  }

  return feedScore
}

function calculateEngagementScore(engagement: {
  viewDuration?: number
  hoverDuration?: number
  scrollDepth?: number
  reacted: boolean
  reactionType?: ReactionType | null
  allReactions?: { type: ReactionType }[]
  commented: boolean
  saved: boolean
  scrolledPast?: boolean
  readComplete?: boolean
}): number {
  let score = 0

  if (engagement.viewDuration) {
    score += Math.min(engagement.viewDuration / 60000, 1) * 0.25
  }

  if (engagement.hoverDuration && engagement.hoverDuration > 5000) {
    score += 0.1
  }

  if (engagement.scrollDepth) {
    if (engagement.scrollDepth >= 75) score += 0.15
    else if (engagement.scrollDepth >= 50) score += 0.1
    else if (engagement.scrollDepth >= 25) score += 0.05
  }

  if (engagement.readComplete) score += 0.2
  if (engagement.scrolledPast) score -= 0.2
  if (engagement.reacted) score += getReactionWeight(engagement.reactionType || null)

  if (engagement.allReactions && engagement.allReactions.length > 0) {
    const uniqueTypes = new Set(engagement.allReactions.map((r: { type: ReactionType }) => r.type)).size
    if (uniqueTypes >= 3) score += 0.15 
    if (uniqueTypes >= 5) score += 0.1 
  }

  if (engagement.commented) score += 0.4
  if (engagement.saved) score += 0.2

  return Math.min(score, 1)
}

export async function getPersonalizedFeed(
  userId: string,
  cursor: string | null,
  limit: number
) {
  const userChannels = await prisma.channelSubscription.findMany({
    where: { userId },
    select: { channelId: true }
  })

  const followedChannelIds = userChannels.map((c: { channelId: string }) => c.channelId)

  const [channelAffinity, reactionPattern, timeOfDayHistory] = await Promise.all([
    calculateTimeDecayedChannelAffinity(userId, followedChannelIds),
    calculateUserReactionPattern(userId),
    getUserTimeOfDayActivity(userId)
  ])

  // Content Freshness: Avoid showing same post twice (Filter seen)
  const seenPostIds = await prisma.feedTracking.findMany({
    where: { userId, viewed: true },
    select: { postId: true }
  })
  const seenIdsSet = new Set(seenPostIds.map(s => s.postId))

  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      visibilityType: 'PUBLIC',
      parentId: null,
      id: { notIn: Array.from(seenIdsSet) }
    },
    include: postInclude,
    orderBy: { createdAt: 'desc' },
    take: limit * 8, // Larger pool for diversity and exploration
    ...(cursor && { cursor: { id: cursor }, skip: 1 })
  })

  const currentHour = new Date().getHours()
  const rankedPosts = await Promise.all(
    posts.map(async (post) => {
      const typedPost = post as PostWithRelations
      const recency = calculateRecencyScore(typedPost.createdAt)
      const channelScore = channelAffinity[typedPost.channelId || ''] || 0.3
      const patternScore = calculateReactionMatch(reactionPattern, typedPost.reactions as { type: ReactionType }[])
      const timeScore = timeOfDayHistory[currentHour] || 0.5
      
      const tracking = typedPost.feedTracking.find(t => t.userId === userId)

      const score = await calculateFeedScore({
        userId,
        postId: typedPost.id,
        authorTier: typedPost.author.reputationTier as ReputationTier,
        viewDuration: tracking?.viewDuration || undefined,
        hoverDuration: tracking?.hoverDuration || undefined,
        scrollDepth: tracking?.scrollDepth || undefined,
        reacted: typedPost.reactions.some((r) => r.userId === userId),
        reactionType: typedPost.reactions.find((r) => r.userId === userId)?.type || null,
        allReactions: typedPost.reactions,
        commented: false,
        saved: false,
        channelAffinity: channelScore,
        recency,
        reactionPattern: patternScore,
        timeOfDayScore: timeScore,
        readComplete: tracking?.readComplete || false,
        scrolledPast: tracking?.scrolledPast || false,
        toxicityScore: typedPost.toxicityScore,
        tone: typedPost.tone
      })

      const surprise = Math.random() * 0.1
      const finalScore = score + surprise

      return { ...typedPost, feedScore: finalScore }
    })
  )

  // Enforce Diversity Ratio (15% Explorer Posts)
  const diversityFiltered = injectDiversity(
    rankedPosts.sort((a, b) => b.feedScore - a.feedScore),
    followedChannelIds
  )

  const slicedPosts = diversityFiltered.slice(0, limit) as (PostWithRelations & { feedScore: number })[]

  return {
    posts: slicedPosts,
    nextCursor: slicedPosts.length === limit ? slicedPosts[slicedPosts.length - 1].id : null
  }
}

function injectDiversity(
  posts: (PostWithRelations & { feedScore: number })[],
  followedChannelIds: string[]
): (PostWithRelations & { feedScore: number })[] {
  const authorCount: Record<string, number> = {}
  const channelCount: Record<string, number> = {}
  
  const explorerPool: (PostWithRelations & { feedScore: number })[] = []
  const filtered: (PostWithRelations & { feedScore: number })[] = []

  // Separate Explorer Posts (unfollowed channels)
  posts.forEach(post => {
    const isExplorer = post.channelId && !followedChannelIds.includes(post.channelId)
    if (isExplorer) {
      explorerPool.push(post)
    } else {
      filtered.push(post)
    }
  })

  // Mandatory 15% Diversity Ratio
  const diversityTarget = Math.floor(posts.length * 0.15)
  let diversityInjected = 0

  // Merge with Priority handling
  const finalPool: (PostWithRelations & { feedScore: number })[] = []
  
  // Interleave explorer posts
  let filteredIdx = 0
  let explorerIdx = 0

  while (filteredIdx < filtered.length || explorerIdx < explorerPool.length) {
    // Every 6 posts, try to inject an explorer post
    if (diversityInjected < diversityTarget && explorerIdx < explorerPool.length && (finalPool.length % 6 === 0)) {
      finalPool.push(explorerPool[explorerIdx++])
      diversityInjected++
    } else if (filteredIdx < filtered.length) {
      const post = filtered[filteredIdx++]
      const aId = post.authorId
      const cId = post.channelId || 'global'
      
      // Concentration Caps
      if ((authorCount[aId] || 0) < 2 && (channelCount[cId] || 0) < 3) {
        finalPool.push(post)
        authorCount[aId] = (authorCount[aId] || 0) + 1
        channelCount[cId] = (channelCount[cId] || 0) + 1
      }
    } else if (explorerIdx < explorerPool.length) {
      finalPool.push(explorerPool[explorerIdx++])
    } else {
      break
    }
  }

  return finalPool
}

function getReputationMultiplier(tier: ReputationTier): number {
  switch (tier) {
    case 'ARCHITECT': return 1.0 // Normalized 0-1 range for the weighted sum
    case 'GUARDIAN':  return 0.85
    case 'ORACLE':    return 0.75
    case 'SPECTRE':   return 0.6
    case 'DRIFTER':   return 0.4
    case 'VOID':      return 0.2
    default: return 0.4
  }
}

// ... rest of helpers

export async function getTrendingFeed(limit: number, cursor?: string | null) {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: last24h },
      deletedAt: null,
      visibilityType: 'PUBLIC'
    },
    include: postInclude,
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' }
  })

  const rankedPosts = (posts as PostWithRelations[])
    .map((post) => {
      const ageHours = (Date.now() - post.createdAt.getTime()) / 3600000
      const engagement = (post._count?.reactions || 0) + ((post._count?.comments || 0) * 2)
      // Boost Trending by Creator Reputation
      const reputationBoost = getReputationMultiplier(post.author.reputationTier as ReputationTier)
      const trendingScore = (engagement * (1 + reputationBoost)) / Math.pow(ageHours + 2, 1.5)
      return { ...post, trendingScore }
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)

  return {
    posts: rankedPosts,
    nextCursor: rankedPosts.length === limit ? rankedPosts[rankedPosts.length - 1].id : null
  }
}

export async function getDeepDiveFeed(limit: number, cursor?: string | null) {
  const posts = await prisma.post.findMany({
    where: {
      content: { gt: "" },
      deletedAt: null,
      visibilityType: 'PUBLIC',
      reactionCount: { gte: 3 }
    },
    include: postInclude,
    take: limit * 2,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' }
  })

  const filteredPosts = (posts as PostWithRelations[])
    .filter((p) => p.content.length > 500)
    .sort((a, b) => {
      const aDeepCount = a.reactions.filter(r => r.type === 'DEEP').length
      const bDeepCount = b.reactions.filter(r => r.type === 'DEEP').length
      const aDeepRatio = aDeepCount / (a._count?.reactions || 1)
      const bDeepRatio = bDeepCount / (b._count?.reactions || 1)
      return bDeepRatio - aDeepRatio
    })
    .slice(0, limit)

  return {
    posts: filteredPosts,
    nextCursor: filteredPosts.length === limit ? filteredPosts[filteredPosts.length - 1].id : null
  }
}

export async function getQuickHitsFeed(limit: number, cursor?: string | null) {
  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      visibilityType: 'PUBLIC'
    },
    include: postInclude,
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 })
  })

  const filteredPosts = (posts as PostWithRelations[])
    .filter((p) => p.content.length < 200)

  return {
    posts: filteredPosts,
    nextCursor: filteredPosts.length === limit ? filteredPosts[filteredPosts.length - 1].id : null
  }
}

function calculateRecencyScore(createdAt: Date): number {
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  return Math.exp(-ageInHours / 12)
}

async function calculateTimeDecayedChannelAffinity(
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
        hoverDuration: true,
        scrollDepth: true,
        reacted: true,
        commented: true,
        saved: true,
        createdAt: true
      }
    })

    const totalScore = interactions.reduce((sum: number, int) => {
      let score = 0
      if (int.viewDuration && int.viewDuration > 10000) score += 0.25
      if (int.hoverDuration && int.hoverDuration > 5000) score += 0.1
      if (int.scrollDepth && int.scrollDepth >= 50) score += 0.1
      if (int.reacted) score += 0.25
      if (int.commented) score += 0.35
      if (int.saved) score += 0.15
      
      // Time Decay: Interactions older than 7 days lose 50% weight
      const daysOld = (Date.now() - new Date(int.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      const timeWeight = Math.exp(-daysOld / 7)
      
      return sum + (score * timeWeight)
    }, 0)

    affinity[channelId] = Math.min(totalScore / (interactions.length * 0.5) || 0.5, 1)
  }

  return affinity
}

async function calculateUserReactionPattern(userId: string): Promise<Partial<Record<ReactionType, number>>> {
  const reactions = await prisma.reaction.findMany({
    where: { userId },
    select: { type: true }
  })

  const pattern: Partial<Record<ReactionType, number>> = {
    RELATE: 0, DEEP: 0, NOT_ALONE: 0, WILD: 0, REAL_TALK: 0, THANK_YOU: 0, THAT_HURTS: 0, STAY_STRONG: 0
  }

  if (reactions.length === 0) return pattern

  reactions.forEach((r: { type: string }) => {
    const type = r.type as ReactionType
    pattern[type] = (pattern[type] || 0) + (1 / reactions.length)
  })

  return pattern
}

function calculateReactionMatch(
  userPattern: Partial<Record<ReactionType, number>>, 
  postReactions: { type: ReactionType }[]
): number {
  if (postReactions.length === 0) return 0.5
  
  let matchScore = 0
  postReactions.forEach((r: { type: ReactionType }) => {
    matchScore += userPattern[r.type] || 0
  })

  return Math.min(matchScore / (postReactions.length * 0.5) || 0.5, 1)
}

async function getUserTimeOfDayActivity(userId: string): Promise<Record<number, number>> {
  const activities = await prisma.feedTracking.findMany({
    where: { userId },
    select: { createdAt: true }
  })

  const hourlyActivity: Record<number, number> = {}
  for (let i = 0; i < 24; i++) hourlyActivity[i] = 0

  if (activities.length === 0) return hourlyActivity

  activities.forEach((a: { createdAt: Date }) => {
    const hour = new Date(a.createdAt).getHours()
    hourlyActivity[hour] += 1 / activities.length
  })

  const max = Math.max(...Object.values(hourlyActivity))
  if (max > 0) {
    for (let i = 0; i < 24; i++) hourlyActivity[i] /= max
  }

  return hourlyActivity
}

function getReactionWeight(type: ReactionType | null): number {
  if (!type) return 0.3

  switch (type) {
    case 'DEEP':
    case 'REAL_TALK':
      return 0.5
    case 'WILD':
    case 'THAT_HURTS':
    case 'STAY_STRONG':
      return 0.4
    case 'RELATE':
    case 'NOT_ALONE':
    case 'THANK_YOU':
    default:
      return 0.3
  }
}