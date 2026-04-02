"use client"

import { useState, useTransition } from "react"
import { Plus, Zap, Wifi, Globe, Ghost } from "lucide-react"
import StoriesBar from "@/components/feed/StoriesBar"
import ComposeModal from "@/components/feed/ComposeModal"
import { PostCard } from "@/components/feed/PostCard"
import type { PostWithRelations } from "@/lib/types/post"
import { getFollowingFeed } from "@/lib/actions/feed"

interface FeedClientProps {
  initialPosts: PostWithRelations[]
  stories: PostWithRelations[]
  user: { 
    id: string 
    shadowName?: string | null
    defaultShadowMode?: boolean
  }
}

export default function FeedClient({ initialPosts, stories, user }: FeedClientProps) {
  const [activeTab, setActiveTab] = useState<"GLOBAL" | "FOLLOWING">("GLOBAL")
  const [followingPosts, setFollowingPosts] = useState<PostWithRelations[]>([])
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleTabChange = (tab: "GLOBAL" | "FOLLOWING") => {
    setActiveTab(tab)
    if (tab === "FOLLOWING" && followingPosts.length === 0) {
      startTransition(async () => {
        const posts = await getFollowingFeed()
        setFollowingPosts(posts as PostWithRelations[])
      })
    }
  }

  const displayedPosts = activeTab === "GLOBAL" ? initialPosts : followingPosts

  return (
    <>
      {/* Feed Navigation Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <button 
          onClick={() => handleTabChange("GLOBAL")}
          className={`
            flex items-center gap-2 px-8 py-3 font-mono text-[10px] uppercase tracking-widest border-2 transition-all shrink-0
            ${activeTab === "GLOBAL" 
              ? "bg-truth-nearBlack text-truth-accentRed border-truth-accentRed shadow-[4px_4px_0px_rgba(255,51,102,0.2)]" 
              : "bg-transparent border-truth-midGray text-truth-textGray hover:border-truth-textGray"}
          `}
        >
          <Globe className="w-3.5 h-3.5" /> GLOBAL_SYNC
        </button>
        <button 
          onClick={() => handleTabChange("FOLLOWING")}
          className={`
            flex items-center gap-2 px-8 py-3 font-mono text-[10px] uppercase tracking-widest border-2 transition-all shrink-0
            ${activeTab === "FOLLOWING" 
              ? "bg-truth-nearBlack text-truth-accentBlue border-truth-accentBlue shadow-[4px_4px_0px_rgba(30,144,255,0.2)]" 
              : "bg-transparent border-truth-midGray text-truth-textGray hover:border-truth-textGray"}
          `}
        >
          <Wifi className="w-3.5 h-3.5" /> FOLLOWING_SIGNAL
        </button>
      </div>

      {/* Stories IG Style */}
      <StoriesBar stories={stories} onOpenComposer={() => setIsComposeOpen(true)} />

      {/* Feed Content */}
      <div className="space-y-8 min-min-h-[600px] mb-20 animate-fadeIn">
        {isPending ? (
          <div className="py-32 text-center">
            <div className="inline-block w-8 h-8 border-2 border-truth-accentRed border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.3em] animate-pulse">Decrypting Follower Frequency...</p>
          </div>
        ) : displayedPosts.length > 0 ? (
          displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="py-24 text-center border-4 border-dashed border-truth-midGray bg-truth-nearBlack/20 group">
             <div className="mb-4 flex justify-center">
               <Ghost className="w-12 h-12 text-truth-textGray/20 group-hover:text-truth-accentRed/40 transition-colors" />
             </div>
             <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest leading-relaxed">
               {activeTab === "FOLLOWING" 
                 ? "No synchronized signals detected from observed nodes." 
                 : "The void remains silent. Be the first to emit a pulse."}
             </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (X-Style) */}
      <button 
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-12 right-12 xl:right-92 w-16 h-16 bg-truth-accentRed shadow-[10px_10px_0px_rgba(0,0,0,0.4)] flex items-center justify-center group hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 transition-all z-40"
      >
        <Plus className="w-8 h-8 text-truth-bg group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-truth-textLight flex items-center justify-center">
           <Zap className="w-2 h-2 text-truth-bg animate-pulse" />
        </div>
      </button>

      {/* Compose Modal */}
      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
        user={user} 
      />
    </>
  )
}
