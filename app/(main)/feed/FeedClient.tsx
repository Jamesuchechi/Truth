"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { PostCard } from "@/components/feed/PostCard"
import type { PostWithRelations } from "@/lib/types/post"
import { 
  getForYouFeed, 
  getFreshFeed, 
  getFollowingFeed,
  getTrendingFeed,
  getDeepDiveFeed,
  getQuickHitsFeed
} from "@/lib/actions/feed"
import { 
  Plus, 
  Wifi, 
  Ghost, 
  Flame, 
  BookOpen, 
  ZapIcon, 
  Compass,
  Clock,
  Loader2
} from "lucide-react"
import StoriesBar from "@/components/feed/StoriesBar"
import ComposeModal from "@/components/feed/ComposeModal"
import FeedSkeleton from "@/components/feed/FeedSkeleton"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer } from "@/lib/motion"

type FeedTab = "FOR_YOU" | "FRESH" | "FOLLOWING" | "TRENDING" | "DEEP_DIVE" | "QUICK_HITS"

interface FeedClientProps {
  initialPosts: PostWithRelations[]
  stories: PostWithRelations[]
  user: { 
    id: string 
    shadowName?: string | null
    defaultShadowMode?: boolean
  }
}

interface FeedState {
  posts: PostWithRelations[]
  cursor: string | null
  hasMore: boolean
}

export default function FeedClient({ initialPosts, stories, user }: FeedClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("FOR_YOU")
  const [feeds, setFeeds] = useState<Record<FeedTab, FeedState>>({
    FOR_YOU: { posts: initialPosts, cursor: initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].id : null, hasMore: true },
    FRESH: { posts: [], cursor: null, hasMore: true },
    FOLLOWING: { posts: [], cursor: null, hasMore: true },
    TRENDING: { posts: [], cursor: null, hasMore: true },
    DEEP_DIVE: { posts: [], cursor: null, hasMore: true },
    QUICK_HITS: { posts: [], cursor: null, hasMore: true },
  })
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchFeed = useCallback(async (tab: FeedTab, cursor?: string | null) => {
    let res: { posts: PostWithRelations[], nextCursor: string | null }
    switch (tab) {
      case "FOR_YOU": res = await getForYouFeed(20, cursor || undefined); break
      case "FRESH": res = await getFreshFeed(20, cursor || undefined); break
      case "FOLLOWING": res = await getFollowingFeed(20, cursor || undefined); break
      case "TRENDING": res = await getTrendingFeed(20, cursor || undefined); break
      case "DEEP_DIVE": res = await getDeepDiveFeed(10, cursor || undefined); break
      case "QUICK_HITS": res = await getQuickHitsFeed(15, cursor || undefined); break
    }
    return res
  }, [])

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab)
    if (feeds[tab].posts.length === 0) {
      startTransition(async () => {
        const res = await fetchFeed(tab)
        setFeeds(prev => ({ 
          ...prev, 
          [tab]: { 
            posts: res.posts, 
            cursor: res.nextCursor, 
            hasMore: !!res.nextCursor 
          } 
        }))
      })
    }
  }

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !feeds[activeTab].hasMore) return
    
    setIsLoadingMore(true)
    const currentCursor = feeds[activeTab].cursor
    const res = await fetchFeed(activeTab, currentCursor)
    
    setFeeds(prev => ({
      ...prev,
      [activeTab]: {
        posts: [...prev[activeTab].posts, ...res.posts],
        cursor: res.nextCursor,
        hasMore: !!res.nextCursor
      }
    }))
    setIsLoadingMore(false)
  }, [activeTab, feeds, fetchFeed, isLoadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && feeds[activeTab].hasMore && !isPending && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Prefetch when 200px from bottom
    )

    const currentTarget = observerTarget.current

    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [loadMore, activeTab, feeds, isPending, isLoadingMore])

  const displayedPosts = feeds[activeTab].posts

  return (
    <>
      <div className="-mx-3 sm:-mx-4 md:mx-0 mb-8 sm:mb-10 overflow-hidden">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 px-3 sm:px-4 md:mx-0 scrollbar-hide">
          {[
            { id: "FOR_YOU", label: "FOR_YOU", icon: Compass, color: "text-truth-accentRed", border: "border-truth-accentRed" },
            { id: "FRESH", label: "FRESH", icon: Clock, color: "text-truth-accentGreen", border: "border-truth-accentGreen" },
            { id: "FOLLOWING", label: "OBSERVING", icon: Wifi, color: "text-truth-accentBlue", border: "border-truth-accentBlue" },
            { id: "TRENDING", label: "TRENDING", icon: Flame, color: "text-truth-accentYellow", border: "border-truth-accentYellow" },
            { id: "DEEP_DIVE", label: "DEEP", icon: BookOpen, color: "text-truth-accentPurple", border: "border-truth-accentPurple" },
            { id: "QUICK_HITS", label: "QUICK", icon: ZapIcon, color: "text-truth-textLight", border: "border-truth-textLight" },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => handleTabChange(tab.id as FeedTab)}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 font-mono text-[8px] sm:text-[9px] uppercase tracking-widest border-2 transition-all shrink-0
                ${activeTab === tab.id 
                  ? `bg-card ${tab.color} ${tab.border} shadow-[2px_2px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_6px_rgba(255,255,255,0.05)]` 
                  : "bg-transparent border-border text-muted hover:border-foreground hover:text-foreground"}
              `}
            >
              <tab.icon className="w-3 h-3" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <StoriesBar stories={stories} onOpenComposer={() => setIsComposeOpen(true)} />

      <div className="space-y-8 min-h-[600px] mb-20">
        {isPending ? (
          <FeedSkeleton />
        ) : displayedPosts.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-0"
          >
            <AnimatePresence mode="popLayout">
              {displayedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} priority={index < 2} />
              ))}
            </AnimatePresence>
            
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {isLoadingMore && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-truth-accentRed animate-spin" />
                  <span className="font-mono text-[8px] text-muted uppercase tracking-widest">
                    PULLING_NEXT_SIGNAL_POOL...
                  </span>
                </div>
              )}
              {!isLoadingMore && feeds[activeTab].hasMore && (
                <button 
                  onClick={loadMore}
                  className="font-mono text-[9px] text-muted hover:text-foreground uppercase tracking-widest border border-dashed border-border px-6 py-2 transition-colors bg-card/50"
                >
                  MANUAL_FETCH_OVERRIDE_ENABLED [LOAD_MORE]
                </button>
              )}
              {!feeds[activeTab].hasMore && (
                <div className="py-10 text-center opacity-30">
                   <div className="h-px bg-border w-24 mx-auto mb-4" />
                   <p className="font-mono text-[8px] text-muted uppercase tracking-[0.4em]">
                     END_OF_OBSERVABLE_STREAM
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center border-4 border-dashed border-border bg-card/20 group">
             <div className="mb-4 flex justify-center">
               <Ghost className="w-12 h-12 text-muted/20 group-hover:text-truth-accentRed/40 transition-colors" />
             </div>
             <p className="font-mono text-[10px] text-muted uppercase tracking-widest leading-relaxed">
               {activeTab === "FOLLOWING" 
                 ? "No synchronized signals detected from observed nodes." 
                 : "The void remains silent. Be the first to emit a pulse."}
             </p>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-24 lg:bottom-12 right-4 sm:right-8 xl:right-92 w-14 h-14 sm:w-16 sm:h-16 bg-truth-accentRed shadow-[4px_4px_0px_rgba(0,0,0,0.4)] flex items-center justify-center group hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all z-40"
      >
        <Plus className="w-8 h-8 text-truth-bg group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
        user={user} 
      />
    </>
  )
}
