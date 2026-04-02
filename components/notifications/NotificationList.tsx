// components/notifications/NotificationList.tsx
"use client"

import { type NotificationWithSender, markAllAsRead } from "@/lib/actions/notification"
import NotificationItem from "./NotificationItem"
import { useTransition, useState } from "react"
import { BellOff, CheckCircle, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface NotificationListProps {
  initialNotifications: NotificationWithSender[]
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllAsRead()
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
    })
  }

  const hasUnread = notifications.some(n => !n.read)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-truth-midGray/20 pb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-truth-accentRed" />
          <h2 className="font-mono text-xs font-black uppercase tracking-widest text-truth-textLight">
            SIGNAL_FEED [{notifications.length}]
          </h2>
        </div>
        {hasUnread && (
          <button 
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="font-mono text-[10px] uppercase text-truth-textGray hover:text-truth-accentRed transition-all flex items-center gap-2 px-3 py-1 border border-truth-midGray/30 hover:border-truth-accentRed/50"
          >
            <CheckCircle className="w-3 h-3" /> Clear_Buffer
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center border-4 border-dashed border-truth-midGray/10 bg-truth-nearBlack/20"
            >
               <BellOff className="w-12 h-12 text-truth-midGray/20 mx-auto mb-4" />
               <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest leading-loose">
                 No synchronous signals detected in current node buffer.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
