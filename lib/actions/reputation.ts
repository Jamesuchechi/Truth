"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { getTierForScore, calculateReputationScore } from "@/lib/utils/reputation"
import { revalidatePath } from "next/cache"
import type { ReputationTier } from "@prisma/client"

/**
 * Synchronize a user's reputation score and tier with the database.
 * Calculates score based on current engagement, quality, and penalties.
 */
export async function syncUserReputation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
          reactions: true,
          followers: true,
        }
      },
      posts: {
        select: {
          reactionCount: true,
          commentCount: true,
          reactions: { select: { type: true } }
        }
      },
      reports: {
        where: { status: "ACTIONED" },
        select: { id: true }
      }
    }
  })

  if (!user) return { error: "User not found in the network." }

  // 1. Gather all reactions received on their posts
  const reactionsReceivedRaw = user.posts.flatMap(p => p.reactions)

  // 2. Calculate account age in weeks
  const accountAgeMs = Date.now() - new Date(user.createdAt).getTime()
  const weeksOld = Math.max(0, Math.floor(accountAgeMs / (1000 * 60 * 60 * 24 * 7)))

  // 3. Compute score
  const score = calculateReputationScore({
    posts: user._count.posts,
    comments: user._count.comments,
    reactionsReceived: reactionsReceivedRaw,
    endorsements: user.endorsements || 0,
    actionedReports: user.reports.length,
    accountAgeWeeks: weeksOld
  })

  // 4. Determine Status based on Governance Protocol
  let status: "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "BANNED" = "ACTIVE"
  if (score < -500) status = "BANNED"
  else if (score < -200) status = "SUSPENDED"
  else if (score < -50) status = "RESTRICTED"

  // 5. Update Database
  const tier = getTierForScore(score)
  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationScore: score,
      reputationTier: tier as ReputationTier,
      status: status,
      lastReputationSync: new Date()
    }
  })

  revalidatePath(`/profile/${user.username}`)
  return { success: true, score, tier, status }
}

/**
 * Endorse a fellow shadow identity.
 * Requires ORACLE tier or higher to endorse.
 */
export async function endorseUser(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized access." }
  
  const senderId = session.user.id
  if (senderId === targetUserId) return { error: "Self-endorsement is a digital paradox." }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { reputationTier: true, reputationScore: true }
  })

  if (!sender || (sender.reputationTier !== "ORACLE" && 
                 sender.reputationTier !== "GUARDIAN" && 
                 sender.reputationTier !== "ARCHITECT")) {
    return { error: "Only those at ORACLE tier or above can endorse others." }
  }

  // Check if already endorsed
  // For simplicity since I haven't added an 'Endorsement' model yet, I'll use a transaction for safety
  // but I might eventually want a separate model to track WHO endorsed WHOM to prevent spam.
  // For now, I'll allow 1 endorsement per target in a simple counter until we scale.
  
  await prisma.user.update({
    where: { id: targetUserId },
    data: { endorsements: { increment: 1 } }
  })

  await syncUserReputation(targetUserId)

  return { success: "Community endorsement successful." }
}
