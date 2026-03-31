"use client"

import { motion } from "framer-motion"
import Hero from "@/components/landing/Hero"
import BentoFeatures from "@/components/landing/BentoFeatures"
import Stats from "@/components/landing/Stats"

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-truth-accent/30 selection:text-white">
      {/* Immersive Scroll Experience Container */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* The Hook: Premium Hero */}
        <Hero />

        {/* The Proof: Impact Metrics */}
        <Stats />

        {/* The Identity: Core Features */}
        <BentoFeatures />

        {/* The Invitation: Final CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          {/* Internal Glow for CTA */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-truth-border to-transparent opacity-50" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              READY TO <span className="text-truth-accent">BEGIN?</span>
            </h2>
            <p className="text-xl text-truth-muted mb-12 max-w-xl mx-auto">
              Step into a sanctuary where authenticity is the only currency. 
              Your truth starts here.
            </p>
            
            <button className="px-12 py-5 bg-truth-accent text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
              Enter the Sanctuary
            </button>
          </div>
        </section>

        {/* Minimalist Landing Footer */}
        <footer className="py-12 border-t border-truth-border/30 text-center">
          <p className="text-sm text-truth-muted/50 tracking-widest uppercase">
            TruTH &copy; 2026 &bull; Presence Secured
          </p>
        </footer>
      </motion.main>
    </div>
  )
}
