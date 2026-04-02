// lib/ai/anomaly.ts
import { prisma } from "@/lib/db/prisma"
import { analyzeContent } from "./moderation"
import type { ReactionType } from "@prisma/client"

/**
 * Triggered on high-velocity reaction pulses.
 * Checks for anomalies like mass negative reactions or high toxicity signals.
 */
export async function detectReactionAnomaly(postId: string) {
  // 1. Fetch recent reaction velocity (last 60 mins)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const reactions = await prisma.reaction.findMany({
    where: {
      postId,
      createdAt: { gte: oneHourAgo },
      type: { in: ['THAT_HURTS', 'WILD'] as ReactionType[] }
    }
  })

  // 2. If negative reactions > 10 in 1 hour, trigger a re-scan
  if (reactions.length >= 10) {
    console.warn(`[PROTOCOL_ANOMALY_DETECTION]: High negative velocity on post ${postId}. Triggering re-scan.`)
    
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { content: true, toxicityScore: true }
    })

    if (!post) return

    // Re-verify with a higher fidelity model if needed
    const analysis = await analyzeContent(post.content)
    
    // Auto-flag if the situation has escalated
    if (analysis.toxicityScore > 0.7) {
      await prisma.post.update({
        where: { id: postId },
        data: { isFiltered: true }
      })
      // Optional: Inform Admin via a report or system notification
      await prisma.report.create({
        data: {
          reporterId: "SYSTEM", // Pseudo-id for system-generated reports
          postId,
          reason: "HATE_SPEECH",
          description: `SYSTEM_AUTO_FLAG: High negative reaction velocity (${reactions.length} signals/hr) detected. Re-scan toxicity: ${analysis.toxicityScore}`
        }
      })
    }
  }
}
