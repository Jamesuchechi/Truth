"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { summarizeContent } from "@/lib/ai/summary"
import { redis } from "@/lib/db/redis"

const SUMMARY_TTL = 3600 * 24 // 24 Hours Cache

export async function getPostSummary(postId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "AUTHENTICATION_REQUIRED" }

  try {
    // 1. Check Redis Cache First
    const cachedSummary = await redis.get(`summary:${postId}`)
    if (cachedSummary) return { summary: cachedSummary as string }

    // 2. Fetch Post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { content: true }
    })

    if (!post || post.content.length < 200) {
      return { error: "CONTENT_TOO_SHORT_FOR_AI_EXTRACTION" }
    }

    // 3. Generate Summary
    const summary = await summarizeContent(post.content)

    if (summary) {
      // 4. Cache it
      await redis.set(`summary:${postId}`, summary, { ex: SUMMARY_TTL })
    }

    return { summary }
  } catch (error) {
    console.error(`[AI_SUMMARY_ERROR] Protocol extraction failed:`, error)
    return { error: "EXTRACTION_PROTOCOL_FAILURE" }
  }
}
