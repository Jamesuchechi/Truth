"use client"

import type { Prisma } from "@prisma/client"
import { formatRelativeTime } from "@/lib/utils"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Ghost, 
  Zap,
  ArrowUpRight
} from "lucide-react"
import { motion } from "framer-motion"

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { 
    author: true, 
    channel: true 
  }
}>

export function PostCard({ post }: { post: PostWithAuthor }) {
  const isShadow = post.useShadowId

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-truth-nearBlack border-2 border-truth-midGray p-8 mb-6 hover:border-truth-accentRed transition-all duration-500 shadow-[10px_10px_0px_rgba(0,0,0,0.3)] hover:shadow-[12px_12px_0px_rgba(255,51,102,0.15)]"
    >
      {/* Dynamic Glow Effect */}
      <div className="absolute -inset-px bg-linear-to-r from-truth-accentRed/0 via-truth-accentRed/5 to-truth-accentRed/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-0.5 border-2 ${isShadow ? "border-truth-accentRed" : "border-truth-midGray"}`}>
             <div className="w-10 h-10 bg-truth-darkGray flex items-center justify-center">
               {isShadow ? (
                 <Ghost className="w-5 h-5 text-truth-accentRed" />
               ) : (
                 <div className="w-full h-full bg-truth-midGray" />
               )}
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bitter font-black text-sm uppercase tracking-tighter ${isShadow ? "text-truth-accentRed" : "text-truth-textLight"}`}>
                {isShadow ? "SHADOW_IDENTITY" : post.author.username}
              </h3>
              {post.channel && (
                <>
                  <span className="text-truth-textGray text-[10px]">IN</span>
                  <span className="font-mono text-[10px] text-truth-accentBlue uppercase tracking-widest px-2 py-0.5 bg-truth-accentBlue/10 border border-truth-accentBlue/20">
                    {post.channel.name}
                  </span>
                </>
              )}
            </div>
            <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest mt-1">
              {isShadow ? `MASK_ID: ${post.author.shadowName}` : "AUTH_VERIFIED"} {" // "} {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        <button className="text-truth-textGray hover:text-truth-textLight transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-8">
        <p className="font-bitter text-xl text-truth-textLight leading-tight whitespace-pre-wrap selection:bg-truth-accentRed selection:text-truth-bg">
          {post.content}
        </p>
      </div>

      {/* Visibility Badge */}
      {post.visibilityType === 'LIMITED' && (
        <div className="mb-8 p-3 bg-truth-accentRed/5 border-l-4 border-truth-accentRed flex items-center gap-3">
          <Zap className="w-4 h-4 text-truth-accentRed animate-pulse" />
          <span className="font-mono text-[10px] text-truth-accentRed uppercase tracking-widest">
            SYNCHRONIZED_LIMITED: {post.viewsLimit} OBSERVERS ONLY
          </span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-truth-midGray relative z-10">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-truth-textGray hover:text-truth-accentRed transition-all group/btn">
            <div className="p-2 border border-transparent group-hover/btn:border-truth-accentRed transition-all">
              <Heart className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold">{post.reactionCount}</span>
          </button>
          
          <button className="flex items-center gap-2 text-truth-textGray hover:text-truth-accentBlue transition-all group/btn">
            <div className="p-2 border border-transparent group-hover/btn:border-truth-accentBlue transition-all">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold">{post.commentCount}</span>
          </button>

          <button className="flex items-center gap-2 text-truth-textGray hover:text-truth-accentPurple transition-all group/btn">
            <div className="p-2 border border-transparent group-hover/btn:border-truth-accentPurple transition-all">
              <Share2 className="w-4 h-4" />
            </div>
          </button>
        </div>

        <button className="flex items-center gap-1.5 font-mono text-[10px] text-truth-textGray hover:text-truth-textLight transition-colors group/view">
          VIEW_DECRYPTION
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-truth-midGray rotate-45 translate-x-1/2 -translate-y-1/2" />
      </div>
    </motion.div>
  )
}