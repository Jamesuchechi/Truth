import { useState, useEffect } from "react"
import type { PostWithRelations } from "@/lib/types/post"
import Image from "next/image"
import { Plus } from "lucide-react"

interface StoriesBarProps {
  stories: PostWithRelations[]
  onOpenComposer: () => void
}

export default function StoriesBar({ stories, onOpenComposer }: StoriesBarProps) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full overflow-hidden mb-12">
      <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {/* Create Story Button */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button 
            onClick={onOpenComposer}
            className="w-16 h-16 rounded-none border-2 border-dashed border-truth-midGray flex items-center justify-center hover:border-truth-accentRed transition-colors group relative"
          >
            <Plus className="w-6 h-6 text-truth-textGray group-hover:text-truth-accentRed transition-colors" />
            <div className="absolute inset-0 bg-truth-accentRed/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-widest">EMIT_STORY</span>
        </div>

        {/* Story Items */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
            <div className="relative p-1 border-2 border-truth-accentPurple shadow-[0_0_10px_rgba(157,80,187,0.3)] group-hover:shadow-[0_0_20px_rgba(157,80,187,0.6)] transition-all">
              <div className="w-14 h-14 bg-truth-nearBlack relative overflow-hidden">
                {story.author.image ? (
                  <Image 
                    src={story.author.image} 
                    alt={story.author.username}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bitter font-black text-xl text-truth-accentPurple">
                    {story.author.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Twitch-style LIVE badge for very recent stories */}
              {now && (now - new Date(story.createdAt).getTime() < 1000 * 60 * 60) && (
                <div className="absolute -top-1 -right-1 px-1 bg-truth-accentRed text-truth-bg font-mono text-[7px] font-black uppercase tracking-tighter">
                  LIVE
                </div>
              )}
            </div>
            <span className="font-mono text-[8px] text-truth-textLight uppercase tracking-tight max-w-[64px] truncate">
              {story.author.shadowName || story.author.username}
            </span>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="flex items-center gap-4 py-4 px-6 border border-truth-midGray/30 bg-truth-nearBlack/20">
             <div className="w-2 h-2 bg-truth-textGray/30 rounded-full animate-pulse" />
             <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-[0.3em]">NO_ACTIVE_STREAM_SIGNALS</span>
          </div>
        )}
      </div>
    </div>
  )
}
