"use client"

import { motion } from "framer-motion"
import type { ReactionType } from "@prisma/client"

interface ReactionOption {
  type: ReactionType
  emoji: string
  label: string
  color: string
}

const REACTION_OPTIONS: ReactionOption[] = [
  { type: "RELATE", emoji: "🫂", label: "I_RELATE", color: "reactions-relate" },
  { type: "DEEP", emoji: "🌊", label: "THATS_DEEP", color: "reactions-deep" },
  { type: "NOT_ALONE", emoji: "💙", label: "NOT_ALONE", color: "reactions-notAlone" },
  { type: "WILD", emoji: "🤯", label: "THIS_IS_WILD", color: "reactions-wild" },
  { type: "REAL_TALK", emoji: "🔥", label: "REAL_TALK", color: "reactions-realTalk" },
  { type: "THANK_YOU", emoji: "🙏", label: "THANK_YOU", color: "reactions-thankYou" },
  { type: "THAT_HURTS", emoji: "😢", label: "THAT_HURTS", color: "reactions-hurts" },
  { type: "STAY_STRONG", emoji: "💪", label: "STAY_STRONG", color: "reactions-strong" },
]

interface ReactionPickerProps {
  onSelect: (type: ReactionType) => void
  onClose: () => void
  activeType?: ReactionType | null
}

export function ReactionPicker({ onSelect, onClose, activeType }: ReactionPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      className="absolute bottom-full left-0 mb-4 z-50 bg-card border-2 border-border shadow-[15px_15px_0px_rgba(0,0,0,0.1)] dark:shadow-[15px_15px_0px_rgba(0,0,0,0.5)] p-2 flex items-center gap-1"
      onMouseLeave={onClose}
    >
      {REACTION_OPTIONS.map((option, index) => (
        <motion.button
          key={option.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: index * 0.03 }
          }}
          whileHover={{ 
            scale: 1.3, 
            y: -5,
            zIndex: 10
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(option.type)
          }}
          className={`
            relative p-3 flex flex-col items-center gap-2 group transition-all rounded-sm
            ${activeType === option.type ? `bg-${option.color}/20 border border-${option.color}/40` : "hover:bg-muted/10"}
          `}
        >
          <span className="text-2xl filter drop-shadow-lg">{option.emoji}</span>
          
          <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom">
            <span className="bg-black border border-border px-2 py-1 font-mono text-[8px] text-foreground uppercase tracking-widest whitespace-nowrap shadow-xl">
              {option.label}
            </span>
          </div>

          {activeType === option.type && (
            <motion.div 
              layoutId="active-reaction-indicator"
              className="absolute -bottom-1 w-1 h-1 bg-foreground rounded-full"
            />
          )}
        </motion.button>
      ))}
      
      {/* Protocol Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-size-[100%_2px] z-10 opacity-10" />
    </motion.div>
  )
}
