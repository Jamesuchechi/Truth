"use client"

import { formatRelativeTime } from "@/lib/utils"
import { Ghost, Heart, CheckCircle, Zap } from "lucide-react"
import type { CommentWithAuthor } from "@/lib/types/comment"
import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { toggleReaction } from "@/lib/actions/reaction"
import { CommentReactionPicker } from "./CommentReactionPicker"
import { motion, AnimatePresence } from "framer-motion"
import type { ReactionType } from "@prisma/client"

export default function CommentItem({ 
  comment 
}: { 
  comment: CommentWithAuthor
}) {
  const { data: session } = useSession()
  const [, startTransition] = useTransition()
  const userId = session?.user?.id

  // Stats - Find current user's reaction if any
  const reactions = comment.reactions || []
  const initialReaction = reactions.find((r) => r.userId === userId)?.type || null
  
  const [reactionCount, setReactionCount] = useState<number>(comment._count?.reactions || 0)
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(initialReaction)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const isReacted = !!activeReaction
  return (
    <div className="flex gap-4 p-4 border-b border-truth-midGray/10 hover:bg-truth-nearBlack/30 transition-all group">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-8 h-8 border border-truth-midGray bg-truth-darkGray flex items-center justify-center relative overflow-hidden">
          {comment.author.shadowName ? (
            <Ghost className="w-4 h-4 text-truth-accentRed" />
          ) : (
            <div className="w-full h-full bg-truth-midGray" />
          )}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_2px]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-tighter text-truth-textLight">
              {comment.author.shadowName && comment.author.isAnonymous ? comment.author.shadowName : comment.author.username}
            </span>
            {comment.author.isAnonymous && comment.author.shadowVerified && (
              <span title="Verified Shadow Identity">
                <CheckCircle className="w-3 h-3 text-truth-accentPurple fill-truth-accentPurple/10 -ml-1 mt-0.5" />
              </span>
            )}
            <span className={`flex items-center gap-1 px-1 py-0.5 border border-opacity-30 font-mono text-[7px] uppercase tracking-tighter ${
              comment.author.reputationTier === 'ARCHITECT' ? 'text-truth-accentYellow border-truth-accentYellow bg-truth-accentYellow/10' :
              comment.author.reputationTier === 'GUARDIAN' ? 'text-truth-accentGreen border-truth-accentGreen bg-truth-accentGreen/10' :
              comment.author.reputationTier === 'ORACLE' ? 'text-truth-accentBlue border-truth-accentBlue bg-truth-accentBlue/10' :
              comment.author.reputationTier === 'SPECTRE' ? 'text-truth-accentPurple border-truth-accentPurple bg-truth-accentPurple/10' :
              'text-truth-textGray border-truth-midGray bg-truth-darkGray/30'
            }`}>
              <Zap className="w-2 h-2" />
              {comment.author.reputationTier}
            </span>
            <span className="font-mono text-[8px] text-truth-textGray uppercase">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
        <p className="font-bitter text-sm text-truth-textGray group-hover:text-truth-textLight transition-colors leading-relaxed">
          {comment.content}
        </p>

        {/* Comment Footer / Actions */}
        <div className="mt-3 flex items-center gap-4 relative">
          <button 
            onMouseEnter={() => setIsPickerOpen(true)}
            onClick={() => {
              const type: ReactionType = "REAL_TALK"
              const wasReacted = isReacted
              const wasType = activeReaction

              // Optimistic update
              if (wasReacted && wasType === type) {
                setReactionCount(prev => prev - 1)
                setActiveReaction(null)
              } else if (!wasReacted) {
                setReactionCount(prev => prev + 1)
                setActiveReaction(type)
                setShowBurst(true)
                setTimeout(() => setShowBurst(false), 800)
              } else {
                setActiveReaction(type)
                setShowBurst(true)
                setTimeout(() => setShowBurst(false), 800)
              }

              startTransition(async () => {
                const res = await toggleReaction(comment.id, type, 'COMMENT')
                if (res.error) {
                  setReactionCount(comment._count?.reactions || 0)
                  setActiveReaction(wasType)
                }
              })
            }}
            className={`flex items-center gap-1.5 transition-all group/btn ${isReacted ? "text-truth-accentRed" : "text-truth-textGray"} hover:text-truth-accentRed`}
          >
            <div className={`relative p-1.5 rounded-sm border border-transparent transition-all ${isReacted ? "bg-truth-accentRed/5 border-truth-accentRed/20" : "group-hover/btn:bg-white/5"}`}>
               {/* Burst Animation */}
               <AnimatePresence>
                 {showBurst && (
                   <motion.div
                     initial={{ scale: 0, opacity: 1 }}
                     animate={{ scale: 2.5, opacity: 0 }}
                     className="absolute inset-0 bg-truth-accentRed/30 rounded-full pointer-events-none"
                   />
                 )}
               </AnimatePresence>

               {activeReaction ? (
                 <span className="text-xs">
                    {activeReaction === "RELATE" && "🫂"}
                    {activeReaction === "DEEP" && "🌊"}
                    {activeReaction === "NOT_ALONE" && "💙"}
                    {activeReaction === "WILD" && "🤯"}
                    {activeReaction === "REAL_TALK" && "🔥"}
                    {activeReaction === "THANK_YOU" && "🙏"}
                    {activeReaction === "THAT_HURTS" && "😢"}
                    {activeReaction === "STAY_STRONG" && "💪"}
                 </span>
               ) : (
                <Heart className={`w-3 h-3 ${isReacted ? "fill-truth-accentRed" : ""}`} />
               )}
            </div>
            <span className="font-mono text-[9px] font-bold">{reactionCount > 0 ? reactionCount : ""}</span>
          </button>

          <AnimatePresence>
            {isPickerOpen && (
              <CommentReactionPicker 
                activeType={activeReaction}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(type) => {
                  const wasReacted = isReacted
                  const wasType = activeReaction
                  
                  // Optimistic
                  if (wasReacted && wasType === type) {
                    setReactionCount(prev => prev - 1)
                    setActiveReaction(null)
                  } else if (!wasReacted) {
                    setReactionCount(prev => prev + 1)
                    setActiveReaction(type)
                    setShowBurst(true)
                    setTimeout(() => setShowBurst(false), 800)
                  } else {
                    setActiveReaction(type)
                    setShowBurst(true)
                    setTimeout(() => setShowBurst(false), 800)
                  }

                  setIsPickerOpen(false)
                  startTransition(async () => {
                    const res = await toggleReaction(comment.id, type, 'COMMENT')
                    if (res.error) {
                      setReactionCount(comment._count?.reactions || 0)
                      setActiveReaction(wasType)
                    }
                  })
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
