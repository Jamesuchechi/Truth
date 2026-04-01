"use client"

import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Ghost, 
  Zap,
  ArrowUpRight,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Archive,
  AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import type { PostWithRelations } from "@/lib/types/post"
import ImageCarousel from "./ImageCarousel"
import PostAnalytics from "./PostAnalytics"
import { usePostTrack } from "@/hooks/usePostTrack"
import { updatePost, deletePost, archivePost } from "@/lib/actions/post"

export function PostCard({ post }: { post: PostWithRelations }) {
  const { data: session } = useSession()
  const isShadow = post.useShadowId
  const isStory = post.visibilityType === "STORY"
  const hasMedia = post.media && post.media.length > 0
  const isAuthor = session?.user?.id === post.authorId

  // Management State
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isPending, setIsPending] = useState(false)

  // Tracking
  const { containerRef } = usePostTrack({ postId: post.id })

  const [canEdit, setCanEdit] = useState(false)
  
  useEffect(() => {
    const createdTime = new Date(post.createdAt).getTime()
    const fiveMinutes = 5 * 60 * 1000
    const expiryTime = createdTime + fiveMinutes
    
    const checkEditWindow = () => {
      const now = Date.now()
      if (now < expiryTime) {
        setCanEdit(true)
        // Schedule a state update when the window expires
        const remainingTime = expiryTime - now
        const timer = setTimeout(() => setCanEdit(false), remainingTime)
        return () => clearTimeout(timer)
      } else {
        setCanEdit(false)
      }
    }
    
    return checkEditWindow()
  }, [post.createdAt])

  const handleUpdate = async () => {
    setIsPending(true)
    const res = await updatePost(post.id, editContent)
    if (res.success) setIsEditing(false)
    setIsPending(false)
    setIsMenuOpen(false)
  }

  const handleDelete = async () => {
    if (confirm("TERMINATE_SIGNAL: Are you sure? This action is permanent in the current reality.")) {
      setIsPending(true)
      await deletePost(post.id)
      setIsPending(false)
    }
  }

  const handleArchive = async () => {
    setIsPending(true)
    await archivePost(post.id)
    setIsPending(false)
    setIsMenuOpen(false)
  }

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`
        group relative bg-truth-nearBlack border-2 p-8 mb-6 transition-all duration-500 shadow-[10px_10px_0px_rgba(0,0,0,0.3)]
        ${isStory ? "border-truth-accentPurple shadow-[10px_10px_0px_rgba(168,85,247,0.1)]" : "border-truth-midGray hover:border-truth-accentRed hover:shadow-[12px_12px_0px_rgba(255,51,102,0.15)]"}
      `}
    >
      {/* Thread Connection Line (Visual Hint) */}
      {post.parentId && (
        <div className="absolute -top-6 left-12 w-0.5 h-6 bg-truth-midGray/30" />
      )}

      {/* Dynamic Glow Effect */}
      <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-linear-to-r from-transparent ${isStory ? "via-truth-accentPurple/5" : "via-truth-accentRed/5"} to-transparent`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-0.5 border-2 ${isShadow ? "border-truth-accentRed" : isStory ? "border-truth-accentPurple" : "border-truth-midGray"}`}>
             <div className="w-10 h-10 bg-truth-darkGray flex items-center justify-center relative overflow-hidden">
               {isShadow ? (
                 <Ghost className="w-5 h-5 text-truth-accentRed" />
               ) : (
                 <div className="w-full h-full bg-truth-midGray" />
               )}
               {/* Scanline overlay for avatar */}
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_2px]" />
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bitter font-black text-sm uppercase tracking-tighter ${isShadow ? "text-truth-accentRed" : isStory ? "text-truth-accentPurple" : "text-truth-textLight"}`}>
                {isShadow ? "SHADOW_IDENTITY" : post.author.username}
              </h3>
              {post.channel && (
                <Link 
                  href={`/channels/${post.channel.slug}`}
                  className="flex items-center gap-2 group/chan"
                >
                  <span className="text-truth-textGray text-[10px] group-hover/chan:text-truth-textLight transition-colors">IN</span>
                  <span 
                    className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-opacity-10 border border-opacity-20 transition-all hover:bg-opacity-20"
                    style={{ 
                      color: post.channel.color || "#FF3366",
                      backgroundColor: `${post.channel.color || "#FF3366"}1a`,
                      borderColor: `${post.channel.color || "#FF3366"}33`
                    }}
                  >
                    {post.channel.name}
                  </span>
                </Link>
              )}
              {isStory && (
                <span className="font-mono text-[8px] bg-truth-accentPurple text-truth-bg px-2 py-0.5 uppercase font-bold tracking-tighter">
                  STORY_MODE
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest mt-1">
              {isShadow ? `MASK_ID: ${post.author.shadowName || 'ANONYMOUS'}` : "AUTH_VERIFIED"} {" // "} {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-truth-textGray hover:text-truth-textLight transition-colors p-2"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Context Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-truth-nearBlack border-2 border-truth-midGray shadow-xl z-50 p-1"
              >
                {isAuthor && (
                  <>
                    <button 
                      onClick={() => { setShowAnalytics(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentBlue hover:bg-truth-darkGray transition-all uppercase tracking-widest"
                    >
                      <Zap className="w-4 h-4" />
                      VIEW_PULSE_ANALYTICS
                    </button>
                    {canEdit && (
                      <button 
                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentGreen hover:bg-truth-darkGray transition-all uppercase tracking-widest"
                      >
                        <Edit3 className="w-4 h-4" />
                        EDIT_TRANSMISSION
                      </button>
                    )}
                    <button 
                      onClick={handleArchive}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentPurple hover:bg-truth-darkGray transition-all uppercase tracking-widest"
                    >
                      <Archive className="w-4 h-4" />
                      ARCHIVE_SIGNAL
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-accentRed hover:bg-truth-accentRed/10 transition-all uppercase tracking-widest border-t border-truth-midGray/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      TERMINATE_POST
                    </button>
                  </>
                )}
                {!isAuthor && (
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentRed hover:bg-truth-darkGray transition-all uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    REPORT_SIGNAL
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6 mb-8 relative z-10">
        {/* Text Content / Edit Mode */}
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black border-2 border-truth-accentBlue p-4 font-bitter text-truth-textLight focus:outline-none min-h-[150px] selection:bg-truth-accentBlue/30"
              placeholder="UPDATE_TRUTH_DATA..."
            />
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="font-mono text-[10px] text-truth-textGray hover:text-truth-textLight uppercase tracking-widest"
              >
                ABORT_UPDATE
              </button>
              <button 
                disabled={isPending}
                onClick={handleUpdate}
                className="bg-truth-accentBlue text-truth-nearBlack px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest hover:bg-truth-textLight disabled:opacity-50"
              >
                {isPending ? "SYNCING..." : "COMMIT_CHANGES"}
              </button>
            </div>
          </div>
        ) : (
          post.content && (
            <div className="font-bitter text-xl text-truth-textLight leading-relaxed prose prose-invert prose-lg max-w-none selection:bg-truth-accentRed selection:text-truth-bg">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )
        )}

        {/* Media Attachments (Carousel) */}
        {hasMedia && (
          <div className="my-4">
            <ImageCarousel media={post.media} />
          </div>
        )}
      </div>

      {/* Thread/Story Indicators */}
      <div className="flex gap-4 mb-8">
        {post.visibilityType === 'LIMITED' && (
          <div className="p-3 bg-truth-accentBlue/5 border-l-4 border-truth-accentBlue flex flex-col gap-1 flex-1 relative overflow-hidden group/scarcity">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-truth-accentBlue animate-pulse" />
              <span className="font-mono text-[10px] text-truth-accentBlue uppercase tracking-widest font-black">
                LIMITED_BY_OBSERVATION: {post.viewsLimit}_TOTAL
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-widest">
                YOU_ARE_1_OF_{post.viewsLimit}_AUTHORIZED_OBSERVERS
              </span>
              <span className="font-mono text-[9px] text-truth-accentBlue font-black">
                {Math.max(0, (post.viewsLimit || 0) - post.currentViews)}_REMAINING
              </span>
            </div>
            {/* Scarcity Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-truth-accentBlue/20 w-full">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, (post.currentViews / (post.viewsLimit || 1) * 100))}%` }}
                 className="h-full bg-truth-accentBlue shadow-[0_0_10px_#00E5FF]"
               />
            </div>
          </div>
        )}
        
        {isStory && (
          <div className="p-3 bg-truth-accentPurple/5 border-l-4 border-truth-accentPurple flex items-center gap-3 flex-1">
            <Clock className="w-4 h-4 text-truth-accentPurple animate-pulse" />
            <span className="font-mono text-[10px] text-truth-accentPurple uppercase tracking-widest">
              TTL: 24_HOURS_REMAINING
            </span>
          </div>
        )}

        {post.parentId && (
          <div className="p-3 bg-truth-accentBlue/5 border-l-4 border-truth-accentBlue flex items-center gap-3 flex-1">
            <Layers className="w-4 h-4 text-truth-accentBlue" />
            <span className="font-mono text-[10px] text-truth-accentBlue uppercase tracking-widest">
              PART_OF_SEQUENTIAL_THREAD
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-truth-midGray relative z-10">
        <div className="flex items-center gap-6">
          <button className={`flex items-center gap-2 text-truth-textGray transition-all group/btn ${isStory ? "hover:text-truth-accentPurple" : "hover:text-truth-accentRed"}`}>
            <div className={`p-2 border border-transparent transition-all ${isStory ? "group-hover/btn:border-truth-accentPurple" : "group-hover/btn:border-truth-accentRed"}`}>
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
         <div className={`absolute top-0 right-0 w-[200%] h-[200%] rotate-45 translate-x-1/2 -translate-y-1/2 ${isStory ? "bg-truth-accentPurple/20" : "bg-truth-midGray"}`} />
      </div>

      {/* Overlays / Modals */}
      <AnimatePresence>
        {showAnalytics && (
          <PostAnalytics post={post} onClose={() => setShowAnalytics(false)} />
        )}
      </AnimatePresence>

      {/* Pulse Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center">
           <Zap className="w-8 h-8 text-truth-accentBlue animate-pulse" />
        </div>
      )}
    </motion.div>
  )
}