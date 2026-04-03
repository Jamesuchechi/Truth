"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Flame, Ghost, ArrowRight } from "lucide-react"

const HIGHLIGHTS = [
  {
    title: "SHADOW_PROTOCOL",
    description: "Switch to your shadow identity for persistent, verified anonymity.",
    icon: Ghost,
    color: "text-truth-accentBlue"
  },
  {
    title: "REACTION_PULSE",
    description: "Pulse your emotions through the grid using context-aware reactions.",
    icon: Flame,
    color: "text-truth-accentRed"
  },
  {
    title: "ENCRYPTED_SIGNALS",
    description: "All messages are encrypted and decentralized across the mesh.",
    icon: Shield,
    color: "text-truth-accentGreen"
  },
  {
    title: "HIGH_FREQUENCY",
    description: "Real-time updates on trending truths and hidden whispers.",
    icon: Zap,
    color: "text-truth-accentYellow"
  }
]

export function TutorialStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="space-y-4">
        <h1 className="font-bitter text-3xl font-black uppercase tracking-tighter text-foreground">
          Protocol_Capabilities
        </h1>
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest leading-relaxed">
          The system is ready. Here are the core modules of TruthOS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HIGHLIGHTS.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-4 border border-border bg-muted/5 group hover:border-foreground/20 transition-all hover:-translate-y-1"
          >
            <div className={`p-2 rounded-sm bg-background border border-border group-hover:scale-110 transition-transform ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold text-foreground group-hover:text-truth-accentRed transition-colors">
                {item.title}
              </p>
              <p className="font-mono text-[8px] text-muted mt-1 leading-normal">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full py-4 bg-foreground text-background font-mono text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0"
      >
        Configure_Interface <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
