"use server"

import { prisma } from "@/lib/db/prisma"
import { redis } from "@/lib/db/redis"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { ReactionType } from "@prisma/client"
import { syncUserReputation } from "./reputation"
import { detectReactionAnomaly } from "@/lib/ai/anomaly"

export async function toggleReaction(
  targetId: string, 
  type: ReactionType, 
  targetType: 'POST' | 'COMMENT' = 'POST'
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized access: Signal identity required." }

  const userId = session.user.id
  const isPost = targetType === 'POST'

  try {

    const existing = isPost 
      ? await prisma.reaction.findUnique({
          where: { postId_userId: { postId: targetId, userId } },
        })
      : await prisma.reaction.findUnique({
          where: { commentId_userId: { commentId: targetId, userId } },
        })

    let reacted = true
    let reactionType: ReactionType | null = type

    if (existing) {
      if (existing.type === type) {
        // Toggle off
        await prisma.$transaction([
          prisma.reaction.delete({
            where: { id: existing.id },
          }),
          isPost 
            ? prisma.post.update({ where: { id: targetId }, data: { reactionCount: { decrement: 1 } } })
            : prisma.comment.update({ where: { id: targetId }, data: { reactionCount: { decrement: 1 } } })
        ])
        reacted = false
        reactionType = null
      } else {
        // Change type
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { type },
        })
        reacted = true
        reactionType = type
      }
    } else {
      // Toggle on
      await prisma.$transaction([
        prisma.reaction.create({
          data: isPost ? {
            postId: targetId,
            userId,
            type,
          } : {
            commentId: targetId,
            userId,
            type,
          },
        }),
        isPost 
          ? prisma.post.update({ where: { id: targetId }, data: { reactionCount: { increment: 1 } } })
          : prisma.comment.update({ where: { id: targetId }, data: { reactionCount: { increment: 1 } } })
      ])
      reacted = true
      reactionType = type

      // Trigger anomaly detection (Asynchronous for protocol responsiveness)
      if (isPost) {
        detectReactionAnomaly(targetId).catch(err => 
          console.error("[ANOMALY_DETECTION_FAILED]", err)
        )
      }
    }

    // Update Redis Cache for real-time sync
    const counts = await prisma.reaction.groupBy({
      by: ['type'],
      where: isPost ? { postId: targetId } : { commentId: targetId },
      _count: true,
    })

    const summary = counts.reduce((acc, curr) => {
      acc[curr.type] = curr._count
      return acc
    }, {} as Record<string, number>)

    const totalCount = counts.reduce((sum, curr) => sum + curr._count, 0)
    const contextPrefix = isPost ? 'post' : 'comment'

    await Promise.all([
      redis.set(`reaction_summary:${contextPrefix}:${targetId}`, JSON.stringify(summary)),
      redis.set(`reaction_count:${contextPrefix}:${targetId}`, totalCount),
      redis.set(`user_reaction:${contextPrefix}:${targetId}:${userId}`, reactionType || "NONE"),
      // Publish event for SSE
      redis.publish(`${contextPrefix}_updates:${targetId}`, JSON.stringify({
        type: 'REACTION_UPDATE',
        targetId,
        totalCount,
        summary
      }))
    ])

    revalidatePath("/feed")
    revalidatePath(`/post/${targetId}`)
    
    // Sync reputation for the author (received reaction)
    const target = isPost 
      ? await prisma.post.findUnique({ where: { id: targetId }, select: { authorId: true } })
      : await prisma.comment.findUnique({ where: { id: targetId }, select: { authorId: true } })
    
    if (target) await syncUserReputation(target.authorId)
    
    return { 
      success: reacted ? "Signal resonated." : "Signal recessed.", 
      reacted, 
      type: reactionType 
    }
  } catch (error) {
    console.error("Reaction toggle error:", error)
    return { error: "Protocol failure: FAILED_TO_SYNC_REACTION" }
  }
}

export async function getReactionAnalytics(targetId: string, targetType: 'POST' | 'COMMENT' = 'POST') {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized access." }

  const isPost = targetType === 'POST'
  const contextPrefix = isPost ? 'post' : 'comment'

  try {
    // Verify author status (Privacy Control)
    if (isPost) {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { authorId: true }
      })
      if (post?.authorId !== session.user.id) return { error: "Access Denied." }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { authorId: true }
      })
      if (comment?.authorId !== session.user.id) return { error: "Access Denied." }
    }

    // Try to get from cache first
    const cachedSummary = await redis.get(`reaction_summary:${contextPrefix}:${targetId}`)
    if (cachedSummary) {
      return { summary: cachedSummary }
    }

    const counts = await prisma.reaction.groupBy({
      by: ['type'],
      where: isPost ? { postId: targetId } : { commentId: targetId },
      _count: true,
    })

    const summary = counts.reduce((acc, curr) => {
      acc[curr.type] = curr._count
      return acc
    }, {} as Record<string, number>)

    // Backfill cache
    await redis.set(`reaction_summary:${contextPrefix}:${targetId}`, JSON.stringify(summary))

    return { summary }
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return { error: "Failed to retrieve emotional breakdown." }
  }
}
