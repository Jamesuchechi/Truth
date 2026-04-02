// app/api/admin/moderation/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { analyzeContent } from "@/lib/ai/moderation"
import { NextResponse } from "next/server"

/**
 * (Admin Only) Bulk Moderator Endpoint
 * Used for re-evaluating potentially toxic content discovered by the protocol.
 */
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Access Denied: Elevation required." }, { status: 403 })
  }

  try {
    const { action, postIds } = await req.json()

    if (action === 'RE_SCAN') {
      const results = []
      
      for (const id of postIds) {
        const post = await prisma.post.findUnique({ where: { id } })
        if (!post) continue

        const analysis = await analyzeContent(post.content)
        
        await prisma.post.update({
          where: { id },
          data: {
            toxicityScore: analysis.toxicityScore,
            tone: analysis.tone,
            isFiltered: analysis.isFlagged
          }
        })
        
        results.push({ id, toxicityScore: analysis.toxicityScore, isFlagged: analysis.isFlagged })
      }

      return NextResponse.json({ 
        success: `Re-scan pulsed for ${results.length} signals.`, 
        results 
      })
    }

    if (action === 'DELETE_FLAGGED') {
      const result = await prisma.post.updateMany({
        where: { id: { in: postIds }, isFiltered: true },
        data: { deletedAt: new Date() }
      })

      return NextResponse.json({ success: `Terminated ${result.count} flagged signals.` })
    }

    return NextResponse.json({ error: "Invalid protocol command." }, { status: 400 })
  } catch (error) {
    console.error("[ADMIN_MODERATION_ERROR]", error)
    return NextResponse.json({ error: "System failure: Moderation pulse interrupted." }, { status: 500 })
  }
}

/**
 * (Admin Only) Get flagged content summary
 */
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const flaggedPosts = await prisma.post.findMany({
    where: { isFiltered: true, deletedAt: null },
    orderBy: { toxicityScore: "desc" },
    take: 50,
    include: {
      author: { select: { username: true } },
      reports: { select: { reason: true } }
    }
  })

  return NextResponse.json({ flaggedPosts })
}
