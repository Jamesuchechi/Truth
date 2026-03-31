'use client'

import React from 'react'

/**
 * Landing component for the TruTH platform.
 * This is the public-facing homepage where users first land.
 * 
 * TODO: Implement vibrant, emotion-driven design with modern animations.
 */
export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-truth-bg text-truth-text flex flex-col items-center justify-center p-6 text-center">
      <header className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-truth-accent to-reactions-relate bg-clip-text text-transparent">
          TruTH
        </h1>
        <p className="text-xl text-truth-muted leading-relaxed">
          The anonymous social network where authenticity trumps validation,
          and every user experiences their own personalized reality. It&apos;s
          time to speak your truth.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button className="px-8 py-3 bg-truth-accent text-white font-semibold rounded-full hover:bg-truth-accent/90 transition-all shadow-lg shadow-truth-accent/20">
            Get Started
          </button>
          <button className="px-8 py-3 bg-truth-surface border border-truth-border text-truth-text font-semibold rounded-full hover:bg-truth-border transition-all">
            See What's Fresh
          </button>
        </div>
      </header>

      {/* Placeholder for Interactive Elements */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {['Personalized Feed', 'Anonymous Inbox', 'Emotional Reactions'].map((feature) => (
          <div key={feature} className="p-8 bg-truth-surface border border-truth-border rounded-2xl hover:border-truth-accent/50 transition-colors">
            <h3 className="text-lg font-semibold mb-2">{feature}</h3>
            <div className="h-2 w-12 bg-truth-accent rounded-full mb-4" />
            <p className="text-sm text-truth-muted">
              Discover content that resonates with your unique emotional fingerprint.
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default Landing
