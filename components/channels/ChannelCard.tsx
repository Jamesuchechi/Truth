"use client"

import { useState } from "react"
import { motion} from "framer-motion"
import { toggleSubscription } from "@/lib/actions/channel"
import { Hash, Plus, Check, Users, Signal } from "lucide-react"

interface Channel {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  isSubscribed: boolean
  _count: {
    subscribers: number
    posts: number
  }
}

export default function ChannelCard({ channel }: { channel: Channel }) {
  const [isSubscribed, setIsSubscribed] = useState(channel.isSubscribed)
  const [subCount, setSubCount] = useState(channel._count.subscribers)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleSubscription(channel.id)
    if (!result.error) {
      const newStatus = !isSubscribed
      setIsSubscribed(newStatus)
      setSubCount(prev => newStatus ? prev + 1 : prev - 1)
    }
    setLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-truth-nearBlack border-2 border-truth-midGray p-6 relative group overflow-hidden"
    >
      {/* Accent Color Strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: channel.color || "#FF3366" }}
      />
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
           <div 
             className="w-12 h-12 flex items-center justify-center border-2 border-truth-midGray bg-truth-darkGray group-hover:border-truth-accentRed transition-colors"
             style={{ color: channel.color || "#FF3366" }}
           >
             <Hash className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bitter font-black text-xl text-truth-textLight uppercase tracking-tight group-hover:text-truth-accentRed transition-colors">
               {channel.name}
             </h3>
             <span className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest">
               {channel.slug}_signal.proto
             </span>
           </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`
            px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all relative overflow-hidden group/btn
            ${isSubscribed 
              ? "bg-truth-accentRed text-truth-bg font-bold border border-truth-accentRed" 
              : "border border-truth-midGray text-truth-textGray hover:border-truth-textLight hover:text-truth-textLight"}
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <span className="relative z-10 flex items-center gap-2">
            {isSubscribed ? (
              <>
                <Check className="w-3 h-3" /> SYNCHED
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> CONNECT
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform" />
        </button>
      </div>

      <p className="font-mono text-xs text-truth-textGray mb-8 line-clamp-2 h-10 italic">
        {channel.description || "No description broadcasted for this frequency..."}
      </p>

      <div className="grid grid-cols-2 gap-4 border-t border-truth-midGray/30 pt-6">
         <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-truth-textGray" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-black text-truth-textLight">{subCount}</span>
              <span className="font-mono text-[8px] text-truth-textGray uppercase">Nodes</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-truth-textGray" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-black text-truth-textLight">{channel._count.posts}</span>
              <span className="font-mono text-[8px] text-truth-textGray uppercase">Pulses</span>
            </div>
         </div>
      </div>

      {/* Decorative Matrix Background (Glow) */}
      <div 
        className="absolute -bottom-12 -right-12 w-32 h-32 blur-[60px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: channel.color || "#FF3366" }}
      />
    </motion.div>
  )
}
