"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export default function FinalCTA() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission logic here
    console.warn("Submitted email:", email)
    setEmail("")
  }

  return (
    <section id="waitlist" className="relative py-40 px-8 bg-truth-nearBlack text-center overflow-hidden">
      {/* Background Video Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{ background: 'repeating-linear-gradient(0deg, var(--accent-red), var(--accent-red) 2px, transparent 2px, transparent 4px)' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-bitter text-[clamp(3.5rem,10vw,8rem)] font-black text-truth-textLight leading-[0.9] uppercase mb-12"
        >
          Stop Performing.<br />
          <span className="text-truth-accentRed block">Start Being.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl text-truth-textGray mb-16 leading-relaxed"
        >
          Join thousands who&apos;ve found freedom in anonymity.<br />
          Your truth deserves to be heard.
        </motion.p>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 max-w-2xl mx-auto justify-center mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-[300px] bg-truth-darkGray border-2 border-truth-midGray p-6 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed focus:bg-truth-bg transition-all"
          />
          <button
            type="submit"
            className="px-12 py-6 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:bg-truth-textLight hover:scale-105 transition-all duration-300"
          >
            Get Early Access
          </button>
        </form>

        <p className="font-mono text-xs text-truth-textGray opacity-70">
          🔒 We respect your privacy. No spam. Ever.
        </p>
      </div>

      {/* Pulse-glow Waitlist Counter Widget */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="fixed bottom-8 right-8 z-1000 bg-truth-darkGray border border-truth-accentRed p-6 font-mono text-sm text-truth-textLight animate-[pulse-glow_2s_infinite] cursor-pointer hover:scale-105 transition-all hidden sm:block"
      >
        <span className="text-truth-accentRed font-bold text-lg">2,847</span> people waiting
      </motion.div>
    </section>
  )
}
