import { useState, useEffect } from 'react'

interface ReactionSummary {
  [key: string]: number
}

interface ReactionUpdate {
  type: 'INITIAL' | 'UPDATE'
  count: number
  summary: ReactionSummary
}

export function useReactions(postId: string) {
  const [reactionCount, setReactionCount] = useState<number | null>(null)
  const [summary, setSummary] = useState<ReactionSummary | null>(null)

  useEffect(() => {
    if (!postId) return

    const eventSource = new EventSource(`/api/reactions/stream?postId=${postId}`)

    eventSource.onmessage = (event) => {
      try {
        const data: ReactionUpdate = JSON.parse(event.data)
        setReactionCount(data.count)
        setSummary(data.summary)
      } catch (err) {
        console.error('SSE sync failure:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [postId])

  return { reactionCount, summary }
}
