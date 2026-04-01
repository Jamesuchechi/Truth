import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Signal Intercepted: Unauthorized access to protocol synchronization." }, { status: 401 })
  }

  try {
    const { postId, duration, readComplete, scrolledPast } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Missing protocol metadata: Transmission ID required." }, { status: 400 })
    }

    const existingTracking = await prisma.feedTracking.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
      select: { viewed: true }
    })

    await prisma.feedTracking.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
      update: {
        viewed: true,
        viewCount: { increment: 1 },
        viewDuration: { increment: duration || 0 },
        readComplete: readComplete || false,
        scrolledPast: scrolledPast || false,
      },
      create: {
        userId: session.user.id,
        postId,
        viewed: true,
        viewCount: 1,
        viewDuration: duration || 0,
        readComplete: readComplete || false,
        scrolledPast: scrolledPast || false,
      },
    })

    // If it's a new view (no existing tracking or viewed was false), increment global count
    if (!existingTracking || !existingTracking.viewed) {
      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          currentViews: { increment: 1 }
        },
        select: {
          currentViews: true,
          viewsLimit: true,
          visibilityType: true,
        }
      })

      // Auto-deletion logic for LIMITED posts
      if (post.visibilityType === "LIMITED" && post.viewsLimit && post.currentViews >= post.viewsLimit) {
        await prisma.post.update({
          where: { id: postId },
          data: { deletedAt: new Date() }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[PROTOCOL_TRACKING_ERROR] Synchronized signal failed:`, error)
    return NextResponse.json({ error: "Transmission failed: Protocol synchronization error." }, { status: 500 })
  }
}
