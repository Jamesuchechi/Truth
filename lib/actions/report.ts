// lib/actions/report.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { ReportReason, ReportStatus } from "@prisma/client"

/**
 * File a report against a post or message
 */
export async function reportContent({
  targetId,
  type,
  reason,
  description
}: {
  targetId: string
  type: 'POST' | 'MESSAGE'
  reason: ReportReason
  description?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized: Signal source unidentified." }

  try {
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reason,
        description,
        ...(type === 'POST' ? { postId: targetId } : { messageId: targetId })
      }
    })

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

  return await prisma.report.findMany({
    where: { status: 'PENDING' },
    include: {
      reporter: {
        select: { username: true, shadowName: true }
      },
      post: {
        include: { author: { select: { username: true } } }
      },
      message: {
        include: { sender: { select: { username: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}
