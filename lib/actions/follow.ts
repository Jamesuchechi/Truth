// lib/actions/follow.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification"
import { NotificationType } from "@prisma/client"
import { followUserSelect } from "@/lib/types/user"

export type FollowActionState = {
  error?: string
  success?: string
}

export async function followUser(followingId: string): Promise<FollowActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be synchronized to follow." }
  
  const followerId = session.user.id
  if (followerId === followingId) return { error: "Internal feedback loop detected. Cannot follow self." }

  try {
    await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    })
    
    // Create notification for the user being followed
    await createNotification({
      recipientId: followingId,
      senderId: followerId,
      type: NotificationType.FOLLOW
    })
    
    revalidatePath(`/`) // Revalidate feeds
    revalidatePath(`/[username]`, "layout")
    
    return { success: "Signal established." }
  } catch (error) {
    console.error("Follow error:", error)
    return { error: "Signal interference. Try again later." }
  }
}

export async function unfollowUser(targetId: string): Promise<FollowActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Authentication required." }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetId
        }
      }
    })
    
    revalidatePath(`/`)
    revalidatePath(`/[username]`, "layout")
    
    return { success: "Signal terminated." }
  } catch (error) {
    console.error("Unfollow error:", error)
    return { error: "Termination failed. Signal remains active." }
  }
}

export async function getFollowStatus(targetId: string) {
  const session = await auth()
  if (!session?.user?.id) return { isFollowing: false, isMutual: false }

  const [following, followedBy] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetId
        }
      }
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: targetId,
          followingId: session.user.id
        }
      }
    })
  ])

  return {
    isFollowing: !!following,
    isMutual: !!following && !!followedBy
  }
}

export async function getFollowers(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: followUserSelect
      }
    }
  })
  return follows.map(f => f.follower)
}

export async function getFollowing(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: followUserSelect
      }
    }
  })
  return follows.map(f => f.following)
}
