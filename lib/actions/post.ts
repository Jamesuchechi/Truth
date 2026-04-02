// lib/actions/post.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { VisibilityType, MediaType, ToneType } from "@prisma/client"
import { postInclude } from "@/lib/types/post"
import { syncUserReputation } from "./reputation"
import { checkToxicity, detectTone } from "@/lib/ai/toxicity"

const MediaItemSchema = z.object({
  url: z.string().url("Invalid protocol signal URL."),
  type: z.enum(["IMAGE", "VIDEO", "AUDIO"]).default("IMAGE"),
})

const PostSchema = z.object({
  content: z.string().min(1, "Truth cannot be empty").max(2000, "Maximum length is 2000 characters"),
  useShadow: z.boolean().optional(),
  visibility: z.enum(["PUBLIC", "STORY", "LIMITED", "FOLLOWERS_ONLY"]).default("PUBLIC"),
  viewsLimit: z.preprocess((val) => Number(val), z.number().int().positive().optional()),
  parentId: z.string().optional(),
  channelId: z.string().optional(),
  media: z.array(MediaItemSchema).optional(),
  authoredByTeamId: z.string().optional(),
})

// Basic profanity filter (pre-AI check)
const forbiddenWords = ["badword1", "badword2"] // Placeholder for development
function hasProfanity(content: string) {
  const normalized = content.toLowerCase()
  return forbiddenWords.some(word => normalized.includes(word))
}

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized access detected." }
  }

  // Parse media from JSON if present
  const mediaRaw = formData.get("media")
  let mediaParsed = undefined
  if (mediaRaw && typeof mediaRaw === 'string') {
    try {
      mediaParsed = JSON.parse(mediaRaw)
    } catch {
       return { error: "Invalid signal metadata encountered." }
    }
  }

  const validatedFields = PostSchema.safeParse({
    content: formData.get("content"),
    useShadow: formData.get("useShadow") === "true",
    visibility: formData.get("visibility"),
    parentId: formData.get("parentId") || undefined,
    channelId: formData.get("channelId") || undefined,
    media: mediaParsed,
    authoredByTeamId: formData.get("authoredByTeamId") || undefined,
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { content, useShadow, visibility, parentId, channelId, media, viewsLimit, authoredByTeamId } = validatedFields.data

  if (hasProfanity(content)) {
    return { error: "Content violated protocol: PROFANITY_DETECTED" }
  }

  try {
    let expiresAt: Date | null = null
    if (visibility === "STORY") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }

    // AI Analysis (Synchronous for protocol integrity)
    const [isToxic, tone] = await Promise.all([
      checkToxicity(content),
      detectTone(content)
    ])

    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
        useShadowId: useShadow,
        visibilityType: visibility,
        expiresAt,
        parentId,
        channelId,
        authoredByTeamId,
        toxicityScore: isToxic ? 1.0 : 0,
        tone: tone as ToneType,
        isFiltered: isToxic,
        viewsLimit: visibility === "LIMITED" ? viewsLimit : null,
        media: media && media.length > 0 ? {
          create: media.map((item, index) => ({
            url: item.url,
            type: item.type as MediaType,
            order: index,
          }))
        } : undefined,
      }
    })

    revalidatePath("/feed")
    revalidatePath(`/${session.user.username}`)
    if (channelId) revalidatePath(`/channels/${channelId}`)
    
    await syncUserReputation(session.user.id)
    
    return { success: "Truth synchronized successfully.", id: post.id }
  } catch (error) {
    console.error("Post creation error:", error)
    return { error: "System failure: FAILED_TO_EXECUTE_TRUTH" }
  }
}

// Special action to create a Thread
export async function createThread(
  contents: { content: string, media?: { url: string, type: string }[] }[], 
  useShadow: boolean, 
  channelId?: string
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    let lastId: string | undefined = undefined
    
    for (const item of contents) {
       if (hasProfanity(item.content)) return { error: "Content violated protocol: Profanity detected in thread." }
       
       const [isToxic, tone] = await Promise.all([
         checkToxicity(item.content),
         detectTone(item.content)
       ])

       const newPost: { id: string } = await prisma.post.create({
         data: {
           content: item.content,
           authorId: session.user.id,
           useShadowId: useShadow,
           parentId: lastId,
           channelId,
           toxicityScore: isToxic ? 1.0 : 0,
           tone: tone as ToneType,
           isFiltered: isToxic,
           media: item.media && item.media.length > 0 ? {
             create: item.media.map((m, idx) => ({
               url: m.url,
               type: m.type as MediaType,
               order: idx,
             }))
           } : undefined,
         },
         select: { id: true }
       })
       lastId = newPost.id
    }
    revalidatePath("/feed")
    await syncUserReputation(session.user.id)
    return { success: "Thread synchronized." }
  } catch {
    return { error: "Thread execution failure." }
  }
}

export async function updatePost(postId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  if (hasProfanity(content)) {
    return { error: "Content violated protocol: PROFANITY_DETECTED" }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId, authorId: session.user.id },
      select: { id: true, content: true, createdAt: true }
    })

    if (!post) return { error: "Transmission not found or unauthorized access." }
    
    // Save current content to history before update
    await prisma.postHistory.create({
      data: {
        postId: post.id,
        content: post.content,
      }
    })

    // 5-minute maximum update window (strict protocol)
    const fiveMinutes = 5 * 60 * 1000
    if (Date.now() - new Date(post.createdAt).getTime() > fiveMinutes) {
      return { error: "Update window closed: Protocol integrity requires persistence after 5 minutes." }
    }

    await prisma.post.update({
      where: { id: postId },
      data: { content }
    })

    revalidatePath("/feed")
    revalidatePath(`/${session.user.username}`)
    return { success: "Transmission updated." }
  } catch {
    return { error: "Update execution failure." }
  }
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    // Soft delete (Terminate Signal)
    await prisma.post.update({
      where: { id: postId, authorId: session.user.id },
      data: { deletedAt: new Date() }
    })

    revalidatePath("/feed")
    revalidatePath(`/${session.user.username}`)
    return { success: "Transmission terminated." }
  } catch {
    return { error: "Termination failure." }
  }
}

export async function archivePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    await prisma.post.update({
      where: { id: postId, authorId: session.user.id },
      data: { visibilityType: "FOLLOWERS_ONLY" } // Archiving effectively makes it private/limited
    })

    revalidatePath("/feed")
    return { success: "Signal archived." }
  } catch {
    return { error: "Archiving failure." }
  }
}

export async function getPosts({
  authorId,
  channelId,
  visibility,
  limit = 20,
  cursor,
}: {
  authorId?: string
  channelId?: string
  visibility?: VisibilityType
  limit?: number
  cursor?: string
} = {}) {
  // Simple hash function for eligibility check
  const getEligibilityScore = (userId: string, postId: string) => {
    let hash = 0
    const str = userId + postId
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash) % 100
  }

  const session = await auth()
  const userId = session?.user?.id

  const posts = await prisma.post.findMany({
    where: {
      authorId,
      channelId,
      visibilityType: visibility,
      deletedAt: null,
      parentId: null,
    },
    take: limit + 50, // Fetch more to account for eligibility filtering
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      ...postInclude,
      feedTracking: userId ? {
        where: { userId }
      } : false
    }
  })

  // Eligibility Filtering for LIMITED posts
  const filteredPosts = posts.filter(post => {
    // Authors can always see their own posts
    if (userId === post.authorId) return true
    
    // Users who have already viewed it should still see it
    const hasViewed = post.feedTracking && post.feedTracking.length > 0 && post.feedTracking[0].viewed
    if (hasViewed) return true

    if (post.visibilityType === "LIMITED") {
      if (!userId) return false 
      
      const score = getEligibilityScore(userId, post.id)
      return score < 30 // 30% of users are eligible for any given limited post
    }

    return true
  })

  return filteredPosts.slice(0, limit)
}

export async function getPostById(id: string) {
  const session = await auth()
  const userId = session?.user?.id

  try {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        ...postInclude,
        feedTracking: userId ? {
          where: { userId }
        } : false
      }
    })

    if (!post) return null

    // Track view if authenticated
    if (userId && post.authorId !== userId) {
      await prisma.feedTracking.upsert({
        where: { userId_postId: { userId, postId: id } },
        create: { userId, postId: id, viewed: true, clickedPost: true },
        update: { viewed: true, clickedPost: true, viewCount: { increment: 1 } }
      })

      // Increment view count on post if limited
      if (post.visibilityType === "LIMITED") {
        await prisma.post.update({
          where: { id },
          data: { currentViews: { increment: 1 } }
        })
      }
    }

    return post
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getTrendingPosts(limit = 5) {
  try {
    // Basic trending logic: most reactions + comments in the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    
    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: fortyEightHoursAgo },
        deletedAt: null,
        visibilityType: "PUBLIC",
      },
      take: limit,
      orderBy: [
        { reactionCount: "desc" },
        { commentCount: "desc" },
        { createdAt: "desc" }
      ],
      include: postInclude
    })

    return posts
  } catch (error) {
    console.error("Error fetching trending posts:", error)
    return []
  }
}
