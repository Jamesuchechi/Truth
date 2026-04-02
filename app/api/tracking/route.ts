import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { redis } from "@/lib/db/redis"
import { NextResponse } from "next/server"

const TRACKING_QUEUE_KEY = "protocol:tracking:queue"
const FLUSH_THRESHOLD = 15 // Flush every 15 signals for responsiveness vs performance balance

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Signal Intercepted: Unauthorized access to protocol synchronization." }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { postId, duration, hoverDuration, scrollDepth, readComplete, scrolledPast, clickedPost } = data

    if (!postId) {
      return NextResponse.json({ error: "Missing protocol metadata: Transmission ID required." }, { status: 400 })
    }

    // Push to Redis Queue
    const signal = {
      userId: session.user.id,
      postId,
      duration: duration || 0,
      hoverDuration: hoverDuration || 0,
      scrollDepth: scrollDepth || 0,
      readComplete: !!readComplete,
      scrolledPast: !!scrolledPast,
      clickedPost: !!clickedPost,
      timestamp: Date.now()
    }

    await redis.lpush(TRACKING_QUEUE_KEY, JSON.stringify(signal))

    // Check if we should flush
    const queueSize = await redis.llen(TRACKING_QUEUE_KEY)
    if (queueSize >= FLUSH_THRESHOLD) {
      // Trigger Background Flush (Lazy)
      // Note: In Next.js 15+ we'd use 'after()'. For now, we'll do it inline but catch errors.
      flushTrackingQueue().catch(err => console.error("[FLUSH_ERROR]", err))
    }

    return NextResponse.json({ success: true, queued: true })
  } catch (error) {
    console.error(`[PROTOCOL_TRACKING_ERROR] Synchronized signal failed:`, error)
    return NextResponse.json({ error: "Transmission failed: Protocol synchronization error." }, { status: 500 })
  }
}

interface TrackingSignal {
  userId: string
  postId: string
  duration: number
  hoverDuration: number
  scrollDepth: number
  readComplete: boolean
  scrolledPast: boolean
  clickedPost: boolean
  timestamp: number
}

interface AggregatedTrackingSignal extends TrackingSignal {
  viewCount: number
}

async function flushTrackingQueue() {
  const signals = await redis.lrange(TRACKING_QUEUE_KEY, 0, -1)
  if (!signals || signals.length === 0) return

  // Atomic Clear (Best effort)
  await redis.del(TRACKING_QUEUE_KEY)

  const parsedSignals = signals.map(s => JSON.parse(s as string) as TrackingSignal)
  
  // Aggregate signals by userId_postId to minimize DB operations
  const aggregated: Record<string, AggregatedTrackingSignal> = {}
  
  for (const s of parsedSignals) {
    const key = `${s.userId}_${s.postId}`
    if (!aggregated[key]) {
      aggregated[key] = { ...s, viewCount: s.duration > 0 ? 1 : 0 }
    } else {
      aggregated[key].duration += s.duration
      aggregated[key].hoverDuration += s.hoverDuration
      aggregated[key].scrollDepth = Math.max(aggregated[key].scrollDepth, s.scrollDepth)
      aggregated[key].readComplete = aggregated[key].readComplete || s.readComplete
      aggregated[key].scrolledPast = aggregated[key].scrolledPast || s.scrolledPast
      aggregated[key].clickedPost = aggregated[key].clickedPost || s.clickedPost
      if (s.duration > 0) aggregated[key].viewCount += 1
    }
  }

  // Perform Batch Upserts
  for (const key in aggregated) {
    const data = aggregated[key]
    
    const existing = await prisma.feedTracking.findUnique({
      where: { userId_postId: { userId: data.userId, postId: data.postId } },
      select: { viewed: true }
    })

    await prisma.feedTracking.upsert({
      where: { userId_postId: { userId: data.userId, postId: data.postId } },
      update: {
        viewed: true,
        viewCount: { increment: data.viewCount },
        viewDuration: { increment: data.duration },
        hoverDuration: { increment: data.hoverDuration },
        scrollDepth: data.scrollDepth,
        readComplete: data.readComplete,
        scrolledPast: data.scrolledPast,
        clickedPost: data.clickedPost,
      },
      create: {
        userId: data.userId,
        postId: data.postId,
        viewed: true,
        viewCount: data.viewCount,
        viewDuration: data.duration,
        hoverDuration: data.hoverDuration,
        scrollDepth: data.scrollDepth,
        readComplete: data.readComplete,
        scrolledPast: data.scrolledPast,
        clickedPost: data.clickedPost,
      }
    })

    // Global View Count logic
    if (!existing || !existing.viewed) {
      const post = await prisma.post.update({
        where: { id: data.postId },
        data: { currentViews: { increment: 1 } },
        select: { currentViews: true, viewsLimit: true, visibilityType: true }
      })

      if (post.visibilityType === "LIMITED" && post.viewsLimit && post.currentViews >= post.viewsLimit) {
        await prisma.post.update({
          where: { id: data.postId },
          data: { deletedAt: new Date() }
        })
      }
    }
  }
}
