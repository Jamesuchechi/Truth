// components/notifications/NotificationBadge.tsx
"use client"

import { getUnreadCount } from "@/lib/actions/notification"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function NotificationBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      const c = await getUnreadCount()
      setCount(c)
    }
    fetchCount()
    
    // Poll every 30 seconds for new signals
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-truth-accentRed text-truth-bg font-mono text-[9px] font-black flex items-center justify-center px-1 rounded-sm shadow-[0_0_10px_rgba(255,51,102,0.4)]"
      >
        {count > 99 ? "99+" : count}
      </motion.div>
    </AnimatePresence>
  )
}
