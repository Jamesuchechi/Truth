"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"
import { Shield, Sparkles } from "lucide-react"

export default function Hero() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 700 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const background = useTransform(
    [x, y],
    ([latestX, latestY]) => 
      `radial-gradient(600px circle at ${latestX}px ${latestY}px, rgba(59, 130, 246, 0.08), transparent 40%)`
  )

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Dynamic Background Glow */}
      <motion.div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background }}
      />

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 animate-pulse opacity-20">
        <Shield size={120} className="text-truth-accent blur-3xl" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 animate-pulse opacity-20 delay-1000">
        <Sparkles size={120} className="text-indigo-500 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
            ENTER YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-truth-accent to-indigo-400">
              TRUTH
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-truth-muted mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          The anonymous social sanctuary where authenticity trumps validation. 
          Your curated reality, secured by truth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              Begin Presence
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-truth-accent to-indigo-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
          
          <button className="px-8 py-4 bg-truth-surface/50 border border-truth-border text-white font-semibold rounded-full hover:bg-truth-surface transition-colors">
            Explore Architecture
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-truth-muted">Explore sanctuary</span>
        <div className="w-px h-12 bg-gradient-to-b from-truth-accent to-transparent" />
      </motion.div>
    </section>
  )
}
