"use client"

import React, { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/Skeleton"
import { motion, AnimatePresence } from "framer-motion"

const LOADING_MESSAGES = [
  "SYNCHRONIZING_WITH_THE_VOID...",
  "DECRYPTING_SIGNAL_STREAMS...",
  "INITIALIZING_TRUTH_PROTOCOL...",
  "MAPPING_SHADOW_IDENTITY...",
  "ESTABLISHING_SECURE_NODE..."
]

export default function FeedSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      {/* Engaging Loading Message */}
      <div className="h-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted text-center"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {[1, 2].map((i) => (
        <div 
          key={i}
          className="bg-card border-2 border-border p-3 sm:p-6 lg:p-8 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] sm:shadow-[10px_10px_0px_rgba(0,0,0,0.05)]"
        >
          {/* Header Skeleton */}
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton variant="circle" className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 sm:w-24" />
                <Skeleton className="h-2 w-28 sm:w-32 opacity-50" />
              </div>
            </div>
            <Skeleton className="w-6 h-6 border-none" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3 mb-6 sm:mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-border/10">
            <div className="flex items-center gap-3 sm:gap-6">
              <Skeleton className="w-10 sm:w-12 h-4" />
              <Skeleton className="w-10 sm:w-12 h-4" />
              <Skeleton className="w-10 sm:w-12 h-4" />
            </div>
            <Skeleton className="w-16 sm:w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  )
}
