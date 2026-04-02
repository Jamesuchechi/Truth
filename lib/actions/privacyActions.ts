// lib/actions/privacyActions.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { ToneType } from "@prisma/client"

export async function toggleQuestionsOnly(enabled: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { questionsOnlyMode: enabled }
  })

  revalidatePath("/settings")
}

export async function updateAllowedTones(tones: ToneType[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { allowedTones: tones }
  })

  revalidatePath("/settings")
}

export async function updateBlockedPhrases(phrases: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { blockedPhrases: phrases }
  })

  revalidatePath("/settings")
}

export async function updateMessageCooldown(minutes: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { messageCooldown: minutes }
  })

  revalidatePath("/settings")
}

export async function blockSenderByFingerprint(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const prospect = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderFingerprint: true, receiverId: true }
  })

  if (!prospect || prospect.receiverId !== session.user.id || !prospect.senderFingerprint) {
    throw new Error("Message source protocol not found or unauthorized.")
  }

  await prisma.messageBlock.upsert({
    where: {
      blockerId_blockedFingerprint: {
        blockerId: session.user.id,
        blockedFingerprint: prospect.senderFingerprint
      }
    },
    update: {},
    create: {
      blockerId: session.user.id,
      blockedFingerprint: prospect.senderFingerprint
    }
  })

  // Optionally delete all messages from this fingerprint for this user
  await prisma.message.updateMany({
    where: {
        receiverId: session.user.id,
        senderFingerprint: prospect.senderFingerprint
    },
    data: { deletedAt: new Date() }
  })

  revalidatePath("/inbox")
  return { success: "Sender fingerprint blocked and purged from buffer." }
}
