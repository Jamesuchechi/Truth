// lib/rate-limit.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number // seconds
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }

  const remaining = Math.max(0, limit - current)

  return {
    success: current <= limit,
    remaining
  }
}

// Usage in API route (Example)
/*
import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth' // Or wherever your authOptions is

export async function POST(request: NextRequest) {
  // const session = await getServerSession(authOptions)
  // const userId = session?.user?.id || request.ip || 'anonymous'
  
  // For demonstration, using simple IP fallback
  const userId = request.ip || 'anonymous'

  // 10 posts per hour
  const { success, remaining } = await rateLimit(`posts:${userId}`, 10, 3600)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', remaining },
      { status: 429 }
    )
  }

  // Continue with post creation...
  return NextResponse.json({ success: true })
}
*/