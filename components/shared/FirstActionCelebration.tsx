"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Star, Zap } from "lucide-react"

const PARTICLE_COUNT = 20
const PARTICLE_POSITIONS = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 600,
  y: (Math.random() - 0.5) * 600,
}))

export function FirstActionCelebration({ 
  type 
}: { 
  type: "FIRST_POST" | "FIRST_REACTION" | "FIRST_FOLLOWER" 
}) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const messages = {
    FIRST_POST: "PROTOCOL_EMISSION_SUCCESSFUL",
    FIRST_REACTION: "EMOTIONAL_SYNC_ESTABLISHED",
    FIRST_FOLLOWER: "NETWORK_NODE_CONNECTED"
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-110 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-2 border-dashed border-truth-accentRed rounded-full opacity-30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-6 bg-truth-accentRed rounded-sm shadow-[0_0_50px_rgba(255,51,102,0.4)]">
                  {type === "FIRST_POST" && <Zap className="w-10 h-10 text-black" />}
                  {type === "FIRST_REACTION" && <Star className="w-10 h-10 text-black" />}
                  {type === "FIRST_FOLLOWER" && <Sparkles className="w-10 h-10 text-black" />}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="font-mono text-xs font-black uppercase tracking-[0.4em] text-truth-accentRed">
                {messages[type]}
              </p>
              <p className="font-mono text-[8px] text-muted uppercase mt-2">Achievement_Unlocked</p>
            </div>
          </motion.div>
          
          {/* Particles */}
          {PARTICLE_POSITIONS.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: p.x, 
                y: p.y,
                opacity: 0,
                rotate: 360
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute w-1 h-1 bg-truth-accentRed"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
