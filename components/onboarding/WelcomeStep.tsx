"use client"

import { motion } from "framer-motion"
import { Shield, ArrowRight } from "lucide-react"

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <h1 className="font-bitter text-4xl font-black uppercase tracking-tighter leading-tight">
        Welcome to <span className="text-truth-accentRed">TRUTH_OS</span>
      </h1>
      <p className="font-mono text-sm text-muted leading-relaxed uppercase tracking-wide">
        You have entered a decentralized protocol for radical honesty. 
        In this space, shadow IDs carry as much weight as truth, and every pulse matters.
      </p>
      
      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-4 p-4 border border-border bg-muted/5 group hover:border-truth-accentRed transition-colors">
          <Shield className="w-5 h-5 text-truth-accentRed mt-1" />
          <div>
            <p className="font-mono text-[10px] font-bold text-foreground">ENCRYPTED_ANONYMITY</p>
            <p className="font-mono text-[8px] text-muted">Your identity is protected by the mesh protocol.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 border border-border bg-muted/5 group hover:border-truth-accentBlue transition-colors">
          <Shield className="w-5 h-5 text-truth-accentBlue mt-1" />
          <div>
            <p className="font-mono text-[10px] font-bold text-foreground">SHADOW_IDENTITY</p>
            <p className="font-mono text-[8px] text-muted">Toggle shadow mode for persistent anonymous interactions.</p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-12 w-full py-4 bg-truth-accentRed text-black font-mono text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0"
      >
        Initialize_Protocol <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
