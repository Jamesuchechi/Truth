// components/notifications/NotificationItem.tsx
"use client"

import { formatRelativeTime } from "@/lib/utils"
import type { NotificationWithSender } from "@/lib/actions/notification"
import { markAsRead } from "@/lib/actions/notification"
import { NotificationType } from "@prisma/client"
import { Heart, MessageSquare, UserPlus, Zap, Bell } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { motion } from "framer-motion"

interface NotificationItemProps {
  notification: NotificationWithSender
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [, startTransition] = useTransition()

  const handleMarkRead = () => {
    if (notification.read) return
    startTransition(async () => {
      await markAsRead(notification.id)
    })
  }

  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.FOLLOW:
        return <UserPlus className="w-4 h-4 text-truth-accentBlue" />
      case NotificationType.REACTION:
        return <Heart className="w-4 h-4 text-truth-accentRed" />
      case NotificationType.COMMENT:
        return <MessageSquare className="w-4 h-4 text-truth-accentGreen" />
      case NotificationType.POST_MENTION:
        return <Zap className="w-4 h-4 text-truth-accentYellow" />
      default:
        return <Bell className="w-4 h-4 text-truth-textLight" />
    }
  }

  const getMessage = () => {
    const name = notification.sender?.shadowName || notification.sender?.username || "Someone"
    switch (notification.type) {
      case NotificationType.FOLLOW:
        return <><b>{name}</b> synchronized with your signal.</>
      case NotificationType.REACTION:
        return <><b>{name}</b> resonated with your transmission.</>
      case NotificationType.COMMENT:
        return <><b>{name}</b> added to the decryption of your post.</>
      case NotificationType.POST_MENTION:
        return <><b>{name}</b> referenced your node in a transmission.</>
      default:
        return <>Experimental alert: Protocol {notification.type} detected.</>
    }
  }

  const href = notification.postId ? `/post/${notification.postId}` : `/${notification.sender?.username || ""}`

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group border-2 transition-all ${notification.read ? 'bg-truth-nearBlack/40 border-truth-midGray/20' : 'bg-truth-nearBlack border-truth-accentRed/30 shadow-[4px_4px_0px_rgba(255,51,102,0.1)] hover:border-truth-accentRed/60'}`}
    >
      <Link 
        href={href} 
        onClick={handleMarkRead}
        className="flex items-start gap-4 p-5"
      >
        <div className="shrink-0 mt-1">
          <div className={`w-10 h-10 flex items-center justify-center border-2 ${notification.read ? 'border-truth-midGray/30' : 'border-truth-accentRed/40 animate-pulse'}`}>
             {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-mono text-xs uppercase tracking-wide leading-relaxed ${notification.read ? 'text-truth-textGray' : 'text-truth-textLight'}`}>
            {getMessage()}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-widest">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {!notification.read && (
              <span className="w-1.5 h-1.5 bg-truth-accentRed animate-ping" />
            )}
          </div>
        </div>

        {/* Action Reveal */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <Zap className="w-3 h-3 text-truth-accentRed/50" />
        </div>
      </Link>

      {/* Decorative Scanline for Unread */}
      {!notification.read && (
        <div className="absolute top-0 left-0 w-1 h-full bg-truth-accentRed" />
      )}
    </motion.div>
  )
}
