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
  const depthObserverRef = useRef<IntersectionObserver | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // High-fidelity Metrics
  const [scrollDepth, setScrollDepth] = useState(0)
  const [hoverDuration, setHoverDuration] = useState(0)
  const hoverStartRef = useRef<number>(0)
  const [readComplete, setReadComplete] = useState(false)
  const [clickedPost, setClickedPost] = useState(false)
  const [isTabActive, setIsTabActive] = useState(true)

  const syncData = useCallback(async (signals: { 
    duration: number, 
    hover?: number,
    depth?: number,
    complete?: boolean, 
    skimmed?: boolean, 
    clicked?: boolean 
  }) => {
    // Only sync if significant interaction occurred
    if (signals.duration < 100 && !signals.clicked && !signals.hover && !signals.depth) return 

    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          duration: signals.duration,
          hoverDuration: signals.hover,
          scrollDepth: signals.depth,
          readComplete: signals.complete || (signals.depth && signals.depth >= 100), 
          scrolledPast: signals.skimmed,
          clickedPost: signals.clicked
        }),
        keepalive: true,
      })
    } catch {
      // Silent protocol failure
    }
  }, [postId])

  const trackClick = useCallback(() => {
    if (!clickedPost) {
      setClickedPost(true)
      syncData({ duration: 0, clicked: true })
    }
  }, [clickedPost, syncData])

  // Mouse Presence
  const handleMouseEnter = () => {
    hoverStartRef.current = performance.now()
  }

  const handleMouseLeave = () => {
    if (hoverStartRef.current > 0) {
      const currentHover = performance.now() - hoverStartRef.current
      setHoverDuration(prev => prev + currentHover)
      syncData({ duration: 0, hover: currentHover })
      hoverStartRef.current = 0
    }
  }

  useEffect(() => {
    if (!isEnabled || !containerRef.current) return

    const container = containerRef.current
    
    // Tab Focus Handling
    const handleFocus = () => setIsTabActive(true)
    const handleBlur = () => {
      setIsTabActive(false)
      if (lastTickRef.current > 0) {
        const currentDuration = performance.now() - lastTickRef.current
        durationRef.current += currentDuration
        syncData({ duration: currentDuration })
        lastTickRef.current = 0
      }
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    // Visibility Observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        
        if (entry.isIntersecting && isTabActive) {
          lastTickRef.current = performance.now()
        } else {
          if (lastTickRef.current > 0) {
            const currentDuration = performance.now() - lastTickRef.current
            durationRef.current += currentDuration
            syncData({ 
              duration: currentDuration, 
              complete: readComplete,
              skimmed: (durationRef.current < 300) && (scrollDepth < 25),
              clicked: clickedPost
            })
            lastTickRef.current = 0
          }
        }
      },
      { threshold: 0.1 }
    )

    // Scroll Depth Observer
    depthObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Determine tiered depth (25, 50, 75, 100)
            let tieredDepth = 0
            if (entry.intersectionRatio >= 0.95) tieredDepth = 100
            else if (entry.intersectionRatio >= 0.75) tieredDepth = 75
            else if (entry.intersectionRatio >= 0.50) tieredDepth = 50
            else if (entry.intersectionRatio >= 0.25) tieredDepth = 25

            if (tieredDepth > scrollDepth) {
              setScrollDepth(tieredDepth)
              if (tieredDepth === 100) setReadComplete(true)
              syncData({ duration: 0, depth: tieredDepth })
            }
          }
        })
      },
      { threshold: [0.25, 0.50, 0.75, 1.0] }
    )

    observerRef.current.observe(container)
    depthObserverRef.current.observe(container)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      if (observerRef.current) observerRef.current.disconnect()
      if (depthObserverRef.current) depthObserverRef.current.disconnect()
      
      if (lastTickRef.current > 0) {
        const finalDuration = performance.now() - lastTickRef.current
        syncData({ duration: finalDuration, hover: hoverDuration, depth: scrollDepth })
      }
    }
  }, [isEnabled, syncData, readComplete, scrollDepth, clickedPost, isTabActive, hoverDuration])

  return { containerRef, isIntersecting, trackClick, handleMouseEnter, handleMouseLeave }
}
