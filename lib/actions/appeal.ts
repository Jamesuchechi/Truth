"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * File an appeal for a moderation action
 */
export async function createAppeal({
  reportId,
  reason
}: {
  reportId: string
  reason: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "AUTH_REQUIRED: You must be synchronized to file an appeal." }
  }

  try {
    // Check if report exists and belongs to the user or affects their content
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { 
        post: { select: { authorId: true } },
        message: { select: { senderId: true } }
      }
    })

    if (!report) return { error: "INVALID_SIGNAL: Report not found." }

    const isAuthorized = 
      report.post?.authorId === session.user.id || 
      report.message?.senderId === session.user.id

    if (!isAuthorized) {
      return { error: "ACCESS_DENIED: You can only appeal your own signals." }
    }

    // Prevent duplicate appeals
    const existing = await prisma.appeal.findFirst({
      where: { reportId, userId: session.user.id }
    })

    if (existing) return { error: "PROTOCOL_LOCK: Appeal already in progress." }

    const appeal = await prisma.appeal.create({
      data: {
        userId: session.user.id,
        reportId,
        reason,
        status: "PENDING"
      }
    })

    revalidatePath("/admin/appeals")
    return { success: "Appeal signal transmitted. Verification pending.", id: appeal.id }
  } catch (error) {
    console.error("Appeal creation failed:", error)
    return { error: "System failure: FAILED_TO_TRANSMIT_APPEAL" }
  }
}

/**
 * Resolve an appeal (Admin only)
 */
export async function resolveAppeal({
  appealId,
  status,
  adminNote
}: {
  appealId: string
  status: "APPROVED" | "REJECTED"
  adminNote?: string
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: "ELEVATION_REQUIRED: Unauthorized administrative action." }
  }

  try {
    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
      include: { 
        report: true,
        user: true
      }
    })

    if (!appeal) return { error: "Appeal not found." }

    await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status,
        adminNote,
        reviewerId: session.user.id,
        reviewedAt: new Date()
      }
    })

    if (status === "APPROVED") {
      // Restore the signal
      if (appeal.report.postId) {
        await prisma.post.update({
          where: { id: appeal.report.postId },
          data: { isFiltered: false, isRestored: true, deletedAt: null }
        })
      } else if (appeal.report.messageId) {
        await prisma.message.update({
          where: { id: appeal.report.messageId },
          data: { isRestored: true, deletedAt: null }
        })
      }

      // Mark report as APPEALED
      await prisma.report.update({
        where: { id: appeal.reportId },
        data: { status: "APPEALED" }
      })

      // Increase user credibility slightly for successful appeal
      await prisma.user.update({
        where: { id: appeal.userId },
        data: { credibilityScore: { increment: 2 } }
      })
    } else {
        // Decrease user credibility for false/rejected appeal
        await prisma.user.update({
            where: { id: appeal.userId },
            data: { credibilityScore: { decrement: 5 } }
        })
    }

    revalidatePath("/transparency/logs")
    revalidatePath("/admin/appeals")
    return { success: `Appeal ${status === 'APPROVED' ? 'synchronized' : 'rejected'}.` }
  } catch {
    return { error: "Failed to resolve appeal." }
  }
}

/**
 * Get internal moderation logs for transparency
 */
export async function getModerationLogs() {
    return await prisma.report.findMany({
        where: { status: { not: "PENDING" } },
        include: {
            post: { select: { content: true, author: { select: { username: true } } } },
            message: { select: { content: true } }
        },
        orderBy: { reviewedAt: "desc" },
        take: 50
    })
}
