"use client"

import { useState, useRef } from "react"
import { Send, Eye, Clock, Ghost } from "lucide-react"
import { motion } from "framer-motion"

export default function PostComposer({ user }: { user: { id: string } }) {
  const [content, setContent] = useState("")
  const [useShadow, setUseShadow] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    // Logic for posting truth will go here later
    setContent("")
  }

  return (
    <div className={`
      relative mb-12 transition-all duration-500
      ${isFocused ? "scale-[1.01]" : "scale-100"}
    `}>
      {/* Terminal Header */}
      <div className="bg-truth-nearBlack border-2 border-truth-midGray border-b-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 bg-truth-accentRed opacity-50" />
             <div className="w-2.5 h-2.5 bg-truth-accentBlue opacity-50" />
             <div className="w-2.5 h-2.5 bg-truth-accentPurple opacity-50" />
           </div>
           <span className="font-mono text-[9px] uppercase tracking-widest text-truth-textGray ml-2">
             composer_v1.0 // session_{user?.id?.substring(0, 8)}
           </span>
        </div>
        <div className="flex items-center gap-4">
           {useShadow && (
             <motion.span 
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               className="font-mono text-[8px] uppercase text-truth-accentRed flex items-center gap-1"
             >
               <Ghost className="w-3 h-3" /> SHADOW_PROTOCOL_ACTIVE
             </motion.span>
           )}
        </div>
      </div>

      {/* Main Composer Area */}
      <form 
        onSubmit={handleSubmit}
        className={`
          bg-truth-nearBlack border-2 border-truth-midGray p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]
          ${isFocused ? "border-truth-accentRed shadow-[8px_8px_0px_rgba(255,51,102,0.15)]" : ""}
        `}
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="SYSTEM_INITIALIZED: Speak your truth..."
            className="w-full bg-transparent border-none focus:ring-0 text-truth-textLight font-bitter text-lg resize-none min-h-[120px] placeholder:text-truth-textGray/30 placeholder:italic"
          />
          
          {/* Decorative Cursor */}
          {isFocused && (content.length === 0) && (
            <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 0.8, repeat: Infinity }}
               className="absolute left-0 top-1.5 w-2 h-6 bg-truth-accentRed"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-truth-midGray pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseShadow(!useShadow)}
              className={`
                px-4 py-2 flex items-center gap-2 border transition-all duration-300 group
                ${useShadow 
                  ? "bg-truth-accentRed/20 border-truth-accentRed text-truth-accentRed" 
                  : "bg-truth-darkGray border-truth-midGray text-truth-textGray hover:border-truth-textGray"}
              `}
            >
              <Ghost className={`w-4 h-4 ${useShadow ? "animate-pulse" : ""}`} />
              <span className="font-mono text-[10px] uppercase tracking-widest leading-none">
                {useShadow ? "Identity: Masked" : "Identity: Public"}
              </span>
            </button>
            <div className="h-4 w-px bg-truth-midGray mx-2" />
            <div className="flex items-center gap-3">
               <button type="button" className="text-truth-textGray hover:text-truth-accentBlue transition-colors">
                 <Eye className="w-4 h-4" />
               </button>
               <button type="button" className="text-truth-textGray hover:text-truth-accentPurple transition-colors">
                 <Clock className="w-4 h-4" />
               </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className={`
              px-8 py-3 bg-truth-accentRed text-truth-bg font-mono font-black text-[12px] uppercase tracking-widest flex items-center gap-3 group
              ${!content.trim() ? "opacity-30 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98] transition-all"}
            `}
          >
            EXECUTE_TRUTH
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </form>
      
      {/* Glitch Overlay (Subtle) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
    </div>
  )
}
