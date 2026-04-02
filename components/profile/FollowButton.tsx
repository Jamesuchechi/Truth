// components/profile/FollowButton.tsx
"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, Loader2, Zap } from "lucide-react"
import { followUser, unfollowUser } from "@/lib/actions/follow"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  targetId: string
  initialIsFollowing: boolean
  isMutual?: boolean
  className?: string
}

export default function FollowButton({ 
  targetId, 
  initialIsFollowing, 
  isMutual,
  className 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = async () => {
    // Optimistic Update
    const previousState = isFollowing
    setIsFollowing(!previousState)

    startTransition(async () => {
      const result = previousState 
        ? await unfollowUser(targetId) 
        : await followUser(targetId)

      if (result.error) {
        setIsFollowing(previousState)
        // You could add a toast here
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        relative group overflow-hidden px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all
        ${isFollowing 
          ? "bg-truth-nearBlack text-truth-accentGreen border border-truth-accentGreen shadow-[4px_4px_0px_rgba(50,205,50,0.2)]" 
          : "bg-truth-accentRed text-truth-bg font-black border border-truth-accentRed hover:shadow-[0_0_15px_rgba(255,51,102,0.4)]"}
        ${isPending ? "opacity-70 cursor-wait" : "active:scale-95"}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Syncing_Signal...</span>
          </motion.div>
        ) : isFollowing ? (
          <motion.div
            key="following"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            {isMutual ? <Zap className="w-3 h-3 text-truth-accentGreen animate-pulse" /> : <Wifi className="w-3 h-3" />}
            <span>{isMutual ? "MUTUAL_SIGNAL" : "SIGNAL_ACTIVE"}</span>
          </motion.div>
        ) : (
          <motion.div
            key="follow"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <WifiOff className="w-3 h-3" />
            <span>ESTABLISH_SIGNAL</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Background Effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 -translate-x-full"
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.4 }}
      />
    </button>
  )
}
