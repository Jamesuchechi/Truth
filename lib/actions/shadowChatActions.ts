// lib/actions/shadowChatActions.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import type { ChatType } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * Initialize a new shadow conversation.
 * Participants can be referred to by their User IDs, and will communicate as shadows.
 */
export async function startShadowConversation(participantIds: string[], type: ChatType = "DIRECT", name?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // For DIRECT chats, ensure we don't have multiple conversations between the same two users.
  if (type === "DIRECT" && participantIds.length === 1) {
    const targetId = participantIds[0]
    const existing = await prisma.conversation.findFirst({
        where: {
            type: "DIRECT",
            participants: { every: { userId: { in: [session.user.id, targetId] } } }
        },
        include: { participants: true }
    })
    
    // Check if both users are actually participanting
    if (existing && existing.participants.length === 2) {
        return existing
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      type,
      name,
      participants: {
        create: [
          { userId: session.user.id, useShadow: true },
          ...participantIds.map(id => ({ userId: id, useShadow: true }))
        ]
      }
    },
    include: {
        participants: {
            include: {
                user: {
                    select: {
                        username: true,
                        shadowName: true,
                        image: true
                    }
                }
            }
        }
    }
  })

  revalidatePath("/shadow-chats")
  return conversation
}

/**
 * Send a message within a persistent shadow conversation.
 */
export async function sendShadowChatMessage(conversationId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify participant status
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
        conversationId_userId: {
            conversationId,
            userId: session.user.id
        }
    }
  })

  if (!participant) throw new Error("Not a member of this secure channel.")

  const message = await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId: session.user.id,
      type: "TEXT"
    }
  })

  // Update conversation last activity
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })

  revalidatePath(`/shadow-chats/${conversationId}`)
  return message
}

/**
 * Retrieve all active shadow conversations for the current user.
 */
export async function getShadowConversations() {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: session.user.id }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              username: true,
              shadowName: true,
              image: true
            }
          }
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
            sender: {
                select: {
                    username: true,
                    shadowName: true
                }
            }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getConversationMessages(conversationId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: {
                select: {
                    username: true,
                    shadowName: true,
                    image: true
                }
            }
        }
    })
}
