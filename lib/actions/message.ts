// lib/actions/message.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { MessageType, ToneType } from "@prisma/client"
import { detectTone } from "@/lib/ai/tone"
import { sendInboxNotificationEmail } from "@/lib/mail"

import { getSenderFingerprint } from "@/lib/utils/fingerprint"

const MessageSchema = z.object({
  receiverId: z.string().min(1, "Recipient ID is required"),
  content: z.string().min(1, "Content cannot be empty").max(500, "Limit: 500 characters"),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  manualTone: z.nativeEnum(ToneType).optional(),
  revealSender: z.boolean().default(false),
  audioUrl: z.string().url().optional()
})

export type MessageActionState = {
  status?: "idle" | "success" | "error"
  message?: string
  errors?: Record<string, string[] | undefined>
}

export async function sendMessage(prevState: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const session = await auth()
  const fingerprint = await getSenderFingerprint()
  
  const validatedFields = MessageSchema.safeParse({
    receiverId: formData.get("receiverId"),
    content: formData.get("content"),
    type: formData.get("type"),
    manualTone: formData.get("manualTone") || undefined,
    revealSender: formData.get("revealSender") === "true"
  })

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed"
    }
  }

  const { receiverId, content, type, manualTone, revealSender, audioUrl } = validatedFields.data

  try {
    // 1. Fetch recipient and their privacy settings
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { 
        id: true,
        email: true,
        inboxEnabled: true, 
        allowAnonymousMsg: true,
        questionsOnlyMode: true,
        allowedTones: true,
        blockedPhrases: true,
        messageCooldown: true,
        emailNotifications: true
      }
    })

    if (!receiver) return { status: "error", message: "Recipient protocol not found." }
    
    // 0. Honeypot check (Spam Prevention)
    const honeypot = formData.get("nickname") // This is our hidden field
    if (honeypot) {
        console.warn("Spam detected from fingerprint:", fingerprint)
        return { status: "error", message: "Signal blocked by autonomous security layer (Bot detected)." }
    }

    if (!receiver.inboxEnabled) return { status: "error", message: "Recipient has disabled their inbox." }

    // 2. Check if sender is blocked by fingerprint
    const isBlocked = await prisma.messageBlock.findUnique({
      where: {
        blockerId_blockedFingerprint: {
          blockerId: receiver.id,
          blockedFingerprint: fingerprint
        }
      }
    })
    if (isBlocked) return { status: "error", message: "Communication link terminated by recipient." }

    // 3. Rate Limiting (Cooldown)
    if (receiver.messageCooldown > 0) {
      const lastMessage = await prisma.message.findFirst({
        where: {
          receiverId: receiver.id,
          senderFingerprint: fingerprint,
          createdAt: {
            gte: new Date(Date.now() - receiver.messageCooldown * 60 * 1000)
          }
        }
      })
      if (lastMessage) {
        return { status: "error", message: `Cooldown active. Wait ${receiver.messageCooldown}m between transmissions.` }
      }
    }

    // 4. Duplicate Detection (Simple)
    const recentDuplicate = await prisma.message.findFirst({
      where: {
        receiverId: receiver.id,
        senderFingerprint: fingerprint,
        content: content,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes
        }
      }
    })
    if (recentDuplicate) return { status: "error", message: "Duplicate signal detected in buffer." }

    // 5. Questions-Only Mode
    if (receiver.questionsOnlyMode && type !== MessageType.QUESTION) {
      return { status: "error", message: "Recipient protocol only accepts direct inquiries (Questions)." }
    }

    // 6. Blocked Phrases
    if (receiver.blockedPhrases.length > 0) {
      const lowerContent = content.toLowerCase()
      const hasBlockedPhrase = receiver.blockedPhrases.some(phrase => 
        lowerContent.includes(phrase.toLowerCase())
      )
      if (hasBlockedPhrase) return { status: "error", message: "Signal contains restricted terminology." }
    }

    // 7. AI Tone Detection & Filtering
    let tone: ToneType = manualTone || ToneType.NEUTRAL
    if (!manualTone) {
      tone = await detectTone(content)
    }

    if (receiver.allowedTones.length > 0 && !receiver.allowedTones.includes(tone)) {
      return { status: "error", message: `Signal filtered: Recipient does not accept ${tone} transmissions.` }
    }

    // 8. Final Transmission
    await prisma.message.create({
      data: {
        receiverId,
        content,
        type,
        tone,
        revealSender: revealSender && !!session?.user?.id,
        senderId: session?.user?.id || null,
        senderFingerprint: fingerprint,
        audioUrl: type === MessageType.VOICE ? audioUrl : null,
        transcription: type === MessageType.VOICE ? content : null
      }
    })

    // 9. Email Notification (if opted in)
    if (receiver.email && receiver.emailNotifications) {
      // Send asynchronously to avoid blocking the user experience
      sendInboxNotificationEmail(receiver.email).catch(err => {
        console.error("Signal notification failed:", err)
      })
    }

    revalidatePath("/inbox")
    return { status: "success", message: "Message transmitted successfully through the secure channel." }
  } catch (error) {
    console.error("Transmission error:", error)
    return { status: "error", message: "Failed to synchronize signal. Please try again." }
  }
}

export async function getInboxMessages() {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.message.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
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

export async function markAsRead(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.message.updateMany({
    where: { 
        id: messageId,
        receiverId: session.user.id 
    },
    data: { readAt: new Date() }
  })
  
  revalidatePath("/inbox")
}
