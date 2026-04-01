"use client"

import { motion } from "framer-motion"

const confessions = [
  {
    text: "I ghosted my best friend for 6 months because I was jealous of their success. I still haven't apologized.",
    reactions: "🫂 247 · 💙 89",
    user: "LostSoul27"
  },
  {
    text: "I'm a therapist who's been seeing a therapist for 3 years. Sometimes I wonder if I'm qualified to help anyone.",
    reactions: "🌊 412 · 💪 156",
    user: "QuietThunder"
  },
  {
    text: "I love my kids more than anything, but sometimes I miss my old life so much it physically hurts.",
    reactions: "😢 328 · 🫂 501",
    user: "MidnightMom"
  },
  {
    text: "I make $200k/year and my family thinks I'm successful. I'm drowning in debt and too ashamed to tell anyone.",
    reactions: "🤯 893 · 🔥 445",
    user: "SilentStruggle"
  },
  {
    text: "I've been faking my accent for 5 years. Everyone thinks I'm from London. I'm from Ohio.",
    reactions: "🤯 1.2k · 😂 789",
    user: "FakeBrit"
  },
  {
    text: "I read my partner's journal and found out they're planning to propose. Now I have to act surprised.",
    reactions: "😢 234 · 🤯 567",
    user: "GuiltySpy"
  }
]

export default function ConfessionShowcase() {
  return (
    <section className="relative py-32 px-8 bg-truth-bg overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-truth-accentRed/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-bitter text-[clamp(3rem,8vw,6rem)] font-black text-center text-truth-textLight leading-none mb-24 uppercase"
      >
        Real Truths.<br />Real People.
      </motion.h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {confessions.map((confession, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-truth-nearBlack p-10 border border-truth-midGray hover:border-truth-accentRed hover:scale-105 transition-all duration-300"
          >
            <div className="absolute top-4 left-6 font-bitter text-7xl text-truth-accentRed opacity-20 leading-none">&quot;</div>
            
            <p className="relative z-10 text-xl text-truth-textLight italic leading-relaxed mb-8">
                {confession.text}
            </p>

            <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-truth-textGray transition-colors group-hover:text-truth-accentRed">
              <span className="flex items-center gap-2">{confession.reactions}</span>
              <span>—{confession.user}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
