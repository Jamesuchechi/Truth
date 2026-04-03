"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { UserStatus } from "@prisma/client"

/**
 * Update a user's status and log the action
 */
export async function updateUserStatus({
  userId,
  reportId,
  status,
  reason,
  durationInDays
}: {
  userId: string
  reportId?: string
  status: UserStatus
  reason?: string
  durationInDays?: number
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: "Access Denied: Elevation required for protocol enforcement." }
  }

  try {
    const shadowBannedAt = status === 'SHADOW_BANNED' ? new Date() : null

    await prisma.user.update({
      where: { id: userId },
      data: { 
        status,
        shadowBannedAt
      }
    })

    // Log the moderator action if a report is linked
    if (reportId) {
      await prisma.moderatorAction.create({
        data: {
          adminId: session.user.id,
          reportId,
          actionType: status,
          reason,
          duration: durationInDays
        }
      })
    }

    revalidatePath("/admin/moderation")
    return { success: `User status synchronized to ${status}.` }
  } catch (error) {
    console.error("Failed to update user status:", error)
    return { error: "System failure: FAILED_TO_UPDATE_USER_STATUS" }
  }
}

/**
 * Quick action to warn a user
 */
export async function warnUser(userId: string, reportId: string, message: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { error: "Unauthorized." }
  }

  try {
    await prisma.moderatorAction.create({
      data: {
        adminId: session.user.id,
        reportId,
        actionType: "WARN",
        reason: message
      }
    })

    // In a real app, this would trigger a notification
    // await createNotification({ recipientId: userId, type: "SYSTEM", content: `WARNING: ${message}` })

    return { success: "Warning signal transmitted." }
  } catch {
    return { error: "Failed to transmit warning." }
  }
}

/**
 * Shadow ban a user
 * Note: Global delivery queries must be updated to respect this.
 */
export async function shadowBanUser(userId: string, reportId?: string) {
  return await updateUserStatus({
    userId,
    reportId,
    status: 'SHADOW_BANNED',
    reason: "Violation of protocol integrity."
  })
}
