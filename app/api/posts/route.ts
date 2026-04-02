// app/api/posts/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { getPersonalizedFeed } from '@/lib/feed/ranking'
import { checkToxicity } from '@/lib/ai/toxicity'

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = parseInt(searchParams.get('limit') || '20')

  // Get personalized feed using ranking algorithm
  const { posts, nextCursor } = await getPersonalizedFeed(session.user.id, cursor, limit)

  return NextResponse.json({
    posts,
    nextCursor
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content, channelId, visibilityType, viewsLimit, useShadowId } = body

  // Validate content
  if (!content || content.length > 2000) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  // Check for toxicity
  const isToxic = await checkToxicity(content)
  if (isToxic) {
    return NextResponse.json({ error: 'Content violates guidelines' }, { status: 400 })
  }

  // Create post
  const post = await prisma.post.create({
    data: {
      content,
      authorId: session.user.id,
      channelId,
      visibilityType: visibilityType || 'PUBLIC',
      viewsLimit: visibilityType === 'LIMITED' ? viewsLimit : null,
      useShadowId: useShadowId || false
    },
    include: {
      author: {
        select: {
          shadowName: true,
          shadowVerified: true
        }
      },
      channel: true
    }
  })

  return NextResponse.json({ post }, { status: 201 })
}