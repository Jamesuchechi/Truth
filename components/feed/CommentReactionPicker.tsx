"use client"

import { motion } from "framer-motion"
import type { ReactionType } from "@prisma/client"

interface ReactionOption {
  type: ReactionType
  emoji: string
}

const REACTION_OPTIONS: ReactionOption[] = [
  { type: "RELATE", emoji: "🫂" },
  { type: "DEEP", emoji: "🌊" },
  { type: "NOT_ALONE", emoji: "💙" },
  { type: "WILD", emoji: "🤯" },
  { type: "REAL_TALK", emoji: "🔥" },
  { type: "THANK_YOU", emoji: "🙏" },
  { type: "THAT_HURTS", emoji: "😢" },
  { type: "STAY_STRONG", emoji: "💪" },
]

interface CommentReactionPickerProps {
  onSelect: (type: ReactionType) => void
  onClose: () => void
  activeType?: ReactionType | null
}

export function CommentReactionPicker({ onSelect, onClose }: CommentReactionPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute bottom-full left-0 mb-2 z-50 bg-truth-nearBlack border border-truth-midGray shadow-xl p-1 flex items-center gap-0.5 rounded-sm"
      onMouseLeave={onClose}
    >
      {REACTION_OPTIONS.map((option, index) => (
        <motion.button
          key={option.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: index * 0.02 }
          }}
          whileHover={{ scale: 1.4 }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(option.type)
          }}
          className="p-1 hover:bg-truth-darkGray transition-colors rounded-sm"
        >
          <span className="text-lg">{option.emoji}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
