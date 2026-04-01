"use client"

import { useState } from "react"
import { Plus, Zap } from "lucide-react"
import StoriesBar from "@/components/feed/StoriesBar"
import ComposeModal from "@/components/feed/ComposeModal"
import { PostCard } from "@/components/feed/PostCard"
import type { PostWithRelations } from "@/lib/types/post"

interface FeedClientProps {
  initialPosts: PostWithRelations[]
  stories: PostWithRelations[]
  user: { id: string }
}

export default function FeedClient({ initialPosts, stories, user }: FeedClientProps) {
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  return (
    <>
      {/* Stories IG Style */}
      <StoriesBar stories={stories} onOpenComposer={() => setIsComposeOpen(true)} />

      {/* Feed Content X/Twitch Style */}
      <div className="space-y-8">
        {initialPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Floating Action Button (X-Style) */}
      <button 
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-12 right-12 w-16 h-16 bg-truth-accentRed shadow-[10px_10px_0px_rgba(0,0,0,0.4)] flex items-center justify-center group hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 transition-all z-40"
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
