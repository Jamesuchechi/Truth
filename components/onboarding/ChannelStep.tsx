"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Plus, Hash, ArrowRight } from "lucide-react"
import { getChannels, toggleSubscription } from "@/lib/actions/channel"
import { Skeleton } from "@/components/ui/Skeleton"

interface Channel {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  isSubscribed: boolean
}

export function ChannelStep({ onNext }: { onNext: () => void }) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannels = async () => {
      const data = await getChannels()
      setChannels(data as Channel[])
      setLoading(false)
    }
    fetchChannels()
  }, [])

  const handleToggle = async (id: string) => {
    setChannels(prev => prev.map(c => 
      c.id === id ? { ...c, isSubscribed: !c.isSubscribed } : c
    ))
    await toggleSubscription(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="space-y-2">
        <h1 className="font-bitter text-3xl font-black uppercase tracking-tighter text-foreground">
          Tune Frequency
        </h1>
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest leading-relaxed">
          Select initial signals to synchronize with your feed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))
        ) : (
          channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => handleToggle(channel.id)}
              className={`flex items-center justify-between p-4 border-2 transition-all text-left group ${
                channel.isSubscribed 
                ? "bg-truth-accentRed/5 border-truth-accentRed" 
                : "bg-muted/5 border-border hover:border-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-sm ${channel.isSubscribed ? "bg-truth-accentRed text-black" : "bg-muted/10 text-muted"}`}>
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className={`font-mono text-[10px] font-bold uppercase transition-colors ${channel.isSubscribed ? "text-foreground" : "text-muted"}`}>
                    {channel.name}
                  </p>
                  <p className="font-mono text-[7px] text-muted/60 uppercase truncate w-32">
                    {channel.description || "NO_DATA_STREAM"}
                  </p>
                </div>
              </div>
              {channel.isSubscribed ? (
                <Check className="w-4 h-4 text-truth-accentRed" />
              ) : (
                <Plus className="w-4 h-4 text-muted group-hover:text-foreground" />
              )}
            </button>
          ))
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full py-4 bg-foreground text-background font-mono text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-0 active:translate-y-0"
      >
        Sync_Frequencies <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
