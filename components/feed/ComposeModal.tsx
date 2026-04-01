"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, SignalHigh } from "lucide-react"
import PostComposer from "./PostComposer"

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  user: { id: string }
}

export default function ComposeModal({ isOpen, onClose, user }: ComposeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-truth-bg/90 backdrop-blur-md cursor-pointer"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl z-10"
          >
            {/* Modal Header Decoration */}
            <div className="absolute -top-10 left-0 w-full flex items-end justify-between px-4 pb-2 border-b-2 border-truth-accentRed/30">
               <div className="flex items-center gap-2">
                 <SignalHigh className="w-4 h-4 text-truth-accentRed" />
                 <span className="font-mono text-[9px] text-truth-accentRed uppercase tracking-[0.5em] font-black">
                   TERMINAL_UPLINK_ESTABLISHED
                 </span>
               </div>
               <button 
                 onClick={onClose}
                 className="p-1 hover:text-truth-accentRed transition-colors group"
               >
                 <X className="w-5 h-5 text-truth-textGray group-hover:rotate-90 transition-transform" />
               </button>
            </div>

            {/* PostComposer Wrapper */}
            <div className="bg-truth-nearBlack border-x-4 border-b-4 border-truth-midGray shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
               <div className="p-8">
                  <PostComposer user={user} onComplete={onClose} />
               </div>
               
               {/* Aesthetic Terminal Footer */}
               <div className="px-6 py-3 bg-black/40 border-t border-truth-midGray/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-truth-accentGreen animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-truth-accentGreen opacity-40" />
                     </div>
                     <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-[0.2em]">PROTOCOL_ENCRYPTION_V4.2_ACTIVE</span>
                  </div>
                  <Zap className="w-3 h-3 text-truth-textGray/40" />
               </div>
            </div>

            {/* Matrix/Glitch Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_2px] z-20 opacity-20" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
