"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Eye, Ghost, Lock, Cpu } from "lucide-react"

const FEATURES = [
  {
    title: "Curated Realities",
    description: "Every feed is unique, encrypted, and built specifically for your emotional sanctuary.",
    icon: Zap,
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-truth-accent/20 to-indigo-500/10",
  },
  {
    title: "Shadow Presence",
    description: "Your voice is absolute. Your identity is a whisper. Complete encryption for every shadow name.",
    icon: Ghost,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "AI Sanctuary",
    description: "Real-time toxicity neutralization. A environment where authenticity is protected, not attacked.",
    icon: Cpu,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Invisible Trust",
    description: "Zero-knowledge proof architecture. We know nothing, you know everything.",
    icon: Lock,
    className: "md:col-span-1 md:row-span-2 bg-indigo-500/5",
  },
  {
    title: "Ephemeral Echoes",
    description: "Posts that disappear like whispers. Your data belongs to the moment, not the history books.",
    icon: Eye,
    className: "md:col-span-2 md:row-span-1",
  },
]

export default function BentoFeatures() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          BUILT FOR THE <span className="text-truth-accent">SHADOWS</span>
        </h2>
        <p className="text-truth-muted text-lg max-w-2xl mx-auto">
          The architecture of TruTH isn&apos;t just code; it&apos;s a philosophy of protection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`group relative p-8 rounded-3xl border border-truth-border bg-truth-surface/30 backdrop-blur-sm overflow-hidden flex flex-col justify-end ${feature.className}`}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-truth-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center justify-center p-3 rounded-2xl bg-truth-accent/10 text-truth-accent group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-truth-muted leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Corner Decorative Element */}
            <div className="absolute top-4 right-4 text-truth-border opacity-20 group-hover:opacity-100 transition-opacity">
              <feature.icon size={128} className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 blur-2xl" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
