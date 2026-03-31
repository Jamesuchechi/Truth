// lib/rate-limit.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
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

// Usage in API route
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || request.ip || 'anonymous'

  // 10 posts per hour
  const { success, remaining } = await rateLimit(`posts:${userId}`, 10, 3600)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', remaining },
      { status: 429 }
    )
  }

  // Continue with post creation...
}