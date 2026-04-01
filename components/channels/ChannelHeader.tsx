"use client"

import { useTransition } from "react"
import { toggleSubscription } from "@/lib/actions/channel"
import { Hash, Plus, Check } from "lucide-react"

export default function ChannelHeader({ 
  channel, 
  isSubscribed: initialSubscribed 
}: { 
  channel: { id: string; name: string; slug: string; description: string | null; color: string | null };
  isSubscribed: boolean 
}) {
  const [isPending, startTransition] = useTransition()
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed)

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleSubscription(channel.id)
      if (!result.error) {
        setIsSubscribed(!isSubscribed)
      }
    })
  }

  return (
    <div className="bg-truth-nearBlack border-2 border-truth-midGray p-8 relative overflow-hidden group mb-8">
      <div 
        className="absolute top-0 left-0 right-0 h-1.5" 
        style={{ backgroundColor: channel.color || "#FF3366" }}
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 flex items-center justify-center border-4 border-truth-midGray bg-truth-darkGray text-3xl"
              style={{ color: channel.color || "#FF3366" }}
            >
              <Hash className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-bitter text-4xl font-black text-truth-textLight tracking-tighter uppercase leading-none">
                {channel.name}
              </h1>
              <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.4em] mt-2 italic shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                {channel.slug}_signal_frequency
              </p>
            </div>
          </div>
          <p className="max-w-2xl font-bitter text-lg text-truth-textGray italic leading-relaxed border-l-2 border-truth-midGray/30 pl-4 py-1">
            {channel.description || "The frequency is silent... No description broadcasted."}
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`
            px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn
            ${isSubscribed 
              ? "bg-truth-accentRed text-truth-bg border-2 border-truth-accentRed" 
              : "border-2 border-truth-midGray text-truth-textGray hover:border-truth-textLight hover:text-truth-textLight"}
            ${isPending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <span className="relative z-10 flex items-center gap-3">
            {isSubscribed ? (
              <>
                <Check className="w-4 h-4" /> DISCONNECT_SIGNAL
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> ADOPT_FREQUENCY
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform opacity-30" />
        </button>
      </div>

      {/* Decorative Glow */}
      <div 
        className="absolute -bottom-24 -right-24 w-64 h-64 blur-[100px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: channel.color || "#FF3366" }}
      />
    </div>
  )
}

import { useState } from "react"
