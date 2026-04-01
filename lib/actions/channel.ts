"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

const DEFAULT_CHANNELS = [
  { name: "General", slug: "general", description: "The central hub of TruthOS. Everything and anything.", color: "#FF3366" },
  { name: "Shadows", slug: "shadows", description: "Where the hidden personas reveal their deepest secrets.", color: "#8A2BE2" },
  { name: "Whispers", slug: "whispers", description: "Soft truths and quiet confessions.", color: "#00BFFF" },
  { name: "DeepTalk", slug: "deep-talk", description: "Profound philosophical discussions and existential dread.", color: "#20B2AA" },
  { name: "TheVoid", slug: "the-void", description: "Shout into the emptiness and see what echoes back.", color: "#1A1A1A" },
  { name: "CyberSec", slug: "cyber-sec", description: "Protocol discussions, encryption, and digital safety.", color: "#32CD32" },
  { name: "Philosophy", slug: "philosophy", description: "Seeking the truth behind the truth.", color: "#FFD700" },
  { name: "Anonymity", slug: "anonymity", description: "Refining the art of staying unseen.", color: "#708090" },
  { name: "Meta", slug: "meta", description: "Discussions about the TruthOS protocol itself.", color: "#FF4500" },
  { name: "Leaks", slug: "leaks", description: "Verified and unverified signal spills.", color: "#DC143C" },
]

export async function getChannels() {
  const session = await auth()
  
  let channels = await prisma.channel.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { subscribers: true, posts: true }
      }
    }
  })

  // Auto-seed if empty
  if (channels.length === 0) {
    await Promise.all(
      DEFAULT_CHANNELS.map(c => 
        prisma.channel.create({
          data: { ...c, isDefault: true }
        })
      )
    )
    channels = await prisma.channel.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { subscribers: true, posts: true }
          }
        }
    })
  }

  if (session?.user?.id) {
    const subscriptions = await prisma.channelSubscription.findMany({
      where: { userId: session.user.id },
      select: { channelId: true }
    })
    const subIds = new Set(subscriptions.map(s => s.channelId))
    return channels.map(c => ({
      ...c,
      isSubscribed: subIds.has(c.id)
    }))
  }

  return channels.map(c => ({ ...c, isSubscribed: false }))
}

export async function toggleSubscription(channelId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const existing = await prisma.channelSubscription.findUnique({
    where: {
      userId_channelId: {
        userId: session.user.id,
        channelId
      }
    }
  })

  try {
    if (existing) {
      await prisma.channelSubscription.delete({
        where: { id: existing.id }
      })
      revalidatePath("/channels")
      return { success: "Unsubscribed from signal." }
    } else {
      await prisma.channelSubscription.create({
        data: {
          userId: session.user.id,
          channelId
        }
      })
      revalidatePath("/channels")
      return { success: "Subscribed to signal." }
    }
  } catch {
    return { error: "Failed to update protocol subscription." }
  }
}

export async function getSubscribedChannels() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.channel.findMany({
    where: {
      subscribers: {
        some: { userId: session.user.id }
      }
    },
    orderBy: { name: "asc" }
  })
}

export async function getChannelBySlug(slug: string) {
  const session = await auth()
  
  const channel = await prisma.channel.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { subscribers: true, posts: true }
      }
    }
  })

  if (!channel) return null

  let isSubscribed = false
  if (session?.user?.id) {
    const sub = await prisma.channelSubscription.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId: channel.id
        }
      }
    })
    isSubscribed = !!sub
  }

  return {
    ...channel,
    isSubscribed
  }
}
