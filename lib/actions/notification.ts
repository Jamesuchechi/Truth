// lib/actions/notification.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { NotificationType } from "@prisma/client"

export type NotificationWithSender = {
  id: string
  type: NotificationType
  read: boolean
  createdAt: Date
  postId?: string | null
  commentId?: string | null
  sender: {
    id: string
    username: string
    image: string | null
    shadowName: string | null
  } | null
}

/**
 * Internal helper to create a notification
 */
export async function createNotification({
  recipientId,
  senderId,
  type,
  postId,
  commentId
}: {
  recipientId: string
  senderId?: string
  type: NotificationType
  postId?: string
  commentId?: string
}) {
  try {
    // Don't notify yourself
    if (recipientId === senderId) return

    await prisma.notification.create({
      data: {
        recipientId,
        senderId,
        type,
        postId,
        commentId
      }
    })
    
    // Potentially trigger real-time updates here in the future
  } catch (error) {
    console.error("Failed to create notification:", error)
  }
}

/**
 * Fetch notifications for the current user
 */
export async function getNotifications(limit = 20): Promise<NotificationWithSender[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          image: true,
          shadowName: true
        }
      }
    }
  }) as NotificationWithSender[]
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthenticated" }

  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: session.user.id
      },
      data: { read: true }
    })
    
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("MarkAsRead error:", error)
    return { error: "Failed to update notification." }
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthenticated" }

  try {
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, read: false },
      data: { read: true }
    })
    
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("MarkAllAsRead error:", error)
    return { error: "Failed to update notifications." }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  return await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false
    }
  })
}
