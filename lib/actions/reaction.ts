"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { ReactionType } from "@prisma/client"

export async function toggleReaction(postId: string, type: ReactionType = "RELATE") {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized access: Signal identity required." }

  try {
    const existing = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      // Toggle off
      await prisma.$transaction([
        prisma.reaction.delete({
          where: { id: existing.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { reactionCount: { decrement: 1 } },
        }),
      ])
      revalidatePath("/feed")
      return { success: "Reaction decoupled.", reacted: false }
    } else {
      // Toggle on
      await prisma.$transaction([
        prisma.reaction.create({
          data: {
            postId,
            userId: session.user.id,
            type,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { reactionCount: { increment: 1 } },
        }),
      ])
      revalidatePath("/feed")
      return { success: "Reaction synchronized.", reacted: true }
    }
  } catch (error) {
    console.error("Reaction toggle error:", error)
    return { error: "Protocol failure: FAILED_TO_SYNC_REACTION" }
  }
}
