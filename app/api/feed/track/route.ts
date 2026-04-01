// app/api/feed/track/route.ts

import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId, action, duration } = await request.json()

  await prisma.feedTracking.upsert({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId
      }
    },
    create: {
      userId: session.user.id,
      postId,
      viewed: action === 'view',
      viewDuration: duration,
      clickedPost: action === 'click',
      reacted: action === 'react',
      commented: action === 'comment',
      saved: action === 'save'
    },
    update: {
      ...(action === 'view' && { viewed: true, viewDuration: duration }),
      ...(action === 'click' && { clickedPost: true }),
      ...(action === 'react' && { reacted: true }),
      ...(action === 'comment' && { commented: true }),
      ...(action === 'save' && { saved: true })
    }
  })

  return NextResponse.json({ success: true })
}