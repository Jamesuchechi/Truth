"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UsePostTrackProps {
  postId: string
  isEnabled?: boolean
}

export function usePostTrack({ postId, isEnabled = true }: UsePostTrackProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const durationRef = useRef<number>(0)
  const lastTickRef = useRef<number>(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Buffering events to avoid excessive API calls
  const syncData = useCallback(async () => {
    if (durationRef.current < 1) return // Ignore non-views

    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          duration: durationRef.current,
          readComplete: durationRef.current > 10000, 
          scrolledPast: durationRef.current > 0 && durationRef.current < 200,
        }),
        // Use keepalive to ensure sync completes even on unmount
        keepalive: true,
      })
    } catch {
      // Silent fail on tracking
    }
  }, [postId])

  useEffect(() => {
    if (!isEnabled || !containerRef.current) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        
        if (entry.isIntersecting) {
          lastTickRef.current = performance.now()
        } else {
          // Stopped viewing, update duration
          if (lastTickRef.current > 0) {
            durationRef.current += performance.now() - lastTickRef.current
            lastTickRef.current = 0
            syncData()
          }
        }
      },
      { threshold: 0.5 } // 50% visible means "viewing"
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      // Final sync on unmount
      if (lastTickRef.current > 0) {
        durationRef.current += performance.now() - lastTickRef.current
      }
      syncData()
    }
  }, [isEnabled, syncData])

  return { containerRef, isIntersecting }
}
