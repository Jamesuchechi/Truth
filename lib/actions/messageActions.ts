// lib/actions/messageActions.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { MessageType } from "@prisma/client"
import type { Prisma, ToneType, ReportReason } from "@prisma/client"

export async function getInboxThreads(filters: {
  type?: MessageType | "ALL"
  tone?: ToneType | "ALL"
  search?: string
  status?: 'INBOX' | 'ARCHIVED' | 'FAVORITES'
} = {}) {
  const session = await auth()
  if (!session?.user?.id) return []

  const { type, tone, search, status } = filters

  const where: Prisma.MessageWhereInput = {
    receiverId: session.user.id,
    deletedAt: null,
    parentId: null, // Only fetch top-level messages for the main list
  }

  if (type && type !== "ALL") where.type = type
  if (tone && tone !== "ALL") where.tone = tone
  if (search) {
    where.content = { contains: search, mode: 'insensitive' }
  }

  if (status === 'ARCHIVED') where.isArchived = true
  else if (status === 'FAVORITES') where.isFavorite = true
  else where.isArchived = false

  return await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
            sender: {
                select: {
                    username: true,
                    image: true,
                    shadowName: true
                }
            }
        }
      },
      sender: {
        select: {
          username: true,
          image: true,
          shadowName: true
        }
      }
    }
  })
}

export async function updateMessageStatus(id: string, updates: { 
  isArchived?: boolean 
  isFavorite?: boolean 
  isRead?: boolean 
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const data: Prisma.MessageUpdateManyMutationInput = {}
  if (updates.isArchived !== undefined) data.isArchived = updates.isArchived
  if (updates.isFavorite !== undefined) data.isFavorite = updates.isFavorite
  if (updates.isRead !== undefined) data.readAt = updates.isRead ? new Date() : null

  await prisma.message.updateMany({
    where: { id, receiverId: session.user.id },
    data
  })

  revalidatePath("/inbox")
}

export async function bulkMessageAction(ids: string[], action: 'READ' | 'ARCHIVE' | 'DELETE') {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const where = { id: { in: ids }, receiverId: session.user.id }

  if (action === 'READ') {
    await prisma.message.updateMany({ where, data: { readAt: new Date() } })
  } else if (action === 'ARCHIVE') {
    await prisma.message.updateMany({ where, data: { isArchived: true } })
  } else if (action === 'DELETE') {
    await prisma.message.updateMany({ where, data: { deletedAt: new Date() } })
  }

  revalidatePath("/inbox")
}

export async function replyToMessage(parentId: string, content: string, asPublicPost: boolean = false) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parentMessage = await prisma.message.findUnique({
    where: { id: parentId },
    select: { receiverId: true, senderId: true, content: true }
  })

  if (!parentMessage || parentMessage.receiverId !== session.user.id) {
    throw new Error("Parent message not found or unauthorized")
  }

  if (asPublicPost) {
    // Create a public post revealing the anonymous message
    const post = await prisma.post.create({
      data: {
        content: `REVEALED SIGNAL:\n\n> ${parentMessage.content}\n\nREPLY: ${content}`,
        authorId: session.user.id,
        useShadowId: false, // Default to real identity for reveal
      }
    })

    await prisma.message.update({
      where: { id: parentId },
      data: { repliedWithPostId: post.id }
    })

    revalidatePath("/feed")
  } else {
    // Create a private threaded reply
    await prisma.message.create({
      data: {
        content,
        parentId,
        receiverId: parentMessage.senderId || parentMessage.receiverId, // To the original sender or back to self if test
        senderId: session.user.id,
        type: MessageType.TEXT,
      }
    })
  }

  revalidatePath("/inbox")
}

export async function reportMessage(messageId: string, reason: ReportReason, description?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      messageId,
      reason,
      description
    }
  })

  return { success: "Report filed for review." }
}

export async function toggleFavorite(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const message = await prisma.message.findUnique({
        where: { id, receiverId: session.user.id },
        select: { isFavorite: true }
    })

    if (!message) throw new Error("Message not found")

    await prisma.message.update({
        where: { id },
        data: { isFavorite: !message.isFavorite }
    })

    revalidatePath("/inbox")
}

export async function toggleArchive(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const message = await prisma.message.findUnique({
        where: { id, receiverId: session.user.id },
        select: { isArchived: true }
    })

    if (!message) throw new Error("Message not found")

    await prisma.message.update({
        where: { id },
        data: { isArchived: !message.isArchived }
    })

    revalidatePath("/inbox")
}

export async function deleteMessage(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.message.update({
        where: { id, receiverId: session.user.id },
        data: { deletedAt: new Date() }
    })

    revalidatePath("/inbox")
}

export async function markAsRead(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.message.updateMany({
        where: { id, receiverId: session.user.id, readAt: null },
        data: { readAt: new Date() }
    })

    revalidatePath("/inbox")
}

export async function blockSender(messageId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const message = await prisma.message.findUnique({
        where: { id: messageId, receiverId: session.user.id },
        select: { senderFingerprint: true }
    })

    if (!message || !message.senderFingerprint) throw new Error("Signal source not found")

    await prisma.messageBlock.upsert({
        where: {
            blockerId_blockedFingerprint: {
                blockerId: session.user.id,
                blockedFingerprint: message.senderFingerprint
            }
        },
        update: {},
        create: {
            blockerId: session.user.id,
            blockedFingerprint: message.senderFingerprint,
        }
    })

    // Also archive all messages from this fingerprint
    await prisma.message.updateMany({
        where: { 
            receiverId: session.user.id, 
            senderFingerprint: message.senderFingerprint 
        },
        data: { isArchived: true }
    })

    revalidatePath("/inbox")
}
