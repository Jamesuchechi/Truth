"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart2, Eye, MessageCircle, Heart, X, Zap, Clock, 
  PieChart as PieIcon, Activity 
} from "lucide-react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from "recharts"

import type { PostWithRelations } from "@/lib/types/post"
import { getReactionAnalytics } from "@/lib/actions/reaction"

const REACTION_COLORS: Record<string, string> = {
  RELATE: "#9b5de5",
  DEEP: "#00BBF9",
  NOT_ALONE: "#00F5D4",
  WILD: "#FEE440",
  REAL_TALK: "#FF3366",
  THANK_YOU: "#00F5D4",
  THAT_HURTS: "#FF3366",
  STAY_STRONG: "#9b5de5",
}

const REACTION_LABELS: Record<string, string> = {
  RELATE: "🫂_RELATE",
  DEEP: "🌊_DEEP",
  NOT_ALONE: "💙_NOT_ALONE",
  WILD: "🤯_WILD",
  REAL_TALK: "🔥_REAL_TALK",
  THANK_YOU: "🙏_THANK_YOU",
  THAT_HURTS: "😢_THAT_HURTS",
  STAY_STRONG: "💪_STAY_STRONG",
}

interface PostAnalyticsProps {
  post: PostWithRelations & {
    reactionCount: number
    commentCount: number
  }
  onClose: () => void
}

export default function PostAnalytics({ post, onClose }: PostAnalyticsProps) {
  const engagementRate = post.currentViews > 0 
    ? ((post.reactionCount + post.commentCount) / post.currentViews * 100).toFixed(1)
    : "0"

  const stats = [
    { label: "TOTAL_IMPRESSIONS", value: post.currentViews, icon: Eye, color: "text-truth-accentBlue" },
    { label: "ENGAGEMENT_RATE", value: `${engagementRate}%`, icon: Zap, color: "text-truth-accentRed" },
    { label: "REACTIONS_SYNCED", value: post.reactionCount, icon: Heart, color: "text-truth-accentRed" },
    { label: "TRANS_COMMENTS", value: post.commentCount, icon: MessageCircle, color: "text-truth-accentBlue" },
  ]

  // Advanced Analysis
  const returnObservers = post.feedTracking?.filter(t => (t.viewCount || 0) > 1).length || 0
  const skimCount = post.feedTracking?.filter(t => t.scrolledPast).length || 0
  const skimRate = post.currentViews > 0 
    ? (skimCount / post.currentViews * 100).toFixed(1)
    : "0"

  // Best Performing Time (Hourly distribution)
  const hourlyDistribution = new Array(24).fill(0)
  post.reactions?.forEach(r => {
    const hour = new Date(r.createdAt).getHours()
    hourlyDistribution[hour]++
  })
  const bestHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution))
  const bestTimeStr = bestHour >= 0 && Math.max(...hourlyDistribution) > 0
    ? `${bestHour.toString().padStart(2, '0')}:00 - ${(bestHour + 1).toString().padStart(2, '0')}:00`
    : "INSUFFICIENT_DATA"

  const advancedStats = [
    { label: "RETURN_OBSERVERS", value: returnObservers, icon: Clock, color: "text-truth-accentBlue" },
    { label: "SKIM_RATE_DETECT", value: `${skimRate}%`, icon: Zap, color: "text-truth-accentRed" },
    { label: "PEAK_SIGNAL_TIME", value: bestTimeStr, icon: Clock, color: "text-truth-accentBlue" },
  ]

  const [now, setNow] = useState<number | null>(null)
  const [reactionSummary, setReactionSummary] = useState<Record<string, number>>({})
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now())
    }, 0)
    
    const fetchReactions = async () => {
      const res = await getReactionAnalytics(post.id)
      if (res.summary) {
        setReactionSummary(typeof res.summary === 'string' ? JSON.parse(res.summary) : res.summary)
      }
      setIsLoadingAnalytics(false)
    }

    fetchReactions()
    return () => clearTimeout(timer)
  }, [post.id])

  const chartData = Object.entries(reactionSummary).map(([name, value]) => ({
    name,
    value,
    label: REACTION_LABELS[name] || name,
    color: REACTION_COLORS[name] || "#666"
  })).sort((a, b) => b.value - a.value)

  // Calculate stats based on stable 'now' value
  const hoursSinceCreation = now 
    ? Math.max(0.5, (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60))
    : 0.5
  const velocity = (post.reactionCount + post.commentCount) / hoursSinceCreation
  const isSpiking = velocity > 5 


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-truth-nearBlack border-2 border-truth-accentBlue p-8 relative shadow-[20px_20px_0px_rgba(0,0,0,0.5)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-truth-textGray hover:text-truth-accentRed transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <BarChart2 className="w-6 h-6 text-truth-accentBlue" />
          <h2 className="font-bitter font-black text-xl uppercase tracking-tighter text-truth-textLight">
            PULSE_ANALYTICS_V01
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-4 bg-truth-darkGray/50 border border-truth-midGray/30 group hover:border-truth-accentBlue transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="font-mono text-[9px] uppercase tracking-widest text-truth-textGray group-hover:text-truth-textLight">
                  {stat.label}
                </span>
              </div>
              <div className="font-bitter font-black text-2xl text-truth-textLight tracking-tighter">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Emotional Pulse Breakdown */}
        <div className="p-6 bg-black/40 border-2 border-truth-midGray/20 mb-8 overflow-hidden relative group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <PieIcon className="w-4 h-4 text-truth-accentRed" />
              <h3 className="font-mono text-[10px] font-black uppercase text-truth-textLight tracking-[0.2em]">
                EMOTIONAL_PULSE_ANALYTICS
              </h3>
            </div>
            {isLoadingAnalytics && <Activity className="w-4 h-4 text-truth-accentBlue animate-pulse" />}
          </div>

          <div className="h-[200px] w-full flex items-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #2a2a2a', borderRadius: 0 }}
                    itemStyle={{ fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconType="rect"
                    formatter={(value: string) => (
                      <span className="font-mono text-[8px] text-truth-textGray uppercase ml-2">
                        {REACTION_LABELS[value] || value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                 <Activity className="w-8 h-8 text-truth-textGray" />
                 <span className="font-mono text-[8px] uppercase tracking-widest text-truth-textGray">
                   AWAITING_EMOTIONAL_SYNC
                 </span>
              </div>
            )}
          </div>
          
          {/* Subtle Protocol Pattern */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-truth-accentRed/5 rounded-full blur-3xl group-hover:bg-truth-accentRed/10 transition-colors" />
        </div>

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {advancedStats.map((stat, idx) => (
             <div key={idx} className="p-3 bg-black/40 border border-truth-midGray/20">
               <div className="flex items-center gap-2 mb-1">
                 <stat.icon className={`w-2.5 h-2.5 ${stat.color}`} />
                 <span className="font-mono text-[7px] uppercase tracking-widest text-truth-textGray">
                   {stat.label}
                 </span>
               </div>
               <div className="font-mono font-bold text-xs text-truth-textLight">
                 {stat.value}
               </div>
             </div>
          ))}
        </div>

        {/* Spike & Scarcity Alerts */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {isSpiking && (
            <div className="p-3 bg-truth-accentRed/10 border border-truth-accentRed/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Zap className="w-4 h-4 text-truth-accentRed animate-pulse" />
                 <span className="font-mono text-[10px] text-truth-accentRed uppercase tracking-widest font-black">
                   ENGAGEMENT_SPIKE_DETECTED
                 </span>
               </div>
               <span className="font-mono text-[9px] text-truth-accentRed opacity-70">
                 VELOCITY: {velocity.toFixed(2)}_PPS
               </span>
            </div>
          )}

          {post.visibilityType === 'LIMITED' && (
            <div className="p-3 bg-truth-accentBlue/10 border border-truth-accentBlue/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Eye className="w-4 h-4 text-truth-accentBlue" />
                 <span className="font-mono text-[10px] text-truth-accentBlue uppercase tracking-widest font-black">
                   SCARCITY_PROTOCOL_ACTIVE
                 </span>
               </div>
               <span className="font-mono text-[9px] text-truth-accentBlue opacity-70">
                 SUPPLY: {((post.viewsLimit || 1) - post.currentViews)} / {post.viewsLimit}
               </span>
            </div>
          )}
        </div>

        {/* Content Pulse Snapshot */}
        <div className="p-6 bg-black border-l-4 border-truth-accentBlue mb-8">
           <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-truth-textGray" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-truth-textGray">
                ORIGINAL_SYNC: {new Date(post.createdAt).toLocaleString()}
              </span>
           </div>
           <p className="text-truth-textGray text-xs line-clamp-3 italic">
             &ldquo;{post.content}&rdquo;
           </p>
        </div>

        <div className="flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-truth-accentBlue text-truth-nearBlack font-mono text-[10px] uppercase font-black hover:bg-truth-textLight transition-colors"
           >
             TERMINATE_VIEW
           </button>
        </div>

        {/* Protocol Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_2px] z-10 opacity-30" />
      </motion.div>
    </motion.div>
  )
}
