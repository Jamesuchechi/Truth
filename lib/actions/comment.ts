"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Maximum length is 1000 characters"),
  postId: z.string().min(1, "Post ID required."),
  parentId: z.string().optional(),
})

export async function createComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized: Signal identity required." }

  const validatedFields = CommentSchema.safeParse({
    content: formData.get("content"),
    postId: formData.get("postId"),
    parentId: formData.get("parentId") || undefined,
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { content, postId, parentId } = validatedFields.data

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        parentId,
      },
    })

    // Atomic increment of comment count on post
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    revalidatePath("/feed")
    return { success: "Comment synchronized.", comment }
  } catch (error) {
    console.error("Comment creation error:", error)
    return { error: "Protocol failure: FAILED_TO_SYNC_COMMENT" }
  }
}
