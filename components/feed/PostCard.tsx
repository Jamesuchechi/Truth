"use client"

import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Ghost, 
  ArrowUpRight,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Archive,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import Logo from "@/components/shared/Logo"
import { ReportModal } from "@/components/moderation/ReportModal"
import { AppealModal } from "@/components/moderation/AppealModal"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import type { PostWithRelations } from "@/lib/types/post"
import ImageCarousel from "./ImageCarousel"
import PostAnalytics from "./PostAnalytics"
import { usePostTrack } from "@/hooks/usePostTrack"
import { updatePost, deletePost, archivePost } from "@/lib/actions/post"
import { getPostSummary } from "@/lib/actions/summary"
import { toggleReaction } from "@/lib/actions/reaction"
import { createComment } from "@/lib/actions/comment"
import { useTransition, useCallback } from "react"
import { ReactionPicker } from "./ReactionPicker"
import { useReactions } from "@/hooks/useReactions"
import type { ReactionType } from "@prisma/client"
import { Terminal, ScanFace } from "lucide-react"
import { ReactionBurst } from "./ReactionBurst"
import { fadeInUp, tapScale } from "@/lib/motion"

export function PostCard({ 
  post, 
  isDetail = false,
  priority = false
}: { 
  post: PostWithRelations, 
  isDetail?: boolean,
  priority?: boolean
}) {
  const { data: session } = useSession()
  const isShadow = post.useShadowId
  const isStory = post.visibilityType === "STORY"
  const hasMedia = post.media && post.media.length > 0
  const isAuthor = session?.user?.id === post.authorId

  // Management State
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isPending, startTransition] = useTransition()
  
  // Optimistic Engagement State
  const [optimisticReactionOffset, setOptimisticReactionOffset] = useState(0)
  const [isReacted, setIsReacted] = useState(post.reactions?.length > 0)
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(
    (post.reactions?.[0] as { type: ReactionType } | undefined)?.type || null
  )
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  
  const { reactionCount: liveCount } = useReactions(post.id)
  const displayReactionCount = (liveCount ?? post.reactionCount) + optimisticReactionOffset
  
  const [showBurst, setShowBurst] = useState(false)

  const [showComments, setShowComments] = useState(isDetail) // Default open in detail view
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [commentText, setCommentText] = useState("")

  // AI Summary State
  const [summary, setSummary] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (summary) return
    setIsScanning(true)
    const res = await getPostSummary(post.id)
    if (res.summary) setSummary(res.summary)
    setIsScanning(false)
  }, [post.id, summary])

  // Tracking
  const { containerRef, trackClick, handleMouseEnter, handleMouseLeave } = usePostTrack({ postId: post.id })

  const [canEdit, setCanEdit] = useState(false)
  
  useEffect(() => {
    const createdTime = new Date(post.createdAt).getTime()
    const fiveMinutes = 5 * 60 * 1000
    const expiryTime = createdTime + fiveMinutes
    
    const checkEditWindow = () => {
      const now = Date.now()
      if (now < expiryTime) {
        setCanEdit(true)
        const remainingTime = expiryTime - now
        const timer = setTimeout(() => setCanEdit(false), remainingTime)
        return () => clearTimeout(timer)
      } else {
        setCanEdit(false)
      }
    }
    
    return checkEditWindow()
  }, [post.createdAt])

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updatePost(post.id, editContent)
      if (res.success) setIsEditing(false)
      setIsMenuOpen(false)
    })
  }

  const handleDelete = () => {
    if (confirm("TERMINATE_SIGNAL: Are you sure? This action is permanent in the current reality.")) {
      startTransition(async () => {
        await deletePost(post.id)
      })
    }
  }

  const handleArchive = () => {
    startTransition(async () => {
      await archivePost(post.id)
      setIsMenuOpen(false)
    })
  }

  const maxChars = 280
  const isLong = post.content.length > maxChars
  const displayContent = (!isDetail && isLong) ? post.content.substring(0, maxChars) + "..." : post.content

  return (
    <motion.div 
      ref={containerRef}
      onClick={trackClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      {...tapScale}
      className={`
        group relative bg-card border-2 p-3 sm:p-6 lg:p-8 mb-4 sm:mb-6 transition-all duration-500
        shadow-[4px_4px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)] dark:sm:shadow-[8px_8px_0px_rgba(0,0,0,0.5)]
        ${isStory ? "border-truth-accentPurple" : "border-border hover:border-truth-accentRed"}
        ${isDetail ? "" : "cursor-pointer"}
      `}
    >
      {/* Header and other elements remain mostly the same, but we wrap content in Link if not detail */}
      {/* Thread Connection Line (Visual Hint) */}
      {post.parentId && (
        <div className="absolute -top-6 left-12 w-0.5 h-6 bg-truth-midGray/30" />
      )}

      {/* Dynamic Glow Effect */}
      <div className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-linear-to-r from-transparent ${isStory ? "via-truth-accentPurple/5" : "via-truth-accentRed/5"} to-transparent`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 sm:mb-6 lg:mb-8 relative z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className={`shrink-0 p-0.5 border-2 ${isShadow ? "border-truth-accentRed" : isStory ? "border-truth-accentPurple" : "border-border"}`}>
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background flex items-center justify-center relative overflow-hidden">
               {isShadow ? (
                 <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-truth-accentRed" />
               ) : (
                 <div className="w-full h-full bg-muted/20" />
               )}
               {/* Glitch Overlay */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-linear-to-t from-truth-accentRed to-transparent animate-glitch" />
             </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className={`font-bitter font-black text-sm uppercase tracking-tighter truncate ${isShadow ? "text-truth-accentRed" : isStory ? "text-truth-accentPurple" : "text-foreground"}`}>
                {isShadow ? "SHADOW_IDENTITY" : post.author.username}
              </h3>
              {post.channel && (
                <Link 
                  href={`/channels/${post.channel.slug}`}
                  className="flex items-center gap-1.5 group/chan shrink-0"
                >
                  <span className="text-muted text-[10px] group-hover/chan:text-foreground transition-colors">IN</span>
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
                <span className="font-mono text-[8px] bg-truth-accentPurple text-truth-bg px-2 py-0.5 uppercase font-bold tracking-tighter shrink-0">
                  STORY_MODE
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 font-mono text-[9px] text-muted uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1">
                {isShadow ? `MASK_ID: ${post.author.shadowName || 'ANONYMOUS'}` : "AUTH_VERIFIED"}
                {isShadow && post.author.shadowVerified && (
                  <CheckCircle className="w-2.5 h-2.5 text-truth-accentPurple fill-truth-accentPurple/10" />
                )}
              </span>
              
              <span className={`flex items-center gap-1 px-1.5 py-0.5 border border-opacity-30 shrink-0 ${
                post.author.reputationTier === 'ARCHITECT' ? 'text-truth-accentYellow border-truth-accentYellow bg-truth-accentYellow/10' :
                post.author.reputationTier === 'GUARDIAN' ? 'text-truth-accentGreen border-truth-accentGreen bg-truth-accentGreen/10' :
                post.author.reputationTier === 'ORACLE' ? 'text-truth-accentBlue border-truth-accentBlue bg-truth-accentBlue/10' :
                post.author.reputationTier === 'SPECTRE' ? 'text-truth-accentPurple border-truth-accentPurple bg-truth-accentPurple/10' :
                'text-truth-textGray border-truth-midGray bg-truth-darkGray/30'
              }`}>
                <Logo size={8} />
                {post.author.reputationTier}
              </span>

              <span className="shrink-0">{" // "} {formatRelativeTime(post.createdAt)}</span>
              {post.isRestored && (
                <span className="flex items-center gap-1 text-truth-accentGreen border border-truth-accentGreen/30 bg-truth-accentGreen/5 px-1.5 py-0.5 font-black animate-pulse">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  RESTORED_SIGNAL
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-muted hover:text-foreground transition-colors p-2"
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
                className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-truth-nearBlack border-2 border-truth-midGray shadow-xl z-50 p-1"
              >
                {isAuthor && (
                  <>
                    <button 
                      onClick={() => { setShowAnalytics(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentBlue hover:bg-truth-darkGray transition-all uppercase tracking-widest"
                    >
                      <Logo size={16} />
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
                  <button 
                    onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-mono text-truth-textGray hover:text-truth-accentRed hover:bg-truth-darkGray transition-all uppercase tracking-widest"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    REPORT_SIGNAL
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4 mb-4 sm:mb-6 lg:mb-8 relative z-10">
        {post.isFiltered && !isAuthor ? (
          <div className="py-12 flex flex-col items-center gap-4 bg-truth-accentRed/5 border-2 border-dashed border-truth-accentRed/20">
             <ShieldAlert className="w-12 h-12 text-truth-accentRed opacity-20" />
             <p className="font-mono text-[10px] text-muted uppercase tracking-widest">Signal terminated by autonomous protocol.</p>
          </div>
        ) : post.isFiltered && isAuthor ? (
          <div className="p-6 bg-truth-accentRed/10 border-2 border-truth-accentRed space-y-4">
             <div className="flex items-center gap-3 text-truth-accentRed font-mono text-[10px] uppercase font-black">
                <AlertTriangle className="w-4 h-4" /> TRANSMISSION_FILTERED
             </div>
             <p className="font-bitter text-sm text-foreground leading-relaxed">
               Your signal has been quarantined by the AI moderation layer. No other nodes can observe this content.
             </p>
             <button 
               onClick={(e) => { e.stopPropagation(); setIsAppealModalOpen(true); }}
               className="w-full py-3 bg-truth-accentRed text-white font-mono text-[9px] uppercase font-black tracking-widest hover:brightness-110 transition-all"
             >
               FILE_PROTOCOL_APPEAL
             </button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black border-2 border-truth-accentBlue p-4 font-bitter text-foreground focus:outline-none min-h-[150px] selection:bg-truth-accentBlue/30"
              placeholder="UPDATE_TRUTH_DATA..."
            />
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="font-mono text-[10px] text-muted hover:text-foreground uppercase tracking-widest"
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
          <div className="space-y-4">
            <div className={isDetail ? "" : "block group/content relative"}>
              <div className={`font-bitter ${isDetail ? "text-lg sm:text-2xl" : "text-sm sm:text-base lg:text-lg"} text-foreground leading-relaxed prose prose-invert max-w-none break-words overflow-wrap-anywhere selection:bg-truth-accentRed selection:text-truth-bg`}>
                <ReactMarkdown>{displayContent}</ReactMarkdown>
              </div>
              {!isDetail && isLong && (
                <div className="flex items-center gap-4 mt-2 relative z-10">
                  <Link href={`/p/${post.id}`} className="font-mono text-[10px] text-truth-accentRed uppercase font-black group-hover/content:translate-x-1 transition-transform">
                    READ_FULL_SIGNAL {" >>"}
                  </Link>
                  {!summary && (
                    <button 
                      onClick={handleScan}
                      disabled={isScanning}
                      className="flex items-center gap-1.5 font-mono text-[9px] text-truth-accentBlue hover:text-foreground uppercase tracking-widest border border-truth-accentBlue/30 px-2 py-0.5 bg-truth-accentBlue/5 transition-all disabled:opacity-50 pointer-events-auto"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-2 h-2 border border-truth-accentBlue border-t-transparent animate-spin" />
                          SCANNING...
                        </>
                      ) : (
                        <>
                          <ScanFace className="w-3 h-3" />
                          SCAN_SIGNAL
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              {!isDetail && <Link href={`/p/${post.id}`} className="absolute inset-0 z-0" aria-label="View post detail" />}
            </div>
          </div>
        )}

        {/* AI Summary Display */}
        <AnimatePresence>
          {summary && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-truth-accentBlue/5 border-l-2 border-truth-accentBlue p-4 relative overflow-hidden"
            >
              {/* Scanline Animation */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-truth-accentBlue/10 to-transparent h-4 animate-scanline pointer-events-none" />
              <div className="flex items-start gap-3 relative z-10">
                <Terminal className="w-4 h-4 text-truth-accentBlue shrink-0 mt-1" />
                <p className="font-mono text-[11px] leading-relaxed text-truth-accentBlue uppercase tracking-tight">
                  <span className="opacity-50">[DECRYPTED_SIGNAL]: </span>
                  {summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasMedia && (
          <div className="my-4">
            <ImageCarousel media={post.media} priority={priority} />
          </div>
        )}
      </div>

      {/* Thread/Story Indicators */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 lg:mb-8">
        {post.visibilityType === 'LIMITED' && (
          <div className="p-3 bg-truth-accentBlue/5 border-l-4 border-truth-accentBlue flex flex-col gap-1 flex-1 relative overflow-hidden group/scarcity">
            <div className="flex items-center gap-3">
              <Logo size={16} className="animate-pulse" />
              <span className="font-mono text-[10px] text-truth-accentBlue uppercase tracking-widest font-black">
                LIMITED_BY_OBSERVATION: {post.viewsLimit}_TOTAL
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[8px] text-muted uppercase tracking-widest">
                YOU_ARE_1_OF_{post.viewsLimit}_AUTHORIZED_OBSERVERS
              </span>
              <span className="font-mono text-[9px] text-truth-accentBlue font-black">
                {Math.max(0, (post.viewsLimit || 0) - post.currentViews)}_REMAINING
              </span>
            </div>
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
      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-truth-midGray relative z-10 gap-2 flex-wrap min-w-0">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative">
            <button 
              disabled={isPending}
              onMouseEnter={() => setIsPickerOpen(true)}
              onClick={(e) => {
                e.stopPropagation()
                // Default toggle (REAL_TALK as primary for fast interaction)
                const type: ReactionType = "REAL_TALK"
                const wasReacted = isReacted
                const wasType = activeReaction
                
                // Optimistic Update
                if (wasReacted && wasType === type) {
                  setOptimisticReactionOffset(prev => prev - 1)
                  setIsReacted(false)
                  setActiveReaction(null)
                } else if (!wasReacted) {
                  setOptimisticReactionOffset(prev => prev + 1)
                  setIsReacted(true)
                  setActiveReaction(type)
                  setShowBurst(true)
                  setTimeout(() => setShowBurst(false), 1000)
                } else {
                  // Just changing type
                  setActiveReaction(type)
                  setShowBurst(true)
                  setTimeout(() => setShowBurst(false), 1000)
                }

                startTransition(async () => {
                  const res = await toggleReaction(post.id, type)
                  if (res.error) {
                    setOptimisticReactionOffset(0)
                    setIsReacted(wasReacted)
                    setActiveReaction(wasType)
                  } else {
                    setOptimisticReactionOffset(0) // Reset after sync
                  }
                })
              }}
              className={`flex items-center gap-2 transition-all group/btn ${isReacted ? "text-truth-accentRed" : "text-truth-textGray"} ${isStory ? "hover:text-truth-accentPurple" : "hover:text-truth-accentRed"}`}
            >
              <div className={`relative p-2 border border-transparent transition-all ${isReacted ? "border-truth-accentRed/30 bg-truth-accentRed/5" : ""} ${isStory ? "group-hover/btn:border-truth-accentPurple" : "group-hover/btn:border-truth-accentRed"}`}>
                {/* Micro-burst Animation */}
                <AnimatePresence>
                  {showBurst && (
                    <ReactionBurst 
                      key={activeReaction}
                      color={activeReaction === "STAY_STRONG" ? "#F97316" : activeReaction === "REAL_TALK" ? "#EF4444" : "#FF3366"} 
                    />
                  )}
                </AnimatePresence>

                {isReacted && activeReaction ? (
                  <span className="text-sm drop-shadow-md">
                    {activeReaction === "RELATE" && "🫂"}
                    {activeReaction === "DEEP" && "🌊"}
                    {activeReaction === "NOT_ALONE" && "💙"}
                    {activeReaction === "WILD" && "🤯"}
                    {activeReaction === "REAL_TALK" && "🔥"}
                    {activeReaction === "THANK_YOU" && "🙏"}
                    {activeReaction === "THAT_HURTS" && "😢"}
                    {activeReaction === "STAY_STRONG" && "💪"}
                  </span>
                ) : (
                  <Heart className={`w-4 h-4 ${isReacted ? "fill-truth-accentRed text-truth-accentRed" : ""}`} />
                )}
              </div>
              {(isAuthor || isReacted) && (
                <motion.span 
                  key={displayReactionCount}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bitter text-[10px] uppercase font-black tracking-tighter"
                >
                  {displayReactionCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {isPickerOpen && (
                <ReactionPicker 
                  activeType={activeReaction}
                  onClose={() => setIsPickerOpen(false)}
                  onSelect={(type) => {
                    const wasReacted = isReacted
                    const wasType = activeReaction
                    
                    // Optimistic
                    if (wasReacted && wasType === type) {
                      setOptimisticReactionOffset(prev => prev - 1)
                      setIsReacted(false)
                      setActiveReaction(null)
                    } else if (!wasReacted) {
                      setOptimisticReactionOffset(prev => prev + 1)
                      setIsReacted(true)
                      setActiveReaction(type)
                      setShowBurst(true)
                      setTimeout(() => setShowBurst(false), 600)
                    } else {
                      setActiveReaction(type)
                      setShowBurst(true)
                      setTimeout(() => setShowBurst(false), 600)
                    }
                    
                    setIsPickerOpen(false)
                    startTransition(async () => {
                      const res = await toggleReaction(post.id, type)
                      if (res.error) {
                         setOptimisticReactionOffset(0)
                         setIsReacted(wasReacted)
                         setActiveReaction(wasType)
                      } else {
                        setOptimisticReactionOffset(0) // Reset after sync
                      }
                    })
                  }}
                />
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation()
              if (isDetail) return // Always open in detail
              setShowComments(!showComments)
            }}
            className={`flex items-center gap-2 transition-all group/btn ${showComments ? "text-truth-accentBlue" : "text-truth-textGray"} hover:text-truth-accentBlue`}
          >
            <div className={`p-2 border border-transparent transition-all ${showComments ? "border-truth-accentBlue/30 bg-truth-accentBlue/5" : ""} group-hover/btn:border-truth-accentBlue`}>
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase font-bold">{commentCount}</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsReportModalOpen(true)
            }}
            className="flex items-center gap-2 text-muted hover:text-truth-accentRed transition-all group/btn"
            title="Report Signal Violation"
          >
            <div className="p-2 border border-transparent group-hover/btn:border-truth-accentRed transition-all">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </button>
        </div>

        <button className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-muted hover:text-foreground transition-colors group/view shrink-0 whitespace-nowrap">
          VIEW_DECRYPTION
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Comment Trace Input - Always visible in detail view */}
      <AnimatePresence>
        {(showComments || isDetail) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-truth-midGray/50 mt-4 pt-4"
          >
            <form 
              action={async (formData) => {
                const text = formData.get("content") as string
                if (!text.trim()) return
                
                setCommentCount(prev => prev + 1)
                setCommentText("")
                
                startTransition(async () => {
                  const res = await createComment(formData)
                  if (res.error) {
                    setCommentCount(prev => prev - 1)
                    setCommentText(text)
                  }
                })
              }}
              className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
            >
              <input type="hidden" name="postId" value={post.id} />
              <input 
                type="text" 
                name="content"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Synchronize comment signal..."
                className="flex-1 min-w-0 bg-truth-nearBlack border border-truth-midGray px-3 py-2 font-mono text-[10px] text-foreground placeholder:text-muted/40 focus:outline-none focus:border-truth-accentBlue transition-colors"
                disabled={isPending}
              />
              <button 
                type="submit"
                disabled={isPending || !commentText.trim()}
                className="px-4 py-2 bg-truth-accentBlue/20 border border-truth-accentBlue text-truth-accentBlue font-mono text-[9px] uppercase font-bold hover:bg-truth-accentBlue hover:text-truth-bg transition-all disabled:opacity-30"
              >
                EMIT
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
         <div className={`absolute top-0 right-0 w-[200%] h-[200%] rotate-45 translate-x-1/2 -translate-y-1/2 ${isStory ? "bg-truth-accentPurple/20" : "bg-border/50"}`} />
      </div>

      <AnimatePresence>
        {showAnalytics && (
          <PostAnalytics post={post} onClose={() => setShowAnalytics(false)} />
        )}
      </AnimatePresence>

      {isPending && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center">
           <Logo size={32} className="animate-pulse" />
        </div>
      )}

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={post.id}
        type="POST"
      />

      <AppealModal 
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        reportId={post.reports?.[0]?.id || ""}
      />
    </motion.div>
  )
}