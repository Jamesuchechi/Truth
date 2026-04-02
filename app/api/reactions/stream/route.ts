import type { NextRequest } from 'next/server'
import { redis } from '@/lib/db/redis'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return new Response('Missing postId', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Initial data
      const [count, summary] = await Promise.all([
        redis.get<number>(`reaction_count:${postId}`),
        redis.get<Record<string, number>>(`reaction_summary:${postId}`)
      ])

      sendEvent({ type: 'INITIAL', count: count || 0, summary: summary || {} })

      // Polling loop (Serverless friendly SSE "heartbeat")
      const interval = setInterval(async () => {
        try {
          const [currentCount, currentSummary] = await Promise.all([
            redis.get<number>(`reaction_count:${postId}`),
            redis.get<Record<string, number>>(`reaction_summary:${postId}`)
          ])
          
          sendEvent({ type: 'UPDATE', count: currentCount || 0, summary: currentSummary || {} })
        } catch (e) {
          console.error('SSE polling error:', e)
        }
      }, 3000) // 3s interval for sync

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
