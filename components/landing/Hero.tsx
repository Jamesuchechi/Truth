"use client"

import { useEffect, useState } from "react"
import { Shield, Eye, Lock } from "lucide-react"
import Logo from "@/components/shared/Logo"

const floatingConfessions = [
  "I've never told anyone this, but...",
  "Sometimes I feel like I'm the only one who...",
  "What if everyone knew that I...",
  "My deepest fear is that...",
  "I wish I could say out loud...",
]

const stats = [
  { label: "Truths Shared", count: 10000 },
  { label: "Anonymous Souls", count: 2500 },
  { label: "Connections Made", count: 50000 },
]

export default function Hero() {
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      const increment = Math.ceil(stat.count / 100)
      return setInterval(() => {
        setCounts(prev => {
          const next = [...prev]
          if (next[index] < stat.count) {
            next[index] = Math.min(stat.count, next[index] + increment)
          }
          return next
        })
      }, 20)
    })
    return () => intervals.forEach(clearInterval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden bg-truth-bg">
      {/* Parallax/Gradient Orbs */}
      <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-truth-accentRed/15 rounded-full blur-[80px] animate-[float-orb_15s_infinite_ease-in-out]" />
      <div className="absolute bottom-[20%] -right-[5%] w-[400px] h-[400px] bg-truth-accentPurple/15 rounded-full blur-[80px] animate-[float-orb_15s_infinite_ease-in-out_5s]" />
      <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-truth-accentBlue/15 rounded-full blur-[80px] animate-[float-orb_15s_infinite_ease-in-out_10s]" />

      {/* Video Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 animate-[scan_8s_linear_infinite] z-20"
           style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px)' }} />

      {/* Floating Background Confessions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {floatingConfessions.map((text, i) => (
          <div
            key={i}
            className="absolute text-sm text-truth-textGray opacity-15 italic font-mono animate-[float_20s_infinite_ease-in-out]"
            style={{
              top: `${[10, 30, 80, 60, 70][i]}%`,
              left: `${[5, 70, 15, 80, 75][i]}%`,
              animationDelay: `${i * 3}s`,
              maxWidth: '300px'
            }}
          >
            &quot;{text}&quot;
          </div>
        ))}
      </div>

      <div className="relative z-30 text-center max-w-6xl mx-auto">
        {/* Logo/Title */}
        <div className="group relative inline-block mb-12 animate-[fadeInScale_1.5s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex flex-col items-center gap-6">
            <Logo size={120} className="hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_30px_rgba(255,51,102,0.3)]" />
            <h1 className="font-bitter text-[clamp(3.5rem,12vw,10rem)] font-black leading-none tracking-[-0.05em] uppercase group-hover:animate-[glitch_0.5s_infinite]">
              TRUTH
            </h1>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 bg-truth-accentRed animate-[expandLine_1.5s_cubic-bezier(0.16,1,0.3,1)_0.5s_both]" />
        </div>

        {/* Tagline */}
        <p className="text-[clamp(1.2rem,3.5vw,2.2rem)] font-light italic text-truth-textGray mb-12 leading-[1.4] animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.3s_both] max-w-4xl mx-auto">
          The <span className="text-truth-accentRed font-bold not-italic">Decentralized Signal Protocol</span> for Radical Honesty.<br />
          Where masks fall and truths rise.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-6 justify-center items-center mb-24 animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.6s_both]">
          <a
            href="#waitlist"
            className="relative px-12 py-6 bg-truth-accentRed text-truth-bg font-mono font-bold text-lg uppercase tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_10px_40px_rgba(255,51,102,0.4)] group z-50 shadow-lg"
          >
            <span className="relative z-10">Join the Movement</span>
            <div className="absolute top-0 -left-full w-full h-full bg-white/20 transition-all duration-300 group-hover:left-0" />
          </a>
          <a
            href="#features"
            className="px-12 py-6 border-2 border-truth-midGray text-truth-textLight font-mono text-lg uppercase tracking-widest hover:border-truth-accentPurple hover:text-truth-accentPurple hover:translate-y-[-2px] transition-all"
          >
            Discover More
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-16 justify-center animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.9s_both]">
          {stats.map((stat, i) => (
            <div key={i} className="group text-center">
              <span className="block font-bitter text-5xl font-black text-truth-accentRed mb-2 group-hover:text-truth-accentPurple group-hover:scale-110 transition-all duration-300">
                {counts[i].toLocaleString()}+
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-truth-textGray">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="mt-16 flex flex-wrap gap-8 justify-center opacity-50 animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_1.1s_both]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-truth-midGray px-4 py-2">
            <Shield size={14} /> End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-truth-midGray px-4 py-2">
            <Eye size={14} /> GDPR Compliant
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-truth-midGray px-4 py-2">
            <Lock size={14} /> Zero Data Selling
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce cursor-default">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-truth-textGray">Scroll</span>
        <div className="w-5 h-[30px] border-2 border-truth-textGray rounded-full relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-truth-textGray rounded-full animate-[scroll-down_1.5s_infinite]" />
        </div>
      </div>
    </section>
  )
}
