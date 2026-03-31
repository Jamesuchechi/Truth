"use client"

import { motion } from "framer-motion"

const STATS = [
  { label: "Post-Encryption", value: "100%" },
  { label: "Identity Anonymity", value: "Absolute" },
  { label: "AI Neutralization", value: "Real-time" },
  { label: "Data Ownership", value: "User-Owned" },
]

export default function Stats() {
  return (
    <section className="py-24 border-y border-truth-border/50 bg-truth-surface/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-truth-accent tracking-widest uppercase font-semibold">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
