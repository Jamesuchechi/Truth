// components/shared/Landing.tsx
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import ConfessionShowcase from "@/components/landing/ConfessionShowcase"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/shared/Footer"
import Navbar from "@/components/shared/Navbar"
import ClientEffects from "@/components/shared/ClientEffects"

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-truth-bg selection:bg-truth-accentRed/30 selection:text-white">
      <ClientEffects />
      <Navbar />

      <main className="relative z-10 pt-20">
        <Hero />
        <Features />
        <ConfessionShowcase />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}
