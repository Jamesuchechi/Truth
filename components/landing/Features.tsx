"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const features = [
  {
    icon: "💌",
    title: "Anonymous Inbox",
    description: "Receive raw, unfiltered messages from anyone. No judgement. No filters. Just truth."
  },
  {
    icon: "🎭",
    title: "Shadow Identity",
    description: "Build reputation while staying anonymous. Your persona, your rules, your story."
  },
  {
    icon: "🌍",
    title: "Personalized Reality",
    description: "No two feeds are the same. Your truth is yours alone. AI-curated for your soul."
  },
  {
    icon: "❤️",
    title: "Emotional Reactions",
    description: "React with empathy, not vanity. 'I Relate', 'You're Not Alone', 'Stay Strong' — real connection."
  },
  {
    icon: "⚡",
    title: "Limited Visibility",
    description: "Some truths are for 50 eyes only. Scarcity creates intimacy. Miss it and it's gone forever."
  },
  {
    icon: "🧩",
    title: "Truth Zones",
    description: "Heartbreak. Mind Maze. Raw Secrets. Find your tribe in curated channels of raw honesty."
  }
];

interface Feature {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-truth-darkGray p-12 border-l-8 border-truth-midGray hover:border-truth-accentRed hover:translate-x-4 transition-all duration-500 cursor-default overflow-hidden"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent transition-all duration-700 group-hover:left-full" />
      
      <span className="block text-5xl mb-6 transform group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500">
        {feature.icon}
      </span>
      <h3 className="font-bitter text-3xl font-black text-truth-textLight mb-4">
        {feature.title}
      </h3>
      <p className="text-lg text-truth-textGray leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-8 bg-truth-nearBlack">
      {/* Decorative Label */}
      <div className="absolute top-12 left-12 font-mono text-[10px] uppercase tracking-[0.4em] text-truth-textGray opacity-30 select-none">
        FEATURES
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}
