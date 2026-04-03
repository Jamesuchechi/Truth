// lib/actions/report.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { ReportPriority, ReputationTier } from "@prisma/client"
import type { ReportReason, ReportStatus } from "@prisma/client"

/**
 * File a report against a post or message
 */
export async function reportContent({
  targetId,
  type,
  reason,
  description,
  isAnonymous = false
}: {
  targetId: string
  type: 'POST' | 'MESSAGE'
  reason: ReportReason
  description?: string
  isAnonymous?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized: Signal source unidentified." }

  try {
    // 1. Check for existing reports (aggregation)
    const existingReports = await prisma.report.findFirst({
      where: {
        ...(type === 'POST' ? { postId: targetId } : { messageId: targetId }),
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Fetch reporter and target info for prioritization
    const reporter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { reputationTier: true }
    })

    const targetContent = type === 'POST' 
      ? await prisma.post.findUnique({ where: { id: targetId }, select: { toxicityScore: true, authorId: true } })
      : await prisma.message.findUnique({ where: { id: targetId }, select: { tone: true, senderId: true } })

    // 3. Calculate Priority
    let priority: ReportPriority = ReportPriority.LOW
    
    // Severity based on toxicity
    const toxicity = targetContent && 'toxicityScore' in targetContent ? (targetContent.toxicityScore as number) : 0
    if (toxicity > 0.9 || reason === 'SELF_HARM' || reason === 'VIOLENCE') priority = ReportPriority.CRITICAL
    else if (toxicity > 0.7 || reason === 'HATE_SPEECH') priority = ReportPriority.HIGH
    else if (toxicity > 0.5) priority = ReportPriority.MEDIUM

    // Reputation Boost (Guardian/Oracle)
    if (reporter?.reputationTier === ReputationTier.GUARDIAN || reporter?.reputationTier === ReputationTier.ORACLE) {
      if (priority === ReportPriority.LOW) priority = ReportPriority.MEDIUM
      else if (priority === ReportPriority.MEDIUM) priority = ReportPriority.HIGH
      else if (priority === ReportPriority.HIGH) priority = ReportPriority.CRITICAL
    }

    // 4. Create or Update Report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reason,
        description,
        isAnonymous,
        priority,
        ...(type === 'POST' ? { postId: targetId } : { messageId: targetId }),
        duplicateCount: existingReports ? existingReports.duplicateCount + 1 : 1
      }
    })

    // 5. Automated Action Trigger (Auto-Hide after 10 reports)
    if (report.duplicateCount >= 10) {
      if (type === 'POST') {
        await prisma.post.update({
          where: { id: targetId },
          data: { isFiltered: true }
        })
      }
    }

    return { success: "Report filed successfully. Protocol monitoring active.", id: report.id }
  } catch (error) {
    console.error("Report filing failed:", error)
    return { error: "System failure: FAILED_TO_FILE_REPORT" }
  }
}

/**
 * (Admin Only) Process a moderation report
 */
export async function processReport(reportId: string, status: ReportStatus) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: "Access Denied: Elevation required for report resolution." }
  }

  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { 
        status,
        reviewedAt: new Date()
      },
      include: {
        post: true,
        message: true
      }
    })

    // If actioned, potentially hide the content or restrict the user
    if (status === 'ACTIONED') {
      if (report.postId) {
        await prisma.post.update({
          where: { id: report.postId },
          data: { isFiltered: true, deletedAt: new Date() } // Soft delete by default
        })
      } else if (report.messageId) {
        await prisma.message.update({
          where: { id: report.messageId },
          data: { deletedAt: new Date() }
        })
      }
    }

    revalidatePath("/admin/moderation")
    return { success: `Report ${reportId} resolved as ${status}.` }
  } catch (error) {
    console.error("Report processing failure:", error)
    return { error: "Failed to process report signal." }
  }
}

/**
 * (Admin Only) Get all pending reports
 */
export async function getPendingReports() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return []
  }

  const reports = await prisma.report.findMany({
    where: { status: 'PENDING' },
    include: {
      reporter: {
        select: { username: true, shadowName: true, reputationTier: true, credibilityScore: true }
      },
      post: {
        include: { 
          author: { select: { username: true, status: true, reputationTier: true } } 
        }
      },
      message: {
        include: { 
          sender: { select: { username: true, status: true, reputationTier: true } } 
        }
      },
      moderatorNotes: {
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Manual sorting by priority (CRITICAL > HIGH > MEDIUM > LOW)
  const priorityMap: Record<ReportPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  }

  return reports.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority])
}
